/**
 * power-consumption.js
 * wwwroot/js/power-consumption.js  v1.0.5
 *
 * New in v1.0.5:
 *   - โหลด PassFail Limit (max_fail, min_fail) จาก SP_GetPassFailParam
 *   - เพิ่มเส้น Limit บน chartEndPowerScatter (annotation + color coding)
 *   - Modal popup แก้ไขค่า Limit → POST SP_UpdatePassFailParam
 *   - ป้องกัน null กรณี series ไม่มีข้อมูล Limit
 */

'use strict';

/* ─── State ─────────────────────────────────────────────── */
let dtSummary = null;
let dtTimeProfile = null;
let apexScatter = null;
let apexProfile = null;
let _summaryData = [];
let _timeData = [];
let _scatterMeta = {};
let _limitParam = null;   // PassFailParamModel | null

/* ─── Init ──────────────────────────────────────────────── */
$(document).ready(function () {
  // กำหนดค่า default date ให้ input (today และ 7 วันก่อน)
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 6);
  $('#inputDateFrom').val(fmtDateInput(weekAgo));
  $('#inputDateTo').val(fmtDateInput(today));

  $('input[name="rangeRadio"]').on('change', function () {
    const val = this.value;
    $('#hdnFlagrange').val(val);
    if (val === 'D') {
      $('#customDateRange').css('display', 'flex');
    } else {
      $('#customDateRange').css('display', 'none');
      $('#hdnDateFrom').val('');
      $('#hdnDateTo').val('');
      loadPowerConsumption();
    }
  });
  loadPowerConsumption();
});

/* ─── Series toggle ─────────────────────────────────────── */
function changeSeries(series) {
  $('#hdnSeries').val(series);
  $('[id^="btnB"]').removeClass('btn-primary').addClass('btn-outline-primary');
  $('#btnB' + series).removeClass('btn-outline-primary').addClass('btn-primary');
  closeTimeProfile();
  loadPowerConsumption();
}

/* ─── Apply custom date range ───────────────────────────── */
function applyCustomRange() {
  const from = $('#inputDateFrom').val();
  const to   = $('#inputDateTo').val();
  if (!from || !to) {
    alert('Please select both From and To dates.');
    return;
  }
  if (from > to) {
    alert('From date must not be later than To date.');
    return;
  }
  $('#hdnDateFrom').val(from);
  $('#hdnDateTo').val(to);
  loadPowerConsumption();
}

