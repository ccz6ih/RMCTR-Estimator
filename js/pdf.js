// ── PDF Logo Helper ───────────────────────────────────────────
function getPDFLogoHTML(size){
  size = size || 44;
  return '<img src="logo/rmctr-logo.png" alt="" style="width:'+size+'px;height:'+size+'px;border-radius:8px;object-fit:contain;margin-right:12px;vertical-align:middle" onerror="this.style.display=\'none\'"/>';
}

// ── PDF HTML Renderer ─────────────────────────────────────────
function renderPDFHTML(data, theme){
  theme = theme || 'standard';
  if(theme==='minimal') return renderPDFMinimal(data);
  if(theme==='executive') return renderPDFExecutive(data);
  return renderPDFStandard(data);
}

function renderPDFStandard(data){
  var co = getSettings();
  var j = data.job||{};
  var t = data.totals||{};
  var mat = data.materials||{};

  var PERF_L = {ok:'PASS', warn:'LOW', critical:'CRIT', neutral:'--'};

  var findRows = (data.findings||[]).filter(function(f){ return f.category||f.finding; }).map(function(f){
    var s=f.severity||'warn';
    return '<tr><td style="text-align:center;width:28px"><span class="pdf-dot '+s+'">&#9679;</span></td><td style="width:130px"><b>'+esc(f.category)+'</b></td><td>'+esc(f.finding)+'</td></tr>';
  }).join('');

  var perfRows = (data.performance||[]).filter(function(p){ return p.metric; }).map(function(p){
    var s=p.status||'neutral';
    return '<tr><td>'+esc(p.metric)+'</td><td><b>'+esc(p.measured)+'</b></td><td style="color:#6B7280;font-style:italic">'+esc(p.expected)+'</td><td style="text-align:center"><span class="pdf-badge '+s+'">'+(PERF_L[s]||s.toUpperCase())+'</span></td></tr>';
  }).join('');

  var scopeRows = (data.scope_of_work||[]).filter(function(s){ return s.phase||s.description; }).map(function(s){
    return '<tr><td><span class="pdf-phase">'+esc(s.phase)+'</span></td><td>'+esc(s.description)+'</td><td style="color:#6B7280;font-size:10.5px">'+esc(s.crew)+'</td><td style="text-align:right"><span class="pdf-money">'+esc(s.labor_cost)+'</span></td></tr>';
  }).join('');

  var matRows = (mat.items||[]).filter(function(m){ return m.description; }).map(function(m){
    return '<tr><td>'+esc(m.description)+'</td><td style="text-align:center">'+(m.qty!=null?esc(m.qty):'--')+'</td><td style="text-align:right;color:#6B7280">'+esc(m.unit_rate)+'</td><td style="text-align:right"><span class="pdf-money">'+esc(m.amount)+'</span></td></tr>';
  }).join('');

  var costRows = (data.additional_costs||[]).filter(function(c){ return c.item; }).map(function(c){
    return '<tr><td><b>'+esc(c.item)+'</b></td><td>'+esc(c.details)+'</td><td style="text-align:right"><span class="pdf-money">'+esc(c.cost)+'</span></td></tr>';
  }).join('');

  var noteRows = (data.notes||[]).filter(function(n){ return n.text; }).map(function(n){
    var icon = n.type==='warning' ? '<span style="color:#EF4444">&#9888;</span>' : '<span style="color:#10B981">&#10004;</span>';
    return '<tr><td style="text-align:center;width:28px">'+icon+'</td><td>'+esc(n.text)+'</td></tr>';
  }).join('');

  var photoHTML = '';
  if((data.photos||[]).length){
    photoHTML = '<div class="pdf-sh t2">Site Inspection Photos</div>'
      +'<div class="pdf-photos-grid">'
      +(data.photos||[]).map(function(p){
        return '<div class="pdf-photo-item"><img src="'+p.dataUrl+'" alt="site photo"/>'+(p.caption?'<div class="pdf-photo-caption">'+esc(p.caption)+'</div>':'')+'</div>';
      }).join('')+'</div>';
  }

  return '<div id="pdf-doc">'
    +'<div class="pdf-header">'
      +'<div class="pdf-company" style="display:flex;align-items:flex-start">'+getPDFLogoHTML(48)+'<div><h1>'+esc(co.name)+'</h1><p>'+esc(co.fullname)+'</p><div class="addr">'+esc(co.address)+'<br>'+esc(co.phone)+' &middot; '+esc(co.email)+'<br>'+esc(co.contact)+'</div></div></div>'
      +'<div class="pdf-job-info"><div class="lbl">INSPECTION ESTIMATE</div><div class="val">'+esc(j.customer_name||'--')+'</div><div style="color:rgba(255,255,255,.5);font-size:11px;margin-top:4px">'+esc(j.address||'')+'</div><div style="color:rgba(255,255,255,.5);font-size:11px">'+esc(j.inspection_date||'')+'</div></div>'
    +'</div>'
    +'<div class="pdf-sh">Customer &amp; Unit Information</div>'
    +'<div class="pdf-info-grid">'
      +'<div>'
        +'<div class="pdf-info-row"><span class="k">Customer</span><span>'+esc(j.customer_name||'--')+'</span></div>'
        +'<div class="pdf-info-row"><span class="k">Address</span><span>'+esc(j.address||'--')+'</span></div>'
        +'<div class="pdf-info-row"><span class="k">Phone</span><span>'+esc(j.contact_phone||'--')+'</span></div>'
        +'<div class="pdf-info-row"><span class="k">Email</span><span>'+esc(j.contact_email||'--')+'</span></div>'
        +'<div class="pdf-info-row"><span class="k">Date</span><span>'+esc(j.inspection_date||'--')+'</span></div>'
      +'</div>'
      +'<div>'
        +'<div class="pdf-info-row"><span class="k">Unit Make</span><span>'+esc(j.unit_make_model||'--')+'</span></div>'
        +'<div class="pdf-info-row"><span class="k">Unit ID</span><span>'+esc(j.unit_id||'--')+'</span></div>'
        +'<div class="pdf-info-row"><span class="k">Reference</span><span>'+esc(j.reference_doc||'--')+'</span></div>'
        +'<div class="pdf-info-row"><span class="k">CHWS Temp</span><span>'+esc(j.chws_enable_temp||'--')+'</span></div>'
        +'<div class="pdf-info-row"><span class="k">Ambient</span><span>'+esc(j.ambient_temp||'--')+'</span></div>'
      +'</div>'
    +'</div>'
    +(findRows ? '<div class="pdf-sh">Inspection Findings</div><table class="pdf-table"><thead><tr><th>&#9679;</th><th>Category</th><th>Finding</th></tr></thead><tbody>'+findRows+'</tbody></table>' : '')
    +(perfRows ? '<div class="pdf-sh t2">Performance Data</div><table class="pdf-table"><thead><tr><th>Metric</th><th>Measured</th><th>Expected</th><th style="width:80px">Status</th></tr></thead><tbody>'+perfRows+'</tbody></table>' : '')
    +(data.performance_alert ? '<div class="pdf-alert">&#9888; EFFICIENCY ALERT: '+esc(data.performance_alert)+'</div>' : '')
    +(scopeRows ? '<div class="pdf-sh">Scope of Work &amp; Labor</div><table class="pdf-table"><thead><tr><th style="width:120px">Phase</th><th>Description</th><th style="width:150px">Crew</th><th style="width:90px;text-align:right">Labor</th></tr></thead><tbody>'+scopeRows+'</tbody></table>' : '')
    +(matRows ? '<div class="pdf-sh t2">Materials - '+esc(mat.unit_description||'')+'</div>'+(mat.fill_pack_size||mat.lead_time ? '<div style="padding:8px 16px;background:#F4EDE3;font-size:10.5px;color:#6B7280">Fill Pack: '+esc(mat.fill_pack_size||'--')+' &nbsp;|&nbsp; Lead Time: <b style="color:#B45309">'+esc(mat.lead_time||'--')+'</b></div>' : '')+'<table class="pdf-table"><thead><tr><th>Description</th><th style="width:40px;text-align:center">Qty</th><th style="width:80px;text-align:right">Rate</th><th style="width:90px;text-align:right">Amount</th></tr></thead><tbody>'+matRows+'</tbody></table>' : '')
    +(costRows ? '<div class="pdf-sh">Additional Costs</div><table class="pdf-table"><thead><tr><th style="width:140px">Item</th><th>Details</th><th style="width:90px;text-align:right">Cost</th></tr></thead><tbody>'+costRows+'</tbody></table>' : '')
    +'<div class="pdf-totals">'
      +'<div class="pdf-tr"><span class="tl">Materials</span><span class="tv">'+esc(t.materials_subtotal||'--')+'</span></div>'
      +'<div class="pdf-tr"><span class="tl">Labor</span><span class="tv">'+esc(t.labor_subtotal||'--')+'</span></div>'
      +'<div class="pdf-tr"><span class="tl">Additional Costs</span><span class="tv">'+esc(t.additional_costs||'--')+'</span></div>'
      +'<div class="pdf-tr"><span class="tl">Contingency</span><span class="tv">'+esc(t.contingency||'--')+'</span></div>'
      +'<div class="pdf-tr grand"><span class="tl">ESTIMATE TOTAL</span><span class="tv">'+esc(t.grand_total||'--')+'</span></div>'
      +'<div class="pdf-tr dep"><span class="tl">Deposit Required (50%)</span><span class="tv">'+esc(t.deposit_amount||'--')+'</span></div>'
    +'</div>'
    +(noteRows ? '<div class="pdf-sh t2">Notes &amp; Recommendations</div><table class="pdf-table"><tbody>'+noteRows+'</tbody></table>' : '')
    +(data.warranty ? '<div class="pdf-warranty"><b>WARRANTY &amp; TERMS:</b> '+esc(data.warranty)+'</div>' : '')
    +photoHTML
    +'<div class="pdf-footer">'+esc(co.name)+' &mdash; '+esc(co.fullname)+' | '+esc(co.address)+' | '+esc(co.phone)+' | '+esc(co.email)+' | '+esc(co.contact)+'<br>Professional estimate only. Figures subject to change based on actual conditions. &copy; '+new Date().getFullYear()+' RMCTR.</div>'
    +'</div>';
}

