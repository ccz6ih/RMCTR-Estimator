// ── Dashboard ─────────────────────────────────────────────────
function renderDashboard(filter){
  filter = (filter||'').toLowerCase();
  var jobs = getJobs().filter(function(j){ return !j.archived; });
  var allJobs = jobs;
  var now = new Date();
  var thisMonth = jobs.filter(function(j){
    var d = new Date(j.updatedAt||0);
    return d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear();
  }).length;
  var totals = jobs.map(function(j){ return parseMoney((j.data&&j.data.totals&&j.data.totals.grand_total)||'0'); });
  var revenue = totals.reduce(function(a,b){ return a+b; },0);
  var avg = jobs.length ? revenue/jobs.length : 0;

  document.getElementById('stat-total').textContent = jobs.length;
  document.getElementById('stat-revenue').textContent = '$'+Math.round(revenue/1000)+'K';
  document.getElementById('stat-month').textContent = thisMonth;
  document.getElementById('stat-avg').textContent = '$'+Math.round(avg/1000)+'K';

  // Render charts
  renderCharts(allJobs);

  var filtered = filter ? jobs.filter(function(j){
    var jb = (j.data&&j.data.job)||{};
    return (jb.customer_name||'').toLowerCase().indexOf(filter)>=0
      || (jb.address||'').toLowerCase().indexOf(filter)>=0
      || (jb.unit_id||'').toLowerCase().indexOf(filter)>=0;
  }) : jobs;

  var grid = document.getElementById('jobs-grid');
  if(!filtered.length){
    grid.innerHTML = '<div class="empty-state"><span class="icon">&#128203;</span><h3>'+(filter?'No results':'No estimates yet')+'</h3><p>'+(filter?'Try a different search term':'Tap "New Estimate" to get started')+'</p></div>';
    return;
  }

  var html = '';
  var rev = filtered.slice().reverse();
  for(var i=0;i<rev.length;i++){
    var job = rev[i];
    var jb = (job.data&&job.data.job)||{};
    var status = jb.status||'draft';
    var total = (job.data&&job.data.totals&&job.data.totals.grand_total)||'--';
    var date = jb.inspection_date || fmtDate(job.updatedAt);
    var versionLabel = (job.version && job.version > 1) ? '<span class="version-badge">v'+job.version+'</span>' : '';
    html += '<div class="job-card" data-id="'+job.id+'">'
      +'<div class="job-card-header">'
      +'<h3>'+esc(jb.customer_name||'Untitled')+versionLabel+'</h3>'
      +'<p>'+esc(jb.address||'No address')+'</p>'
      +'<span class="job-card-badge badge-'+status+'">'+(status==='complete'?'COMPLETE':'DRAFT')+'</span>'
      +'</div>'
      +'<div class="job-card-body">'
      +'<div class="job-card-meta"><span>'+esc(jb.unit_id||'--')+'</span><span>'+esc(date)+'</span></div>'
      +'<div class="job-card-total">'+esc(total)+'</div>'
      +'<div class="job-card-actions">'
      +'<button class="btn btn-sm btn-primary" data-action="edit" data-id="'+job.id+'">Edit</button>'
      +'<button class="btn btn-sm btn-secondary" data-action="preview" data-id="'+job.id+'">Preview</button>'
      +'<button class="btn btn-sm btn-ghost" data-action="duplicate" data-id="'+job.id+'">Duplicate</button>'
      +'<button class="btn btn-sm btn-ghost" data-action="export" data-id="'+job.id+'">Export</button>'
      +'<button class="btn btn-sm btn-danger" data-action="delete" data-id="'+job.id+'">Delete</button>'
      +'</div></div></div>';
  }
  grid.innerHTML = html;
}

function fmtDate(ts){
  if(!ts) return '--';
  return new Date(ts).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
}

