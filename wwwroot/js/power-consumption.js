/**
 * power-consumption.js
 * wwwroot/js/power-consumption.js
 *
 * Handles:
 *   - DataTable 1 : Burn-in power summary  (Query 1)
 *   - DataTable 2 + ApexChart : Time profile per machine  (Query 2)
 *   - Series toggle (B3 / B7)
 *   - Date-range radio  (W = 7 days | M = 30 days | Y = 365 days)
 *   - Export Excel  (SheetJS xlsx.full.min.js)
 */

'use strict';

/* ─── State ─────────────────────────────────────────────── */
let dtSummary      = null;   // DataTable instance – summary
let dtTimeProfile  = null;   // DataTable instance – time profile
let apexChart      = null;   // ApexCharts instance
let _summaryData   = [];     // raw data cache for export (Query 1)
let _timeData      = [];     // raw data cache for export (Query 2)

/* ─── Init ──────────────────────────────────────────────── */
$(document).ready(function () {
  $('input[name="rangeRadio"]').on('change', function () {
    $('#hdnFlagrange').val(this.value);
    loadPowerConsumption();
  });

  // Default load: B7 / Weekly
  loadPowerConsumption();
});

/* ─── Series toggle ─────────────────────────────────────── */
function changeSeries(series) {
  $('#hdnSeries').val(series);
  $('#btnB3').removeClass('btn-primary').addClass('btn-outline-primary');
  $('#btnB7').removeClass('btn-primary').addClass('btn-outline-primary');
  if (series === '3') {
    $('#btnB3').removeClass('btn-outline-primary').addClass('btn-primary');
  } else {
    $('#btnB7').removeClass('btn-outline-primary').addClass('btn-primary');
  }
  closeTimeProfile();
  loadPowerConsumption();
}

/* ─── Load DataTable 1 ──────────────────────────────────── */
async function loadPowerConsumption() {
  const series    = $('#hdnSeries').val();
  const flagrange = $('#hdnFlagrange').val();

  $('#lblSeries').text('B' + series);
  $('#badgeSeries').text('B' + series + ' — ' + rangeLabel(flagrange));
  $('#btnExportSummary').prop('disabled', true);

  const query = new URLSearchParams({ series, flagrange }).toString();
  let data = [];
  try {
    const resp = await fetch(`/PowerConsumption/GetPowerConsumption?${query}`);
    data = await resp.json();
  } catch (e) {
    console.error('GetPowerConsumption error:', e);
    return;
  }

  _summaryData = data;   // cache for export
  updateSummaryCards(data);

  // Destroy previous DataTable
  if (dtSummary && $.fn.DataTable.isDataTable('#tblPowerSummary')) {
    dtSummary.clear().destroy();
    $('#tblPowerSummaryBody').empty();
  }

  // Build rows
  let rows = '';
  data.forEach((row, idx) => {
    const reductClass = row.power_reduct < 0 ? 'pc-reduct-neg' : 'pc-reduct-pos';
    rows += `
      <tr data-serial="${escHtml(row.serial)}"
          data-series="${escHtml(row.series)}"
          data-date="${escHtml(row.productionDate_txt)}"
          class="pc-clickable-row">
        <td>${idx + 1}</td>
        <td class="fw-medium">${escHtml(row.serial)}</td>
        <td>${escHtml(row.productionDate_txt)}</td>
        <td>${row.series}</td>
        <td>${escHtml(row.prdname)}</td>
        <td>${row.start_power.toFixed(2)}</td>
        <td>${row.end_power.toFixed(2)}</td>
        <td class="${reductClass} fw-semibold">${row.power_reduct.toFixed(2)}</td>
      </tr>`;
  });
  $('#tblPowerSummaryBody').html(rows);

  dtSummary = $('#tblPowerSummary').DataTable({
    order     : [[2, 'desc']],
    pageLength: 25,
    lengthMenu: [10, 25, 50, 100],
    language  : { search: 'Search:', lengthMenu: 'Show _MENU_ rows' },
    columnDefs: [{ orderable: false, targets: 0 }]
  });

  if (data.length > 0) {
    $('#btnExportSummary').prop('disabled', false);
  }

  // Row click → load time profile
  $('#tblPowerSummary tbody').on('click', 'tr.pc-clickable-row', function () {
    $('#tblPowerSummary tbody tr').removeClass('pc-row-selected');
    $(this).addClass('pc-row-selected');
    loadTimeProfile($(this).data('serial'), $(this).data('series'), $(this).data('date'));
  });
}