// ── Minimal PDF Theme ─────────────────────────────────────────
function renderPDFMinimal(data){
  var co = getSettings();
  var j = data.job||{};
  var t = data.totals||{};
  var mat = data.materials||{};

  var findRows = (data.findings||[]).filter(function(f){ return f.category||f.finding; }).map(function(f){
    return '<tr><td style="width:130px;font-weight:600">'+esc(f.category)+'</td><td>'+esc(f.finding)+'</td><td style="width:80px;text-align:center;font-size:10px;text-transform:uppercase;color:#6B7280">'+esc(f.severity||'--')+'</td></tr>';
  }).join('');

  var scopeRows = (data.scope_of_work||[]).filter(function(s){ return s.phase||s.description; }).map(function(s){
    return '<tr><td style="width:120px;font-weight:600">'+esc(s.phase)+'</td><td>'+esc(s.description)+'</td><td style="text-align:right;font-family:\'JetBrains Mono\',monospace">'+esc(s.labor_cost)+'</td></tr>';
  }).join('');

  var matRows = (mat.items||[]).filter(function(m){ return m.description; }).map(function(m){
    return '<tr><td>'+esc(m.description)+'</td><td style="text-align:center">'+(m.qty||'--')+'</td><td style="text-align:right">'+esc(m.unit_rate)+'</td><td style="text-align:right;font-weight:600">'+esc(m.amount)+'</td></tr>';
  }).join('');

  var costRows = (data.additional_costs||[]).filter(function(c){ return c.item; }).map(function(c){
    return '<tr><td style="font-weight:600">'+esc(c.item)+'</td><td>'+esc(c.details)+'</td><td style="text-align:right;font-weight:600">'+esc(c.cost)+'</td></tr>';
  }).join('');

  return '<div id="pdf-doc" style="font-family:\'DM Sans\',sans-serif;font-size:12px;color:#333;line-height:1.6;width:816px;background:#fff;padding:32px">'
    +'<div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #333;padding-bottom:16px;margin-bottom:20px">'
      +'<div style="display:flex;align-items:flex-start">'+getPDFLogoHTML(40)+'<div><div style="font-size:24px;font-weight:700;color:#0B2A35">'+esc(co.name)+'</div><div style="font-size:11px;color:#666;margin-top:2px">'+esc(co.fullname)+'</div><div style="font-size:10px;color:#999;margin-top:4px">'+esc(co.address)+' | '+esc(co.phone)+' | '+esc(co.email)+'</div></div></div>'
      +'<div style="text-align:right"><div style="font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:#999">Estimate</div><div style="font-size:14px;font-weight:600;color:#333;margin-top:2px">'+esc(j.customer_name||'--')+'</div><div style="font-size:11px;color:#666">'+esc(j.inspection_date||'')+'</div></div>'
    +'</div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px;font-size:11px">'
      +'<div>'+['Customer: '+esc(j.customer_name||'--'),'Address: '+esc(j.address||'--'),'Phone: '+esc(j.contact_phone||'--'),'Email: '+esc(j.contact_email||'--')].join('<br>')+'</div>'
      +'<div>'+['Unit: '+esc(j.unit_make_model||'--'),'ID: '+esc(j.unit_id||'--'),'Reference: '+esc(j.reference_doc||'--'),'CHWS/Ambient: '+esc(j.chws_enable_temp||'--')+' / '+esc(j.ambient_temp||'--')].join('<br>')+'</div>'
    +'</div>'
    +(findRows ? '<div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;border-bottom:1px solid #ddd;padding-bottom:4px;margin-bottom:8px;margin-top:20px">Findings</div><table style="width:100%;border-collapse:collapse;font-size:11px"><tbody>'+findRows.replace(/<tr>/g,'<tr style="border-bottom:1px solid #eee">')+'</tbody></table>' : '')
    +(scopeRows ? '<div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;border-bottom:1px solid #ddd;padding-bottom:4px;margin-bottom:8px;margin-top:20px">Scope of Work</div><table style="width:100%;border-collapse:collapse;font-size:11px"><tbody>'+scopeRows.replace(/<tr>/g,'<tr style="border-bottom:1px solid #eee">')+'</tbody></table>' : '')
    +(matRows ? '<div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;border-bottom:1px solid #ddd;padding-bottom:4px;margin-bottom:8px;margin-top:20px">Materials</div><table style="width:100%;border-collapse:collapse;font-size:11px"><tbody>'+matRows.replace(/<tr>/g,'<tr style="border-bottom:1px solid #eee">')+'</tbody></table>' : '')
    +(costRows ? '<div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;border-bottom:1px solid #ddd;padding-bottom:4px;margin-bottom:8px;margin-top:20px">Additional Costs</div><table style="width:100%;border-collapse:collapse;font-size:11px"><tbody>'+costRows.replace(/<tr>/g,'<tr style="border-bottom:1px solid #eee">')+'</tbody></table>' : '')
    +'<div style="background:#f5f5f5;padding:16px;margin-top:24px;border-radius:4px">'
      +'<div style="display:flex;justify-content:space-between;font-size:12px;padding:3px 0"><span>Materials</span><span>'+esc(t.materials_subtotal||'--')+'</span></div>'
      +'<div style="display:flex;justify-content:space-between;font-size:12px;padding:3px 0"><span>Labor</span><span>'+esc(t.labor_subtotal||'--')+'</span></div>'
      +'<div style="display:flex;justify-content:space-between;font-size:12px;padding:3px 0"><span>Additional</span><span>'+esc(t.additional_costs||'--')+'</span></div>'
      +'<div style="display:flex;justify-content:space-between;font-size:12px;padding:3px 0"><span>Contingency</span><span>'+esc(t.contingency||'--')+'</span></div>'
      +'<div style="display:flex;justify-content:space-between;font-size:16px;font-weight:700;border-top:2px solid #333;margin-top:8px;padding-top:10px"><span>TOTAL</span><span>'+esc(t.grand_total||'--')+'</span></div>'
      +'<div style="display:flex;justify-content:space-between;font-size:12px;padding:3px 0;color:#0D7A55"><span>Deposit (50%)</span><span>'+esc(t.deposit_amount||'--')+'</span></div>'
    +'</div>'
    +(data.warranty ? '<div style="font-size:10px;color:#666;margin-top:16px;padding:10px;border:1px solid #ddd;border-radius:4px"><b>WARRANTY & TERMS:</b> '+esc(data.warranty)+'</div>' : '')
    +'<div style="text-align:center;font-size:9px;color:#999;margin-top:24px;border-top:1px solid #eee;padding-top:10px">'+esc(co.name)+' | '+esc(co.address)+' | '+esc(co.phone)+' | '+esc(co.email)+' | &copy; '+new Date().getFullYear()+'</div>'
    +'</div>';
}

