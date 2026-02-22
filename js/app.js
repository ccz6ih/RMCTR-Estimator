// ── Dark Mode Init (runs immediately, before DOMContentLoaded) ──
(function(){
  var theme = localStorage.getItem('rmctr_theme')||'light';
  document.documentElement.setAttribute('data-theme', theme);
})();

// ── Navigation ────────────────────────────────────────────────
function showPage(id){
  document.querySelectorAll('.page').forEach(function(p){ p.classList.remove('active'); });
  document.querySelectorAll('.sb-btn').forEach(function(b){ b.classList.remove('active'); });
  var pg = document.getElementById('page-'+id);
  if(pg) pg.classList.add('active');
  var nb = document.getElementById('nav-'+id);
  if(nb) nb.classList.add('active');
  var titles = {dashboard:'Dashboard', editor:'Estimate Editor', settings:'Company Settings', customers:'Customers', catalog:'Parts Catalog'};
  document.getElementById('page-title').textContent = titles[id] || id;
  if(id === 'dashboard') renderDashboard();
  if(id === 'customers') renderCustomersPage();
  if(id === 'catalog') renderCatalogPage();
  closeSidebar();
  window.scrollTo(0,0);
}

function toggleSidebar(){
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('overlay').classList.toggle('open');
}
function closeSidebar(){
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('overlay').classList.remove('open');
}

// ── Dark Mode Toggle ──────────────────────────────────────────
function toggleDarkMode(){
  var current = document.documentElement.getAttribute('data-theme')||'light';
  var next = current==='dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('rmctr_theme', next);
  updateDarkModeIcon();
}

function updateDarkModeIcon(){
  var btn = document.getElementById('dark-toggle');
  if(!btn) return;
  var isDark = document.documentElement.getAttribute('data-theme')==='dark';
  btn.innerHTML = isDark
    ? '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><path stroke-linecap="round" d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
    : '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>';
}

// ── Customer Autocomplete ─────────────────────────────────────
function initCustomerAutocomplete(){
  var input = document.getElementById('f-customer');
  var dropdown = document.getElementById('customer-dropdown');
  if(!input || !dropdown) return;

  input.addEventListener('input', function(){
    var query = input.value;
    if(query.length < 2){
      dropdown.classList.remove('open');
      return;
    }
    var matches = searchCustomers(query);
    if(!matches.length){
      dropdown.classList.remove('open');
      return;
    }
    var html = '';
    matches.forEach(function(c){
      html += '<div class="autocomplete-item" data-cust-id="'+c.id+'"><div class="ac-name">'+esc(c.name)+'</div><div class="ac-detail">'+esc(c.address||'')+' &middot; '+esc(c.phone||'')+'</div></div>';
    });
    dropdown.innerHTML = html;
    dropdown.classList.add('open');
  });

  dropdown.addEventListener('click', function(e){
    var item = e.target.closest('.autocomplete-item');
    if(!item) return;
    var custId = item.dataset.custId;
    var custs = getCustomers();
    var cust = null;
    for(var i=0;i<custs.length;i++){
      if(custs[i].id===custId){ cust=custs[i]; break; }
    }
    if(cust){
      document.getElementById('f-customer').value = cust.name||'';
      document.getElementById('f-address').value = cust.address||'';
      document.getElementById('f-phone').value = cust.phone||'';
      document.getElementById('f-email').value = cust.email||'';
    }
    dropdown.classList.remove('open');
  });

  // Hide on blur with delay
  input.addEventListener('blur', function(){
    setTimeout(function(){ dropdown.classList.remove('open'); }, 200);
  });
}

// ── Catalog Picker Modal ──────────────────────────────────────
var catalogPickerTarget = 'material'; // 'material' or 'cost'

function showCatalogPicker(target){
  catalogPickerTarget = target||'material';
  var modal = document.getElementById('catalog-modal');
  if(!modal) return;
  renderCatalogPickerResults('');
  document.getElementById('catalog-picker-search').value = '';
  modal.classList.add('open');
}

function renderCatalogPickerResults(query){
  var container = document.getElementById('catalog-picker-results');
  if(!container) return;
  var items = searchCatalog(query);
  if(!items.length){
    container.innerHTML = '<div style="text-align:center;padding:20px;color:var(--gray);font-size:13px">No catalog items found</div>';
    return;
  }
  var html = '';
  items.forEach(function(c){
    html += '<div class="catalog-item" data-cat-id="'+c.id+'">'
      +'<div class="catalog-item-info"><div class="cat-name">'+esc(c.description)+'</div><div class="cat-detail">'+esc(c.category||'General')+' &middot; Rate: '+esc(c.defaultRate||'-')+'</div></div>'
      +'<button class="btn btn-sm btn-primary" data-action="use-cat" data-cat-id="'+c.id+'">Use</button>'
      +'</div>';
  });
  container.innerHTML = html;
}