/* ─── Load DataTable 1 + Chart ──────────────────────────── */
async function loadPowerConsumption() {
  const series    = $('#hdnSeries').val();
  const flagrange = $('#hdnFlagrange').val();
  const dtFrom    = $('#hdnDateFrom').val();
  const dtTo      = $('#hdnDateTo').val();
  const label     = 'B' + series + ' — ' + rangeLabel(flagrange, dtFrom, dtTo);

  $('#lblSeries').text('B' + series);
  $('#badgeSeries').text(label);
  $('#badgeScatterSeries').text(label);
  $('#btnExportSummary').prop('disabled', true);

  // build query params — เพิ่ม dt_from/dt_to เมื่อเลือก Date to Date
  const qMain = new URLSearchParams({ series, flagrange });
  if (flagrange === 'D' && dtFrom && dtTo) {
    qMain.set('dt_from', dtFrom);
    qMain.set('dt_to', dtTo);
  }

  // โหลด Limit + Data พร้อมกัน (parallel)
  const [data, limitParam] = await Promise.all([
    fetchJson(`/PowerConsumption/GetPowerConsumption?${qMain}`),
    fetchJson(`/PowerConsumption/GetPassFailParam?${new URLSearchParams({ series })}`)
  ]);

  _summaryData = data || [];
  _limitParam = limitParam;   // อาจเป็น null ถ้า series ไม่มีข้อมูล

  updateLimitBadge(_limitParam);
  updateSummaryCards(_summaryData);
  renderScatterChart(_summaryData, _limitParam);

  // ── DataTable 1 ───────────────────────────────────────
  if (dtSummary && $.fn.DataTable.isDataTable('#tblPowerSummary')) {
    dtSummary.clear().destroy();
    $('#tblPowerSummaryBody').empty();
  }

  let rows = '';
  _summaryData.forEach((row, idx) => {
    const cls = row.power_reduct < 0 ? 'pc-reduct-neg' : 'pc-reduct-pos';
    // ระบายสีแถวที่ end_power เกิน limit
    const rowCls = getRowLimitClass(row.end_power, _limitParam);
    rows += `
      <tr data-serial="${escHtml(row.serial)}"
          data-series="${escHtml(row.series)}"
          data-date="${escHtml(row.productionDate_txt)}"
          class="pc-clickable-row ${rowCls}">
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
    order: [[2, 'desc']],
    pageLength: 10,
    lengthMenu: [10, 25, 50, 100],
    language: { search: 'Search:', lengthMenu: 'Show _MENU_ rows' },
    columnDefs: [{ orderable: false, targets: 0 }]
  });

  if (_summaryData.length > 0) $('#btnExportSummary').prop('disabled', false);

  $('#tblPowerSummary tbody').on('click', 'tr.pc-clickable-row', function () {
    $('#tblPowerSummary tbody tr').removeClass('pc-row-selected');
    $(this).addClass('pc-row-selected');
    loadTimeProfile($(this).data('serial'), $(this).data('series'), $(this).data('date'));
  });
}

/* ─── Limit badge in chart header ───────────────────────── */
function updateLimitBadge(param) {
  if (param && param.max_fail != null) {
    $('#lblLimitMax').text('Max: ' + param.max_fail + ' W');
    $('#lblLimitMin').text('Min: ' + param.min_fail + ' W');
    $('#limitBadgeGroup').show();
  } else {
    $('#limitBadgeGroup').hide();
  }
}

/* ─── Row limit class helper ────────────────────────────── */
function getRowLimitClass(endPower, param) {
  if (!param) return '';
  if (endPower > param.max_fail) return 'pc-row-fail-high';
  if (endPower <= param.min_fail) return 'pc-row-fail-low';
  return '';
}

/* ═══════════════════════════════════════════════════════════
   SCATTER + AVG LINE + LIMIT LINES
   ═══════════════════════════════════════════════════════════ */
function renderScatterChart(data, limitParam) {
  if (apexScatter) { apexScatter.destroy(); apexScatter = null; }
  $('#chartEndPowerScatter').empty();
  if (!data || data.length === 0) return;

  const sorted = [...data].sort((a, b) =>
    new Date(a.productionDate) - new Date(b.productionDate)
  );

  // ── 1. Scatter series grouped by model ───────────────
  const seriesMap = {};
  const metaMap = {};
  sorted.forEach(row => {
    const key = row.prdname;
    if (!seriesMap[key]) { seriesMap[key] = []; metaMap[key] = []; }
    seriesMap[key].push({ x: new Date(row.productionDate).getTime(), y: row.end_power });
    metaMap[key].push({ serial: row.serial, prdname: row.prdname, date: row.productionDate_txt });
  });
  _scatterMeta = metaMap;

  const scatterSeries = Object.keys(seriesMap).map(name => ({
    name, type: 'scatter', data: seriesMap[name]
  }));

  // ── 2. Daily Average Line ────────────────────────────
  const dailyMap = {};
  sorted.forEach(row => {
    const key = new Date(row.productionDate).toISOString().slice(0, 10);
    if (!dailyMap[key]) {
      dailyMap[key] = { sum: 0, count: 0, timestamp: new Date(key + 'T12:00:00').getTime() };
    }
    dailyMap[key].sum += row.end_power;
    dailyMap[key].count += 1;
  });
  const avgLineData = Object.values(dailyMap)
    .sort((a, b) => a.timestamp - b.timestamp)
    .map(d => ({ x: d.timestamp, y: parseFloat((d.sum / d.count).toFixed(2)) }));

  const avgSeries = { name: 'Daily Avg', type: 'line', data: avgLineData };

  // ── 3. Colours ────────────────────────────────────────
  const palette = ['#696cff', '#03c3ec', '#71dd37', '#ff3e1d',
    '#20c997', '#e83e8c', '#6f42c1', '#fd7e14'];
  const scatterColors = Object.keys(seriesMap).map((_, i) => palette[i % palette.length]);
  const allColors = [...scatterColors, '#ffab00'];  // avg line = orange

  const allSeries = [...scatterSeries, avgSeries];

  // ── 4. Limit annotations (null-safe) ─────────────────
  const yAnnotations = [];
  if (limitParam && limitParam.max_fail != null) {
    yAnnotations.push({
      y: limitParam.max_fail,
      borderColor: '#ff3e1d',
      strokeDashArray: 5,
      borderWidth: 2,
      label: {
        text: 'Max Limit: ' + limitParam.max_fail + ' W',
        position: 'right',
        style: { color: '#fff', background: '#ff3e1d', fontSize: '11px', padding: { left: 6, right: 6 } }
      }
    });
  }
  if (limitParam && limitParam.min_fail != null) {
    yAnnotations.push({
      y: limitParam.min_fail,
      borderColor: '#ff9f43',
      strokeDashArray: 5,
      borderWidth: 2,
      label: {
        text: 'Min Limit: ' + limitParam.min_fail + ' W',
        position: 'right',
        style: { color: '#fff', background: '#ff9f43', fontSize: '11px', padding: { left: 6, right: 6 } }
      }
    });
  }

  // ── 5. ApexCharts options ─────────────────────────────
  const options = {
    chart: {
      type: 'line',
      height: 380,
      zoom: { enabled: true, type: 'xy' },
      toolbar: { show: true },
      events: {
        dataPointSelection: function (event, chartContext, config) {
          const si = config.seriesIndex;
          const dpi = config.dataPointIndex;
          if (allSeries[si]?.type === 'line') return;
          const modelName = allSeries[si]?.name;
          const meta = _scatterMeta[modelName]?.[dpi];
          if (!meta) return;
          const currentSeries = $('#hdnSeries').val();
          $('#tblPowerSummary tbody tr').removeClass('pc-row-selected');
          $('#tblPowerSummary tbody tr').each(function () {
            if ($(this).data('serial') === meta.serial) $(this).addClass('pc-row-selected');
          });
          loadTimeProfile(meta.serial, currentSeries, meta.date);
        }
      }
    },

    series: allSeries,
    colors: allColors,
    annotations: { yaxis: yAnnotations },

    stroke: {
      width: allSeries.map(s => s.type === 'line' ? 2.5 : 0),
      curve: 'smooth',
      dashArray: allSeries.map(s => s.type === 'line' ? 4 : 0)
    },

    markers: {
      size: allSeries.map(s => s.type === 'scatter' ? 5 : 6),
      strokeWidth: 1,
      strokeOpacity: 0.8,
      fillOpacity: allSeries.map(s => {
        // scatter points — color code by limit (null-safe)
        return s.type === 'scatter' ? 0.80 : 1;
      }),
      hover: { size: 8 }
    },

    xaxis: {
      type: 'datetime',
      title: { text: 'Production Date' },
      labels: { datetimeUTC: false, format: 'dd-MM HH:mm' },
      tooltip: { enabled: false }
    },

    yaxis: {
      title: { text: 'End Power (W)' },
      decimalsInFloat: 2,
      labels: { formatter: v => v.toFixed(1) + ' W' },
      max: (limitParam && limitParam.max_fail > 0)
        ? limitParam.max_fail + 5
        : undefined
    },

    tooltip: {
      shared: false,
      custom: function ({ seriesIndex, dataPointIndex, w }) {
        const seriesName = w.globals.seriesNames[seriesIndex];
        const seriesType = allSeries[seriesIndex]?.type;
        const yVal = w.globals.series[seriesIndex][dataPointIndex];

        // Avg line tooltip
        if (seriesType === 'line') {
          const xTs = w.globals.seriesX[seriesIndex][dataPointIndex];
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

        // Scatter point tooltip
        const meta = _scatterMeta[seriesName]?.[dataPointIndex];
        if (!meta) return '';

        // Limit status (null-safe)
        let limitBadge = '';
        if (limitParam) {
          if (yVal > limitParam.max_fail) {
            limitBadge = '<span class="pc-tt-fail-badge pc-tt-fail-high">⚠ Fail High</span>';
          } else if (yVal <= limitParam.min_fail) {
            limitBadge = '<span class="pc-tt-fail-badge pc-tt-fail-low">⚠ Fail Low / Error</span>';
          } else {
            limitBadge = '<span class="pc-tt-fail-badge pc-tt-pass">✓ Pass</span>';
          }
        }

        return `
          <div class="pc-scatter-tooltip">
            <div class="pc-st-header">
              ${escHtml(meta.serial)}
              ${limitBadge}
            </div>
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
      position: 'bottom',
      horizontalAlign: 'center',
      markers: { size: 6, shape: 'circle' },
      itemMargin: { horizontal: 10, vertical: 4 }
    },

    grid: { borderColor: '#f1f1f1', strokeDashArray: 4 }
  };

  apexScatter = new ApexCharts(document.querySelector('#chartEndPowerScatter'), options);
  apexScatter.render();
}

