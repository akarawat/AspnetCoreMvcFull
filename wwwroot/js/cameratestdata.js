/**
 * cameratestdata.js
 * wwwroot/js/cameratestdata.js
 *
 * #PDU-Web — Camera Test Data dashboard (dbo.mig_CameraTestData)
 * Needle Position Map (X vs Y scatter) + Focus over Time + summary + table.
 * No Pass/Fail spec yet — raw data view only.
 *
 * Endpoint: /CameraTestData/GetCameraTestData?series=&flagrange=
 */

'use strict';

let ctdTable = null;
let ctdChartPosition = null;
let ctdChartFocus = null;
let _ctdData = [];

/* ─── Init ──────────────────────────────────────────────── */
$(document).ready(function () {
  $('input[name="ctdRangeRadio"]').on('change', function () {
    $('#ctdHdnFlagrange').val(this.value);
    loadCameraTestData();
  });

  loadCameraTestData();
});

/* ─── Series toggle ─────────────────────────────────────── */
function changeCtdSeries(series) {
  $('#ctdHdnSeries').val(series);

  $('[id^="ctdBtnB"]').removeClass('btn-primary').addClass('btn-outline-primary');
  $('#ctdBtnB' + series).removeClass('btn-outline-primary').addClass('btn-primary');

  loadCameraTestData();
}

/* ─── Load & Render ─────────────────────────────────────── */
async function loadCameraTestData() {
  const series = $('#ctdHdnSeries').val();
  const flagrange = $('#ctdHdnFlagrange').val();
  const label = 'B' + series + ' — ' + ctdRangeLabel(flagrange);

  $('#ctdLblSeries').text('B' + series);
  $('#ctdBadgeSeriesMap').text(label);
  $('#ctdBadgeSeriesFocus').text(label);
  $('#ctdBadgeSeriesTable').text(label);
  $('#ctdBtnExport').prop('disabled', true);

  let data = [];
  try {
    const q = new URLSearchParams({ series, flagrange }).toString();
    const resp = await fetch(`/CameraTestData/GetCameraTestData?${q}`);
    data = await resp.json();
  } catch (e) {
    console.error('GetCameraTestData error:', e);
    return;
  }

  _ctdData = data || [];

  updateCtdSummaryCards(_ctdData);
  renderCtdPositionMap(_ctdData);
  renderCtdFocusChart(_ctdData);
  renderCtdDataTable(_ctdData);

  if (_ctdData.length > 0) $('#ctdBtnExport').prop('disabled', false);
}

function ctdRangeLabel(flag) {
  return flag === 'M' ? 'Last 30 days' : flag === 'H' ? 'Last 6 months' : 'Last 7 days';
}

/* ─── Summary Cards ─────────────────────────────────────── */
function updateCtdSummaryCards(data) {
  if (!data || data.length === 0) {
    $('#ctdStatTotal').text('0');
    $('#ctdStatAvgFocus').text('–');
    $('#ctdStatAvgX').text('–');
    $('#ctdStatAvgY').text('–');
    return;
  }

  const focus = data.map(d => d.focus).filter(v => v !== null && v !== undefined);
  const needleX = data.map(d => d.needleXPosition).filter(v => v !== null && v !== undefined);
  const needleY = data.map(d => d.needleYPosition).filter(v => v !== null && v !== undefined);

  const avg = arr => arr.length ? (arr.reduce((s, v) => s + v, 0) / arr.length) : 0;

  $('#ctdStatTotal').text(data.length.toLocaleString());
  $('#ctdStatAvgFocus').text(avg(focus).toFixed(1));
  $('#ctdStatAvgX').text(avg(needleX).toFixed(1));
  $('#ctdStatAvgY').text(avg(needleY).toFixed(1));
}

