// ── Form Helpers ──────────────────────────────────────────────
function clearForm(){
  var ids = ['f-customer','f-address','f-phone','f-email','f-date','f-unit-make',
    'f-unit-id','f-ref','f-chws','f-ambient','f-filename','f-perf-alert',
    'f-mat-unit','f-mat-size','f-mat-lead','f-warranty','f-tot-mat','f-tot-labor',
    'f-tot-add','f-tot-cont','f-tot-grand','f-tot-deposit','f-send-email','f-cc-email'];
  ids.forEach(function(id){ var el=document.getElementById(id); if(el) el.value=''; });
  var st = document.getElementById('f-status'); if(st) st.value='draft';
  ['findings-list','perf-list','scope-list','mat-list','costs-list','notes-list']
    .forEach(function(id){ var el=document.getElementById(id); if(el) el.innerHTML=''; });
  photoStore = [];
  var pg = document.getElementById('photo-grid'); if(pg) pg.innerHTML='';
  updatePhotoCountLabel();
  updateTotalsPanel();
}

function updateTotalsPanel(){
  var map = {mat:'f-tot-mat',labor:'f-tot-labor',add:'f-tot-add',cont:'f-tot-cont',grand:'f-tot-grand',deposit:'f-tot-deposit'};
  Object.keys(map).forEach(function(k){
    var el = document.getElementById('tp-'+k);
    if(el) el.textContent = v(map[k]) || '-';
  });
}

// ── Dynamic Row Builders ──────────────────────────────────────
function makeSevSelect(cls, val, opts){
  var sel = document.createElement('select');
  sel.className = 'sev-select sev-'+val;
  sel.setAttribute('data-cls', cls);
  opts.forEach(function(o){
    var opt = document.createElement('option');
    opt.value = o.v; opt.textContent = o.l;
    if(o.v===val) opt.selected = true;
    sel.appendChild(opt);
  });
  return sel;
}

function addFinding(f){
  f = f||{};
  var sev = f.severity||'warn';
  var row = document.createElement('div'); row.className='dyn-row';
  var fields = document.createElement('div'); fields.className='dyn-row-fields';

  var g1=document.createElement('div'); g1.className='form-group';
  var l1=document.createElement('label'); l1.textContent='Category';
  var i1=document.createElement('input'); i1.className='fc'; i1.placeholder='e.g. Water Reservoir'; i1.value=f.category||'';
  g1.appendChild(l1); g1.appendChild(i1);

  var g2=document.createElement('div'); g2.className='form-group';
  var l2=document.createElement('label'); l2.textContent='Finding';
  var t2=document.createElement('textarea'); t2.className='ff'; t2.rows=2; t2.placeholder='Describe the finding...'; t2.value=f.finding||'';
  g2.appendChild(l2); g2.appendChild(t2);

  var g3=document.createElement('div'); g3.className='form-group sev-col';
  var l3=document.createElement('label'); l3.textContent='Severity';
  var sel=makeSevSelect('fs',sev,[{v:'critical',l:'Critical'},{v:'warn',l:'Warning'},{v:'ok',l:'OK'}]);
  sel.classList.add('fs');
  g3.appendChild(l3); g3.appendChild(sel);

  fields.appendChild(g1); fields.appendChild(g2); fields.appendChild(g3);
  var rb=document.createElement('button'); rb.className='remove-btn'; rb.type='button'; rb.textContent='Remove Finding';
  row.appendChild(fields); row.appendChild(rb);
  document.getElementById('findings-list').appendChild(row);
}