/* ═══════════════════════════════════════════════════════════
   MODAL — Edit Pass/Fail Limit
   ═══════════════════════════════════════════════════════════ */
function openLimitModal() {
  const series = $('#hdnSeries').val();
  $('#modalLimitSeries').text('B' + series);
  $('#inputLimitSeries').val(series);
  $('#inputLimitMnufunc').val('1');   // Power Consumption fixed

  if (_limitParam) {
    $('#inputMaxFail').val(_limitParam.max_fail);
    $('#inputMinFail').val(_limitParam.min_fail);
  } else {
    $('#inputMaxFail').val('');
    $('#inputMinFail').val('');
  }

  $('#modalLimitAlert').hide();
  const modal = new bootstrap.Modal(document.getElementById('modalEditLimit'));
  modal.show();
}

async function saveLimitParam() {
  const series = $('#inputLimitSeries').val();
  const mnufunc = $('#inputLimitMnufunc').val();
  const maxFail = parseFloat($('#inputMaxFail').val());
  const minFail = parseFloat($('#inputMinFail').val());

  // Validate
  if (isNaN(maxFail) || isNaN(minFail)) {
    showModalAlert('danger', 'Please enter valid numbers for Max and Min Limit.');
    return;
  }
  if (minFail >= maxFail) {
    showModalAlert('danger', 'Min Limit must be less than Max Limit.');
    return;
  }

  $('#btnSaveLimit').prop('disabled', true).html(
    '<span class="spinner-border spinner-border-sm me-1"></span>Saving...'
  );

  try {
    const resp = await fetch('/PowerConsumption/UpdatePassFailParam', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ series, mnufunc, max_fail: maxFail, min_fail: minFail })
    });
    const result = await resp.json();

    if (result.success) {
      showModalAlert('success', 'Limit updated successfully.');
      setTimeout(() => {
        bootstrap.Modal.getInstance(document.getElementById('modalEditLimit')).hide();
        loadPowerConsumption();   // reload chart + table
      }, 800);
    } else {
      showModalAlert('danger', 'Update failed: ' + (result.message || 'Unknown error'));
    }
  } catch (e) {
    showModalAlert('danger', 'Network error: ' + e.message);
  } finally {
    $('#btnSaveLimit').prop('disabled', false).html(
      '<i class="ri-save-line me-1"></i>Save'
    );
  }
}