// ── Executive Summary PDF Theme ───────────────────────────────
function renderPDFExecutive(data){
  var co = getSettings();
  var j = data.job||{};
  var t = data.totals||{};

  var criticalCount = (data.findings||[]).filter(function(f){ return f.severity==='critical'; }).length;
  var totalFindings = (data.findings||[]).filter(function(f){ return f.category||f.finding; }).length;
  var totalPhases = (data.scope_of_work||[]).filter(function(s){ return s.phase||s.description; }).length;

  var summary = 'Our inspection of the cooling tower at '+esc(j.address||'the site')+' identified '+totalFindings+' finding'+(totalFindings!==1?'s':'')+' ('+criticalCount+' critical). '
    +'The recommended scope of work includes '+totalPhases+' phase'+(totalPhases!==1?'s':'')+' to restore the unit to optimal operating condition.';

  if(data.performance_alert){
    summary += ' '+esc(data.performance_alert);
  }

  var keyFindings = (data.findings||[]).filter(function(f){ return f.severity==='critical' && f.finding; }).slice(0,3).map(function(f){
    return '<li style="margin-bottom:4px"><b>'+esc(f.category)+':</b> '+esc(f.finding)+'</li>';
  }).join('');

  return '<div id="pdf-doc" style="font-family:\'DM Sans\',sans-serif;font-size:13px;color:#3C2D0F;line-height:1.5;width:816px;background:#fff">'
    +'<div class="pdf-header">'
      +'<div class="pdf-company" style="display:flex;align-items:flex-start">'+getPDFLogoHTML(48)+'<div><h1>'+esc(co.name)+'</h1><p>'+esc(co.fullname)+'</p><div class="addr">'+esc(co.address)+'<br>'+esc(co.phone)+' &middot; '+esc(co.email)+'</div></div></div>'
      +'<div class="pdf-job-info"><div class="lbl">EXECUTIVE SUMMARY</div><div class="val">'+esc(j.customer_name||'--')+'</div><div style="color:rgba(255,255,255,.5);font-size:11px;margin-top:4px">'+esc(j.inspection_date||'')+'</div></div>'
    +'</div>'
    +'<div style="padding:24px 28px">'
      +'<div style="font-size:11px;color:#6B7280;text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">Overview</div>'
      +'<p style="font-size:13px;line-height:1.7;margin-bottom:20px">'+summary+'</p>'
      +(keyFindings ? '<div style="font-size:11px;color:#6B7280;text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">Critical Findings</div><ul style="font-size:12px;padding-left:20px;margin-bottom:20px">'+keyFindings+'</ul>' : '')
      +'<div style="font-size:11px;color:#6B7280;text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">Unit Information</div>'
      +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:11px;margin-bottom:20px">'
        +'<div><b>Customer:</b> '+esc(j.customer_name||'--')+'</div>'
        +'<div><b>Unit:</b> '+esc(j.unit_make_model||'--')+'</div>'
        +'<div><b>Location:</b> '+esc(j.address||'--')+'</div>'
        +'<div><b>Unit ID:</b> '+esc(j.unit_id||'--')+'</div>'
      +'</div>'
    +'</div>'
    +'<div class="pdf-totals">'
      +'<div class="pdf-tr"><span class="tl">Materials</span><span class="tv">'+esc(t.materials_subtotal||'--')+'</span></div>'
      +'<div class="pdf-tr"><span class="tl">Labor</span><span class="tv">'+esc(t.labor_subtotal||'--')+'</span></div>'
      +'<div class="pdf-tr"><span class="tl">Additional Costs</span><span class="tv">'+esc(t.additional_costs||'--')+'</span></div>'
      +'<div class="pdf-tr"><span class="tl">Contingency</span><span class="tv">'+esc(t.contingency||'--')+'</span></div>'
      +'<div class="pdf-tr grand"><span class="tl">ESTIMATE TOTAL</span><span class="tv">'+esc(t.grand_total||'--')+'</span></div>'
      +'<div class="pdf-tr dep"><span class="tl">Deposit Required (50%)</span><span class="tv">'+esc(t.deposit_amount||'--')+'</span></div>'
    +'</div>'
    +(data.warranty ? '<div class="pdf-warranty"><b>WARRANTY & TERMS:</b> '+esc(data.warranty)+'</div>' : '')
    +'<div class="pdf-footer">'+esc(co.name)+' &mdash; '+esc(co.fullname)+' | '+esc(co.address)+' | '+esc(co.phone)+' | '+esc(co.email)+'<br>Executive Summary &mdash; detailed inspection report available upon request. &copy; '+new Date().getFullYear()+' RMCTR.</div>'
    +'</div>';
}

