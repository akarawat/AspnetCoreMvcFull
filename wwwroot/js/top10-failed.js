/**
 * top10-failed.js
 * wwwroot/js/top10-failed.js
 *
 * Heatmap: Top 10 Test Failure Ratio
 *   X-axis : Date (dd-MM)
 *   Y-axis : Test name (Top 10)
 *   Color  : Ratio % (white → orange → red)
 *
 * Dependencies: ApexCharts, jQuery
 * Endpoint    : /KPIs/GetTop10Failed?series=&flagrange=
 */

'use strict';

/* ─── State ─────────────────────────────────────────────── */
let apexTop10Heatmap = null;

/* ─── Init ──────────────────────────────────────────────── */
$(document).ready(function () {
  // ถ้าหน้านี้มี radio rangeRadio ให้ sync flagrange ด้วย
  $('input[name="rangeRadio"]').on('change', function () {
    $('#hdnTop10Flagrange').val(this.value);
    loadTop10Heatmap();
  });

  loadTop10Heatmap();
});

/* ─── Series toggle ─────────────────────────────────────── */
function changeTop10Series(series) {
  $('#hdnTop10Series').val(series);

  // Reset all → activate selected
  $('[id^="t10Btn"]').removeClass('btn-primary').addClass('btn-outline-primary');
  $('#t10BtnB' + series).removeClass('btn-outline-primary').addClass('btn-primary');

  loadTop10Heatmap();
}

/* ─── Load & Render Heatmap ─────────────────────────────── */
async function loadTop10Heatmap() {
  const series    = $('#hdnTop10Series').val();
  const flagrange = $('#hdnTop10Flagrange').val();

  $('#badgeTop10Series').text('B' + series + ' — ' + top10RangeLabel(flagrange));

  // Show spinner
  if (apexTop10Heatmap) { apexTop10Heatmap.destroy(); apexTop10Heatmap = null; }
  $('#chartTop10Heatmap').html(`
    <div class="d-flex align-items-center justify-content-center" style="height:320px;">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>`);

  let data = [];
  try {
    const q    = new URLSearchParams({ series, flagrange }).toString();
    const resp = await fetch(`/KPIs/GetTop10Failed?${q}`);
    data = await resp.json();
  } catch (e) {
    console.error('GetTop10Failed error:', e);
    $('#chartTop10Heatmap').html(
      '<p class="text-danger text-center mt-5"><i class="ri-error-warning-line me-1"></i>Load failed</p>'
    );
    return;
  }

  if (!data || data.length === 0) {
    $('#chartTop10Heatmap').html(
      '<p class="text-muted text-center mt-5"><i class="ri-inbox-line me-1"></i>No data</p>'
    );
    return;
  }

  renderTop10Heatmap(data);
}

