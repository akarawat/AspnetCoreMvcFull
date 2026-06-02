/**
 * baseplate-weight.js
 * wwwroot/js/baseplate-weight.js  v1.0.1
 *
 * Fix : ห่อด้วย IIFE ป้องกัน variable ชนกับ site.js (เช่น 'now')
 * New : Auto-reload countdown ทุก AUTO_RELOAD_MINUTES นาที
 */

/* ═══════════════════════════════════════════════════════════
   ★ CONFIG — แก้ไขค่าตรงนี้ได้เลย
   ═══════════════════════════════════════════════════════════ */
const SPEC = {
  upper : 25,    // Upper Spec Limit (USL)  → เส้นแดงประบน
  lower : -10,   // Lower Spec Limit (LSL)  → เส้นแดงประล่าง
  target:  0     // Target / Nominal        → เส้นเขียวกลาง
};

const AUTO_RELOAD_MINUTES = 5;   // รีโหลดทุกกี่นาที

/* ═══════════════════════════════════════════════════════════
   IIFE — ป้องกัน variable ชนกับ site.js หรือไฟล์อื่นๆ
   ฟังก์ชันที่ถูกเรียกจาก HTML onclick จะถูก expose ผ่าน window
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ─── State ─────────────────────────────────────────────── */
  let dtBW         = null;
  let apexDiff     = null;
  let _bwData      = [];
  let _filterOOS   = false;   // toggle: กรองเฉพาะ Out-of-Spec
  let _countdownId = null;
  let _reloadId    = null;

  /* ─── Init ──────────────────────────────────────────────── */
  $(document).ready(function () {
    // Spec labels in header
    $('#lblSpecUpper').text('USL = ' + SPEC.upper);
    $('#lblSpecLower').text('LSL = ' + SPEC.lower);

    // Inject countdown badge
    $('#btnReload').after(
      `<span id="bwCountdownBadge" class="badge bg-label-secondary ms-2 bw-countdown-badge">
         <i class="ri-time-line me-1"></i><span id="bwCountdownTxt">--:--</span>
       </span>`
    );

    // ── Register DataTables custom search filter ──────────
    // ลงทะเบียนครั้งเดียว — ใช้ _filterOOS flag เพื่อ toggle
    $.fn.dataTable.ext.search.push(function (settings, rowData) {
      if (settings.nTable.id !== 'tblBaseplateWeight') return true;
      if (!_filterOOS) return true;   // ไม่ filter → แสดงทั้งหมด
      const diff = parseFloat(rowData[7]);   // column index 7 = DiffMP1to4
      return diff > SPEC.upper || diff < SPEC.lower;
    });

    // ── Out-of-Spec icon click → toggle filter ────────────
    $('#btnFilterOOS').on('click', function () {
      toggleOOSFilter();
    });

    // Radio range
    $('input[name="rangeRadio"]').on('change', function () {
      $('#hdnFlagrange').val(this.value);
      resetAutoReload();
      loadBaseplateWeight();
    });

    loadBaseplateWeight();
    startAutoReload();
  });

  /* ─── Auto-reload: start / reset ───────────────────────── */
  function startAutoReload() {
    stopAutoReload();

    const totalSec = AUTO_RELOAD_MINUTES * 60;
    let remaining  = totalSec;

    // Update countdown display ทุก 1 วินาที
    _countdownId = setInterval(function () {
      remaining--;
      if (remaining < 0) remaining = 0;
      const m = String(Math.floor(remaining / 60)).padStart(2, '0');
      const s = String(remaining % 60).padStart(2, '0');
      $('#bwCountdownTxt').text(m + ':' + s);

      // เปลี่ยนสี badge ช่วงสุดท้าย 30 วินาที
      if (remaining <= 30) {
        $('#bwCountdownBadge').removeClass('bg-label-secondary').addClass('bg-label-warning');
      }
    }, 1000);

    // Auto-reload เมื่อครบเวลา
    _reloadId = setTimeout(function () {
      loadBaseplateWeight();     // โหลดข้อมูลใหม่
      startAutoReload();         // reset countdown ใหม่
    }, totalSec * 1000);
  }

  function stopAutoReload() {
    if (_countdownId) { clearInterval(_countdownId); _countdownId = null; }
    if (_reloadId)    { clearTimeout(_reloadId);     _reloadId    = null; }
    $('#bwCountdownBadge').removeClass('bg-label-warning').addClass('bg-label-secondary');
  }

  function resetAutoReload() {
    stopAutoReload();
    startAutoReload();
  }

  /* ─── OOS Filter toggle ─────────────────────────────────── */
  function toggleOOSFilter() {
    // ถ้าไม่มีข้อมูล OOS → ไม่ทำอะไร
    const oosCount = _bwData.filter(function (d) {
      const v = parseFloat(d.diffMP1to4);
      return v > SPEC.upper || v < SPEC.lower;
    }).length;
    if (oosCount === 0) return;

    _filterOOS = !_filterOOS;

    if (_filterOOS) {
      // Active state — icon เปลี่ยนเป็น danger
      $('#iconFilterOOS').removeClass('bg-label-warning').addClass('bg-label-danger');
      $('#cardOutSpec').addClass('bw-card-oos-active');
      $('#lblOosFilterActive').show();
      $('#lblOutSpecHint').html(
        `<span class="text-danger fw-semibold">
           <i class="ri-filter-line me-1"></i>Showing ${oosCount} out-of-spec record(s) only
           &nbsp;—&nbsp;
           <a href="javascript:void(0)" onclick="window.toggleOOSFilter()" class="text-muted">
             Clear filter
           </a>
         </span>`
      );
    } else {
      // Reset state
      $('#iconFilterOOS').removeClass('bg-label-danger').addClass('bg-label-warning');
      $('#cardOutSpec').removeClass('bw-card-oos-active');
      $('#lblOosFilterActive').hide();
    }

    // Redraw DataTable ด้วย filter ที่ลงทะเบียนไว้
    if (dtBW) {
      dtBW.draw();
      // Scroll ไปที่ตาราง
      $('html, body').animate({
        scrollTop: $('#tblBaseplateWeight').closest('.card').offset().top - 80
      }, 400);
    }
  }

  /* ─── Series toggle ─────────────────────────────────────── */
  function changeSeries(series) {
    $('#hdnSeries').val(series);
    $('[id^="btnB"]').removeClass('btn-primary').addClass('btn-outline-primary');
    $('#btnB' + series).removeClass('btn-outline-primary').addClass('btn-primary');
    resetAutoReload();
    loadBaseplateWeight();
  }

  /* ─── Load data → Chart + Table ─────────────────────────── */
  async function loadBaseplateWeight() {
    const series    = $('#hdnSeries').val();
    const flagrange = $('#hdnFlagrange').val();
    const label     = 'B' + series + ' — ' + bwRangeLabel(flagrange);

    $('#lblSeries').text('B' + series);
    $('#badgeSeries').text(label);
    $('#badgeSeriesTable').text(label);
    $('#btnExport').prop('disabled', true);

    let data = [];
    try {
      const q    = new URLSearchParams({ series, flagrange }).toString();
      const resp = await fetch(`/BaseplateWeight/GetBaseplateWeight?${q}`);
      data = await resp.json();
    } catch (e) {
      console.error('GetBaseplateWeight error:', e);
      return;
    }

    _bwData = data;
    _filterOOS = false;   // reset filter เมื่อโหลดข้อมูลใหม่
    $('#iconFilterOOS').removeClass('bg-label-danger').addClass('bg-label-warning');
    $('#cardOutSpec').removeClass('bw-card-oos-active');
    $('#lblOosFilterActive').hide();
    updateSummaryCards(data);
    renderLineChart(data);
    renderDataTable(data);

    if (data.length > 0) $('#btnExport').prop('disabled', false);
  }

  /* ═══════════════════════════════════════════════════════════
     LINE CHART — DiffMP1to4 with Spec Limit annotations
     ═══════════════════════════════════════════════════════════ */
  function renderLineChart(data) {
    if (apexDiff) { apexDiff.destroy(); apexDiff = null; }
    $('#chartDiffLine').empty();
    if (!data || data.length === 0) return;

    const chartData = data.map(function (d) {
      return { x: d.logDateTime_ts, y: parseFloat(d.diffMP1to4) };
    });

    // Out-of-spec discrete marker overrides
    const outOfSpecPoints = data.reduce(function (acc, d, i) {
      const v = parseFloat(d.diffMP1to4);
      if (v > SPEC.upper || v < SPEC.lower) {
        acc.push({ seriesIndex: 0, dataPointIndex: i,
                   fillColor: '#ff3e1d', strokeColor: '#ff3e1d', size: 7 });
      }
      return acc;
    }, []);

    const options = {
      chart: {
        type      : 'line',
        height    : 380,
        zoom      : { enabled: true, type: 'x' },
        toolbar   : { show: true },
        animations: { enabled: false }
      },

      series: [{ name: 'DiffMP1to4', data: chartData }],

      annotations: {
        yaxis: [
          {
            y: SPEC.upper, borderColor: '#ff3e1d',
            strokeDashArray: 5, borderWidth: 2,
            label: { text: 'USL = ' + SPEC.upper, position: 'right',
                     style: { color: '#fff', background: '#ff3e1d', fontSize: '11px' } }
          },
          {
            y: SPEC.lower, borderColor: '#ff3e1d',
            strokeDashArray: 5, borderWidth: 2,
            label: { text: 'LSL = ' + SPEC.lower, position: 'right',
                     style: { color: '#fff', background: '#ff3e1d', fontSize: '11px' } }
          },
          {
            y: SPEC.target, borderColor: '#28c76f',
            strokeDashArray: 3, borderWidth: 1.5,
            label: { text: 'Target = ' + SPEC.target, position: 'right',
                     style: { color: '#fff', background: '#28c76f', fontSize: '11px' } }
          }
        ]
      },

      markers: {
        size: 3, strokeWidth: 1,
        hover: { size: 6 },
        discrete: outOfSpecPoints
      },

      stroke    : { curve: 'straight', width: 1.8 },
      colors    : ['#696cff'],
      grid      : { borderColor: '#f1f1f1', strokeDashArray: 3 },
      dataLabels: { enabled: false },

      xaxis: {
        type  : 'datetime',
        title : { text: 'Date / Time' },
        labels: { datetimeUTC: false, format: 'dd-MM HH:mm' },
        tooltip: { enabled: false }
      },

      yaxis: {
        title          : { text: 'DiffMP1to4' },
        decimalsInFloat: 2,
        labels         : { formatter: function (v) { return v.toFixed(1); } }
      },

      tooltip: {
        x: { format: 'dd-MM-yyyy HH:mm' },
        custom: function (opts) {
          const d = _bwData[opts.dataPointIndex];
          if (!d) return '';
          const val     = parseFloat(d.diffMP1to4);
          const outSpec = val > SPEC.upper || val < SPEC.lower;
          const clr     = outSpec ? '#ff3e1d' : '#28c76f';
          return `
            <div class="bw-tooltip">
              <div class="bw-tt-header">
                <i class="ri-time-line me-1"></i>${escHtml(d.logDateTime_txt)}
                ${outSpec ? '<span class="bw-tt-oos">⚠ Out of Spec</span>' : ''}
              </div>
              <div class="bw-tt-row">
                <span class="bw-tt-label">SeriesNo</span>
                <span class="bw-tt-value">${escHtml(d.seriesNo)}</span>
              </div>
              <div class="bw-tt-row">
                <span class="bw-tt-label">MP1</span>
                <span class="bw-tt-value">${parseFloat(d.mp1).toFixed(1)}</span>
              </div>
              <div class="bw-tt-row">
                <span class="bw-tt-label">MP4</span>
                <span class="bw-tt-value">${parseFloat(d.mp4).toFixed(1)}</span>
              </div>
              <div class="bw-tt-row">
                <span class="bw-tt-label">DiffMP1to4</span>
                <span class="bw-tt-value fw-bold" style="color:${clr};">
                  ${val.toFixed(2)}
                </span>
              </div>
            </div>`;
        }
      }
    };

    apexDiff = new ApexCharts(document.querySelector('#chartDiffLine'), options);
    apexDiff.render();
  }

  /* ─── DataTable ─────────────────────────────────────────── */
  function renderDataTable(data) {
    if (dtBW && $.fn.DataTable.isDataTable('#tblBaseplateWeight')) {
      dtBW.clear().destroy();
      $('#tblBaseplateWeightBody').empty();
    }

    let rows = '';
    let oos  = 0;
    data.forEach(function (row, idx) {
      const val     = parseFloat(row.diffMP1to4);
      const outSpec = val > SPEC.upper || val < SPEC.lower;
      if (outSpec) oos++;
      rows += `
        <tr class="${outSpec ? 'bw-row-oos' : ''}">
          <td>${idx + 1}</td>
          <td>${escHtml(row.logDate_txt)}</td>
          <td>${escHtml(row.logTime_txt)}</td>
          <td class="fw-medium">${escHtml(row.seriesNo)}</td>
          <td>${escHtml(row.userCode)}</td>
          <td>${parseFloat(row.mp1).toFixed(1)}</td>
          <td>${parseFloat(row.mp4).toFixed(1)}</td>
          <td class="${outSpec ? 'bw-oos fw-semibold' : ''}">${val.toFixed(2)}</td>
          <td class="text-muted">${parseFloat(row.calMP1).toFixed(0)}</td>
          <td class="text-muted">${parseFloat(row.calMP4).toFixed(0)}</td>
        </tr>`;
    });
    $('#tblBaseplateWeightBody').html(rows);

    $('#lblOutSpecHint').html(
      oos > 0
        ? `<span class="text-danger fw-semibold">
             <i class="ri-alert-line me-1"></i>${oos} record(s) out of spec highlighted in red
           </span>`
        : `<span class="text-success">
             <i class="ri-checkbox-circle-line me-1"></i>All records within spec
           </span>`
    );

    dtBW = $('#tblBaseplateWeight').DataTable({
      order     : [[1, 'desc'], [2, 'desc']],
      pageLength: 25,
      lengthMenu: [10, 25, 50, 100],
      language  : { search: 'Search:', lengthMenu: 'Show _MENU_ rows' },
      columnDefs: [{ orderable: false, targets: 0 }]
    });
  }

  /* ─── Summary Cards ─────────────────────────────────────── */
  function updateSummaryCards(data) {
    if (!data || data.length === 0) {
      ['#statAvgDiff', '#statMaxDiff', '#statMinDiff'].forEach(function (id) { $(id).text('–'); });
      $('#statOutSpec').text('0 / 0');
      return;
    }
    const vals = data.map(function (d) { return parseFloat(d.diffMP1to4); });
    const avg  = vals.reduce(function (a, b) { return a + b; }, 0) / vals.length;
    const max  = Math.max.apply(null, vals);
    const min  = Math.min.apply(null, vals);
    const oos  = vals.filter(function (v) { return v > SPEC.upper || v < SPEC.lower; }).length;

    $('#statAvgDiff').text(avg.toFixed(2));
    $('#statMaxDiff').text(max.toFixed(2));
    $('#statMinDiff').text(min.toFixed(2));
    $('#statOutSpec').text(oos + ' / ' + data.length);
    $('#statOutSpec').closest('.card').toggleClass('border-danger', oos > 0);
  }

  /* ─── Export Excel ──────────────────────────────────────── */
  function exportExcel() {
    if (!_bwData || _bwData.length === 0) return;

    const series    = $('#hdnSeries').val();
    const flagrange = $('#hdnFlagrange').val();
    const filename  = `BaseplateWeight_B${series}_${flagrange}_${bwDateStamp()}.xlsx`;

    const wsData = [[
      '#', 'Date', 'Time', 'SeriesNo', 'UserCode',
      'MP1', 'MP4', 'DiffMP1to4', 'CalMP1', 'CalMP4', 'Out of Spec'
    ]];
    _bwData.forEach(function (row, idx) {
      const val     = parseFloat(row.diffMP1to4);
      const outSpec = val > SPEC.upper || val < SPEC.lower;
      wsData.push([
        idx + 1, row.logDate_txt, row.logTime_txt, row.seriesNo, row.userCode,
        parseFloat(row.mp1), parseFloat(row.mp4), val,
        parseFloat(row.calMP1), parseFloat(row.calMP4),
        outSpec ? 'YES' : ''
      ]);
    });
    wsData.push([]);
    wsData.push(['Spec', 'USL', SPEC.upper, 'LSL', SPEC.lower, 'Target', SPEC.target]);

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws['!cols'] = [
      { wch: 5 }, { wch: 12 }, { wch: 10 }, { wch: 16 }, { wch: 10 },
      { wch: 10 }, { wch: 10 }, { wch: 14 }, { wch: 10 }, { wch: 10 }, { wch: 12 }
    ];
    XLSX.utils.book_append_sheet(wb, ws, `B${series}_BpWeight`);
    XLSX.writeFile(wb, filename);
  }

  /* ─── Helpers ───────────────────────────────────────────── */
  function bwRangeLabel(flag) {
    return flag === 'W' ? 'Last 7 days'
         : flag === 'M' ? 'Last 30 days'
         :                'Last 6 months';
  }

  function bwDateStamp() {
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

  /* ─── Expose functions ที่ HTML onclick ต้องเรียก ────────── */
  window.changeSeries        = changeSeries;
  window.loadBaseplateWeight = loadBaseplateWeight;
  window.exportExcel         = exportExcel;
  window.toggleOOSFilter     = toggleOOSFilter;

})(); // end IIFE
