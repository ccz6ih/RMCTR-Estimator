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

// ── Shopify Draft Order Bridge ───────────────────────────────
function showShopifyExport(){
  var data = collectFormData();
  var modal = document.getElementById('shopify-modal');
  var body = document.getElementById('shopify-modal-body');
  if(!modal || !body) return;

  var job = data.job || {};
  var mats = (data.materials && data.materials.items) || [];
  var costs = data.additional_costs || [];
  var scope = data.scope_of_work || [];
  var totals = data.totals || {};

  // Build line items from materials + scope labor + additional costs
  var lineItems = [];
  mats.forEach(function(m){
    if(!m.description) return;
    lineItems.push({
      title: m.description,
      qty: m.qty || '1',
      price: m.amount || m.unit_rate || '0'
    });
  });
  scope.forEach(function(s){
    if(!s.description || !s.labor_cost) return;
    lineItems.push({
      title: 'Labor: ' + s.description + (s.phase ? ' (' + s.phase + ')' : ''),
      qty: s.crew || '1',
      price: s.labor_cost
    });
  });
  costs.forEach(function(c){
    if(!c.item) return;
    lineItems.push({
      title: c.item + (c.details ? ' - ' + c.details : ''),
      qty: '1',
      price: c.cost || '0'
    });
  });

  // Build notes summary
  var notesParts = [];
  if(data.warranty) notesParts.push('Warranty: ' + data.warranty);
  (data.notes || []).forEach(function(n){
    if(n.text) notesParts.push((n.type ? n.type + ': ' : '') + n.text);
  });
  if(job.unit_make_model) notesParts.push('Unit: ' + job.unit_make_model);
  if(job.unit_id) notesParts.push('Unit ID: ' + job.unit_id);
  var notesText = notesParts.join('\n');

  // Customer section
  var custHTML = '<div style="margin-bottom:18px;padding:14px;background:var(--light);border-radius:8px">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">' +
      '<h4 style="margin:0;font-size:14px">Customer</h4>' +
      '<button class="btn btn-ghost btn-sm" onclick="copyShopifySection(\'shopify-customer\')">Copy</button>' +
    '</div>' +
    '<pre id="shopify-customer" style="white-space:pre-wrap;font-family:var(--font-b);font-size:13px;margin:0;line-height:1.6">' +
      esc(job.customer_name || '(No customer)') + '\n' +
      esc(job.contact_email || '') + '\n' +
      esc(job.contact_phone || '') + '\n' +
      esc(job.address || '') +
    '</pre></div>';

  // Line items table
  var itemsHTML = '<div style="margin-bottom:18px;padding:14px;background:var(--light);border-radius:8px">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">' +
      '<h4 style="margin:0;font-size:14px">Line Items (' + lineItems.length + ')</h4>' +
      '<button class="btn btn-ghost btn-sm" onclick="copyShopifySection(\'shopify-items\')">Copy</button>' +
    '</div>';

  if(lineItems.length > 0){
    itemsHTML += '<table id="shopify-items" style="width:100%;border-collapse:collapse;font-size:13px">' +
      '<tr style="border-bottom:2px solid var(--border);text-align:left">' +
        '<th style="padding:6px 8px">Item</th>' +
        '<th style="padding:6px 8px;width:60px;text-align:center">Qty</th>' +
        '<th style="padding:6px 8px;width:100px;text-align:right">Price</th>' +
      '</tr>';
    lineItems.forEach(function(li){
      itemsHTML += '<tr style="border-bottom:1px solid var(--border)">' +
        '<td style="padding:6px 8px">' + esc(li.title) + '</td>' +
        '<td style="padding:6px 8px;text-align:center">' + esc(li.qty) + '</td>' +
        '<td style="padding:6px 8px;text-align:right">$' + esc(formatMoney(li.price)) + '</td>' +
      '</tr>';
    });
    itemsHTML += '</table>';
  } else {
    itemsHTML += '<p id="shopify-items" style="color:var(--gray);margin:0">No line items in this estimate.</p>';
  }
  itemsHTML += '</div>';

  // Notes section
  var notesHTML = '<div style="margin-bottom:18px;padding:14px;background:var(--light);border-radius:8px">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">' +
      '<h4 style="margin:0;font-size:14px">Order Notes</h4>' +
      '<button class="btn btn-ghost btn-sm" onclick="copyShopifySection(\'shopify-notes\')">Copy</button>' +
    '</div>' +
    '<pre id="shopify-notes" style="white-space:pre-wrap;font-family:var(--font-b);font-size:13px;margin:0;line-height:1.6">' +
      esc(notesText || '(No notes)') +
    '</pre></div>';

  // Totals
  var totalsHTML = '<div style="margin-bottom:18px;padding:14px;background:var(--light);border-radius:8px">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">' +
      '<h4 style="margin:0;font-size:14px">Totals</h4>' +
      '<button class="btn btn-ghost btn-sm" onclick="copyShopifySection(\'shopify-totals\')">Copy</button>' +
    '</div>' +
    '<pre id="shopify-totals" style="white-space:pre-wrap;font-family:var(--font-b);font-size:13px;margin:0;line-height:1.6">' +
      'Materials Subtotal: $' + esc(formatMoney(totals.materials_subtotal)) + '\n' +
      'Labor Subtotal: $' + esc(formatMoney(totals.labor_subtotal)) + '\n' +
      'Additional Costs: $' + esc(formatMoney(totals.additional_costs)) + '\n' +
      'Contingency: $' + esc(formatMoney(totals.contingency)) + '\n' +
      'Grand Total: $' + esc(formatMoney(totals.grand_total)) + '\n' +
      'Deposit: $' + esc(formatMoney(totals.deposit_amount)) +
    '</pre></div>';

  // CSV download button
  var csvBtnHTML = '<div style="display:flex;gap:10px;justify-content:flex-end">' +
    '<button class="btn btn-ghost" onclick="copyShopifyAll()">&#128203; Copy All</button>' +
    '<button class="btn btn-primary" onclick="downloadShopifyCSV()">&#8659; Download CSV</button>' +
  '</div>';

  // Instructions
  var instrHTML = '<div style="margin-bottom:18px;padding:12px 14px;background:var(--amber);color:var(--teal);border-radius:8px;font-size:12px;line-height:1.5">' +
    '<b>How to use:</b> In Shopify Admin, go to <b>Orders &rarr; Drafts &rarr; Create order</b>. ' +
    'Copy each section below and paste into the matching fields. Or download the CSV to import line items.' +
  '</div>';

  body.innerHTML = instrHTML + custHTML + itemsHTML + notesHTML + totalsHTML + csvBtnHTML;
  modal.classList.add('open');
}