/* ─── Build ApexCharts Heatmap ──────────────────────────── */
function renderTop10Heatmap(data) {

  // ── 1. Unique dates (X-axis), sorted asc ─────────────
  const dates = [...new Set(data.map(d => d.monitor_dt_txt))].sort((a, b) => {
    // parse "dd-MM" → comparable (assume same year)
    const [da, ma] = a.split('-').map(Number);
    const [db, mb] = b.split('-').map(Number);
    return ma !== mb ? ma - mb : da - db;
  });

  // ── 2. Pick Top 10 tests by total ratio across all dates ─
  const testTotals = {};
  const testMeta   = {};   // { testName: { date: { fails, ratio_txt } } }

  data.forEach(d => {
    if (!testTotals[d.test]) { testTotals[d.test] = 0; testMeta[d.test] = {}; }
    testTotals[d.test]              += d.ratio_val;
    testMeta[d.test][d.monitor_dt_txt] = { fails: d.fails, ratio_txt: d.ratio_txt };
  });

  // Sort desc, take top 10, then reverse so highest is on top in heatmap
  const top10Tests = Object.keys(testTotals)
    .sort((a, b) => testTotals[b] - testTotals[a])
    .slice(0, 10)
    .reverse();   // ApexCharts renders bottom-up → reverse to put #1 on top

  // ── 3. Build series for ApexCharts heatmap ────────────
  //    Each series = one test row; data = array of { x: date, y: ratio_val }
  const series = top10Tests.map(testName => ({
    name: testName,
    data: dates.map(date => ({
      x: date,
      y: testMeta[testName]?.[date]?.fails !== undefined
         ? parseFloat((testMeta[testName][date]?.fails > 0
             ? data.find(d => d.test === testName && d.monitor_dt_txt === date)?.ratio_val ?? 0
             : 0).toFixed(2))
         : 0
    }))
  }));

  // Recalculate cleanly
  const seriesClean = top10Tests.map(testName => ({
    name: testName,
    data: dates.map(date => {
      const found = data.find(d => d.test === testName && d.monitor_dt_txt === date);
      return { x: date, y: found ? parseFloat(found.ratio_val.toFixed(2)) : 0 };
    })
  }));

  // ── 4. Color scale ────────────────────────────────────
  const colorRanges = [
    { from: 0,    to: 0,    color: '#f0f2f5', name: 'None'   },
    { from: 0.01, to: 3,    color: '#fff3cd', name: '< 3%'   },
    { from: 3.01, to: 7,    color: '#ffd580', name: '3–7%'   },
    { from: 7.01, to: 12,   color: '#ff9f43', name: '7–12%'  },
    { from: 12.01,to: 20,   color: '#ff6b6b', name: '12–20%' },
    { from: 20.01,to: 100,  color: '#c0392b', name: '> 20%'  }
  ];

  // ── 5. ApexCharts options ─────────────────────────────
  $('#chartTop10Heatmap').empty();

  const options = {
    chart: {
      type  : 'heatmap',
      height: 340,
      toolbar: { show: false },
      animations: { enabled: true, speed: 400 }
    },

    series: seriesClean,

    plotOptions: {
      heatmap: {
        radius     : 4,
        enableShades: false,
        colorScale : { ranges: colorRanges }
      }
    },

    dataLabels: {
      enabled  : true,
      formatter: (val) => val > 0 ? val.toFixed(1) + '%' : '',
      style    : { fontSize: '10px', fontWeight: '600', colors: ['#333'] }
    },

    xaxis: {
      type  : 'category',
      labels: { style: { fontSize: '11px' } },
      tooltip: { enabled: false }
    },

    yaxis: {
      labels: {
        style    : { fontSize: '11px' },
        maxWidth : 160
      }
    },

    // ── Custom tooltip ────────────────────────────────────
    tooltip: {
      custom: function ({ seriesIndex, dataPointIndex, w }) {
        const testName = w.globals.seriesNames[seriesIndex];
        const date     = w.globals.labels[dataPointIndex];
        const ratioVal = w.globals.series[seriesIndex][dataPointIndex];
        const meta     = testMeta[testName]?.[date];
        const fails    = meta?.fails ?? 0;
        const ratioTxt = meta?.ratio_txt ?? (ratioVal.toFixed(1) + ' %');

        const cellColor = ratioVal === 0 ? '#adb5bd'
          : ratioVal <= 3  ? '#e6a817'
          : ratioVal <= 7  ? '#ff9f43'
          : ratioVal <= 12 ? '#ff6b6b'
          : '#c0392b';

        return `
          <div class="pc-scatter-tooltip">
            <div class="pc-st-header" style="color:${cellColor};">
              <i class="ri-test-tube-line me-1"></i>${escTop10Html(testName)}
            </div>
            <div class="pc-st-row">
              <span class="pc-st-label">Date</span>
              <span class="pc-st-value">${escTop10Html(date)}</span>
            </div>
            <div class="pc-st-row">
              <span class="pc-st-label">Fails</span>
              <span class="pc-st-value">${fails} times</span>
            </div>
            <div class="pc-st-row">
              <span class="pc-st-label">Ratio</span>
              <span class="pc-st-value fw-bold" style="color:${cellColor};">${ratioTxt}</span>
            </div>
          </div>`;
      }
    },

    legend: {
      show           : true,
      position       : 'bottom',
      horizontalAlign: 'center',
      fontSize       : '11px',
      itemMargin     : { horizontal: 8, vertical: 4 }
    },

    grid: { padding: { right: 8 } }
  };

  apexTop10Heatmap = new ApexCharts(
    document.querySelector('#chartTop10Heatmap'), options
  );
  apexTop10Heatmap.render();
}

/* ─── Helpers ───────────────────────────────────────────── */
function top10RangeLabel(flag) {
  return flag === 'W' ? 'Last 7 days' : flag === 'M' ? 'Last 30 days' : 'Last 365 days';
}

function escTop10Html(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
