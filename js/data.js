// ── Constants & State ──────────────────────────────────────────
var LS_JOBS = 'rmctr_jobs';
var LS_SETTINGS = 'rmctr_settings';
var LS_CUSTOMERS = 'rmctr_customers';
var LS_CATALOG = 'rmctr_catalog';
var LS_TEMPLATES = 'rmctr_templates';
var currentJobId = null;
var photoStore = [];

var defaultSettings = {
  name:'RMCTR',
  fullname:'Rocky Mountain Cooling Tower Repair',
  address:'6272 South Routt Street, Littleton, CO 80127',
  phone:'720-626-9805',
  email:'info@RMCTR.com',
  contact:'Tim Haran'
};

// ── Core Helpers ──────────────────────────────────────────────
function getJobs(){ try{ return JSON.parse(localStorage.getItem(LS_JOBS)||'[]'); }catch(e){ return []; } }
function saveJobs(jobs){ localStorage.setItem(LS_JOBS, JSON.stringify(jobs)); }
function getSettings(){ try{ return JSON.parse(localStorage.getItem(LS_SETTINGS)||JSON.stringify(defaultSettings)); }catch(e){ return defaultSettings; } }
function v(id){ var el=document.getElementById(id); return el ? el.value : ''; }
function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function parseMoney(s){ return parseFloat(String(s).replace(/[$,]/g,''))||0; }
function dateStamp(){ return new Date().toISOString().split('T')[0].replace(/-/g,''); }

// ── Toast ─────────────────────────────────────────────────────
var toastTimer;
function toast(msg, type){
  var el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'show ' + (type||'success');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function(){ el.className=''; }, 3200);
}

// ── Customer Database ─────────────────────────────────────────
function getCustomers(){ try{ return JSON.parse(localStorage.getItem(LS_CUSTOMERS)||'[]'); }catch(e){ return []; } }
function saveCustomers(custs){ localStorage.setItem(LS_CUSTOMERS, JSON.stringify(custs)); }

function addCustomer(cust){
  var custs = getCustomers();
  cust.id = 'cust_'+Date.now()+'_'+Math.random().toString(36).slice(2);
  cust.createdAt = Date.now();
  custs.push(cust);
  saveCustomers(custs);
  return cust;
}

function updateCustomer(id, data){
  var custs = getCustomers();
  for(var i=0;i<custs.length;i++){
    if(custs[i].id===id){ Object.assign(custs[i], data); break; }
  }
  saveCustomers(custs);
}

function deleteCustomer(id){
  saveCustomers(getCustomers().filter(function(c){ return c.id!==id; }));
}

function findCustomerByName(name){
  if(!name) return null;
  var n = name.toLowerCase();
  var custs = getCustomers();
  for(var i=0;i<custs.length;i++){
    if((custs[i].name||'').toLowerCase()===n) return custs[i];
  }
  return null;
}

function searchCustomers(query){
  if(!query) return [];
  var q = query.toLowerCase();
  return getCustomers().filter(function(c){
    return (c.name||'').toLowerCase().indexOf(q)>=0
      || (c.address||'').toLowerCase().indexOf(q)>=0
      || (c.email||'').toLowerCase().indexOf(q)>=0;
  }).slice(0,5);
}

// ── Parts Catalog ─────────────────────────────────────────────
function getCatalog(){ try{ return JSON.parse(localStorage.getItem(LS_CATALOG)||'[]'); }catch(e){ return []; } }
function saveCatalog(items){ localStorage.setItem(LS_CATALOG, JSON.stringify(items)); }

function addCatalogItem(item){
  var items = getCatalog();
  item.id = 'cat_'+Date.now()+'_'+Math.random().toString(36).slice(2);
  item.createdAt = Date.now();
  items.push(item);
  saveCatalog(items);
  return item;
}

function updateCatalogItem(id, data){
  var items = getCatalog();
  for(var i=0;i<items.length;i++){
    if(items[i].id===id){ Object.assign(items[i], data); break; }
  }
  saveCatalog(items);
}

function deleteCatalogItem(id){
  saveCatalog(getCatalog().filter(function(c){ return c.id!==id; }));
}

function searchCatalog(query){
  if(!query) return getCatalog();
  var q = query.toLowerCase();
  return getCatalog().filter(function(c){
    return (c.description||'').toLowerCase().indexOf(q)>=0
      || (c.category||'').toLowerCase().indexOf(q)>=0;
  });
}

// ── User Templates ────────────────────────────────────────────
function getUserTemplates(){ try{ return JSON.parse(localStorage.getItem(LS_TEMPLATES)||'[]'); }catch(e){ return []; } }
function saveUserTemplates(tpls){ localStorage.setItem(LS_TEMPLATES, JSON.stringify(tpls)); }