function closeShopifyModal(){
  var modal = document.getElementById('shopify-modal');
  if(modal) modal.classList.remove('open');
}

function formatMoney(val){
  var n = parseFloat(String(val||'0').replace(/[$,]/g,'')) || 0;
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function copyShopifySection(id){
  var el = document.getElementById(id);
  if(!el) return;
  var text = '';
  if(el.tagName === 'TABLE'){
    // Convert table to tab-separated text
    var rows = el.querySelectorAll('tr');
    rows.forEach(function(row){
      var cells = row.querySelectorAll('th,td');
      var parts = [];
      cells.forEach(function(c){ parts.push(c.textContent.trim()); });
      text += parts.join('\t') + '\n';
    });
  } else {
    text = el.textContent;
  }
  if(navigator.clipboard){
    navigator.clipboard.writeText(text).then(function(){
      toast('Copied to clipboard!');
    }).catch(function(){
      fallbackCopy(text);
    });
  } else {
    fallbackCopy(text);
  }
}

function copyShopifyAll(){
  var sections = ['shopify-customer','shopify-items','shopify-notes','shopify-totals'];
  var headers = ['CUSTOMER','LINE ITEMS','NOTES','TOTALS'];
  var allText = '';
  sections.forEach(function(id, i){
    allText += '=== ' + headers[i] + ' ===\n';
    var el = document.getElementById(id);
    if(!el) return;
    if(el.tagName === 'TABLE'){
      var rows = el.querySelectorAll('tr');
      rows.forEach(function(row){
        var cells = row.querySelectorAll('th,td');
        var parts = [];
        cells.forEach(function(c){ parts.push(c.textContent.trim()); });
        allText += parts.join('\t') + '\n';
      });
    } else {
      allText += el.textContent + '\n';
    }
    allText += '\n';
  });
  if(navigator.clipboard){
    navigator.clipboard.writeText(allText).then(function(){
      toast('All sections copied!');
    }).catch(function(){
      fallbackCopy(allText);
    });
  } else {
    fallbackCopy(allText);
  }
}

function fallbackCopy(text){
  var ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;left:-9999px';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); toast('Copied!'); }
  catch(e){ toast('Copy failed — select text manually','error'); }
  document.body.removeChild(ta);
}

function downloadShopifyCSV(){
  var data = collectFormData();
  var mats = (data.materials && data.materials.items) || [];
  var costs = data.additional_costs || [];
  var scope = data.scope_of_work || [];

  var rows = [['Title','Quantity','Price','Notes']];
  mats.forEach(function(m){
    if(!m.description) return;
    rows.push([m.description, m.qty||'1', m.amount||m.unit_rate||'0', '']);
  });
  scope.forEach(function(s){
    if(!s.description || !s.labor_cost) return;
    rows.push(['Labor: '+s.description+(s.phase?' ('+s.phase+')':''), s.crew||'1', s.labor_cost, '']);
  });
  costs.forEach(function(c){
    if(!c.item) return;
    rows.push([c.item+(c.details?' - '+c.details:''), '1', c.cost||'0', '']);
  });

  var csvContent = rows.map(function(row){
    return row.map(function(cell){
      return '"' + String(cell).replace(/"/g,'""') + '"';
    }).join(',');
  }).join('\n');

  var blob = new Blob([csvContent], {type:'text/csv;charset=utf-8;'});
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  var name = (data.job && data.job.customer_name) || 'estimate';
  a.download = 'shopify-draft-' + name.replace(/[^a-zA-Z0-9]/g,'-').toLowerCase() + '.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast('CSV downloaded!');
}
