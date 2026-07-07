/**
 * uttcdw.js
 * wwwroot/js/uttcdw.js
 *
 * #PDU-UttcDw — UTTC/DW Test Log drill-down dashboard
 * Daily fail-ratio summary + serial-level drill-down.
 *
 * Endpoints:
 *   /UttcDw/GetDailySummary?series=&testtype=&dt_from=&dt_to=
 *   /UttcDw/GetSerialList?series=&testtype=&dt_from=&dt_to=&failonly=
 *   /UttcDw/GetFileList?series=&serial=&testtype=&testdate=
 *
 * Dependencies: jQuery, DataTables, Bootstrap 5 modal
 */

'use strict';

let udDailyTable = null;
let udSerialTable = null;
let udFileTable = null;

/* ─── Init ──────────────────────────────────────────────── */
$(document).ready(function () {
  $('input[name="udRangeRadio"]').on('change', function () {
    $('#udHdnRange').val(this.value);
    loadUdDailySummary();
  });

  loadUdDailySummary();
});

/* ─── Filters ───────────────────────────────────────────── */
function changeUdSeries(series) {
  $('#udHdnSeries').val(series);

  $('[id^="udBtnSeries"]').removeClass('btn-primary').addClass('btn-outline-primary');
  const btnId = series === '' ? '#udBtnSeriesAll' : '#udBtnSeries' + series;
  $(btnId).removeClass('btn-outline-primary').addClass('btn-primary');

  loadUdDailySummary();
}

function changeUdTestType(testtype) {
  $('#udHdnTestType').val(testtype);

  $('[id^="udBtnType"]').removeClass('btn-secondary').addClass('btn-outline-secondary');
  const btnId = testtype === '' ? '#udBtnTypeAll' : '#udBtnType' + testtype;
  $(btnId).removeClass('btn-outline-secondary').addClass('btn-secondary');

  loadUdDailySummary();
}

function udRangeToDates(range) {
  const to = new Date();
  const from = new Date();
  const days = range === 'M' ? 30 : range === 'H' ? 180 : 7;
  from.setDate(to.getDate() - days);
  return { dt_from: udToIso(from), dt_to: udToIso(to) };
}