function showModalAlert(type, msg) {
  $('#modalLimitAlert')
    .removeClass('alert-success alert-danger')
    .addClass('alert-' + type)
    .html('<i class="ri-' + (type === 'success' ? 'checkbox-circle' : 'error-warning') + '-line me-1"></i>' + msg)
    .show();
}

/* ─── Load DataTable 2 + Burn-in time chart ─────────────── */
async function loadTimeProfile(serial, series, dateLabel) {
  const flagrange = $('#hdnFlagrange').val();

  $('#lblProfileSerial').text(serial);
  $('#lblProfileDate').text(dateLabel);
  $('#panelTimeProfile').show();
  $('html, body').animate({ scrollTop: $('#panelTimeProfile').offset().top - 80 }, 400);

  const qTime = new URLSearchParams({ serial, series, flagrange });
  const dtFrom = $('#hdnDateFrom').val();
  const dtTo   = $('#hdnDateTo').val();
  if (flagrange === 'D' && dtFrom && dtTo) {
    qTime.set('dt_from', dtFrom);
    qTime.set('dt_to', dtTo);
  }
  const data = await fetchJson(`/PowerConsumption/GetPowerConsumptionTime?${qTime}`);
  _timeData = data || [];

  if (apexProfile) { apexProfile.destroy(); apexProfile = null; }
  $('#chartBurninProfile').empty();

  apexProfile = new ApexCharts(document.querySelector('#chartBurninProfile'), {
    chart: { type: 'line', height: 280, toolbar: { show: true }, zoom: { enabled: true } },
    series: [{ name: 'Power (W)', data: _timeData.map(d => ({ x: d.timesec, y: d.powerwatt })) }],
    xaxis: { type: 'numeric', title: { text: 'Time (s)' } },
    yaxis: { title: { text: 'Power (W)' }, decimalsInFloat: 2 },
    stroke: { curve: 'smooth', width: 2 },
    markers: { size: 3 },
    tooltip: { x: { formatter: v => v + ' s' }, y: { formatter: v => v.toFixed(2) + ' W' } },
    colors: ['#696cff'],
    grid: { borderColor: '#f1f1f1' },
    dataLabels: { enabled: false }
  });
  apexProfile.render();

  if (dtTimeProfile && $.fn.DataTable.isDataTable('#tblTimeProfile')) {
    dtTimeProfile.clear().destroy();
    $('#tblTimeProfileBody').empty();
  }

  let rows = '';
  _timeData.forEach((row, idx) => {
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
    order: [[3, 'asc']],
    pageLength: 25,
    lengthMenu: [10, 25, 50],
    language: { search: 'Search:', lengthMenu: 'Show _MENU_ rows' },
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
  const series = $('#hdnSeries').val();
  const flagrange = $('#hdnFlagrange').val();
  const filename = `PowerConsumption_B${series}_${flagrange}_${dateStamp()}.xlsx`;

  const wsData = [['#', 'Serial', 'Production Date', 'Series', 'Model',
    'Start Power (W)', 'End Power (W)', 'Reduction (W)', 'Limit Status']];

  _summaryData.forEach((row, idx) => {
    let status = '';
    if (_limitParam) {
      if (row.end_power > _limitParam.max_fail) status = 'Fail High';
      else if (row.end_power <= _limitParam.min_fail) status = 'Fail Low';
      else status = 'Pass';
    }
    wsData.push([idx + 1, row.serial, row.productionDate_txt, row.series,
    row.prdname, row.start_power, row.end_power, row.power_reduct, status]);
  });

  const avg = arr => parseFloat((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2));
  wsData.push([]);
  wsData.push(['Average', '', '', '', '',
    avg(_summaryData.map(d => d.start_power)),
    avg(_summaryData.map(d => d.end_power)),
    avg(_summaryData.map(d => d.power_reduct))]);
  wsData.push(['Total machines', _summaryData.length]);
  if (_limitParam) {
    wsData.push([]);
    wsData.push(['Limit', 'Max', _limitParam.max_fail, 'Min', _limitParam.min_fail]);
  }

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws['!cols'] = [{ wch: 5 }, { wch: 18 }, { wch: 20 }, { wch: 8 },
  { wch: 14 }, { wch: 16 }, { wch: 14 }, { wch: 14 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, ws, `B${series}_Summary`);
  XLSX.writeFile(wb, filename);
}

function exportTimeProfileExcel() {
  if (!_timeData || _timeData.length === 0) return;
  const serial = $('#lblProfileSerial').text().trim();
  const flagrange = $('#hdnFlagrange').val();
  const filename = `BurninProfile_${serial.replace(/\s+/g, '_')}_${flagrange}_${dateStamp()}.xlsx`;

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
async function fetchJson(url) {
  try {
    const resp = await fetch(url);
    return await resp.json();
  } catch (e) {
    console.error('fetchJson error:', url, e);
    return null;
  }
}

function rangeLabel(flag, dtFrom, dtTo) {
  if (flag === 'D' && dtFrom && dtTo) return dtFrom + ' → ' + dtTo;
  return flag === 'W' ? 'Last 7 days' : flag === 'M' ? 'Last 30 days' : 'Last 365 days';
}

function fmtDateInput(date) {
  return date.getFullYear() + '-'
    + String(date.getMonth() + 1).padStart(2, '0') + '-'
    + String(date.getDate()).padStart(2, '0');
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
