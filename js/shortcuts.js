// ── Keyboard Shortcuts ────────────────────────────────────────
function initKeyboardShortcuts(){
  document.addEventListener('keydown', function(e){
    var tag = (e.target.tagName||'').toLowerCase();
    var isInput = tag==='input' || tag==='textarea' || tag==='select';
    var editorActive = document.getElementById('page-editor').classList.contains('active');

    // Ctrl combos (no shift)
    if((e.ctrlKey || e.metaKey) && !e.shiftKey){
      switch(e.key.toLowerCase()){
        case 's':
          if(editorActive){
            e.preventDefault();
            saveJob();
          }
          break;
        case 'p':
          if(editorActive){
            e.preventDefault();
            previewPDF();
          }
          break;
        case 'd':
          if(editorActive){
            e.preventDefault();
            downloadPDF();
          }
          break;
        case 'n':
          e.preventDefault();
          showTemplatePicker();
          break;
      }
    }

    // Ctrl+Shift combos
    if((e.ctrlKey || e.metaKey) && e.shiftKey){
      switch(e.key.toLowerCase()){
        case 'f':
          if(editorActive){ e.preventDefault(); addFinding(); }
          break;
        case 'm':
          if(editorActive){ e.preventDefault(); addMaterial(); }
          break;
        case 's':
          if(editorActive){ e.preventDefault(); addScope(); }
          break;
      }
    }

    // Escape
    if(e.key==='Escape'){
      closePDFModal();
      closeSidebar();
      closeQRModal();
      closeShopifyModal();
      var tplModal = document.getElementById('template-modal');
      if(tplModal) tplModal.classList.remove('open');
      var catModal = document.getElementById('catalog-modal');
      if(catModal) catModal.classList.remove('open');
      var scModal = document.getElementById('shortcuts-modal');
      if(scModal) scModal.classList.remove('open');
    }

    // Shift+? for shortcuts help
    if(e.key==='?' && e.shiftKey && !isInput){
      e.preventDefault();
      showShortcutsHelp();
    }
  });
}

function showShortcutsHelp(){
  var modal = document.getElementById('shortcuts-modal');
  if(modal) modal.classList.add('open');
}

function closeShortcutsModal(){
  var modal = document.getElementById('shortcuts-modal');
  if(modal) modal.classList.remove('open');
}