// ── Charts ────────────────────────────────────────────────────
function renderCharts(jobs){
  var container = document.getElementById('charts-container');
  if(!container) return;
  if(!jobs.length){
    container.innerHTML = '';
    return;
  }

  // Revenue by month (last 6 months) - bar chart
  var months = {};
  var now = new Date();
  for(var m=5;m>=0;m--){
    var d = new Date(now.getFullYear(), now.getMonth()-m, 1);
    var key = d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');
    months[key] = { label: d.toLocaleDateString('en-US',{month:'short'}), total: 0 };
  }
  jobs.forEach(function(j){
    var d = new Date(j.updatedAt||0);
    var key = d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');
    if(months[key]){
      months[key].total += parseMoney((j.data&&j.data.totals&&j.data.totals.grand_total)||'0');
    }
  });

  var keys = Object.keys(months);
  var maxVal = Math.max.apply(null, keys.map(function(k){ return months[k].total; }))||1;
  var barW = 40, gap = 16, chartH = 100, padBottom = 24, padTop = 20;
  var svgW = keys.length * (barW + gap);
  var svgH = chartH + padBottom + padTop;

  var bars = keys.map(function(k, i){
    var h = (months[k].total / maxVal) * chartH;
    if(h < 2 && months[k].total > 0) h = 2;
    var x = i * (barW + gap) + gap/2;
    var y = padTop + chartH - h;
    var valLabel = months[k].total >= 1000 ? '$'+Math.round(months[k].total/1000)+'K' : '$'+Math.round(months[k].total);
    return '<rect x="'+x+'" y="'+y+'" width="'+barW+'" height="'+h+'" rx="4" fill="#B4692D" opacity="0.85"/>'
      +'<text x="'+(x+barW/2)+'" y="'+(y-5)+'" text-anchor="middle" fill="#6B7280" font-size="9" font-family="\'JetBrains Mono\',monospace">'+(months[k].total>0?valLabel:'')+'</text>'
      +'<text x="'+(x+barW/2)+'" y="'+(padTop+chartH+16)+'" text-anchor="middle" fill="#6B7280" font-size="10" font-family="\'DM Sans\',sans-serif">'+months[k].label+'</text>';
  }).join('');

  var barSvg = '<svg width="100%" viewBox="0 0 '+svgW+' '+svgH+'" preserveAspectRatio="xMidYMid meet">'
    +'<line x1="0" y1="'+(padTop+chartH)+'" x2="'+svgW+'" y2="'+(padTop+chartH)+'" stroke="#EDE4D8" stroke-width="1"/>'
    +bars+'</svg>';

  // Status donut chart
  var draftCount = 0, completeCount = 0;
  jobs.forEach(function(j){
    var s = (j.data&&j.data.job&&j.data.job.status)||'draft';
    if(s==='complete') completeCount++; else draftCount++;
  });
  var total = draftCount + completeCount;
  var draftPct = total ? (draftCount/total) : 0;
  var completePct = total ? (completeCount/total) : 0;
  var r = 40, cx = 60, cy = 60, stroke = 12;
  var circumference = 2 * Math.PI * r;
  var completeLen = completePct * circumference;
  var draftLen = draftPct * circumference;

  var donutSvg = '<svg width="100%" viewBox="0 0 120 120" preserveAspectRatio="xMidYMid meet">'
    +'<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="#EDE4D8" stroke-width="'+stroke+'"/>'
    +'<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="#0D7A55" stroke-width="'+stroke+'" stroke-dasharray="'+completeLen+' '+circumference+'" stroke-dashoffset="0" transform="rotate(-90 '+cx+' '+cy+')"/>'
    +'<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="#B4692D" stroke-width="'+stroke+'" stroke-dasharray="'+draftLen+' '+circumference+'" stroke-dashoffset="-'+completeLen+'" transform="rotate(-90 '+cx+' '+cy+')"/>'
    +'<text x="'+cx+'" y="'+(cy-4)+'" text-anchor="middle" fill="#0B2A35" font-size="18" font-family="\'DM Serif Display\',serif" font-weight="700">'+total+'</text>'
    +'<text x="'+cx+'" y="'+(cy+12)+'" text-anchor="middle" fill="#6B7280" font-size="9" font-family="\'DM Sans\',sans-serif">jobs</text>'
    +'</svg>'
    +'<div style="display:flex;gap:14px;justify-content:center;margin-top:8px;font-size:11px">'
    +'<span style="display:flex;align-items:center;gap:4px"><span style="width:8px;height:8px;border-radius:50%;background:#0D7A55;display:inline-block"></span> Complete ('+completeCount+')</span>'
    +'<span style="display:flex;align-items:center;gap:4px"><span style="width:8px;height:8px;border-radius:50%;background:#B4692D;display:inline-block"></span> Draft ('+draftCount+')</span>'
    +'</div>';

  container.innerHTML = '<div class="charts-row">'
    +'<div class="chart-card"><h4>Revenue by Month</h4>'+barSvg+'</div>'
    +'<div class="chart-card"><h4>Jobs by Status</h4>'+donutSvg+'</div>'
    +'</div>';
}