function handleCatalogPick(catId){
  var items = getCatalog();
  var item = null;
  for(var i=0;i<items.length;i++){
    if(items[i].id===catId){ item=items[i]; break; }
  }
  if(!item) return;
  var modal = document.getElementById('catalog-modal');
  if(modal) modal.classList.remove('open');

  if(catalogPickerTarget==='material'){
    addMaterial({
      description: item.description||'',
      qty: item.defaultQty||'',
      unit_rate: item.defaultRate||'',
      amount: ''
    });
  } else {
    addCost({
      item: item.description||'',
      details: item.category||'',
      cost: item.defaultRate||''
    });
  }
  toast('Added from catalog!');
}

// ── Customer Page Actions ─────────────────────────────────────
function handleCustomerPageAction(e){
  var del = e.target.closest('[data-action="delete-cust"]');
  var edit = e.target.closest('[data-action="edit-cust"]');
  if(del){
    if(confirm('Delete this customer?')){
      deleteCustomer(del.dataset.id);
      renderCustomersPage();
      toast('Customer deleted');
    }
    return;
  }
  if(edit){
    var custs = getCustomers();
    var cust = null;
    for(var i=0;i<custs.length;i++){
      if(custs[i].id===edit.dataset.id){ cust=custs[i]; break; }
    }
    if(!cust) return;
    var name = prompt('Customer name:', cust.name||'');
    if(name===null) return;
    var addr = prompt('Address:', cust.address||'');
    var phone = prompt('Phone:', cust.phone||'');
    var email = prompt('Email:', cust.email||'');
    updateCustomer(cust.id, { name: name, address: addr||'', phone: phone||'', email: email||'' });
    renderCustomersPage();
    toast('Customer updated');
    return;
  }
}

function addCustomerManual(){
  var name = prompt('Customer name:');
  if(!name) return;
  var addr = prompt('Address:','');
  var phone = prompt('Phone:','');
  var email = prompt('Email:','');
  addCustomer({ name: name, address: addr||'', phone: phone||'', email: email||'', notes: '' });
  renderCustomersPage();
  toast('Customer added!');
}

// ── Catalog Page Actions ──────────────────────────────────────
function handleCatalogPageAction(e){
  var del = e.target.closest('[data-action="delete-cat"]');
  var edit = e.target.closest('[data-action="edit-cat"]');
  if(del){
    if(confirm('Delete this catalog item?')){
      deleteCatalogItem(del.dataset.id);
      renderCatalogPage();
      toast('Item deleted');
    }
    return;
  }
  if(edit){
    var items = getCatalog();
    var item = null;
    for(var i=0;i<items.length;i++){
      if(items[i].id===edit.dataset.id){ item=items[i]; break; }
    }
    if(!item) return;
    var desc = prompt('Description:', item.description||'');
    if(desc===null) return;
    var cat = prompt('Category:', item.category||'');
    var qty = prompt('Default Qty:', item.defaultQty||'');
    var rate = prompt('Default Rate:', item.defaultRate||'');
    var lead = prompt('Lead Time:', item.defaultLeadTime||'');
    updateCatalogItem(item.id, { description: desc, category: cat||'', defaultQty: qty||'', defaultRate: rate||'', defaultLeadTime: lead||'' });
    renderCatalogPage();
    toast('Item updated');
    return;
  }
}

function addCatalogItemManual(){
  var desc = prompt('Item description:');
  if(!desc) return;
  var cat = prompt('Category (e.g. Fill Media, Hardware):','');
  var qty = prompt('Default quantity:','');
  var rate = prompt('Default rate (e.g. $358.15):','');
  var lead = prompt('Lead time (e.g. 3 Weeks):','');
  addCatalogItem({ description: desc, category: cat||'General', defaultQty: qty||'', defaultRate: rate||'', defaultLeadTime: lead||'' });
  renderCatalogPage();
  toast('Catalog item added!');
}

// ── Event Delegation Handlers ─────────────────────────────────
function handleDynRemove(e){
  var btn = e.target.closest('.remove-btn');
  if(btn){ var row=btn.closest('.dyn-row'); if(row) row.remove(); }
}