/* ─── Chart 1: Needle Position Map (2D scatter, X vs Y) ──── */
function renderCtdPositionMap(data) {
  if (ctdChartPosition) { ctdChartPosition.destroy(); ctdChartPosition = null; }
  $('#ctdChartPosition').empty();

  const points = (data || [])
    .filter(d => d.needleXPosition !== null && d.needleYPosition !== null)
    .map(d => ({ x: d.needleXPosition, y: d.needleYPosition, serial: d.serial, dt: d.productionDate_txt, rowKey: ctdRowKey(d) }));

  if (points.length === 0) {
    $('#ctdChartPosition').html('<p class="text-muted text-center py-5">No data</p>');
    return;
  }

  const avgX = points.reduce((s, p) => s + p.x, 0) / points.length;
  const avgY = points.reduce((s, p) => s + p.y, 0) / points.length;

  const options = {
    chart: {
      type: 'scatter',
      height: 380,
      zoom: { enabled: true, type: 'xy' },
      toolbar: { show: true },
      animations: { enabled: false },
      events: {
        markerClick: function (event, chartContext, { seriesIndex, dataPointIndex, w }) {
          const p = w.globals.initialSeries[seriesIndex]?.data[dataPointIndex];
          if (p && p.rowKey) highlightCtdRow(p.rowKey);
        }
      }
    },

    series: [{ name: 'Needle Position', data: points }],

    colors: ['#696cff'],
    markers: { size: 5, hover: { size: 7 } },
    grid: { borderColor: '#f1f1f1', strokeDashArray: 3 },

    annotations: {
      xaxis: [{
        x: avgX, borderColor: '#ff9f43', strokeDashArray: 4,
        label: { text: 'Avg X = ' + avgX.toFixed(1), style: { color: '#fff', background: '#ff9f43', fontSize: '10px' } }
      }],
      yaxis: [{
        y: avgY, borderColor: '#28c76f', strokeDashArray: 4,
        label: { text: 'Avg Y = ' + avgY.toFixed(1), style: { color: '#fff', background: '#28c76f', fontSize: '10px' } }
      }]
    },

    xaxis: {
      type: 'numeric',
      title: { text: 'Needle X Position' },
      tickAmount: 8
    },

    yaxis: {
      title: { text: 'Needle Y Position' },
      tickAmount: 8
    },

    tooltip: {
      custom: function ({ seriesIndex, dataPointIndex, w }) {
        const p = w.globals.initialSeries[seriesIndex].data[dataPointIndex];
        return `<div class="p-2">
                  <div><b>Serial:</b> ${escCtdHtml(p.serial)}</div>
                  <div><b>X:</b> ${p.x.toFixed(2)}</div>
                  <div><b>Y:</b> ${p.y.toFixed(2)}</div>
                  <div><b>Date:</b> ${escCtdHtml(p.dt)}</div>
                </div>`;
      }
    }
  };

  ctdChartPosition = new ApexCharts(document.querySelector('#ctdChartPosition'), options);
  ctdChartPosition.render();
}

/* ─── Chart 2: Focus over Time ──────────────────────────── */
function renderCtdFocusChart(data) {
  if (ctdChartFocus) { ctdChartFocus.destroy(); ctdChartFocus = null; }
  $('#ctdChartFocus').empty();

  const points = (data || [])
    .filter(d => d.focus !== null && d.focus !== undefined)
    .map(d => ({ x: d.productionDate_ts, y: d.focus, serial: d.serial, rowKey: ctdRowKey(d) }));

  if (points.length === 0) {
    $('#ctdChartFocus').html('<p class="text-muted text-center py-5">No data</p>');
    return;
  }

  const options = {
    chart: {
      type: 'scatter',
      height: 380,
      zoom: { enabled: true, type: 'xy' },
      toolbar: { show: true },
      animations: { enabled: false },
      events: {
        markerClick: function (event, chartContext, { seriesIndex, dataPointIndex, w }) {
          const p = w.globals.initialSeries[seriesIndex]?.data[dataPointIndex];
          if (p && p.rowKey) highlightCtdRow(p.rowKey);
        }
      }
    },

    series: [{ name: 'Focus', data: points }],

    colors: ['#03c3ec'],
    markers: { size: 4, hover: { size: 6 } },
    grid: { borderColor: '#f1f1f1', strokeDashArray: 3 },

    xaxis: {
      type: 'datetime',
      title: { text: 'Date / Time' },
      labels: { datetimeUTC: false, format: 'dd-MM HH:mm' }
    },

    yaxis: {
      title: { text: 'Focus' },
      decimalsInFloat: 1
    },

    tooltip: {
      custom: function ({ seriesIndex, dataPointIndex, w }) {
        const p = w.globals.initialSeries[seriesIndex].data[dataPointIndex];
        const dt = new Date(p.x);
        const dtTxt = dt.toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
        return `<div class="p-2">
                  <div><b>Serial:</b> ${escCtdHtml(p.serial)}</div>
                  <div><b>Focus:</b> ${p.y.toFixed(2)}</div>
                  <div><b>Date:</b> ${dtTxt}</div>
                </div>`;
      }
    }
  };

  ctdChartFocus = new ApexCharts(document.querySelector('#ctdChartFocus'), options);
  ctdChartFocus.render();
}