// ── PDF Actions ───────────────────────────────────────────────
function getSelectedPDFTheme(){
  var sel = document.getElementById('pdf-theme-select');
  return sel ? sel.value : 'standard';
}

function previewPDF(){
  var data = collectFormData();
  document.getElementById('pdf-modal-body').innerHTML = renderPDFHTML(data, getSelectedPDFTheme());
  document.getElementById('pdf-modal').classList.add('open');
}

function previewJobPDF(id){
  var jobs = getJobs();
  var job = null;
  for(var i=0;i<jobs.length;i++){ if(jobs[i].id===id){ job=jobs[i]; break; } }
  if(!job) return;
  document.getElementById('pdf-modal-body').innerHTML = renderPDFHTML(job.data, getSelectedPDFTheme());
  document.getElementById('pdf-modal').classList.add('open');
}

function closePDFModal(){
  document.getElementById('pdf-modal').classList.remove('open');
}

function downloadPDF(){
  saveJob();
  var data = collectFormData();
  var theme = getSelectedPDFTheme();
  toast('Generating PDF...');
  var container = document.createElement('div');
  container.style.cssText='position:fixed;left:-9999px;top:0;width:816px;background:#fff;z-index:-1;';
  container.innerHTML = renderPDFHTML(data, theme);
  document.body.appendChild(container);
  setTimeout(function(){
    var docEl = container.querySelector('#pdf-doc');
    html2canvas(docEl, {scale:1.5, useCORS:true, backgroundColor:'#ffffff', logging:false}).then(function(canvas){
      var imgData = canvas.toDataURL('image/jpeg',0.92);
      var pdf = new window.jspdf.jsPDF('p','pt','a4');
      var pdfW = pdf.internal.pageSize.getWidth();
      var pdfH = pdf.internal.pageSize.getHeight();
      var ratio = pdfW / canvas.width;
      var scaledH = canvas.height * ratio;
      var yPos = 0;
      while(yPos < scaledH){
        if(yPos > 0) pdf.addPage();
        pdf.addImage(imgData,'JPEG',0,-yPos,pdfW,scaledH);
        yPos += pdfH;
      }
      var fn = data.job.output_filename || 'RMCTR_'+(data.job.customer_name||'Estimate').replace(/\s+/g,'_')+'.pdf';
      pdf.save(fn);
      toast('PDF downloaded!');
    }).catch(function(e){
      toast('PDF error: '+e.message,'error');
    }).finally(function(){
      if(container.parentNode) document.body.removeChild(container);
    });
  }, 350);
}