function handleSevChange(e){
  var sel = e.target.closest('.sev-select');
  if(sel){ sel.className = 'sev-select sev-'+sel.value; }
}

function handleJobCardClick(e){
  var del  = e.target.closest('[data-action="delete"]');
  var prev = e.target.closest('[data-action="preview"]');
  var edit = e.target.closest('[data-action="edit"]');
  var dup  = e.target.closest('[data-action="duplicate"]');
  var exp  = e.target.closest('[data-action="export"]');
  var card = e.target.closest('.job-card');
  if(del)  { e.stopPropagation(); deleteJob(del.dataset.id); return; }
  if(prev) { e.stopPropagation(); previewJobPDF(prev.dataset.id); return; }
  if(edit) { e.stopPropagation(); openJob(edit.dataset.id); return; }
  if(dup)  { e.stopPropagation(); duplicateJob(dup.dataset.id); return; }
  if(exp)  { e.stopPropagation(); exportSingleJob(exp.dataset.id); return; }
  if(card && card.dataset.id) openJob(card.dataset.id);
}

// ── PWA Registration ──────────────────────────────────────────
function registerServiceWorker(){
  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('sw.js').then(function(reg){
      reg.addEventListener('updatefound', function(){
        var newWorker = reg.installing;
        if(newWorker){
          newWorker.addEventListener('statechange', function(){
            if(newWorker.state==='activated'){
              toast('App updated! Reload for latest version.');
            }
          });
        }
      });
    }).catch(function(err){
      console.warn('SW registration failed:', err);
    });
  }
}