/* ─── DataTable ──────────────────────────────────────────── */
function renderCtdDataTable(data) {
  if ($.fn.DataTable.isDataTable('#ctdTable')) {
    ctdTable.clear().destroy();
  }

  ctdTable = $('#ctdTable').DataTable({
    data: data,
    order: [[0, 'desc']],
    pageLength: 25,
    rowCallback: function (row, rowData) {
      $(row).attr('data-row-key', ctdRowKey(rowData));
    },
    columns: [
      { data: 'productionDate_txt', title: 'Date / Time' },
      { data: 'serial', title: 'Serial' },
      { data: 'name', title: 'Model' },
      { data: 'focus', title: 'Focus', render: v => v === null ? '–' : v },
      { data: 'needleXPosition', title: 'Needle X', render: v => v === null ? '–' : v },
      { data: 'needleYPosition', title: 'Needle Y', render: v => v === null ? '–' : v }
    ]
  });
}

/* ─── Chart point → table row highlight ─────────────────── */
function ctdRowKey(d) {
  return (d.serial || '') + '|' + (d.productionDate_ts || d.productionDate || '') + '|' + (d.testDefinitionId || '');
}

function highlightCtdRow(rowKey) {
  if (!ctdTable) return;

  const rowIdx = ctdTable.rows().indexes().toArray()
    .find(i => ctdRowKey(ctdTable.row(i).data()) === rowKey);
  if (rowIdx === undefined) return;

  const pageInfo = ctdTable.page.info();
  const posInOrder = ctdTable.rows({ order: 'applied' }).indexes().toArray().indexOf(rowIdx);
  const targetPage = Math.floor(posInOrder / pageInfo.length);

  const applyHighlight = function () {
    const node = ctdTable.row(rowIdx).node();
    if (!node) return;
    $('#ctdTable tbody tr').removeClass('row-highlight-flash');
    void node.offsetWidth; // restart animation if same row clicked twice
    $(node).addClass('row-highlight-flash');
    node.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  if (targetPage !== pageInfo.page) {
    ctdTable.one('draw', applyHighlight);
    ctdTable.page(targetPage).draw(false);
  } else {
    applyHighlight();
  }
}

/* ─── Export Excel ───────────────────────────────────────── */
function exportCtdExcel() {
  if (!_ctdData || _ctdData.length === 0) return;

  const series = $('#ctdHdnSeries').val();
  const flagrange = $('#ctdHdnFlagrange').val();

  const headerRow = ['Date / Time', 'Serial', 'Model', 'Focus', 'Needle X', 'Needle Y'];
  const dataRows = _ctdData.map(d => [
    d.productionDate_txt, d.serial, d.name, d.focus, d.needleXPosition, d.needleYPosition
  ]);

  const finalSheetData = [
    [`Camera Test Data Export — B${series}`],
    [`Range: ${ctdRangeLabel(flagrange)}`],
    [''],
    headerRow,
    ...dataRows
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(finalSheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'CameraTestData');
  XLSX.writeFile(workbook, `CameraTestData_B${series}_${flagrange}.xlsx`);
}

/* ─── Helpers ───────────────────────────────────────────── */
function escCtdHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
