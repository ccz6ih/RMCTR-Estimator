// ── Built-in Estimate Templates ───────────────────────────────
var BUILTIN_TEMPLATES = [
  {
    id: 'tpl_fill_replacement',
    name: 'Fill Media Replacement',
    description: 'Standard fill media removal and replacement with new media',
    icon: '&#9881;',
    data: {
      job: {},
      findings: [
        { category: 'Fill Media', finding: 'Existing fill media is deteriorated, clogged, and restricting airflow. Biological growth present.', severity: 'critical' },
        { category: 'Water Distribution', finding: 'Nozzles partially blocked due to fill media debris.', severity: 'warn' },
        { category: 'Basin', finding: 'Basin contains sediment and fill media fragments.', severity: 'warn' }
      ],
      performance: [
        { metric: 'Cooling Delta', measured: '~2 deg F', expected: '>10 deg F expected', status: 'critical' },
        { metric: 'Airflow', measured: 'Restricted', expected: 'Unrestricted', status: 'warn' }
      ],
      performance_alert: 'Cooling tower is operating at significantly reduced efficiency due to fill media degradation.',
      scope_of_work: [
        { phase: 'Day 1 - Demo & Clean', description: 'Remove and dispose of existing fill media. Pressure wash basin, structure, and distribution deck.', crew: '4 crew x $79/hr x 8 hrs', labor_cost: '$2,528.00' },
        { phase: 'Day 2 - Install', description: 'Install new fill media packs. Replace damaged nozzles. Test water distribution pattern.', crew: '4 crew x $79/hr x 8 hrs', labor_cost: '$2,528.00' },
        { phase: 'Day 3 - Commission', description: 'System startup, balance water flow, verify cooling delta improvement.', crew: '2 crew x $79/hr x 4 hrs', labor_cost: '$632.00' }
      ],
      materials: { unit_description: '', fill_pack_size: '', lead_time: '3 Weeks - Order Immediately', items: [
        { description: 'Fill media packs', qty: '', unit_rate: '', amount: '' },
        { description: 'Replacement nozzles', qty: '', unit_rate: '', amount: '' }
      ]},
      additional_costs: [
        { item: 'Disposal', details: 'Dumpster rental and fill media disposal', cost: '' },
        { item: 'Equipment', details: 'Pressure washer and rigging', cost: '' }
      ],
      totals: {},
      notes: [
        { type: 'warning', text: 'Fill media must be ordered immediately - typical lead time 3 weeks from order.' },
        { type: 'ok', text: 'Basin cleaning and nozzle replacement included in scope.' }
      ],
      photos: [],
      warranty: '1 Year - Parts & Service. Excludes motor and electrical components. Work commences 3 weeks after receipt of deposit and/or PO. All pricing is an estimate; final invoice based on actual time and materials. Valid 30 days from inspection.'
    }
  },
  {
    id: 'tpl_gearbox_overhaul',
    name: 'Gearbox Overhaul',
    description: 'Gearbox inspection, rebuild, or replacement with alignment',
    icon: '&#9881;',
    data: {
      job: {},
      findings: [
        { category: 'Gearbox', finding: 'Excessive noise and vibration detected during operation. Oil analysis shows metallic particles indicating internal wear.', severity: 'critical' },
        { category: 'Drive Shaft', finding: 'Drive shaft coupling shows signs of misalignment and wear.', severity: 'warn' },
        { category: 'Oil System', finding: 'Oil level low, oil appears dark and contaminated. Recommend full oil change.', severity: 'warn' }
      ],
      performance: [
        { metric: 'Vibration Level', measured: 'Excessive', expected: 'Within tolerance', status: 'critical' },
        { metric: 'Oil Quality', measured: 'Contaminated', expected: 'Clean, clear', status: 'warn' }
      ],
      performance_alert: 'Gearbox is showing signs of imminent failure. Continued operation risks catastrophic damage.',
      scope_of_work: [
        { phase: 'Day 1 - Remove & Inspect', description: 'Disconnect and remove gearbox. Disassemble and inspect all bearings, gears, and seals. Document wear patterns.', crew: '3 crew x $79/hr x 8 hrs', labor_cost: '$1,896.00' },
        { phase: 'Day 2 - Rebuild', description: 'Replace bearings, seals, and worn gears. Reassemble gearbox with new oil. Static test.', crew: '3 crew x $79/hr x 8 hrs', labor_cost: '$1,896.00' },
        { phase: 'Day 3 - Install & Align', description: 'Reinstall gearbox. Laser-align drive shaft. Connect motor. Run test and verify vibration levels.', crew: '3 crew x $79/hr x 8 hrs', labor_cost: '$1,896.00' }
      ],
      materials: { unit_description: '', fill_pack_size: '', lead_time: '2-4 Weeks for rebuild kit', items: [
        { description: 'Gearbox rebuild kit (bearings, seals, gaskets)', qty: '1', unit_rate: '', amount: '' },
        { description: 'Gear oil (synthetic)', qty: '', unit_rate: '', amount: '' },
        { description: 'Drive shaft coupling', qty: '1', unit_rate: '', amount: '' }
      ]},
      additional_costs: [
        { item: 'Crane Rental', details: 'Crane for gearbox removal and installation', cost: '' },
        { item: 'Laser Alignment', details: 'Precision laser alignment service', cost: '' }
      ],
      totals: {},
      notes: [
        { type: 'warning', text: 'Gearbox must not be operated until repairs are completed - risk of catastrophic failure.' },
        { type: 'ok', text: 'Oil analysis report will be provided with final documentation.' }
      ],
      photos: [],
      warranty: '1 Year - Parts & Service. Excludes motor and electrical components. Work commences upon receipt of deposit and/or PO. All pricing is an estimate; final invoice based on actual time and materials. Valid 30 days from inspection.'
    }
  },
  {
    id: 'tpl_fan_deck',
    name: 'Fan Deck Repair',
    description: 'Fan deck structural repair and fan blade replacement',
    icon: '&#127744;',
    data: {
      job: {},
      findings: [
        { category: 'Fan Deck', finding: 'Fan deck panels show significant corrosion and structural deterioration. Several panels have holes or are missing.', severity: 'critical' },
        { category: 'Fan Blades', finding: 'Fan blades are warped, cracked, or missing tips. Blade pitch is inconsistent.', severity: 'critical' },
        { category: 'Fan Guard', finding: 'Fan guard is corroded and has missing sections. Safety hazard.', severity: 'warn' }
      ],
      performance: [
        { metric: 'Airflow', measured: 'Reduced ~40%', expected: 'Full design airflow', status: 'critical' },
        { metric: 'Fan Balance', measured: 'Excessive vibration', expected: 'Smooth operation', status: 'warn' }
      ],
      performance_alert: 'Fan deck deterioration is causing significant airflow reduction and safety concerns.',
      scope_of_work: [
        { phase: 'Day 1 - Demo', description: 'Remove existing fan deck panels, fan guard, and damaged fan blades. Prep structural supports.', crew: '4 crew x $79/hr x 8 hrs', labor_cost: '$2,528.00' },
        { phase: 'Day 2 - Structural', description: 'Repair or replace structural supports. Install new FRP fan deck panels.', crew: '4 crew x $79/hr x 8 hrs', labor_cost: '$2,528.00' },
        { phase: 'Day 3 - Fan Install', description: 'Install new fan blades, set pitch angles. Install new fan guard. Test and balance.', crew: '3 crew x $79/hr x 8 hrs', labor_cost: '$1,896.00' }
      ],
      materials: { unit_description: '', fill_pack_size: '', lead_time: '2-3 Weeks', items: [
        { description: 'FRP fan deck panels', qty: '', unit_rate: '', amount: '' },
        { description: 'Fan blades (set)', qty: '1', unit_rate: '', amount: '' },
        { description: 'Fan guard assembly', qty: '1', unit_rate: '', amount: '' }
      ]},
      additional_costs: [
        { item: 'Crane/Lift', details: 'Equipment for elevated work access', cost: '' }
      ],
      totals: {},
      notes: [
        { type: 'warning', text: 'Fan deck area is a fall hazard - do not access until repairs are complete.' },
        { type: 'ok', text: 'New FRP panels carry manufacturer lifetime warranty against corrosion.' }
      ],
      photos: [],
      warranty: '1 Year - Parts & Service. FRP panels carry manufacturer warranty. Work commences upon receipt of deposit and/or PO. All pricing is an estimate; final invoice based on actual time and materials. Valid 30 days from inspection.'
    }
  },
  {
    id: 'tpl_annual_inspection',
    name: 'Annual Inspection & PM',
    description: 'Comprehensive annual inspection and preventive maintenance',
    icon: '&#128269;',
    data: {
      job: {},
      findings: [
        { category: 'Fill Media', finding: '', severity: 'ok' },
        { category: 'Basin', finding: '', severity: 'ok' },
        { category: 'Nozzles', finding: '', severity: 'ok' },
        { category: 'Structure', finding: '', severity: 'ok' },
        { category: 'Motor', finding: '', severity: 'ok' },
        { category: 'Gearbox', finding: '', severity: 'ok' },
        { category: 'Fan Assembly', finding: '', severity: 'ok' },
        { category: 'Water Treatment', finding: '', severity: 'ok' }
      ],
      performance: [
        { metric: 'Cooling Delta', measured: '', expected: '>10 deg F', status: 'neutral' },
        { metric: 'Approach Temp', measured: '', expected: 'Per design', status: 'neutral' },
        { metric: 'Motor Amps', measured: '', expected: 'Within nameplate', status: 'neutral' },
        { metric: 'Vibration', measured: '', expected: 'Within tolerance', status: 'neutral' }
      ],
      performance_alert: '',
      scope_of_work: [
        { phase: 'Inspection', description: 'Full mechanical, structural, and performance inspection of cooling tower. Document all findings with photos.', crew: '2 crew x $79/hr x 4 hrs', labor_cost: '$632.00' },
        { phase: 'PM Service', description: 'Lubricate bearings, check belt tensions, verify motor connections, clean strainers, inspect water treatment.', crew: '2 crew x $79/hr x 4 hrs', labor_cost: '$632.00' }
      ],
      materials: { unit_description: '', fill_pack_size: '', lead_time: '', items: [
        { description: 'Lubricants and consumables', qty: '1', unit_rate: '$75.00', amount: '$75.00' }
      ]},
      additional_costs: [],
      totals: {},
      notes: [
        { type: 'ok', text: 'Comprehensive inspection report with photos will be provided within 5 business days.' },
        { type: 'ok', text: 'Recommendations for repairs or upgrades will be included if applicable.' }
      ],
      photos: [],
      warranty: 'Inspection and PM service warranty: 30 days on workmanship. Report provided as-is based on conditions observed during inspection.'
    }
  },
  {
    id: 'tpl_basin_repair',
    name: 'Basin Repair / Coating',
    description: 'Basin leak repair and protective coating application',
    icon: '&#128167;',
    data: {
      job: {},
      findings: [
        { category: 'Basin', finding: 'Basin floor and walls show significant deterioration. Active leaks observed at multiple locations.', severity: 'critical' },
        { category: 'Basin Coating', finding: 'Existing protective coating has failed. Bare metal/concrete exposed to water.', severity: 'warn' },
        { category: 'Drain', finding: 'Basin drain and overflow are functional but show buildup.', severity: 'ok' }
      ],
      performance: [
        { metric: 'Water Loss', measured: 'Significant leaking', expected: 'No visible leaks', status: 'critical' },
        { metric: 'Basin Condition', measured: 'Deteriorated', expected: 'Sound structure', status: 'warn' }
      ],
      performance_alert: 'Water loss from basin leaks is affecting system performance and causing water damage to surrounding area.',
      scope_of_work: [
        { phase: 'Day 1 - Drain & Prep', description: 'Drain basin, remove debris and sediment. Pressure wash all surfaces. Identify and mark all leak points.', crew: '3 crew x $79/hr x 8 hrs', labor_cost: '$1,896.00' },
        { phase: 'Day 2 - Repair', description: 'Patch all cracks and leak points with structural repair compound. Allow cure time per manufacturer specs.', crew: '3 crew x $79/hr x 8 hrs', labor_cost: '$1,896.00' },
        { phase: 'Day 3 - Coating', description: 'Apply primer coat followed by two coats of epoxy basin coating. Allow cure between coats.', crew: '3 crew x $79/hr x 8 hrs', labor_cost: '$1,896.00' },
        { phase: 'Day 4 - Commission', description: 'Final inspection of coating. Refill basin. Test for leaks. Restart system.', crew: '2 crew x $79/hr x 4 hrs', labor_cost: '$632.00' }
      ],
      materials: { unit_description: '', fill_pack_size: '', lead_time: '1-2 Weeks', items: [
        { description: 'Structural repair compound', qty: '', unit_rate: '', amount: '' },
        { description: 'Epoxy basin coating (primer + 2 coats)', qty: '', unit_rate: '', amount: '' },
        { description: 'Application supplies (rollers, brushes, etc.)', qty: '1', unit_rate: '', amount: '' }
      ]},
      additional_costs: [
        { item: 'Temporary Water', details: 'Temporary cooling during basin downtime', cost: '' },
        { item: 'Heaters', details: 'Basin heaters for coating cure in cold weather', cost: '' }
      ],
      totals: {},
      notes: [
        { type: 'warning', text: 'Basin must be completely dry for coating application. Weather-dependent scheduling required.' },
        { type: 'ok', text: 'Epoxy coating system carries 5-year manufacturer warranty when properly applied.' }
      ],
      photos: [],
      warranty: '1 Year - Workmanship. Basin coating carries separate manufacturer warranty (5 years). Work commences upon receipt of deposit and/or PO. All pricing is an estimate; final invoice based on actual time and materials. Valid 30 days from inspection.'
    }
  }
];