// ── Boot ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function(){

  loadSettingsIntoForm();
  updateDarkModeIcon();

  // Check for shared URL
  if(loadFromShareURL()) return;

  // Sidebar nav
  document.getElementById('nav-dashboard').addEventListener('click', function(){ showPage('dashboard'); });
  document.getElementById('nav-new').addEventListener('click', function(){ showTemplatePicker(); });
  document.getElementById('nav-editor').addEventListener('click', function(){ showPage('editor'); });
  document.getElementById('nav-settings').addEventListener('click', function(){ showPage('settings'); });
  document.getElementById('nav-customers').addEventListener('click', function(){ showPage('customers'); });
  document.getElementById('nav-catalog').addEventListener('click', function(){ showPage('catalog'); });

  // Topbar
  document.getElementById('hamburger').addEventListener('click', toggleSidebar);
  document.getElementById('btn-new-top').addEventListener('click', function(){ showTemplatePicker(); });
  document.getElementById('overlay').addEventListener('click', toggleSidebar);

  // Dark mode
  document.getElementById('dark-toggle').addEventListener('click', toggleDarkMode);

  // Editor toolbar
  document.getElementById('btn-save').addEventListener('click', saveJob);
  document.getElementById('btn-preview').addEventListener('click', previewPDF);
  document.getElementById('btn-email').addEventListener('click', generateAndEmail);
  document.getElementById('btn-download').addEventListener('click', downloadPDF);
  document.getElementById('btn-print').addEventListener('click', function(){ window.print(); });
  document.getElementById('btn-share').addEventListener('click', shareEstimateURL);
  document.getElementById('btn-qr').addEventListener('click', showShareQR);
  document.getElementById('btn-save-tpl').addEventListener('click', promptSaveAsTemplate);
  document.getElementById('btn-new-version').addEventListener('click', function(){
    if(currentJobId) createNewVersion(currentJobId);
  });

  // Add-row buttons
  document.getElementById('btn-add-finding').addEventListener('click', function(){ addFinding(); });
  document.getElementById('btn-add-finding2').addEventListener('click', function(){ addFinding(); });
  document.getElementById('btn-add-perf').addEventListener('click', function(){ addPerf(); });
  document.getElementById('btn-add-perf2').addEventListener('click', function(){ addPerf(); });
  document.getElementById('btn-add-scope').addEventListener('click', function(){ addScope(); });
  document.getElementById('btn-add-scope2').addEventListener('click', function(){ addScope(); });
  document.getElementById('btn-add-mat').addEventListener('click', function(){ addMaterial(); });
  document.getElementById('btn-add-mat2').addEventListener('click', function(){ addMaterial(); });
  document.getElementById('btn-add-cost').addEventListener('click', function(){ addCost(); });
  document.getElementById('btn-add-cost2').addEventListener('click', function(){ addCost(); });
  document.getElementById('btn-add-note').addEventListener('click', function(){ addNote(); });
  document.getElementById('btn-add-note2').addEventListener('click', function(){ addNote(); });

  // Catalog picker buttons
  document.getElementById('btn-from-catalog-mat').addEventListener('click', function(){ showCatalogPicker('material'); });
  document.getElementById('btn-from-catalog-cost').addEventListener('click', function(){ showCatalogPicker('cost'); });

  // Margin calculator
  document.getElementById('btn-margin-toggle').addEventListener('click', toggleMarginCalc);
  document.getElementById('btn-apply-margin').addEventListener('click', applyMarginToTotal);
  initMarginCalcListeners();

  // Totals live update
  ['f-tot-mat','f-tot-labor','f-tot-add','f-tot-cont','f-tot-grand','f-tot-deposit'].forEach(function(id){
    document.getElementById(id).addEventListener('input', updateTotalsPanel);
  });

  // Send section
  document.getElementById('btn-email2').addEventListener('click', generateAndEmail);
  document.getElementById('btn-download2').addEventListener('click', downloadPDF);

  // Settings
  document.getElementById('btn-save-settings').addEventListener('click', saveSettings);

  // PDF Modal
  document.getElementById('btn-modal-download').addEventListener('click', downloadPDF);
  document.getElementById('btn-modal-close').addEventListener('click', closePDFModal);
  document.getElementById('pdf-modal').addEventListener('click', function(e){ if(e.target===this) closePDFModal(); });

  // QR Modal
  document.getElementById('qr-modal').addEventListener('click', function(e){ if(e.target===this) closeQRModal(); });
  document.getElementById('btn-qr-close').addEventListener('click', closeQRModal);

  // Template Modal
  document.getElementById('template-modal').addEventListener('click', function(e){
    if(e.target===this) this.classList.remove('open');
    var card = e.target.closest('.tpl-card');
    if(card) handleTemplatePick(card.dataset.tpl);
  });
  document.getElementById('btn-tpl-close').addEventListener('click', function(){
    document.getElementById('template-modal').classList.remove('open');
  });

  // Catalog Modal
  document.getElementById('catalog-modal').addEventListener('click', function(e){
    if(e.target===this) this.classList.remove('open');
    var useBtn = e.target.closest('[data-action="use-cat"]');
    if(useBtn) handleCatalogPick(useBtn.dataset.catId);
  });
  document.getElementById('btn-cat-close').addEventListener('click', function(){
    document.getElementById('catalog-modal').classList.remove('open');
  });
  document.getElementById('catalog-picker-search').addEventListener('input', function(){
    renderCatalogPickerResults(this.value);
  });

  // Shortcuts Modal
  document.getElementById('shortcuts-modal').addEventListener('click', function(e){
    if(e.target===this) this.classList.remove('open');
  });
  document.getElementById('btn-sc-close').addEventListener('click', closeShortcutsModal);

  // Search
  document.getElementById('search-input').addEventListener('input', function(){ renderDashboard(this.value); });

  // Dynamic list event delegation
  ['findings-list','perf-list','scope-list','mat-list','costs-list','notes-list'].forEach(function(id){
    var el = document.getElementById(id);
    el.addEventListener('click', handleDynRemove);
    el.addEventListener('change', handleSevChange);
  });

  // Job card clicks
  document.getElementById('jobs-grid').addEventListener('click', handleJobCardClick);

  // Photos
  document.getElementById('photo-file-input').addEventListener('change', handlePhotoUpload);
  document.getElementById('photo-grid').addEventListener('click', function(e){
    var btn = e.target.closest('.photo-remove-btn');
    if(btn) removePhoto(btn.dataset.id);
  });

  // Version bar
  var verSel = document.getElementById('version-select');
  if(verSel){
    verSel.addEventListener('change', function(){
      openJob(this.value);
    });
  }

  // Export/Import dashboard buttons
  document.getElementById('btn-export-all').addEventListener('click', exportAllData);
  document.getElementById('btn-import').addEventListener('click', importData);

  // Customers page
  document.getElementById('customers-list').addEventListener('click', handleCustomerPageAction);
  document.getElementById('btn-add-customer').addEventListener('click', addCustomerManual);

  // Catalog page
  document.getElementById('catalog-list').addEventListener('click', handleCatalogPageAction);
  document.getElementById('btn-add-catalog').addEventListener('click', addCatalogItemManual);

  // Customer autocomplete
  initCustomerAutocomplete();

  // Keyboard shortcuts
  initKeyboardShortcuts();

  // PWA
  registerServiceWorker();

  // Initial render
  renderDashboard();
});