function saveAsTemplate(name, desc, data){
  var tpls = getUserTemplates();
  var tplData = JSON.parse(JSON.stringify(data));
  // Strip customer-specific info
  if(tplData.job){
    tplData.job.customer_name = '';
    tplData.job.address = '';
    tplData.job.contact_phone = '';
    tplData.job.contact_email = '';
    tplData.job.inspection_date = '';
    tplData.job.output_filename = '';
    tplData.job.status = 'draft';
  }
  tplData.photos = [];
  var tpl = {
    id: 'tpl_user_'+Date.now(),
    name: name,
    description: desc||'',
    icon: '&#128203;',
    data: tplData,
    createdAt: Date.now()
  };
  tpls.push(tpl);
  saveUserTemplates(tpls);
  return tpl;
}

function deleteUserTemplate(id){
  saveUserTemplates(getUserTemplates().filter(function(t){ return t.id!==id; }));
}

// ── Export / Import ───────────────────────────────────────────
function downloadJSON(obj, filename){
  var blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function exportAllData(){
  var payload = {
    rmctr_export: true,
    version: '2.0',
    exportedAt: new Date().toISOString(),
    type: 'full_backup',
    settings: getSettings(),
    customers: getCustomers(),
    catalog: getCatalog(),
    templates: getUserTemplates(),
    jobs: getJobs()
  };
  downloadJSON(payload, 'RMCTR_Backup_'+dateStamp()+'.json');
  toast('Backup exported!');
}

function exportSingleJob(jobId){
  var jobs = getJobs();
  var job = null;
  for(var i=0;i<jobs.length;i++){ if(jobs[i].id===jobId){ job=jobs[i]; break; } }
  if(!job){ toast('Job not found','error'); return; }
  var payload = {
    rmctr_export: true,
    version: '2.0',
    exportedAt: new Date().toISOString(),
    type: 'single_estimate',
    settings: null,
    jobs: [job]
  };
  var name = (job.data && job.data.job && job.data.job.customer_name) || 'Estimate';
  downloadJSON(payload, 'RMCTR_'+name.replace(/\s+/g,'_')+'.json');
  toast('Estimate exported!');
}

function importData(){
  var input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = function(e){
    var file = e.target.files[0];
    if(!file) return;
    var reader = new FileReader();
    reader.onload = function(ev){
      try {
        var payload = JSON.parse(ev.target.result);
        if(!payload.rmctr_export) throw new Error('Not a valid RMCTR export file');
        var existing = getJobs();
        var existingIds = existing.map(function(j){ return j.id; });
        var imported = 0;
        (payload.jobs||[]).forEach(function(job){
          if(existingIds.indexOf(job.id)>=0){
            job.id = 'job_'+Date.now()+'_'+Math.random().toString(36).slice(2);
          }
          existing.push(job);
          imported++;
        });
        saveJobs(existing);
        // Import customers if present
        if(payload.customers && payload.customers.length){
          var custs = getCustomers();
          var custNames = custs.map(function(c){ return (c.name||'').toLowerCase(); });
          payload.customers.forEach(function(c){
            if(custNames.indexOf((c.name||'').toLowerCase())<0){
              custs.push(c);
            }
          });
          saveCustomers(custs);
        }
        // Import catalog if present
        if(payload.catalog && payload.catalog.length){
          var cat = getCatalog();
          var catIds = cat.map(function(c){ return c.id; });
          payload.catalog.forEach(function(c){
            if(catIds.indexOf(c.id)<0) cat.push(c);
          });
          saveCatalog(cat);
        }
        // Import settings if full backup
        if(payload.type==='full_backup' && payload.settings){
          if(confirm('Import also includes company settings. Overwrite current settings?')){
            localStorage.setItem(LS_SETTINGS, JSON.stringify(payload.settings));
            loadSettingsIntoForm();
          }
        }
        renderDashboard();
        toast(imported+' estimate(s) imported!');
      } catch(err){
        toast('Import failed: '+err.message, 'error');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

// ── Job Actions ───────────────────────────────────────────────
function newJob(){
  currentJobId = 'job_' + Date.now();
  showPage('editor');
  clearForm();
  hideVersionBar();
  document.getElementById('f-date').value = new Date().toISOString().split('T')[0];
  document.getElementById('f-warranty').value = '1 Year - Parts & Service. Excludes motor and electrical components. Work commences 3 weeks after receipt of deposit and/or PO. All pricing is an estimate; final invoice based on actual time and materials. Valid 30 days from inspection.';
  addFinding(); addFinding(); addFinding();
  addPerf(); addPerf();
  addScope(); addScope();
  addMaterial(); addMaterial();
  addCost(); addCost();
  addNote(); addNote();
  toast('New estimate started!');
}

function newJobFromTemplate(tplData){
  currentJobId = 'job_' + Date.now();
  showPage('editor');
  clearForm();
  hideVersionBar();
  var data = JSON.parse(JSON.stringify(tplData));
  data.job = data.job || {};
  data.job.inspection_date = new Date().toISOString().split('T')[0];
  data.job.status = 'draft';
  if(!data.warranty) data.warranty = '1 Year - Parts & Service. Excludes motor and electrical components. Work commences 3 weeks after receipt of deposit and/or PO. All pricing is an estimate; final invoice based on actual time and materials. Valid 30 days from inspection.';
  loadJobIntoForm(data);
  toast('Template loaded!');
}

function openJob(id){
  var jobs = getJobs();
  var job = null;
  for(var i=0;i<jobs.length;i++){ if(jobs[i].id===id){ job=jobs[i]; break; } }
  if(!job){ toast('Job not found','error'); return; }
  currentJobId = id;
  showPage('editor');
  loadJobIntoForm(job.data);
  updateVersionBar(job);
}

function saveJob(){
  var data = collectFormData();
  var jobs = getJobs();
  var idx = -1;
  var oldJob = null;
  for(var i=0;i<jobs.length;i++){ if(jobs[i].id===currentJobId){ idx=i; oldJob=jobs[i]; break; } }
  var entry = {
    id: currentJobId,
    updatedAt: Date.now(),
    version: oldJob ? (oldJob.version||1) : 1,
    parentId: oldJob ? (oldJob.parentId||null) : null,
    versionHistory: oldJob ? (oldJob.versionHistory||null) : null,
    data: data
  };
  if(idx>=0) jobs[idx]=entry; else jobs.push(entry);
  saveJobs(jobs);
  // Auto-save customer
  autoSaveCustomer(data.job);
  toast('Saved!');
}

function deleteJob(id){
  if(!confirm('Delete this estimate? This cannot be undone.')) return;
  saveJobs(getJobs().filter(function(j){ return j.id!==id; }));
  renderDashboard();
  toast('Deleted');
}

function duplicateJob(id){
  var jobs = getJobs();
  var source = null;
  for(var i=0;i<jobs.length;i++){ if(jobs[i].id===id){ source=jobs[i]; break; } }
  if(!source){ toast('Job not found','error'); return; }
  var newData = JSON.parse(JSON.stringify(source.data));
  newData.job.customer_name = (newData.job.customer_name||'')+' (Copy)';
  newData.job.status = 'draft';
  var newEntry = {
    id: 'job_'+Date.now(),
    updatedAt: Date.now(),
    version: 1,
    parentId: null,
    data: newData
  };
  jobs.push(newEntry);
  saveJobs(jobs);
  renderDashboard();
  toast('Estimate duplicated!');
}

// ── Versioning ────────────────────────────────────────────────
function createNewVersion(jobId){
  var jobs = getJobs();
  var source = null;
  var sourceIdx = -1;
  for(var i=0;i<jobs.length;i++){
    if(jobs[i].id===jobId){ source=jobs[i]; sourceIdx=i; break; }
  }
  if(!source) return;

  var rootId = source.parentId || source.id;
  var prevVersion = source.version || 1;
  var newVersion = prevVersion + 1;

  // Archive current version
  source.archived = true;
  jobs[sourceIdx] = source;

  // Build version history
  var history = source.versionHistory || [
    { version: prevVersion, createdAt: source.updatedAt, note: 'Initial estimate' }
  ];
  history = history.concat([
    { version: newVersion, createdAt: Date.now(), note: '' }
  ]);

  var newData = JSON.parse(JSON.stringify(source.data));
  var newEntry = {
    id: 'job_'+Date.now(),
    updatedAt: Date.now(),
    version: newVersion,
    parentId: rootId,
    versionHistory: history,
    data: newData
  };

  jobs.push(newEntry);
  saveJobs(jobs);
  openJob(newEntry.id);
  toast('Version '+newVersion+' created!');
}

function getVersionFamily(job){
  if(!job) return [];
  var rootId = job.parentId || job.id;
  return getJobs().filter(function(j){
    return j.id===rootId || j.parentId===rootId;
  }).sort(function(a,b){ return (a.version||1)-(b.version||1); });
}

// ── Customer Auto-Save ────────────────────────────────────────
function autoSaveCustomer(jobData){
  if(!jobData || !jobData.customer_name) return;
  var existing = findCustomerByName(jobData.customer_name);
  if(!existing){
    addCustomer({
      name: jobData.customer_name,
      address: jobData.address||'',
      phone: jobData.contact_phone||'',
      email: jobData.contact_email||'',
      notes: ''
    });
  }
}

// ── Settings ──────────────────────────────────────────────────
function loadSettingsIntoForm(){
  var s = getSettings();
  ['name','fullname','address','phone','email','contact'].forEach(function(k){
    var el=document.getElementById('s-'+k); if(el) el.value=s[k]||'';
  });
}

function saveSettings(){
  var s={};
  ['name','fullname','address','phone','email','contact'].forEach(function(k){ s[k]=v('s-'+k); });
  localStorage.setItem(LS_SETTINGS, JSON.stringify(s));
  toast('Settings saved!');
}