function addPerf(p){
  p = p||{};
  var stat = p.status||'neutral';
  var row=document.createElement('div'); row.className='dyn-row';
  var fields=document.createElement('div'); fields.className='dyn-row-fields';

  function mkG(lbl,cls,val,ph){
    var g=document.createElement('div'); g.className='form-group';
    var l=document.createElement('label'); l.textContent=lbl;
    var i=document.createElement('input'); i.className=cls; i.value=val||''; i.placeholder=ph||'';
    g.appendChild(l); g.appendChild(i); return g;
  }

  var g4=document.createElement('div'); g4.className='form-group sev-col';
  var l4=document.createElement('label'); l4.textContent='Status';
  var sel=makeSevSelect('ps',stat,[{v:'critical',l:'Critical'},{v:'warn',l:'Low'},{v:'ok',l:'Pass'},{v:'neutral',l:'Neutral'}]);
  sel.classList.add('ps');
  g4.appendChild(l4); g4.appendChild(sel);

  fields.appendChild(mkG('Metric','pm',p.metric,'e.g. Cooling Delta'));
  fields.appendChild(mkG('Measured','pv',p.measured,'~1 deg F'));
  fields.appendChild(mkG('Expected','pe',p.expected,'>10 deg F expected'));
  fields.appendChild(g4);

  var rb=document.createElement('button'); rb.className='remove-btn'; rb.type='button'; rb.textContent='Remove Metric';
  row.appendChild(fields); row.appendChild(rb);
  document.getElementById('perf-list').appendChild(row);
}

function addScope(s){
  s = s||{};
  var row=document.createElement('div'); row.className='dyn-row';
  var fields=document.createElement('div'); fields.className='dyn-row-fields';

  function mkG(lbl,cls,val,ph,ta){
    var g=document.createElement('div'); g.className='form-group';
    var l=document.createElement('label'); l.textContent=lbl;
    var inp=ta?document.createElement('textarea'):document.createElement('input');
    inp.className=cls; inp.value=val||''; inp.placeholder=ph||'';
    if(ta) inp.rows=2;
    g.appendChild(l); g.appendChild(inp); return g;
  }

  fields.appendChild(mkG('Phase','sp',s.phase,'Day 1 - Demo'));
  fields.appendChild(mkG('Description','sd',s.description,'Work description...',true));
  fields.appendChild(mkG('Crew / Duration','sc',s.crew,'4 crew x $79/hr x 8 hrs'));
  fields.appendChild(mkG('Labor Cost','sl',s.labor_cost,'$3,160.00'));

  var rb=document.createElement('button'); rb.className='remove-btn'; rb.type='button'; rb.textContent='Remove Phase';
  row.appendChild(fields); row.appendChild(rb);
  document.getElementById('scope-list').appendChild(row);
}

function addMaterial(m){
  m = m||{};
  var row=document.createElement('div'); row.className='dyn-row';
  var fields=document.createElement('div'); fields.className='dyn-row-fields';

  function mkG(lbl,cls,val,ph,narrow){
    var g=document.createElement('div'); g.className='form-group'+(narrow?' narrow':'');
    var l=document.createElement('label'); l.textContent=lbl;
    var i=document.createElement('input'); i.className=cls; i.value=val||''; i.placeholder=ph||'';
    g.appendChild(l); g.appendChild(i); return g;
  }

  fields.appendChild(mkG('Description','md',m.description,'Fill media, nozzles...'));
  fields.appendChild(mkG('Qty','mq',m.qty,'0',true));
  fields.appendChild(mkG('Unit Rate','mr',m.unit_rate,'$358.15'));
  fields.appendChild(mkG('Amount','ma',m.amount,'$3,223.35'));

  var rb=document.createElement('button'); rb.className='remove-btn'; rb.type='button'; rb.textContent='Remove Material';
  row.appendChild(fields); row.appendChild(rb);
  document.getElementById('mat-list').appendChild(row);
}

function addCost(c){
  c = c||{};
  var row=document.createElement('div'); row.className='dyn-row';
  var fields=document.createElement('div'); fields.className='dyn-row-fields';

  function mkG(lbl,cls,val,ph){
    var g=document.createElement('div'); g.className='form-group';
    var l=document.createElement('label'); l.textContent=lbl;
    var i=document.createElement('input'); i.className=cls; i.value=val||''; i.placeholder=ph||'';
    g.appendChild(l); g.appendChild(i); return g;
  }

  fields.appendChild(mkG('Item','ci',c.item,'Heater Rental'));
  fields.appendChild(mkG('Details','cd',c.details,'On-site heater for drying'));
  fields.appendChild(mkG('Cost','cc',c.cost,'$225.00'));

  var rb=document.createElement('button'); rb.className='remove-btn'; rb.type='button'; rb.textContent='Remove Cost';
  row.appendChild(fields); row.appendChild(rb);
  document.getElementById('costs-list').appendChild(row);
}

