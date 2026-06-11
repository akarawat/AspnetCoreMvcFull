/**
 * baseplate-weight.js
 * wwwroot/js/baseplate-weight.js  v1.1.0
 *
 * New in v1.1.0:
 *   - โหลด Pass/Fail Limit (USL=max_fail, LSL=min_fail) จาก SP_GetPassFailParam (mnufunc='10')
 *   - SPEC เปลี่ยนจาก const คงที่ → โหลดจาก DB ต่อ series (null-safe, มี fallback)
 *   - Modal popup แก้ไข Limit → POST SP_UpdatePassFailParam
 *   - Y-axis ปรับ min/max อัตโนมัติให้เห็นเส้น Limit ชัดเจน โดยไม่ clip ข้อมูลจริง
 *
 * Fix : ห่อด้วย IIFE ป้องกัน variable ชนกับ site.js (เช่น 'now')
 * New : Auto-reload countdown ทุก AUTO_RELOAD_MINUTES นาที
 */

/* ═══════════════════════════════════════════════════════════
   ★ CONFIG
   ═══════════════════════════════════════════════════════════ */
// Fallback ใช้เมื่อ series ยังไม่มี config ใน passfail_param (mnufunc='10')
const DEFAULT_SPEC = {
  upper: 25,   // USL (max_fail) fallback
  lower: 10,   // LSL (min_fail) fallback
  target: 0    // Target คงที่เสมอ (ไม่ผ่าน Modal)
};

const AUTO_RELOAD_MINUTES = 5;   // รีโหลดทุกกี่นาที