// ── Template Picker Modal ─────────────────────────────────────
function showTemplatePicker(){
  var modal = document.getElementById('template-modal');
  if(!modal) return;
  var body = document.getElementById('template-modal-body');
  var userTpls = getUserTemplates();

  var html = '<div class="tpl-grid">';
  // Blank option
  html += '<div class="tpl-card blank" data-tpl="blank"><span class="tpl-icon">&#10133;</span><span class="tpl-name">Blank Estimate</span><span class="tpl-desc">Start from scratch</span></div>';
  // Built-in templates
  BUILTIN_TEMPLATES.forEach(function(t){
    html += '<div class="tpl-card" data-tpl="'+t.id+'"><span class="tpl-icon">'+t.icon+'</span><span class="tpl-name">'+esc(t.name)+'</span><span class="tpl-desc">'+esc(t.description)+'</span></div>';
  });
  // User templates
  userTpls.forEach(function(t){
    html += '<div class="tpl-card" data-tpl="'+t.id+'" data-user="1"><span class="tpl-icon">'+t.icon+'</span><span class="tpl-name">'+esc(t.name)+'</span><span class="tpl-desc">'+esc(t.description)+'</span></div>';
  });
  html += '</div>';
  body.innerHTML = html;
  modal.classList.add('open');
}

function handleTemplatePick(tplId){
  var modal = document.getElementById('template-modal');
  if(modal) modal.classList.remove('open');

  if(tplId==='blank'){
    newJob();
    return;
  }
  // Find in built-in
  var tpl = null;
  for(var i=0;i<BUILTIN_TEMPLATES.length;i++){
    if(BUILTIN_TEMPLATES[i].id===tplId){ tpl=BUILTIN_TEMPLATES[i]; break; }
  }
  // Find in user templates
  if(!tpl){
    var userTpls = getUserTemplates();
    for(var j=0;j<userTpls.length;j++){
      if(userTpls[j].id===tplId){ tpl=userTpls[j]; break; }
    }
  }
  if(tpl){
    newJobFromTemplate(tpl.data);
  } else {
    newJob();
  }
}

function promptSaveAsTemplate(){
  var name = prompt('Template name:');
  if(!name) return;
  var desc = prompt('Short description (optional):','');
  var data = collectFormData();
  saveAsTemplate(name, desc, data);
  toast('Saved as template!');
}