function generateAndEmail(){
  var data = collectFormData();
  var co = getSettings();
  var to = v('f-send-email') || data.job.contact_email || '';
  var cc = v('f-cc-email');
  var subj = encodeURIComponent('Cooling Tower Inspection & Estimate - '+(data.job.customer_name||'Your Property'));
  var body = encodeURIComponent(
    'Dear '+(data.job.customer_name||'Valued Customer')+',\n\n'
    +'Thank you for the opportunity to inspect your cooling tower system'+(data.job.address?' at '+data.job.address:'')+'. Please find attached the detailed inspection estimate for your review.\n\n'
    +'ESTIMATE SUMMARY:\n'
    +'  Unit: '+(data.job.unit_id||'--')+' / '+(data.job.unit_make_model||'--')+'\n'
    +'  Estimated Total: '+(data.totals&&data.totals.grand_total||'--')+'\n'
    +'  Deposit (50%): '+(data.totals&&data.totals.deposit_amount||'--')+'\n'
    +'  Materials Lead Time: '+(data.materials&&data.materials.lead_time||'Approx. 3 weeks')+'\n\n'
    +'Please review and contact us to approve and schedule.\n\n'
    +co.contact+'\n'+co.name+'\n'+co.phone+' | '+co.email
  );
  var mailto = 'mailto:'+to+'?subject='+subj+'&body='+body;
  if(cc) mailto += '&cc='+encodeURIComponent(cc);
  window.location.href = mailto;
  setTimeout(downloadPDF, 900);
}
