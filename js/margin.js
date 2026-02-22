// ── Profit Margin Calculator ──────────────────────────────────
function toggleMarginCalc(){
  var panel = document.getElementById('margin-calc');
  if(panel) panel.classList.toggle('open');
}

function calcMargin(){
  var costVal = parseMoney(v('mc-cost'));
  var markupVal = parseFloat(v('mc-markup'))||0;
  var marginVal = parseFloat(v('mc-margin'))||0;

  var sell = 0, profit = 0, effectiveMargin = 0, effectiveMarkup = 0;

  // Determine which field was last changed
  var mode = document.getElementById('margin-calc').dataset.mode || 'markup';

  if(mode==='markup'){
    sell = costVal * (1 + markupVal/100);
    profit = sell - costVal;
    effectiveMargin = sell > 0 ? (profit/sell)*100 : 0;
    effectiveMarkup = markupVal;
    // Update margin field to match
    document.getElementById('mc-margin').value = effectiveMargin.toFixed(1);
  } else {
    sell = marginVal < 100 ? costVal / (1 - marginVal/100) : 0;
    profit = sell - costVal;
    effectiveMarkup = costVal > 0 ? (profit/costVal)*100 : 0;
    effectiveMargin = marginVal;
    // Update markup field to match
    document.getElementById('mc-markup').value = effectiveMarkup.toFixed(1);
  }

  // Display results
  document.getElementById('mc-sell').textContent = '$'+sell.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g,',');
  document.getElementById('mc-profit').textContent = '$'+profit.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g,',');
  document.getElementById('mc-eff-margin').textContent = effectiveMargin.toFixed(1)+'%';
  document.getElementById('mc-eff-markup').textContent = effectiveMarkup.toFixed(1)+'%';
}

function applyMarginToTotal(){
  var sellText = (document.getElementById('mc-sell').textContent||'').replace(/[$,]/g,'');
  var sell = parseFloat(sellText)||0;
  if(sell<=0){ toast('Calculate a sell price first','error'); return; }
  document.getElementById('f-tot-grand').value = '$'+sell.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g,',');
  var deposit = sell * 0.5;
  document.getElementById('f-tot-deposit').value = '$'+deposit.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g,',');
  updateTotalsPanel();
  toast('Applied to grand total!');
}

function initMarginCalcListeners(){
  var costEl = document.getElementById('mc-cost');
  var markupEl = document.getElementById('mc-markup');
  var marginEl = document.getElementById('mc-margin');
  var panel = document.getElementById('margin-calc');
  if(!costEl || !markupEl || !marginEl || !panel) return;

  costEl.addEventListener('input', function(){ panel.dataset.mode='markup'; calcMargin(); });
  markupEl.addEventListener('input', function(){ panel.dataset.mode='markup'; calcMargin(); });
  marginEl.addEventListener('input', function(){ panel.dataset.mode='margin'; calcMargin(); });
}
