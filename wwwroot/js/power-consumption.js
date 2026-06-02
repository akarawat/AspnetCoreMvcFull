/**
 * power-consumption.js
 * wwwroot/js/power-consumption.js  v1.0.4
 *
 * Handles:
 *   - Scatter + Daily Average Line Chart : End Power (W)
 *   - Click on scatter point → load Burn-in Time Profile (same as table row click)
 *   - DataTable 1     : Burn-in power summary  (Query 1)
 *   - DataTable 2 + Line Chart : Burn-in time profile  (Query 2)
 *   - Series toggle   : B3 / B7
 *   - Date-range radio: W = 7 days | M = 30 days | Y = 365 days
 *   - Export Excel    : SheetJS xlsx.full.min.js
 */

'use strict';

/* ─── State ─────────────────────────────────────────────── */
let dtSummary     = null;
let dtTimeProfile = null;
let apexScatter   = null;
let apexProfile   = null;
let _summaryData  = [];
let _timeData     = [];
let _scatterMeta  = {};   // { prdname: [ { serial, prdname, date } ] }

/* ─── Init ──────────────────────────────────────────────── */
$(document).ready(function () {
  $('input[name="rangeRadio"]').on('change', function () {
    $('#hdnFlagrange').val(this.value);
    loadPowerConsumption();
  });
  loadPowerConsumption();
});

/* ─── Series toggle ─────────────────────────────────────── */
function changeSeries(series) {
  $('#hdnSeries').val(series);

  // Reset all series buttons then activate the selected one
  $('[id^="btnB"]').removeClass('btn-primary').addClass('btn-outline-primary');
  $('#btnB' + series).removeClass('btn-outline-primary').addClass('btn-primary');

  closeTimeProfile();
  loadPowerConsumption();
}

