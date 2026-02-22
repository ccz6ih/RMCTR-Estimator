// ── Share via URL ─────────────────────────────────────────────
function shareEstimateURL(){
  if(typeof pako === 'undefined'){
    toast('Sharing library not loaded. Check your connection.','error');
    return;
  }
  var data = collectFormData();
  // Strip photos to keep URL manageable
  data.photos = [];
  var json = JSON.stringify(data);
  try {
    var compressed = pako.deflate(json);
    var binary = '';
    for(var i=0;i<compressed.length;i++){
      binary += String.fromCharCode(compressed[i]);
    }
    var base64 = btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');

    var url = window.location.origin + window.location.pathname + '#share=' + base64;

    if(url.length > 65000){
      toast('Estimate too large for URL sharing. Use JSON export instead.','error');
      return;
    }

    if(navigator.clipboard){
      navigator.clipboard.writeText(url).then(function(){
        toast('Share link copied to clipboard!');
      }).catch(function(){
        prompt('Copy this share link:', url);
      });
    } else {
      prompt('Copy this share link:', url);
    }
  } catch(e){
    toast('Share failed: '+e.message,'error');
  }
}

function loadFromShareURL(){
  var hash = window.location.hash;
  if(!hash || hash.indexOf('#share=')!==0) return false;
  if(typeof pako === 'undefined') return false;

  var base64 = hash.slice(7).replace(/-/g,'+').replace(/_/g,'/');
  while(base64.length % 4) base64 += '=';
  try {
    var binary = atob(base64);
    var bytes = new Uint8Array(binary.length);
    for(var i=0;i<binary.length;i++) bytes[i] = binary.charCodeAt(i);
    var json = pako.inflate(bytes, { to: 'string' });
    var data = JSON.parse(json);
    currentJobId = 'job_'+Date.now();
    showPage('editor');
    loadJobIntoForm(data);
    toast('Estimate loaded from shared link!');
    history.replaceState(null, '', window.location.pathname);
    return true;
  } catch(e){
    toast('Failed to load shared estimate: '+e.message, 'error');
    return false;
  }
}

// ── QR Code ───────────────────────────────────────────────────
function showShareQR(){
  if(typeof pako === 'undefined'){
    toast('Sharing library not loaded.','error');
    return;
  }
  var data = collectFormData();
  data.photos = [];
  var json = JSON.stringify(data);
  try {
    var compressed = pako.deflate(json);
    var binary = '';
    for(var i=0;i<compressed.length;i++){
      binary += String.fromCharCode(compressed[i]);
    }
    var base64 = btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
    var url = window.location.origin + window.location.pathname + '#share=' + base64;

    if(url.length > 4296){
      toast('Estimate too large for QR code. Use the share link instead.','error');
      return;
    }

    var modal = document.getElementById('qr-modal');
    var container = document.getElementById('qr-container');
    if(!modal || !container) return;
    container.innerHTML = '';

    if(typeof QRCode !== 'undefined'){
      new QRCode(container, {
        text: url,
        width: 256,
        height: 256,
        colorDark: '#0B2A35',
        colorLight: '#ffffff'
      });
    } else {
      container.innerHTML = '<p style="color:var(--gray);font-size:13px">QR library not loaded. Use the share link instead.</p>';
    }
    modal.classList.add('open');
  } catch(e){
    toast('QR generation failed: '+e.message, 'error');
  }
}

function closeQRModal(){
  var modal = document.getElementById('qr-modal');
  if(modal) modal.classList.remove('open');
}