function udToIso(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

/* ─── Load & Render : Daily Summary ────────────────────── */
async function loadUdDailySummary() {
  const series = $('#udHdnSeries').val();
  const testtype = $('#udHdnTestType').val();
  const range = $('#udHdnRange').val();
  const { dt_from, dt_to } = udRangeToDates(range);

  let data = [];
  try {
    const q = new URLSearchParams({ series, testtype, dt_from, dt_to }).toString();
    const resp = await fetch(`/UttcDw/GetDailySummary?${q}`);
    data = await resp.json();
  } catch (e) {
    console.error('GetDailySummary error:', e);
    return;
  }

  renderUdSummaryCards(data);
  renderUdDailyTable(data);
}

function renderUdSummaryCards(data) {
  const tested = data.reduce((s, d) => s + d.testedSerials, 0);
  const failed = data.reduce((s, d) => s + d.failedSerials, 0);
  const files = data.reduce((s, d) => s + d.totalFiles, 0);
  const ratio = tested > 0 ? (100 * failed / tested).toFixed(1) : '0.0';

  $('#udStatTested').text(tested.toLocaleString());
  $('#udStatFailed').text(failed.toLocaleString());
  $('#udStatRatio').text(ratio + ' %');
  $('#udStatFiles').text(files.toLocaleString());
}

function renderUdDailyTable(data) {
  if ($.fn.DataTable.isDataTable('#tblUdDailySummary')) {
    udDailyTable.clear().destroy();
  }

  udDailyTable = $('#tblUdDailySummary').DataTable({
    data: data,
    order: [[0, 'desc']],
    pageLength: 15,
    columns: [
      { data: 'monitor_dt_txt', title: 'Date' },
      { data: 'series', title: 'Series', render: v => 'B' + v },
      { data: 'testtype', title: 'Test Type' },
      { data: 'testedSerials', title: 'Tested Serials' },
      { data: 'failedSerials', title: 'Failed Serials' },
      {
        data: 'failRatioPct', title: 'Fail Ratio',
        render: v => udRatioBadge(v)
      },
      { data: 'failFiles', title: 'Fail Files' },
      { data: 'totalFiles', title: 'Total Files' },
      {
        data: null, title: 'Detail', orderable: false,
        render: (row) => `<button class="btn btn-sm btn-outline-primary"
              onclick="viewUdSerials('${row.monitor_dt}','${row.series}','${row.testtype}',${row.failedSerials})">
              <i class="ri-eye-line"></i></button>`
      }
    ]
  });
}

function udRatioBadge(ratioPct) {
  const v = parseFloat(ratioPct) || 0;
  const cls = v >= 10 ? 'bg-label-danger' : v >= 5 ? 'bg-label-warning' : 'bg-label-success';
  return `<span class="badge ${cls}">${v.toFixed(1)} %</span>`;
}

/* ─── Drill-down modal ──────────────────────────────────── */
function viewUdSerials(monitorDt, series, testtype, failedSerials) {
  $('#udHdnModalDate').val(monitorDt);
  $('#udHdnModalSeries').val(series);
  $('#udHdnModalType').val(testtype);
  // If nothing failed that day, "fail only" would show an empty table with
  // no explanation — default to showing all serials instead.
  $('#udChkFailOnly').prop('checked', (failedSerials || 0) > 0);

  $('#modalUdContext').text(`${monitorDt}  |  B${series}  |  ${testtype}`);

  const modal = new bootstrap.Modal(document.getElementById('modalUdSerialList'));
  modal.show();

  loadUdSerialModal();
}

function reloadUdSerialModal() {
  loadUdSerialModal();
}

async function loadUdSerialModal() {
  const dt = $('#udHdnModalDate').val();
  const series = $('#udHdnModalSeries').val();
  const testtype = $('#udHdnModalType').val();
  const failonly = $('#udChkFailOnly').is(':checked');

  let data = [];
  try {
    const q = new URLSearchParams({
      series, testtype, dt_from: dt, dt_to: dt, failonly
    }).toString();
    const resp = await fetch(`/UttcDw/GetSerialList?${q}`);
    data = await resp.json();
  } catch (e) {
    console.error('GetSerialList error:', e);
    return;
  }

  if ($.fn.DataTable.isDataTable('#tblUdSerialList')) {
    udSerialTable.clear().destroy();
  }

  udSerialTable = $('#tblUdSerialList').DataTable({
    data: data,
    order: [[2, 'desc']],
    pageLength: 10,
    columns: [
      { data: 'serial', title: 'Serial' },
      { data: 'modelName', title: 'Model' },
      {
        data: 'isFail', title: 'Status',
        render: v => v
          ? '<span class="badge bg-label-danger"><i class="ri-close-circle-line me-1"></i>Fail</span>'
          : '<span class="badge bg-label-success"><i class="ri-checkbox-circle-line me-1"></i>Pass</span>'
      },
      {
        data: 'fileCount', title: 'Files',
        render: (v, type, row) => `<button class="btn btn-sm btn-outline-secondary"
              onclick="viewUdFiles('${row.serial}')">
              <i class="ri-file-list-3-line me-1"></i>${v} file${v === 1 ? '' : 's'}</button>`
      },
      { data: 'firstTestTime', title: 'First Test' },
      { data: 'lastTestTime', title: 'Last Test' }
    ]
  });
}

/* ─── File Detail modal (deepest drill-down) ───────────── */
function viewUdFiles(serial) {
  const dt = $('#udHdnModalDate').val();
  const series = $('#udHdnModalSeries').val();
  const testtype = $('#udHdnModalType').val();

  $('#modalUdFileContext').text(`${serial}  |  ${dt}  |  B${series}  |  ${testtype}`);

  const modal = new bootstrap.Modal(document.getElementById('modalUdFileList'));
  modal.show();

  loadUdFileModal(serial, series, testtype, dt);
}

async function loadUdFileModal(serial, series, testtype, testdate) {
  let data = [];
  try {
    const q = new URLSearchParams({ series, serial, testtype, testdate }).toString();
    const resp = await fetch(`/UttcDw/GetFileList?${q}`);
    data = await resp.json();
  } catch (e) {
    console.error('GetFileList error:', e);
    return;
  }

  if ($.fn.DataTable.isDataTable('#tblUdFileList')) {
    udFileTable.clear().destroy();
  }

  udFileTable = $('#tblUdFileList').DataTable({
    data: data,
    order: [[0, 'asc']],
    pageLength: 10,
    columns: [
      { data: 'testTime', title: 'Test Time' },
      {
        data: 'isFail', title: 'Status',
        render: v => v
          ? '<span class="badge bg-label-danger"><i class="ri-close-circle-line me-1"></i>Fail</span>'
          : '<span class="badge bg-label-success"><i class="ri-checkbox-circle-line me-1"></i>Pass</span>'
      },
      {
        data: null, title: 'Full Path',
        render: row => row.hasFullPath
          ? `<code class="small">${escUdHtml(row.displayPath)}</code>`
          : `<span class="text-muted small" title="Recorded before FilePath was tracked — rescan to backfill">
               <i class="ri-information-line me-1"></i>${escUdHtml(row.displayPath)} (path not recorded)</span>`
      }
    ]
  });
}

function escUdHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