/* ─── Load DataTable 1 + Chart ──────────────────────────── */
async function loadPowerConsumption() {
  const series    = $('#hdnSeries').val();
  const flagrange = $('#hdnFlagrange').val();
  const label     = 'B' + series + ' — ' + rangeLabel(flagrange);

  $('#lblSeries').text('B' + series);
  $('#badgeSeries').text(label);
  $('#badgeScatterSeries').text(label);
  $('#btnExportSummary').prop('disabled', true);

  let data = [];
  try {
    const q    = new URLSearchParams({ series, flagrange }).toString();
    const resp = await fetch(`/PowerConsumption/GetPowerConsumption?${q}`);
    data = await resp.json();
  } catch (e) {
    console.error('GetPowerConsumption error:', e);
    return;
  }

  _summaryData = data;
  updateSummaryCards(data);
  renderScatterChart(data);

  // ── DataTable 1 ───────────────────────────────────────
  if (dtSummary && $.fn.DataTable.isDataTable('#tblPowerSummary')) {
    dtSummary.clear().destroy();
    $('#tblPowerSummaryBody').empty();
  }

  let rows = '';
  data.forEach((row, idx) => {
    const cls = row.power_reduct < 0 ? 'pc-reduct-neg' : 'pc-reduct-pos';
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
        <td class="${cls} fw-semibold">${row.power_reduct.toFixed(2)}</td>
      </tr>`;
  });
  $('#tblPowerSummaryBody').html(rows);

  dtSummary = $('#tblPowerSummary').DataTable({
    order     : [[2, 'desc']],
    pageLength: 10,
    lengthMenu: [10, 25, 50, 100],
    language  : { search: 'Search:', lengthMenu: 'Show _MENU_ rows' },
    columnDefs: [{ orderable: false, targets: 0 }]
  });

  if (data.length > 0) $('#btnExportSummary').prop('disabled', false);

  // Table row click
  $('#tblPowerSummary tbody').on('click', 'tr.pc-clickable-row', function () {
    $('#tblPowerSummary tbody tr').removeClass('pc-row-selected');
    $(this).addClass('pc-row-selected');
    loadTimeProfile($(this).data('serial'), $(this).data('series'), $(this).data('date'));
  });
}

/* ═══════════════════════════════════════════════════════════
   SCATTER + DAILY AVERAGE LINE  (Mixed chart — ApexCharts)
   ═══════════════════════════════════════════════════════════ */
function renderScatterChart(data) {

  if (apexScatter) { apexScatter.destroy(); apexScatter = null; }
  $('#chartEndPowerScatter').empty();
  if (!data || data.length === 0) return;

  // Sort ascending → X-axis flows left to right
  const sorted = [...data].sort((a, b) =>
    new Date(a.productionDate) - new Date(b.productionDate)
  );

  // ── 1. Scatter series — grouped by model (prdname) ───
  const seriesMap = {};
  const metaMap   = {};

  sorted.forEach(row => {
    const key = row.prdname;
    if (!seriesMap[key]) { seriesMap[key] = []; metaMap[key] = []; }
    seriesMap[key].push({ x: new Date(row.productionDate).getTime(), y: row.end_power });
    metaMap[key].push({ serial: row.serial, prdname: row.prdname, date: row.productionDate_txt });
  });

  _scatterMeta = metaMap;

  const scatterSeries = Object.keys(seriesMap).map(name => ({
    name: name,
    type: 'scatter',
    data: seriesMap[name]
  }));

  // ── 2. Daily Average Line series ─────────────────────
  const dailyMap = {};
  sorted.forEach(row => {
    const key = new Date(row.productionDate).toISOString().slice(0, 10);
    if (!dailyMap[key]) {
      dailyMap[key] = { sum: 0, count: 0, timestamp: new Date(key + 'T12:00:00').getTime() };
    }
    dailyMap[key].sum   += row.end_power;
    dailyMap[key].count += 1;
  });

  const avgLineData = Object.values(dailyMap)
    .sort((a, b) => a.timestamp - b.timestamp)
    .map(d => ({ x: d.timestamp, y: parseFloat((d.sum / d.count).toFixed(2)) }));

  const avgSeries = { name: 'Daily Avg', type: 'line', data: avgLineData };

  // ── 3. Colours ────────────────────────────────────────
  const palette      = ['#696cff', '#03c3ec', '#71dd37', '#ff3e1d',
                        '#20c997', '#e83e8c', '#6f42c1', '#fd7e14'];
  const scatterColors = Object.keys(seriesMap).map((_, i) => palette[i % palette.length]);
  const allColors     = [...scatterColors, '#ffab00'];

  const allSeries = [...scatterSeries, avgSeries];

  // ── 4. ApexCharts options ─────────────────────────────
  const options = {
    chart: {
      type   : 'line',
      height : 360,
      zoom   : { enabled: true, type: 'xy' },
      toolbar: { show: true },

      // ── Scatter point click → load Burn-in Time Profile ──
      events: {
        dataPointSelection: function (event, chartContext, config) {
          const si  = config.seriesIndex;
          const dpi = config.dataPointIndex;

          // Ignore clicks on the Average Line series (last series)
          if (allSeries[si]?.type === 'line') return;

          const modelName = allSeries[si]?.name;
          const meta      = _scatterMeta[modelName]?.[dpi];
          if (!meta) return;

          const currentSeries = $('#hdnSeries').val();

          // Highlight matching row in DataTable
          $('#tblPowerSummary tbody tr').removeClass('pc-row-selected');
          $('#tblPowerSummary tbody tr').each(function () {
            if ($(this).data('serial') === meta.serial) {
              $(this).addClass('pc-row-selected');
            }
          });

          // Load time profile — same function as table row click
          loadTimeProfile(meta.serial, currentSeries, meta.date);
        }
      }
    },

    series: allSeries,
    colors: allColors,

    stroke: {
      width    : allSeries.map(s => s.type === 'line' ? 2.5 : 0),
      curve    : 'smooth',
      dashArray: allSeries.map(s => s.type === 'line' ? 4  : 0)
    },

    markers: {
      size        : allSeries.map(s => s.type === 'scatter' ? 5 : 6),
      strokeWidth : 1,
      strokeOpacity: 0.8,
      fillOpacity : allSeries.map(s => s.type === 'scatter' ? 0.75 : 1),
      // Show pointer cursor on scatter points only
      hover       : { size: 8 }
    },

    xaxis: {
      type  : 'datetime',
      title : { text: 'Production Date' },
      labels: { datetimeUTC: false, format: 'dd-MM HH:mm' },
      tooltip: { enabled: false }
    },

    yaxis: {
      title          : { text: 'End Power (W)' },
      decimalsInFloat: 2,
      labels         : { formatter: v => v.toFixed(1) + ' W' }
    },

    // ── Custom tooltip ────────────────────────────────────
    tooltip: {
      shared: false,
      custom: function ({ seriesIndex, dataPointIndex, w }) {
        const seriesName = w.globals.seriesNames[seriesIndex];
        const seriesType = allSeries[seriesIndex]?.type;
        const yVal       = w.globals.series[seriesIndex][dataPointIndex];

        // Average line tooltip
        if (seriesType === 'line') {
          const xTs  = w.globals.seriesX[seriesIndex][dataPointIndex];
          const date = new Date(xTs).toLocaleDateString('en-GB',
            { day: '2-digit', month: '2-digit', year: 'numeric' });
          return `
            <div class="pc-scatter-tooltip">
              <div class="pc-st-header" style="color:#ffab00;">
                <i class="ri-bar-chart-line me-1"></i>Daily Average
              </div>
              <div class="pc-st-row">
                <span class="pc-st-label">Date</span>
                <span class="pc-st-value">${date}</span>
              </div>
              <div class="pc-st-row">
                <span class="pc-st-label">Avg End Power</span>
                <span class="pc-st-value fw-bold">${yVal.toFixed(2)} W</span>
              </div>
            </div>`;
        }

        // Scatter point tooltip — hint to click
        const meta = _scatterMeta[seriesName]?.[dataPointIndex];
        if (!meta) return '';
        return `
          <div class="pc-scatter-tooltip">
            <div class="pc-st-header">${escHtml(meta.serial)}</div>
            <div class="pc-st-row">
              <span class="pc-st-label">Model</span>
              <span class="pc-st-value">${escHtml(meta.prdname)}</span>
            </div>
            <div class="pc-st-row">
              <span class="pc-st-label">Date</span>
              <span class="pc-st-value">${escHtml(meta.date)}</span>
            </div>
            <div class="pc-st-row">
              <span class="pc-st-label">End Power</span>
              <span class="pc-st-value fw-bold">${yVal.toFixed(2)} W</span>
            </div>
            <div class="pc-st-click-hint">
              <i class="ri-cursor-line me-1"></i>Click to view burn-in profile
            </div>
          </div>`;
      }
    },

    legend: {
      position       : 'bottom',
      horizontalAlign: 'center',
      markers        : { size: 6, shape: 'circle' },
      itemMargin     : { horizontal: 10, vertical: 4 }
    },

    grid: { borderColor: '#f1f1f1', strokeDashArray: 4 }
  };

  apexScatter = new ApexCharts(document.querySelector('#chartEndPowerScatter'), options);
  apexScatter.render();
}

/* ─── Load DataTable 2 + Burn-in time chart ─────────────── */
async function loadTimeProfile(serial, series, dateLabel) {
  const flagrange = $('#hdnFlagrange').val();

  $('#lblProfileSerial').text(serial);
  $('#lblProfileDate').text(dateLabel);
  $('#panelTimeProfile').show();
  $('html, body').animate({ scrollTop: $('#panelTimeProfile').offset().top - 80 }, 400);

  let data = [];
  try {
    const q    = new URLSearchParams({ serial, series, flagrange }).toString();
    const resp = await fetch(`/PowerConsumption/GetPowerConsumptionTime?${q}`);
    data = await resp.json();
  } catch (e) {
    console.error('GetPowerConsumptionTime error:', e);
    return;
  }

  _timeData = data;

  if (apexProfile) { apexProfile.destroy(); apexProfile = null; }
  $('#chartBurninProfile').empty();

  apexProfile = new ApexCharts(document.querySelector('#chartBurninProfile'), {
    chart     : { type: 'line', height: 280, toolbar: { show: true }, zoom: { enabled: true } },
    series    : [{ name: 'Power (W)', data: data.map(d => ({ x: d.timesec, y: d.powerwatt })) }],
    xaxis     : { type: 'numeric', title: { text: 'Time (s)' } },
    yaxis     : { title: { text: 'Power (W)' }, decimalsInFloat: 2 },
    stroke    : { curve: 'smooth', width: 2 },
    markers   : { size: 3 },
    tooltip   : { x: { formatter: v => v + ' s' }, y: { formatter: v => v.toFixed(2) + ' W' } },
    colors    : ['#696cff'],
    grid      : { borderColor: '#f1f1f1' },
    dataLabels: { enabled: false }
  });
  apexProfile.render();

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
  if (apexProfile) { apexProfile.destroy(); apexProfile = null; }
  if (dtTimeProfile && $.fn.DataTable.isDataTable('#tblTimeProfile')) {
    dtTimeProfile.clear().destroy();
    $('#tblTimeProfileBody').empty();
  }
}

/* ═══════════════════════════════════════════════════════════
   EXPORT EXCEL — SheetJS
   ═══════════════════════════════════════════════════════════ */
function exportSummaryExcel() {
  if (!_summaryData || _summaryData.length === 0) return;

  const series    = $('#hdnSeries').val();
  const flagrange = $('#hdnFlagrange').val();
  const filename  = `PowerConsumption_B${series}_${flagrange}_${dateStamp()}.xlsx`;

  const wsData = [
    ['#', 'Serial', 'Production Date', 'Series', 'Model',
     'Start Power (W)', 'End Power (W)', 'Reduction (W)']
  ];
  _summaryData.forEach((row, idx) => {
    wsData.push([idx + 1, row.serial, row.productionDate_txt, row.series,
                 row.prdname, row.start_power, row.end_power, row.power_reduct]);
  });

  const avg = arr => parseFloat((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2));
  wsData.push([]);
  wsData.push(['Average', '', '', '', '',
    avg(_summaryData.map(d => d.start_power)),
    avg(_summaryData.map(d => d.end_power)),
    avg(_summaryData.map(d => d.power_reduct))]);
  wsData.push(['Total machines', _summaryData.length]);

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws['!cols'] = [{ wch: 5 }, { wch: 18 }, { wch: 20 }, { wch: 8 },
                 { wch: 14 }, { wch: 16 }, { wch: 14 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, ws, `B${series}_Summary`);
  XLSX.writeFile(wb, filename);
}

function exportTimeProfileExcel() {
  if (!_timeData || _timeData.length === 0) return;

  const serial    = $('#lblProfileSerial').text().trim();
  const flagrange = $('#hdnFlagrange').val();
  const filename  = `BurninProfile_${serial.replace(/\s+/g, '_')}_${flagrange}_${dateStamp()}.xlsx`;

  const wsData = [['#', 'Serial', 'Production Date', 'Series', 'Model', 'Time (s)', 'Power (W)']];
  _timeData.forEach((row, idx) => {
    wsData.push([idx + 1, row.serial, row.productionDate_txt,
                 row.series, row.prdname, row.timesec, row.powerwatt]);
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws['!cols'] = [{ wch: 5 }, { wch: 18 }, { wch: 20 }, { wch: 8 },
                 { wch: 14 }, { wch: 10 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, ws, `Profile_${serial.replace(/\s+/g, '_').slice(0, 28)}`);
  XLSX.writeFile(wb, filename);
}

/* ─── Summary cards ─────────────────────────────────────── */
function updateSummaryCards(data) {
  if (!data || data.length === 0) {
    ['#statAvgStart', '#statAvgEnd', '#statAvgReduct'].forEach(id => $(id).text('–'));
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
