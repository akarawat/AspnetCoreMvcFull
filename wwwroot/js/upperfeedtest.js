/**
 * upperfeedtest.js
 * wwwroot/js/upperfeedtest.js
 *
 * #PDU-Web — Upper Feed Test dashboard (dbo.mig_UpperFeedTest)
 * Balance / Balance Upper Feed scatter plot over time + summary + table.
 * No Pass/Fail spec yet — raw data view only.
 *
 * Endpoint: /UpperFeedTest/GetUpperFeedTest?series=&flagrange=
 */

'use strict';

let uftTable = null;
let uftChart = null;
let _uftData = [];

/* ─── Init ──────────────────────────────────────────────── */
$(document).ready(function () {
  $('input[name="uftRangeRadio"]').on('change', function () {
    $('#uftHdnFlagrange').val(this.value);
    loadUpperFeedTest();
  });

  loadUpperFeedTest();
});

/* ─── Series toggle ─────────────────────────────────────── */
function changeUftSeries(series) {
  $('#uftHdnSeries').val(series);

  $('[id^="uftBtnB"]').removeClass('btn-primary').addClass('btn-outline-primary');
  $('#uftBtnB' + series).removeClass('btn-outline-primary').addClass('btn-primary');

  loadUpperFeedTest();
}

/* ─── Load & Render ─────────────────────────────────────── */
async function loadUpperFeedTest() {
  const series = $('#uftHdnSeries').val();
  const flagrange = $('#uftHdnFlagrange').val();
  const label = 'B' + series + ' — ' + uftRangeLabel(flagrange);

  $('#uftLblSeries').text('B' + series);
  $('#uftBadgeSeries').text(label);
  $('#uftBadgeSeriesTable').text(label);
  $('#uftBtnExport').prop('disabled', true);

  let data = [];
  try {
    const q = new URLSearchParams({ series, flagrange }).toString();
    const resp = await fetch(`/UpperFeedTest/GetUpperFeedTest?${q}`);
    data = await resp.json();
  } catch (e) {
    console.error('GetUpperFeedTest error:', e);
    return;
  }

  _uftData = data || [];

  updateUftSummaryCards(_uftData);
  renderUftScatterChart(_uftData);
  renderUftDataTable(_uftData);

  if (_uftData.length > 0) $('#uftBtnExport').prop('disabled', false);
}

function uftRangeLabel(flag) {
  return flag === 'M' ? 'Last 30 days' : flag === 'H' ? 'Last 6 months' : 'Last 7 days';
}

/* ─── Summary Cards ─────────────────────────────────────── */
function updateUftSummaryCards(data) {
  if (!data || data.length === 0) {
    $('#uftStatTotal').text('0');
    $('#uftStatAvgBalance').text('–');
    $('#uftStatAvgUpperFeed').text('–');
    $('#uftStatRange').text('–');
    return;
  }

  const balances = data.map(d => d.balance).filter(v => v !== null && v !== undefined);
  const upperFeeds = data.map(d => d.balanceUpperFeed).filter(v => v !== null && v !== undefined);

  const avg = arr => arr.length ? (arr.reduce((s, v) => s + v, 0) / arr.length) : 0;

  $('#uftStatTotal').text(data.length.toLocaleString());
  $('#uftStatAvgBalance').text(avg(balances).toFixed(2));
  $('#uftStatAvgUpperFeed').text(avg(upperFeeds).toFixed(2));

  if (upperFeeds.length) {
    const min = Math.min.apply(null, upperFeeds);
    const max = Math.max.apply(null, upperFeeds);
    $('#uftStatRange').text(min.toFixed(1) + ' … ' + max.toFixed(1));
  } else {
    $('#uftStatRange').text('–');
  }
}

/* ─── Scatter Chart : Balance / Balance Upper Feed over time ── */
function renderUftScatterChart(data) {
  if (uftChart) { uftChart.destroy(); uftChart = null; }
  $('#uftChartScatter').empty();
  if (!data || data.length === 0) {
    $('#uftChartScatter').html('<p class="text-muted text-center py-5">No data</p>');
    return;
  }

  const balanceSeries = data
    .filter(d => d.balance !== null && d.balance !== undefined)
    .map(d => ({ x: d.productionDate_ts, y: d.balance }));

  const upperFeedSeries = data
    .filter(d => d.balanceUpperFeed !== null && d.balanceUpperFeed !== undefined)
    .map(d => ({ x: d.productionDate_ts, y: d.balanceUpperFeed }));

  const options = {
    chart: {
      type: 'scatter',
      height: 380,
      zoom: { enabled: true, type: 'xy' },
      toolbar: { show: true },
      animations: { enabled: false }
    },

    series: [
      { name: 'Balance', data: balanceSeries },
      { name: 'Balance Upper Feed', data: upperFeedSeries }
    ],

    colors: ['#696cff', '#ff9f43'],
    markers: { size: 4, hover: { size: 6 } },
    grid: { borderColor: '#f1f1f1', strokeDashArray: 3 },

    xaxis: {
      type: 'datetime',
      title: { text: 'Date / Time' },
      labels: { datetimeUTC: false, format: 'dd-MM HH:mm' }
    },

    yaxis: {
      title: { text: 'Value' },
      decimalsInFloat: 1
    },

    tooltip: {
      x: { format: 'dd-MM-yyyy HH:mm' }
    },

    legend: { show: true, position: 'top' }
  };

  uftChart = new ApexCharts(document.querySelector('#uftChartScatter'), options);
  uftChart.render();
}

/* ─── DataTable ──────────────────────────────────────────── */
function renderUftDataTable(data) {
  if ($.fn.DataTable.isDataTable('#uftTable')) {
    uftTable.clear().destroy();
  }

  uftTable = $('#uftTable').DataTable({
    data: data,
    order: [[0, 'desc']],
    pageLength: 25,
    columns: [
      { data: 'productionDate_txt', title: 'Date / Time' },
      { data: 'serial', title: 'Serial' },
      { data: 'name', title: 'Model' },
      { data: 'balance', title: 'Balance', render: v => v === null ? '–' : v },
      { data: 'balanceUpperFeed', title: 'Balance Upper Feed', render: v => v === null ? '–' : v }
    ]
  });
}

/* ─── Export Excel ───────────────────────────────────────── */
function exportUftExcel() {
  if (!_uftData || _uftData.length === 0) return;

  const series = $('#uftHdnSeries').val();
  const flagrange = $('#uftHdnFlagrange').val();

  const headerRow = ['Date / Time', 'Serial', 'Model', 'Balance', 'Balance Upper Feed'];
  const dataRows = _uftData.map(d => [
    d.productionDate_txt, d.serial, d.name, d.balance, d.balanceUpperFeed
  ]);

  const finalSheetData = [
    [`Upper Feed Test Export — B${series}`],
    [`Range: ${uftRangeLabel(flagrange)}`],
    [''],
    headerRow,
    ...dataRows
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(finalSheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'UpperFeedTest');
  XLSX.writeFile(workbook, `UpperFeedTest_B${series}_${flagrange}.xlsx`);
}