function addNote(n){
  n = n||{};
  var type = n.type||'ok';
  var row=document.createElement('div'); row.className='dyn-row';
  var fields=document.createElement('div'); fields.className='dyn-row-fields';

  var g1=document.createElement('div'); g1.className='form-group sev-col';
  var l1=document.createElement('label'); l1.textContent='Type';
  var sel=makeSevSelect('nt',type,[{v:'warning',l:'Warning'},{v:'ok',l:'OK'}]);
  sel.classList.add('nt');
  g1.appendChild(l1); g1.appendChild(sel);

  var g2=document.createElement('div'); g2.className='form-group';
  var l2=document.createElement('label'); l2.textContent='Note';
  var ta=document.createElement('textarea'); ta.className='nt-text'; ta.rows=2; ta.value=n.text||'';
  g2.appendChild(l2); g2.appendChild(ta);

  fields.appendChild(g1); fields.appendChild(g2);
  var rb=document.createElement('button'); rb.className='remove-btn'; rb.type='button'; rb.textContent='Remove Note';
  row.appendChild(fields); row.appendChild(rb);
  document.getElementById('notes-list').appendChild(row);
}

// ── Collect & Load Form Data ──────────────────────────────────
function collectFormData(){
  var findings = Array.from(document.querySelectorAll('#findings-list .dyn-row')).map(function(r){
    return { category:r.querySelector('.fc').value, finding:r.querySelector('.ff').value, severity:r.querySelector('.fs').value };
  });
  var performance = Array.from(document.querySelectorAll('#perf-list .dyn-row')).map(function(r){
    return { metric:r.querySelector('.pm').value, measured:r.querySelector('.pv').value, expected:r.querySelector('.pe').value, status:r.querySelector('.ps').value };
  });
  var scope = Array.from(document.querySelectorAll('#scope-list .dyn-row')).map(function(r){
    return { phase:r.querySelector('.sp').value, description:r.querySelector('.sd').value, crew:r.querySelector('.sc').value, labor_cost:r.querySelector('.sl').value };
  });
  var mats = Array.from(document.querySelectorAll('#mat-list .dyn-row')).map(function(r){
    return { description:r.querySelector('.md').value, qty:r.querySelector('.mq').value||null, unit_rate:r.querySelector('.mr').value, amount:r.querySelector('.ma').value };
  });
  var costs = Array.from(document.querySelectorAll('#costs-list .dyn-row')).map(function(r){
    return { item:r.querySelector('.ci').value, details:r.querySelector('.cd').value, cost:r.querySelector('.cc').value };
  });
  var notes = Array.from(document.querySelectorAll('#notes-list .dyn-row')).map(function(r){
    return { type:r.querySelector('.nt').value, text:r.querySelector('.nt-text').value };
  });
  return {
    job:{ customer_name:v('f-customer'), address:v('f-address'), contact_phone:v('f-phone'), contact_email:v('f-email'), inspection_date:v('f-date'), unit_make_model:v('f-unit-make'), unit_id:v('f-unit-id'), reference_doc:v('f-ref'), chws_enable_temp:v('f-chws'), ambient_temp:v('f-ambient'), output_filename:v('f-filename'), status:v('f-status') },
    findings:findings,
    performance:performance, performance_alert:v('f-perf-alert'),
    scope_of_work:scope,
    materials:{ unit_description:v('f-mat-unit'), fill_pack_size:v('f-mat-size'), lead_time:v('f-mat-lead'), items:mats },
    additional_costs:costs,
    totals:{ materials_subtotal:v('f-tot-mat'), labor_subtotal:v('f-tot-labor'), additional_costs:v('f-tot-add'), contingency:v('f-tot-cont'), grand_total:v('f-tot-grand'), deposit_amount:v('f-tot-deposit') },
    notes:notes,
    photos:photoStore.map(function(p){ return {dataUrl:p.dataUrl, caption:p.caption}; }),
    warranty:v('f-warranty')
  };
}