// ── Version Bar ───────────────────────────────────────────────
function updateVersionBar(job){
  var bar = document.getElementById('version-bar');
  if(!bar) return;
  if(!job || (!job.version || job.version <= 1) && !job.parentId){
    bar.style.display = 'none';
    return;
  }
  var family = getVersionFamily(job);
  if(family.length <= 1){
    bar.style.display = 'none';
    return;
  }
  bar.style.display = 'flex';
  var label = bar.querySelector('.ver-label');
  if(label) label.textContent = 'Version '+(job.version||1)+' of '+family.length;
  var sel = document.getElementById('version-select');
  if(sel){
    sel.innerHTML = '';
    family.forEach(function(fj){
      var opt = document.createElement('option');
      opt.value = fj.id;
      opt.textContent = 'v'+(fj.version||1)+(fj.archived?' (archived)':'');
      if(fj.id===job.id) opt.selected = true;
      sel.appendChild(opt);
    });
  }
}

function hideVersionBar(){
  var bar = document.getElementById('version-bar');
  if(bar) bar.style.display = 'none';
}

// ── Customers Page ────────────────────────────────────────────
function renderCustomersPage(){
  var container = document.getElementById('customers-list');
  if(!container) return;
  var custs = getCustomers();
  if(!custs.length){
    container.innerHTML = '<div class="empty-state"><span class="icon">&#128100;</span><h3>No customers yet</h3><p>Customers are saved automatically when you create estimates</p></div>';
    return;
  }
  var html = '<div class="crud-list">';
  custs.forEach(function(c){
    html += '<div class="crud-row" data-id="'+c.id+'">'
      +'<div class="crud-row-info">'
      +'<div class="cr-name">'+esc(c.name)+'</div>'
      +'<div class="cr-detail">'+esc(c.address||'')+' &middot; '+esc(c.phone||'')+' &middot; '+esc(c.email||'')+'</div>'
      +'</div>'
      +'<div class="crud-row-actions">'
      +'<button class="btn btn-sm btn-ghost" data-action="edit-cust" data-id="'+c.id+'">Edit</button>'
      +'<button class="btn btn-sm btn-danger" data-action="delete-cust" data-id="'+c.id+'">Delete</button>'
      +'</div></div>';
  });
  html += '</div>';
  container.innerHTML = html;
}

// ── Catalog Page ──────────────────────────────────────────────
function renderCatalogPage(){
  var container = document.getElementById('catalog-list');
  if(!container) return;
  var items = getCatalog();
  if(!items.length){
    container.innerHTML = '<div class="empty-state"><span class="icon">&#128230;</span><h3>No catalog items yet</h3><p>Add materials and parts for quick access when building estimates</p></div>';
    return;
  }
  var html = '<div class="crud-list">';
  items.forEach(function(c){
    html += '<div class="crud-row" data-id="'+c.id+'">'
      +'<div class="crud-row-info">'
      +'<div class="cr-name">'+esc(c.description)+'</div>'
      +'<div class="cr-detail">'+esc(c.category||'General')+' &middot; Qty: '+(c.defaultQty||'-')+' &middot; Rate: '+esc(c.defaultRate||'-')+' &middot; Lead: '+esc(c.defaultLeadTime||'-')+'</div>'
      +'</div>'
      +'<div class="crud-row-actions">'
      +'<button class="btn btn-sm btn-ghost" data-action="edit-cat" data-id="'+c.id+'">Edit</button>'
      +'<button class="btn btn-sm btn-danger" data-action="delete-cat" data-id="'+c.id+'">Delete</button>'
      +'</div></div>';
  });
  html += '</div>';
  container.innerHTML = html;
}