/* ─── Load DataTable 2 + Chart ──────────────────────────── */
async function loadTimeProfile(serial, series, dateLabel) {
  const flagrange = $('#hdnFlagrange').val();

  $('#lblProfileSerial').text(serial);
  $('#lblProfileDate').text(dateLabel);
  $('#panelTimeProfile').show();
  $('html, body').animate({ scrollTop: $('#panelTimeProfile').offset().top - 80 }, 400);

  const query = new URLSearchParams({ serial, series, flagrange }).toString();
  let data = [];
  try {
    const resp = await fetch(`/PowerConsumption/GetPowerConsumptionTime?${query}`);
    data = await resp.json();
  } catch (e) {
    console.error('GetPowerConsumptionTime error:', e);
    return;
  }

  _timeData = data;   // cache for export

  // ── ApexCharts ────────────────────────────────────────
  const chartData = data.map(d => ({ x: d.timesec, y: d.powerwatt }));
  if (apexChart) { apexChart.destroy(); apexChart = null; }
  $('#chartBurninProfile').empty();

  apexChart = new ApexCharts(document.querySelector('#chartBurninProfile'), {
    chart : { type: 'line', height: 280, toolbar: { show: true }, zoom: { enabled: true } },
    series: [{ name: 'Power (W)', data: chartData }],
    xaxis : { type: 'numeric', title: { text: 'Time (s)' } },
    yaxis : { title: { text: 'Power (W)' }, decimalsInFloat: 2 },
    stroke: { curve: 'smooth', width: 2 },
    markers   : { size: 3 },
    tooltip   : { x: { formatter: v => v + ' s' }, y: { formatter: v => v.toFixed(2) + ' W' } },
    colors    : ['#696cff'],
    grid      : { borderColor: '#f1f1f1' },
    dataLabels: { enabled: false }
  });
  apexChart.render();

  // ── DataTable 2 ───────────────────────────────────────
  if (dtTimeProfile && $.fn.DataTable.isDataTable('#tblTimeProfile')) {
    dtTimeProfile.clear().destroy();
    $('#tblTimeProfileBody').empty();
  }

  let rows = '';
  data.forEach((row, idx) => {
    rows += `
      <tr>
        <td>${idx + 1}</td>
        <td>${escHtml(row.serial)}</td>
        <td>${escHtml(row.productionDate_txt)}</td>
        <td>${row.timesec}</td>
        <td>${row.powerwatt.toFixed(2)}</td>
      </tr>`;
  });
  $('#tblTimeProfileBody').html(rows);

  dtTimeProfile = $('#tblTimeProfile').DataTable({
    order     : [[3, 'asc']],
    pageLength: 25,
    lengthMenu: [10, 25, 50],
    language  : { search: 'Search:', lengthMenu: 'Show _MENU_ rows' },
    columnDefs: [{ orderable: false, targets: 0 }]
  });
}

/* ─── Close time profile panel ──────────────────────────── */
function closeTimeProfile() {
  $('#panelTimeProfile').hide();
  $('#tblPowerSummary tbody tr').removeClass('pc-row-selected');
  _timeData = [];
  if (apexChart) { apexChart.destroy(); apexChart = null; }
  if (dtTimeProfile && $.fn.DataTable.isDataTable('#tblTimeProfile')) {
    dtTimeProfile.clear().destroy();
    $('#tblTimeProfileBody').empty();
  }
}

/* ═══════════════════════════════════════════════════════════
   EXPORT EXCEL — SheetJS (xlsx.full.min.js)
   ═══════════════════════════════════════════════════════════ */