function loadJobIntoForm(data){
  if(!data) return;
  clearForm();
  var j = data.job||{};
  var setV = function(id,val){ var el=document.getElementById(id); if(el) el.value=val||''; };
  setV('f-customer',j.customer_name); setV('f-address',j.address);
  setV('f-phone',j.contact_phone); setV('f-email',j.contact_email);
  setV('f-date',j.inspection_date); setV('f-unit-make',j.unit_make_model);
  setV('f-unit-id',j.unit_id); setV('f-ref',j.reference_doc);
  setV('f-chws',j.chws_enable_temp); setV('f-ambient',j.ambient_temp);
  setV('f-filename',j.output_filename); setV('f-perf-alert',data.performance_alert);
  setV('f-warranty',data.warranty);
  var st=document.getElementById('f-status'); if(st) st.value=j.status||'draft';
  var mat = data.materials||{};
  setV('f-mat-unit',mat.unit_description); setV('f-mat-size',mat.fill_pack_size); setV('f-mat-lead',mat.lead_time);
  var t = data.totals||{};
  setV('f-tot-mat',t.materials_subtotal); setV('f-tot-labor',t.labor_subtotal);
  setV('f-tot-add',t.additional_costs); setV('f-tot-cont',t.contingency);
  setV('f-tot-grand',t.grand_total); setV('f-tot-deposit',t.deposit_amount);
  (data.findings||[]).forEach(addFinding);
  (data.performance||[]).forEach(addPerf);
  (data.scope_of_work||[]).forEach(addScope);
  (mat.items||[]).forEach(addMaterial);
  (data.additional_costs||[]).forEach(addCost);
  (data.notes||[]).forEach(addNote);
  photoStore = [];
  (data.photos||[]).forEach(function(p){
    var id='ph_'+Date.now()+'_'+Math.random().toString(36).slice(2);
    var entry={id:id, dataUrl:p.dataUrl, caption:p.caption||''};
    photoStore.push(entry);
    renderPhotoCard(entry);
  });
  updatePhotoCountLabel();
  updateTotalsPanel();
}

// ── Photos ────────────────────────────────────────────────────
function updatePhotoCountLabel(){
  var el=document.getElementById('photo-count-label');
  if(el) el.textContent = photoStore.length ? photoStore.length+' photo'+(photoStore.length!==1?'s':'') : '0 photos';
}

function handlePhotoUpload(e){
  var files = Array.from(e.target.files);
  files.forEach(function(file){
    if(!file.type.match(/^image\//)) return;
    var reader = new FileReader();
    reader.onload = function(ev){
      var id='ph_'+Date.now()+'_'+Math.random().toString(36).slice(2);
      var entry={id:id, dataUrl:ev.target.result, caption:''};
      photoStore.push(entry);
      renderPhotoCard(entry);
      updatePhotoCountLabel();
    };
    reader.readAsDataURL(file);
  });
  e.target.value='';
}

function renderPhotoCard(photo){
  var grid=document.getElementById('photo-grid');
  var card=document.createElement('div'); card.className='photo-card';
  var img=document.createElement('img'); img.src=photo.dataUrl; img.alt='Site photo';
  var body=document.createElement('div'); body.className='photo-card-body';
  var inp=document.createElement('input'); inp.type='text'; inp.placeholder='Add caption...'; inp.value=photo.caption||'';
  (function(pid){ inp.addEventListener('input',function(){ var p=photoStore.find(function(x){return x.id===pid;}); if(p) p.caption=inp.value; }); })(photo.id);
  var rb=document.createElement('button'); rb.className='photo-remove-btn'; rb.type='button'; rb.textContent='Remove Photo'; rb.dataset.id=photo.id;
  body.appendChild(inp); body.appendChild(rb);
  card.appendChild(img); card.appendChild(body);
  grid.appendChild(card);
}

function removePhoto(id){
  photoStore = photoStore.filter(function(p){ return p.id!==id; });
  document.querySelectorAll('.photo-remove-btn').forEach(function(btn){
    if(btn.dataset.id===id){ var card=btn.closest('.photo-card'); if(card) card.remove(); }
  });
  updatePhotoCountLabel();
}