/* ═══════════════════════════════════════════════════════════
   IIFE — ป้องกัน variable ชนกับ site.js หรือไฟล์อื่นๆ
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ─── State ─────────────────────────────────────────────── */
  let dtBW = null;
  let apexDiff = null;
  let _bwData = [];
  let _filterOOS = false;
  let _countdownId = null;
  let _reloadId = null;
  let _limitParam = null;   // PassFailParamModel | null (จาก DB)

  // SPEC ที่ใช้งานจริง — อัปเดตทุกครั้งหลังโหลดข้อมูล
  let SPEC = {
    upper: DEFAULT_SPEC.upper,
    lower: DEFAULT_SPEC.lower,
    target: DEFAULT_SPEC.target
  };

  /* ─── Init ──────────────────────────────────────────────── */
  $(document).ready(function () {
    // Inject countdown badge
    $('#btnReload').after(
      `<span id="bwCountdownBadge" class="badge bg-label-secondary ms-2 bw-countdown-badge">
         <i class="ri-time-line me-1"></i><span id="bwCountdownTxt">--:--</span>
       </span>`
    );

    // ── Register DataTables custom search filter ──────────
    $.fn.dataTable.ext.search.push(function (settings, rowData) {
      if (settings.nTable.id !== 'tblBaseplateWeight') return true;
      if (!_filterOOS) return true;
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
    let remaining = totalSec;

    _countdownId = setInterval(function () {
      remaining--;
      if (remaining < 0) remaining = 0;
      const m = String(Math.floor(remaining / 60)).padStart(2, '0');
      const s = String(remaining % 60).padStart(2, '0');
      $('#bwCountdownTxt').text(m + ':' + s);

      if (remaining <= 30) {
        $('#bwCountdownBadge').removeClass('bg-label-secondary').addClass('bg-label-warning');
      }
    }, 1000);

    _reloadId = setTimeout(function () {
      loadBaseplateWeight();
      startAutoReload();
    }, totalSec * 1000);
  }

  function stopAutoReload() {
    if (_countdownId) { clearInterval(_countdownId); _countdownId = null; }
    if (_reloadId) { clearTimeout(_reloadId); _reloadId = null; }
    $('#bwCountdownBadge').removeClass('bg-label-warning').addClass('bg-label-secondary');
  }

  function resetAutoReload() {
    stopAutoReload();
    startAutoReload();
  }

  /* ─── OOS Filter toggle ─────────────────────────────────── */
  function toggleOOSFilter() {
    const oosCount = _bwData.filter(function (d) {
      const v = parseFloat(d.diffMP1to4);
      return v > SPEC.upper || v < SPEC.lower;
    }).length;
    if (oosCount === 0) return;

    _filterOOS = !_filterOOS;

    if (_filterOOS) {
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
      $('#iconFilterOOS').removeClass('bg-label-danger').addClass('bg-label-warning');
      $('#cardOutSpec').removeClass('bw-card-oos-active');
      $('#lblOosFilterActive').hide();
    }

    if (dtBW) {
      dtBW.draw();
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
    const series = $('#hdnSeries').val();
    const flagrange = $('#hdnFlagrange').val();
    const label = 'B' + series + ' — ' + bwRangeLabel(flagrange);

    $('#lblSeries').text('B' + series);
    $('#badgeSeries').text(label);
    $('#badgeSeriesTable').text(label);
    $('#btnExport').prop('disabled', true);

    // โหลดข้อมูล + Limit param พร้อมกัน (parallel)
    const [data, limitParam] = await Promise.all([
      fetchJson(`/BaseplateWeight/GetBaseplateWeight?${new URLSearchParams({ series, flagrange })}`),
      fetchJson(`/BaseplateWeight/GetPassFailParam?${new URLSearchParams({ series })}`)
    ]);

    _bwData = data || [];
    _limitParam = limitParam;   // null ถ้า series นี้ยังไม่มี config

    // ── อัปเดต SPEC ที่ใช้งานจริง (null-safe) ───────────────
    if (_limitParam && _limitParam.max_fail != null && _limitParam.min_fail != null) {
      SPEC = {
        upper: parseFloat(_limitParam.max_fail),   // USL
        lower: parseFloat(_limitParam.min_fail),   // LSL
        target: DEFAULT_SPEC.target
      };
    } else {
      // Series ยังไม่มี config → ใช้ default fallback
      SPEC = { upper: DEFAULT_SPEC.upper, lower: DEFAULT_SPEC.lower, target: DEFAULT_SPEC.target };
    }

    // อัปเดต badge ใน header
    $('#lblSpecUpper').text('USL = ' + SPEC.upper);
    $('#lblSpecLower').text('LSL = ' + SPEC.lower);
    if (!_limitParam) {
      $('#specLegend').addClass('bw-spec-default').attr('title', 'Using default values — not yet configured for this series');
    } else {
      $('#specLegend').removeClass('bw-spec-default').attr('title', '');
    }

    // reset OOS filter เมื่อโหลดข้อมูลใหม่
    _filterOOS = false;
    $('#iconFilterOOS').removeClass('bg-label-danger').addClass('bg-label-warning');
    $('#cardOutSpec').removeClass('bw-card-oos-active');
    $('#lblOosFilterActive').hide();

    updateSummaryCards(_bwData);
    renderLineChart(_bwData);
    renderDataTable(_bwData);

    if (_bwData.length > 0) $('#btnExport').prop('disabled', false);
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
        acc.push({
          seriesIndex: 0, dataPointIndex: i,
          fillColor: '#ff3e1d', strokeColor: '#ff3e1d', size: 7
        });
      }
      return acc;
    }, []);

    // ── Y-axis range: รวมข้อมูลจริง + เส้น Limit + padding ──
    const dataVals = chartData.map(p => p.y);
    const allVals = [...dataVals, SPEC.upper, SPEC.lower, SPEC.target];
    const rawMin = Math.min.apply(null, allVals);
    const rawMax = Math.max.apply(null, allVals);
    const range = rawMax - rawMin;
    const padding = range > 0 ? range * 0.12 : 5;
    const yMin = rawMin - padding;
    const yMax = rawMax + padding;

    const options = {
      chart: {
        type: 'line',
        height: 380,
        zoom: { enabled: true, type: 'x' },
        toolbar: { show: true },
        animations: { enabled: false }
      },

      series: [{ name: 'DiffMP1to4', data: chartData }],

      annotations: {
        yaxis: [
          {
            y: SPEC.upper, borderColor: '#ff3e1d',
            strokeDashArray: 5, borderWidth: 2,
            label: {
              text: 'USL = ' + SPEC.upper, position: 'right',
              style: { color: '#fff', background: '#ff3e1d', fontSize: '11px', padding: { left: 6, right: 6 } }
            }
          },
          {
            y: SPEC.lower, borderColor: '#ff9f43',
            strokeDashArray: 5, borderWidth: 2,
            label: {
              text: 'LSL = ' + SPEC.lower, position: 'right',
              style: { color: '#fff', background: '#ff9f43', fontSize: '11px', padding: { left: 6, right: 6 } }
            }
          },
          {
            y: SPEC.target, borderColor: '#28c76f',
            strokeDashArray: 3, borderWidth: 1.5,
            label: {
              text: 'Target = ' + SPEC.target, position: 'right',
              style: { color: '#fff', background: '#28c76f', fontSize: '11px', padding: { left: 6, right: 6 } }
            }
          }
        ]
      },

      markers: {
        size: 3, strokeWidth: 1,
        hover: { size: 6 },
        discrete: outOfSpecPoints
      },

      stroke: { curve: 'straight', width: 0 },
      colors: ['#696cff'],
      grid: { borderColor: '#f1f1f1', strokeDashArray: 3 },
      dataLabels: { enabled: false },

      xaxis: {
        type: 'datetime',
        title: { text: 'Date / Time' },
        labels: { datetimeUTC: false, format: 'dd-MM HH:mm' },
        tooltip: { enabled: false }
      },

      yaxis: {
        title: { text: 'DiffMP1to4' },
        decimalsInFloat: 2,
        min: yMin,
        max: yMax,
        labels: { formatter: function (v) { return v.toFixed(1); } }
      },

      tooltip: {
        x: { format: 'dd-MM-yyyy HH:mm' },
        custom: function (opts) {
          const d = _bwData[opts.dataPointIndex];
          if (!d) return '';
          const val = parseFloat(d.diffMP1to4);
          let badge = '';
          if (val > SPEC.upper) {
            badge = '<span class="bw-tt-badge bw-tt-fail-high">⚠ Fail High</span>';
          } else if (val < SPEC.lower) {
            badge = '<span class="bw-tt-badge bw-tt-fail-low">⚠ Fail Low</span>';
          } else {
            badge = '<span class="bw-tt-badge bw-tt-pass">✓ Pass</span>';
          }
          const clr = (val > SPEC.upper || val < SPEC.lower) ? '#ff3e1d' : '#28c76f';
          return `
            <div class="bw-tooltip">
              <div class="bw-tt-header">
                <i class="ri-time-line me-1"></i>${escHtml(d.logDateTime_txt)}
                ${badge}
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
    let oos = 0;
    data.forEach(function (row, idx) {
      const val = parseFloat(row.diffMP1to4);
      const outSpec = val > SPEC.upper || val < SPEC.lower;
      if (outSpec) oos++;
      rows += `
        <tr class="${outSpec ? 'bw-row-oos' : ''}">
          <td>${idx + 1}</td>
          <td data-order="${row.logDateTime_ts}">${escHtml(row.logDate_txt)}</td>
          <td data-order="${row.logDateTime_ts}">${escHtml(row.logTime_txt)}</td>
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
      order: [[1, 'desc'], [2, 'desc']],
      pageLength: 25,
      lengthMenu: [10, 25, 50, 100],
      language: { search: 'Search:', lengthMenu: 'Show _MENU_ rows' },
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
    const avg = vals.reduce(function (a, b) { return a + b; }, 0) / vals.length;
    const max = Math.max.apply(null, vals);
    const min = Math.min.apply(null, vals);
    const oos = vals.filter(function (v) { return v > SPEC.upper || v < SPEC.lower; }).length;

    $('#statAvgDiff').text(avg.toFixed(2));
    $('#statMaxDiff').text(max.toFixed(2));
    $('#statMinDiff').text(min.toFixed(2));
    $('#statOutSpec').text(oos + ' / ' + data.length);
    $('#statOutSpec').closest('.card').toggleClass('border-danger', oos > 0);
  }

  /* ═══════════════════════════════════════════════════════════
     MODAL — Edit Pass/Fail Limit (USL / LSL)
     ═══════════════════════════════════════════════════════════ */
  function openLimitModal() {
    const series = $('#hdnSeries').val();
    $('#modalLimitSeries').text('B' + series);
    $('#inputLimitSeries').val(series);

    // ใช้ค่าปัจจุบัน (จาก DB ถ้ามี, ไม่งั้นใช้ default ที่กำลังแสดงผล)
    $('#inputUSL').val(SPEC.upper);
    $('#inputLSL').val(SPEC.lower);

    if (!_limitParam) {
      showModalAlert('warning',
        'Series นี้ยังไม่มีค่า Limit ใน database — กำลังแสดงค่า default (USL=' +
        DEFAULT_SPEC.upper + ', LSL=' + DEFAULT_SPEC.lower + ') บันทึกเพื่อสร้างค่าใหม่');
    } else {
      $('#modalLimitAlert').hide();
    }

    const modal = new bootstrap.Modal(document.getElementById('modalEditLimit'));
    modal.show();
  }

  async function saveLimitParam() {
    const series = $('#inputLimitSeries').val();
    const usl = parseFloat($('#inputUSL').val());
    const lsl = parseFloat($('#inputLSL').val());

    if (isNaN(usl) || isNaN(lsl)) {
      showModalAlert('danger', 'Please enter valid numbers for USL and LSL.');
      return;
    }
    if (lsl >= usl) {
      showModalAlert('danger', 'LSL must be less than USL.');
      return;
    }

    $('#btnSaveLimit').prop('disabled', true).html(
      '<span class="spinner-border spinner-border-sm me-1"></span>Saving...'
    );

    try {
      const resp = await fetch('/BaseplateWeight/UpdatePassFailParam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ series, max_fail: usl, min_fail: lsl })
      });
      const result = await resp.json();

      if (result.success) {
        showModalAlert('success', 'Limit updated successfully.');
        setTimeout(() => {
          bootstrap.Modal.getInstance(document.getElementById('modalEditLimit')).hide();
          loadBaseplateWeight();
        }, 800);
      } else {
        showModalAlert('danger', 'Update failed: ' + (result.message || 'Unknown error'));
      }
    } catch (e) {
      showModalAlert('danger', 'Network error: ' + e.message);
    } finally {
      $('#btnSaveLimit').prop('disabled', false).html('<i class="ri-save-line me-1"></i>Save');
    }
  }

  function showModalAlert(type, msg) {
    $('#modalLimitAlert')
      .removeClass('alert-success alert-danger alert-warning')
      .addClass('alert-' + type)
      .html('<i class="ri-' + (type === 'success' ? 'checkbox-circle' : type === 'warning' ? 'alert' : 'error-warning') + '-line me-1"></i>' + msg)
      .show();
  }

  /* ─── Export Excel ──────────────────────────────────────── */
  function exportExcel() {
    if (!_bwData || _bwData.length === 0) return;

    const series = $('#hdnSeries').val();
    const flagrange = $('#hdnFlagrange').val();
    const filename = `BaseplateWeight_B${series}_${flagrange}_${bwDateStamp()}.xlsx`;

    const wsData = [[
      '#', 'Date', 'Time', 'SeriesNo', 'UserCode',
      'MP1', 'MP4', 'DiffMP1to4', 'CalMP1', 'CalMP4', 'Out of Spec'
    ]];
    _bwData.forEach(function (row, idx) {
      const val = parseFloat(row.diffMP1to4);
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
  async function fetchJson(url) {
    try {
      const resp = await fetch(url);
      return await resp.json();
    } catch (e) {
      console.error('fetchJson error:', url, e);
      return null;
    }
  }

  function bwRangeLabel(flag) {
    return flag === 'W' ? 'Last 7 days'
      : flag === 'M' ? 'Last 30 days'
        : 'Last 6 months';
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
  window.changeSeries = changeSeries;
  window.loadBaseplateWeight = loadBaseplateWeight;
  window.exportExcel = exportExcel;
  window.toggleOOSFilter = toggleOOSFilter;
  window.openLimitModal = openLimitModal;
  window.saveLimitParam = saveLimitParam;

})(); // end IIFE