/* Export DataTable 1 : Burn-in Power Summary */
function exportSummaryExcel() {
  if (!_summaryData || _summaryData.length === 0) return;

  const series    = $('#hdnSeries').val();
  const flagrange = $('#hdnFlagrange').val();
  const filename  = `PowerConsumption_B${series}_${flagrange}_${dateStamp()}.xlsx`;

  // Build worksheet rows
  const wsData = [
    ['#', 'Serial', 'Production Date', 'Series', 'Model',
     'Start Power (W)', 'End Power (W)', 'Reduction (W)']
  ];

  _summaryData.forEach((row, idx) => {
    wsData.push([
      idx + 1,
      row.serial,
      row.productionDate_txt,
      row.series,
      row.prdname,
      row.start_power,
      row.end_power,
      row.power_reduct
    ]);
  });

  // Summary row at the bottom
  const avg = arr => parseFloat((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2));
  wsData.push([]);   // blank row
  wsData.push([
    'Average', '', '', '', '',
    avg(_summaryData.map(d => d.start_power)),
    avg(_summaryData.map(d => d.end_power)),
    avg(_summaryData.map(d => d.power_reduct))
  ]);
  wsData.push(['Total machines', _summaryData.length]);

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Column widths
  ws['!cols'] = [
    { wch: 5 }, { wch: 18 }, { wch: 20 }, { wch: 8 },
    { wch: 14 }, { wch: 16 }, { wch: 14 }, { wch: 14 }
  ];

  XLSX.utils.book_append_sheet(wb, ws, `B${series}_Summary`);
  XLSX.writeFile(wb, filename);
}

/* Export DataTable 2 : Burn-in Time Profile */
function exportTimeProfileExcel() {
  if (!_timeData || _timeData.length === 0) return;

  const serial    = $('#lblProfileSerial').text().trim();
  const series    = $('#hdnSeries').val();
  const flagrange = $('#hdnFlagrange').val();
  const filename  = `BurninProfile_${serial.replace(/\s+/g, '_')}_${flagrange}_${dateStamp()}.xlsx`;

  const wsData = [
    ['#', 'Serial', 'Production Date', 'Series', 'Model', 'Time (s)', 'Power (W)']
  ];

  _timeData.forEach((row, idx) => {
    wsData.push([
      idx + 1,
      row.serial,
      row.productionDate_txt,
      row.series,
      row.prdname,
      row.timesec,
      row.powerwatt
    ]);
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  ws['!cols'] = [
    { wch: 5 }, { wch: 18 }, { wch: 20 }, { wch: 8 },
    { wch: 14 }, { wch: 10 }, { wch: 12 }
  ];

  XLSX.utils.book_append_sheet(wb, ws, `Profile_${serial.replace(/\s+/g, '_').slice(0, 28)}`);
  XLSX.writeFile(wb, filename);
}

/* ─── Summary cards ─────────────────────────────────────── */
function updateSummaryCards(data) {
  if (!data || data.length === 0) {
    $('#statAvgStart').text('–');
    $('#statAvgEnd').text('–');
    $('#statAvgReduct').text('–');
    $('#statTotal').text('0');
    return;
  }
  const avg = arr => arr.reduce((a, b) => a + b, 0) / arr.length;
  const fmt = v => v.toFixed(2) + ' W';
  $('#statAvgStart').text(fmt(avg(data.map(d => d.start_power))));
  $('#statAvgEnd').text(fmt(avg(data.map(d => d.end_power))));
  $('#statAvgReduct').text(fmt(avg(data.map(d => d.power_reduct))));
  $('#statTotal').text(data.length);
}

/* ─── Helpers ───────────────────────────────────────────── */
function rangeLabel(flag) {
  return flag === 'W' ? 'Last 7 days' : flag === 'M' ? 'Last 30 days' : 'Last 365 days';
}

function dateStamp() {
  const d = new Date();
  return d.getFullYear()
    + String(d.getMonth() + 1).padStart(2, '0')
    + String(d.getDate()).padStart(2, '0');
}

function escHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
