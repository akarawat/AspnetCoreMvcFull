var myModal = new bootstrap.Modal(document.getElementById("loadingModal"));
let timeInterval = 3000;
const adminList = ['SAKULCHAI.P', 'SUPONG.C'];
$(document).ready(function () {
  //$('#loadingModal').modal('show');
  const params = new URLSearchParams(window.location.search);
  const series = params.get("series");
  GetFoot3AParam(series);
  
  let flagrange = params.get("flagrange");
  if (flagrange == null) {
    flagrange = 'W';
  }

  // Start Admin authen
  $("#btnCfgMaxMin").removeClass("btn btn-sm btn-secondary");
  $("#btnCfgMaxMin").prop("style", "display:none;");
  $.ajax({
    url: '/AdminCfg/GetSAMLogin',
    method: 'GET',
    data: null,
    success: function (res) {
      console.log(res.samlogin);
      const index1 = adminList.indexOf(res.samlogin);
      if (index1 > -1) {
        $("#btnCfgMaxMin").addClass("btn btn-sm btn-secondary");
        $("#btnCfgMaxMin").prop("style", "display:block;");
      }
    },
    error: function () { }
  });
  // End Admin authen

  console.log(flagrange);
  $('#lblSeries').html("Model B" + series);
  $('#ddlSeries').val(series);
  $('#txtSerial').val(series);
  $("#BtnBoxPlot").prop("style", "display:none;");

  loadCalibrationChart(flagrange);

  $("#spanNormalCut").html("");
  $("#spanCutMaxWarn").html("");
  $("#spanCutMaxAlarm").html("");
  $("#spanPrdYeild").html("");

  setBgButton(series);
  //loadCalibrationChart("");
  setAlarmBgColor(series);

});
// Start Load chart
async function loadCalibrationChart(flagrange) {
  const params = new URLSearchParams(window.location.search);
  const series = params.get("series");
  console.log(series);
  const [maxCoord, minCoord] = await GetaxMinFailParam(series);
  console.log("MaxFail =", maxCoord);
  console.log("MinFail =", minCoord);
  // Get Max/Min Fail Param
  let maxFail = maxCoord;
  let minFail = minCoord;


  // อ่านค่าจาก input
  if (flagrange == '') {
    //alert("No data");
    return;
  }
  if (flagrange == 'W' || flagrange == 'M' || flagrange == 'HY') {
    $('#fromDate').val(null);
    $('#toDate').val(null);
  }
  else if (flagrange == undefined) {
    $("#criteria2").prop('checked', false);
    $("#criteria3").prop('checked', false);
    $("#criteria4").prop('checked', false);
  }
  //const series = $('#ddlSeries').val();
  const dtstart = $('#fromDate').val();
  const dtend = $('#toDate').val();

  // เรียกข้อมูลจาก API
  const query = new URLSearchParams({ series, dtstart, dtend, flagrange }).toString();
  const response = await fetch(`/Foot3A/GetDataFoot3A?${query}`);
  const jsonData = await response.json();
  console.log(jsonData);
  if (jsonData[0].startDate != null) {
    var formDt = jsonData[0].startDate.split('T')[0];
    var toDate = jsonData[jsonData.length - 1].startDate.split('T')[0];
    //console.log(response[response.length - 1]);
    //console.log(formDt + ":" + toDate);
    $('#fromDate').val(formDt);
    $('#toDate').val(toDate);
  }
  //// Draw table
  ////-- Start Tables
  BindDataTable(flagrange);
  //if ($.fn.DataTable.isDataTable('#bindDataTable')) {
  //  $('#bindDataTable').DataTable().clear().destroy();
  //}

  //$('#bindDataTable').DataTable({
  //  data: jsonData,
  //  order: [[0, 'desc']],
  //  pageLength: 50,
  //  columns: [
  //    { data: 'startDate_txt' },
  //    { data: 'serial' },
  //    { data: 'valueA' },
  //    { data: 'valueB' }
  //  ]
  //});
  ////-- End Tables

  // เตรียมข้อมูล scatter chart
  const valueADataset = jsonData.map(d => ({
    x: d.startDate.split('T')[0],
    y: d.valueA,
    serial: d.serial
  }));

  const valueBDataset = jsonData.map(d => ({
    x: d.startDate.split('T')[0],
    y: d.valueB,
    serial: d.serial
  }));

  // วันที่ไม่ซ้ำและเรียงจากน้อยไปมาก
  console.log(jsonData);
  //const sortedDates = [...new Set(jsonData.map(d => d.startDate.split('T')[0]))].sort((a, b) => {
  //  const [da, ma, ya] = a.split('-').map(Number);
  //  const [db, mb, yb] = b.split('-').map(Number);
  //  return new Date(ya, ma - 1, da) - new Date(yb, mb - 1, db);
  //});
  const sortedDates = [...new Set(jsonData.map(d => d.startDate.split("T")[0]))]
    .sort((a, b) => new Date(a) - new Date(b));

  console.log(sortedDates);
  // ดึงค่า Parameters จาก DB
  let minA = 0; let minB = 0;
  let maxA = 0; let maxB = 0;
  minA = $("#McParam3").val();
  minB = $("#McParam4").val();
  maxA = $("#McParam5").val();
  maxB = $("#McParam6").val();
  //console.log(minA)

  // Start กรองเฉพาะที่ serial มีค่า และไม่เป็นค่าว่าง
  const validSerialDates = jsonData
    .filter(item => item.serial.length > 5 && item.serial.trim() !== '')
    .map(item => item.startDate.split('T')[0]);
  // End กรองเฉพาะที่ serial มีค่า และไม่เป็นค่าว่าง

  // Start นับ 2 เงื่อนไขที่มากกว่า 80, น้อยกว่า 25
  const totalCount = validSerialDates.length;

  // เงื่อนไขที่ 1: valueA <= 25
  const valueALow = jsonData.filter(item => item.valueA !== null && item.valueA <= 25 && item.serial.length > 5); //item.valueA <= 25
  const countValueALow = valueALow.length;
  const percentValueALow = ((countValueALow / totalCount) * 100).toFixed(2);

  // เงื่อนไขที่ 2: valueB >= 80
  const valueBHigh = jsonData.filter(item => item.valueB !== null && item.valueB > 80 && item.serial.length > 5); //item.valueB > 80
  const countValueBHigh = valueBHigh.length;
  const percentValueBHigh = ((countValueBHigh / totalCount) * 100).toFixed(2);

  console.log(`valueA <= 25: ${countValueALow} รายการ (${percentValueALow}%)`);
  console.log(`valueB >= 80: ${countValueBHigh} รายการ (${percentValueBHigh}%)`);
  // End นับ 2 เงื่อนไขที่มากกว่า 80, น้อยกว่า 25

  // เส้น Tolerance line [Master]
  //const minToleranceA = sortedDates.map(date => ({ x: date, y: 26 }));
  //const maxToleranceA = sortedDates.map(date => ({ x: date, y: 35 }));
  //const minToleranceB = sortedDates.map(date => ({ x: date, y: 61 }));
  //const maxToleranceB = sortedDates.map(date => ({ x: date, y: 80 }));

  const minToleranceA = null; //sortedDates.map(date => ({ x: date, y: minA }));
  const maxToleranceA = null; //sortedDates.map(date => ({ x: date, y: minB }));
  const minToleranceB = null; //sortedDates.map(date => ({ x: date, y: maxA }));
  const maxToleranceB = null; //sortedDates.map(date => ({ x: date, y: maxB }));

  // เตรียมเส้นแนวนอนสำหรับ fail
  const maxFailLine = sortedDates.map(date => ({ x: date, y: maxFail }));
  const minFailLine = sortedDates.map(date => ({ x: date, y: minFail }));
  $("#span_info").prop("style", "display:block;");
  
  // เขียน Proposal อธิบาย Modify Label Form MC. Configuration
  //$("#lblSummaryTest").prop("style", "display:none;");
  //$("#lblSummaryTest").html("Proposal");
  
  $("#lblPrdYeild").prop("style", "display:none;");
  $("#lblTotalNormalCut").prop("style", "display:none;");
  $("#lblTotalMaxCut").prop("style", "display:none;");
  $("#lblTotalClosetoCut").prop("style", "display:none;");
  $("#lblMinTotal").prop("style", "display:none;");

  $("#lblTotalTest").html("Total [" + validSerialDates.length + "]");
  /*
  $("#lblTotalClosetoCut").html("<font color=orange>" + ((minA * 1) + 1) + "-" + minB + "</font>");
  $("#lblTotalMaxCut").html("<font color=lightgreen>" + ((minB * 1) + 1) + "-" + maxA + "</font>");
  $("#lblTotalNormalCut").html("<font color=orange>" + ((maxA * 1) + 1) + "-" + maxB + "</font>");
  $("#lblPrdYeild").html("<font color=red> >= " + ((maxB * 1) + 1) + " </font>");
  $("#lblMinTotal").html("<font color=red> <= " + minA + "</font>");
  
  $("#lblAlarmB").html("<br/><font color=black>Zone Upper " + $("#McParam7").val() + " </font>");
  $("#lblAlarmB_info").html("<br/><font color=orange> ValueB > " + maxB + ": " + countValueBHigh + " items, (" + percentValueBHigh + "%)</font>");
  $("#lblAlarmA").html("<br/><font color=black> Zone Lower " + $("#McParam8").val() + "  </font>");
  $("#lblAlarmA_info").html("<br/><font color=green> ValueA <= " + minA + ": " + countValueALow + " items, (" + percentValueALow + "%)</font><hr/>");
  */
  // ล้าง chart เดิม
  if (window.calibrationChartInstance) {
    window.calibrationChartInstance.destroy();
  }

  const ctx = document.getElementById('calibrationChart').getContext('2d');
  window.calibrationChartInstance = new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: [
        {
          label: 'valueA',
          data: valueADataset,
          backgroundColor: 'green',
          pointRadius: 4
        },
        {
          label: 'valueB',
          data: valueBDataset,
          backgroundColor: 'orange',
          pointRadius: 4
        },
        //{
        //  label: 'Range (26)',
        //  data: minToleranceA,
        //  type: 'line',
        //  borderColor: '#42EE2F',
        //  borderWidth: 2,
        //  pointRadius: 0,
        //  tension: 0
        //},
        //{
        //  label: 'Range (35)',
        //  data: maxToleranceA,
        //  type: 'line',
        //  borderColor: '#A2EE2F',
        //  borderWidth: 2,
        //  pointRadius: 0,
        //  tension: 0
        //},
        //{
        //  label: 'Range (61)',
        //  data: minToleranceB,
        //  type: 'line',
        //  borderColor: '#CA9253',
        //  borderWidth: 2,
        //  pointRadius: 0,
        //  tension: 0
        //},
        //{
        //  label: 'Range (80)',
        //  data: maxToleranceB,
        //  type: 'line',
        //  borderColor: '#E75C36',
        //  borderWidth: 2,
        //  pointRadius: 0,
        //  tension: 0
        //},

        // ⛔ New Added Fail Lines
        {
          label: `MaxFail (${maxFail})`,
          data: maxFailLine,
          type: 'line',
          borderColor: 'orange',
          borderWidth: 2,
          //borderDash: [5, 5],   // optional ทำให้เป็นเส้นปะ
          pointRadius: 0,
          tension: 0
        },
        {
          label: `MinFail (${minFail})`,
          data: minFailLine,
          type: 'line',
          borderColor: '#42EE2F',
          borderWidth: 2,
          //borderDash: [5, 5],
          pointRadius: 0,
          tension: 0
        }
      ]
    },

    options: {
      responsive: true,
      plugins: {
        tooltip: {
          callbacks: {
            label: function (ctx) {
              const serial = ctx.raw.serial ?? '';
              const y = ctx.raw.y;
              return `Serial: ${serial} | Value: ${y}`;
            }
          }
        },
        legend: {
          position: 'top'
        },
        title: {
          display: true,
          text: 'Calibration Buttonhole'
        }
      },
      scales: {
        x: {
          type: 'category',
          labels: sortedDates,
          title: {
            display: true,
            text: 'Date'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Measured Value'
          }
        }
      }
    }
  });
}
// End Load chart

// เรียก Chart เมื่อโหลดหน้า
//document.addEventListener('DOMContentLoaded', loadCalibrationChart);

// Toggle full screen
document.getElementById("toggleFullscreenBtn").addEventListener("click", function () {
  let series = $('#ddlSeries').val();
  const isFull = localStorage.getItem("isFullscreen") === "true";
  localStorage.setItem("isFullscreen", (!isFull).toString());
  // Reload เพื่อใช้ Razor Layout ใหม่
  window.location.href = "?fullscreen=" + isFull + "&series=" + series;

});

$("#BtnBoxPlot").on("click", function () {
  location.href = "/ASSPrdData/BoxPlot?fullscreen=true";
});

// Add Button Sorting
//$('#bindDataTable th').each(function (index, th) {
//  $(th).unbind('click');
//  $(th).append('<button class="sort-btn btn-asc">&#9650;</button>');
//  $(th).append('<button class="sort-btn btn-desc">&#9660;</button>');

//  $(th).find('.btn-asc').click(function () {
//    table.column(index).order('asc').draw();
//  });
//  $(th).find('.btn-desc').click(function () {
//    table.column(index).order('desc').draw();
//  });
//});
function callFuncButton(serial) {
  location.href = "/Foot3a/?fullscreen=true&series=" + serial;
}

// เพิ่ม Parameter Code ตรงนี้ เช่น 1000, 2000, 3000
function GetFoot3AParam(series) {
  let paramcode = '1000'; // B4,B5
  if (series == '3') {
    paramcode = '2000';
  } else if (series == '4' || series == '5') {
    paramcode = '1000';
  } else if (series == '3') {
    paramcode = '3000';
  }
  $.ajax({
    type: "GET",
    url: "/Foot3A/GetKPIParamsByKey",
    data: { param_code: paramcode },
    beforeSend: function () {
      
    },
    success: function (response) {
      //console.log(response);
      if (response.length == 10) {
        $("#McParam1").val(response[0]);
        $("#McParam2").val(response[1]);
        $("#McParam3").val(response[2]);//25
        $("#McParam4").val(response[3]);//35
        $("#McParam5").val(response[4]);//60
        $("#McParam6").val(response[5]);//80
        $("#McParam7").val(response[6]);//15%
        $("#McParam8").val(response[7]);//5%
        $("#McParam9").val(response[8]);//
        $("#McParam10").val(response[9]);// Remarks
        $("#spanYeildFormular").html(`<span class="text-info ">` + response[9] + `</span>`);
      }
    },
    complete: function () {
    },
    error: function (xhr) {
      
    }
  });
}
// Set Alarm Background color
function setAlarmBgColor(series) {
  $.ajax({
    type: "GET",
    url: "/Foot3A/GetDataFoot3A",
    data: { series:series, dtstart:null, dtend:null, flagrange:'W' },
    beforeSend: function () {

    },
    success: function (response) {
      //console.log(response);
      //for (const [keyA, valueA] of Object.entries(response)) {
      //  //console.log(`Key: ${key}, Value: ${value}`);
      //  for (const [keyB, valueB] of Object.entries(valueA)) {
      //    console.log(`Key: ${keyB}, Value: ${valueB}`);
      //  }
      //}
      // ดึงค่า Parameters จาก DB
      let minA = 0; let minB = 0;
      let maxA = 0; let maxB = 0;
      minA = $("#McParam3").val();
      minB = $("#McParam4").val();
      maxA = $("#McParam5").val();
      maxB = $("#McParam6").val();
      //console.log(minA)

      // Start กรองเฉพาะที่ serial มีค่า และไม่เป็นค่าว่าง
      const jsonData = response;
      const validSerialDates = jsonData
        .filter(item => item.serial.length > 5 && item.serial.trim() !== '')
        .map(item => item.startDate.split('T')[0]);
      // End กรองเฉพาะที่ serial มีค่า และไม่เป็นค่าว่าง

      // Start นับ 2 เงื่อนไขที่มากกว่า 80, น้อยกว่า 25
      const totalCount = validSerialDates.length;

      // เงื่อนไขที่ 1: valueA <= 25
      const valueALow = jsonData.filter(item => item.valueA !== null && item.valueA <= 25 && item.serial.length > 5); //item.valueA <= 25
      const countValueALow = valueALow.length;
      const percentValueALow = ((countValueALow / totalCount) * 100).toFixed(2);

      // เงื่อนไขที่ 2: valueB >= 80
      const valueBHigh = jsonData.filter(item => item.valueB !== null && item.valueB > 80 && item.serial.length > 5); //item.valueB > 80
      const countValueBHigh = valueBHigh.length;
      const percentValueBHigh = ((countValueBHigh / totalCount) * 100).toFixed(2);

      console.log(`valueA <= 25: ${countValueALow} รายการ (${percentValueALow}%)`);
      console.log(`valueB >= 80: ${countValueBHigh} รายการ (${percentValueBHigh}%)`);

      //--- 7 Day Zone ---------------
      $("#lbl7DTotalTest").prop("style", "display:none;");
      $("#lbl7DTotalTest").html("Total [" + validSerialDates.length + "]");

      $("#lbl7DAlarmB").prop("style", "display:none;");
      $("#lbl7DAlarmB_info").prop("style", "display:none;");
      $("#lbl7DAlarmA").prop("style", "display:none;");
      $("#lbl7DAlarmA_info").prop("style", "display:none;");

      //$("#lbl7DAlarmB").html("<br/><font color=black>Zone Upper " + $("#McParam7").val() + " </font>");
      //$("#lbl7DAlarmB_info").html("<br/><font color=orange> ValueB > " + maxB + ": " + countValueBHigh + " items, (" + percentValueBHigh + "%)</font>");
      //$("#lbl7DAlarmA").html("<br/><font color=black> Zone Lower " + $("#McParam8").val() + "  </font>");
      //$("#lbl7DAlarmA_info").html("<br/><font color=green> ValueA <= " + minA + ": " + countValueALow + " items, (" + percentValueALow + "%)</font><hr/>");


    },
    complete: function () {
    },
    error: function (xhr) {

    }
  });
}

// Start Ecxel Export

document.getElementById("btnExport").addEventListener("click", async () => {
  if (confirm("Confirm to export")) {
    await exportToExcel();
  }
});
async function BindDataTable(flagrange) {
  // อ่านค่าจาก input
  if (flagrange == '') {
    flagrange = 'W';
    //return;
  }
  if (flagrange == 'W' || flagrange == 'M' || flagrange == 'HY') {
    $('#fromDate').val(null);
    $('#toDate').val(null);
  }
  else if (flagrange == undefined) {
    $("#criteria2").prop('checked', false);
    $("#criteria3").prop('checked', false);
    $("#criteria4").prop('checked', false);
  }
  const series = $('#ddlSeries').val();
  const dtstart = $('#fromDate').val();
  const dtend = $('#toDate').val();

  // เรียกข้อมูลจาก API
  const query = new URLSearchParams({ series, dtstart, dtend, flagrange }).toString();
  const response = await fetch(`/Foot3A/GetDataFoot3AExcel?${query}`);

  if (!response.ok) {
    alert("Export failed.");
    return;
  }

  const result = await response.json();
  const data = result;           // ✅ ดึงข้อมูล
  if (data.length == 0) {
    return;
  }
  // Draw table
  //-- Start Tables
  if ($.fn.DataTable.isDataTable('#bindDataTable')) {
    $('#bindDataTable').DataTable().clear().destroy();
  }
  $('#bindDataTable').DataTable({
    data: data,
    order: [[0, 'desc']],
    pageLength: 50,
    sort: false,
    columns: [
      { data: 'startDate_txt' },
      { data: 'serial' },
      { data: 'valueA' },
      { data: 'valueB' }
    ]
  });
  //-- End Tables
  //return;
}
async function exportToExcel(flagrange) {
  let model_code = "Button Hold Foot 3A " + $("#lblSeries").html();
  let txt_date_st = $("#fromDate").val().slice(-2) + '-' + $("#fromDate").val().slice(5, 7) + '-' + $("#fromDate").val().slice(0, 4);
  let txt_end_dt = $("#toDate").val().slice(-2) + '-' + $("#toDate").val().slice(5, 7) + '-' + $("#toDate").val().slice(0, 4);
  console.log(txt_date_st + ":" + txt_end_dt);
  //const query = new URLSearchParams({
  //  dt_st: $("#fromDate").val(),
  //  dt_en: $("#toDate").val()
  //});
  //console.log(query.toString());
  //return;

  // อ่านค่าจาก input
  if (flagrange == '') {
    flagrange = 'W';
    //return;
  }
  if (flagrange == 'W' || flagrange == 'M' || flagrange == 'HY') {
    $('#fromDate').val(null);
    $('#toDate').val(null);
  }
  else if (flagrange == undefined) {
    $("#criteria2").prop('checked', false);
    $("#criteria3").prop('checked', false);
    $("#criteria4").prop('checked', false);
  }
  const series = $('#ddlSeries').val();
  const dtstart = $('#fromDate').val();
  const dtend = $('#toDate').val();

  // เรียกข้อมูลจาก API
  const query = new URLSearchParams({ series, dtstart, dtend, flagrange }).toString();
  const response = await fetch(`/Foot3A/GetDataFoot3AExcel?${query}`);

  if (!response.ok) {
    alert("Export failed.");
    return;
  }

  const result = await response.json();
  const data = result;           // ✅ ดึงข้อมูล
  if (data.length == 0) {
    return;
  }
  console.log(data);

  // Draw table
  //-- Start Tables
  //if ($.fn.DataTable.isDataTable('#bindDataTable')) {
  //  $('#bindDataTable').DataTable().clear().destroy();
  //}

  //$('#bindDataTable').DataTable({
  //  data: data,
  //  order: [[0, 'desc']],
  //  pageLength: 50,
  //  columns: [
  //    { data: 'startDate_txt' },
  //    { data: 'serial' },
  //    { data: 'valueA' },
  //    { data: 'valueB' }
  //  ]
  //});
  ////-- End Tables
  //return;

  // กำหนดแถวส่วนหัวเอง $("#start_dt").val(), $("#end_dt").val()
  const customHeaderRows = [
    [`Export By: ${model_code}`],                // Row 1
    [`Date : ${txt_date_st} to ${txt_end_dt}`],               // Row 2
    [``]     // Row 3
  ];
  // กำหนดชื่อคอลัมน์ Excel (Row 4)
  const headerRow = [
    "Serial",
    "Date",
    "Value A",
    "Value B",
    "Min",
    "Max"
  ];
// แปลงข้อมูล JSON เป็น Array สำหรับ export
  const dataRows = data.map(row => [
    row.serial,
    row.startDate_txt,
    row.valueA,
    row.valueB,
    row.minVal,
    row.maxVal
  ]);
  // * กรณี อยากใส่ท้ายเอกสาร
  /*
  // ✅ คำนวณรวม mas_qty
  const totalQty = dataRows.reduce((sum, row) => sum + (parseFloat(row.mas_qty) || 0), 0);
  // ✅ แถว Total
  const totalRow = ["", "", "Total", totalQty, "", ""];
  */
  // ✅ แถว Total
  const totalRow = ["", "", "Total", dataRows.length, "รายการ", ""];

  // รวมทั้งหมด
  const finalSheetData = [
    ...customHeaderRows,
    headerRow,
    ...dataRows,
    totalRow  // ✅ ใส่ท้ายสุด
  ];

  // สร้าง worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(finalSheetData);

  // สร้าง workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Foot3A");

  // บันทึกเป็นไฟล์ Excel
  XLSX.writeFile(workbook, `${model_code} ${txt_date_st}_${txt_end_dt}.xlsx`);

}
///------- Remark
var remarkModal = new bootstrap.Modal(document.getElementById("remarkModal"));
$("#btnRemark").click(function () {

  $("#btnAddRemark").addClass("btn btn-success mt-2");
  $("#btnUpdateRemark").prop("style", "display:none;");
  $("#btnUpdateRemark").removeClass("btn btn-info mt-2");
  $('#trid').val(null);
  $('#txtRemark').val(null);

  remarkModal.show();
  BindDataTableRemark();
});

$("#btnAddRemark").click(function () {
  let series = $('#ddlSeries').val();
  let remark = $('#txtRemark').val();
  if (series == null || series == '' && remark == '') {
    alert("No data"); return;
  }
  if (!confirm("💾 \r Confirm add remark.")) return;

  let ObjParam = {
    menuno: '3',
    series: series,
    remarks: remark
  }
  console.log(ObjParam);
  $.ajax({
    url: '/Dashboards/InsHistoryRemark',
    method: 'POST',
    data: ObjParam,
    success: function (res) {
      BindDataTableRemark();
      $('#trid').val(null);
      $('#txtRemark').val(null);
    },
    error: function () {
      alert("Error saving data");
    }
  });


});

async function BindDataTableRemark() {
  let menuno = '3';
  let series = $('#ddlSeries').val();
  // เรียกข้อมูลจาก API
  const query = new URLSearchParams({ menuno, series }).toString();
  const response = await fetch(`/Dashboards/GetHistoryRemark?${query}`);

  if (!response.ok) {
    alert("Load remark failed.");
    return;
  }

  const result = await response.json();
  const data = result;           // ✅ ดึงข้อมูล
  //if (data.length == 0) {
  //  return;
  //}
  // Draw table
  //-- Start Tables
  if ($.fn.DataTable.isDataTable('#bindDataTableRemark')) {
    $('#bindDataTableRemark').DataTable().clear().destroy();
  }
  $('#bindDataTableRemark').DataTable({
    data: data,
    order: [[0, 'desc']],
    pageLength: 50,
    columns: [
      { data: 'create_dt', visible: false },
      {
        data: 'trid',
        render: function (data, type, row) {
          if (row.remarks != '') {
            return `${row.remarks} <br/> <b>${row.create_dt_txt}</b>`;
          } else {
            return `-`;
          }
        }
      },
      {
        data: 'trid',
        render: function (data, type, row) {
          return `
            <i id="btnItemEdit" class="ri-save-3-fill text-success" onclick="javascript:EditItem('${data}');" style="cursor:pointer; font-size: 24px;" title='Edit'></i>
            <i id="btnItemDel" class="ri-delete-bin-2-fill text-danger" onclick="javascript:DeleteRemark('${data}');" style="cursor:pointer; font-size: 24px;" title='Delete'></i>
            `;
        }
      }
    ]
  });
  //-- End Tables
  return;
}

function DeleteRemark(trid) {
  $('#trid').val(trid);
  if (!confirm("💾 \r Confirm Delete remark.")) return;
  let ObjParam = {
    trid: trid
  }
  $.ajax({
    url: '/Dashboards/DeleteHistoryRemark',
    method: 'DELETE',
    data: ObjParam,
    success: function (res) {
      BindDataTableRemark();
      $('#trid').val(null);
    },
    error: function () {
      alert("Error saving data");
    }
  });
}

$("#btnUpdateRemark").click(function () {
  let trid = $('#trid').val();
  let remark = $('#txtRemark').val();
  if (remark == '') {
    alert("No data"); return;
  }
  if (!confirm("💾 \r Confirm Revise update remark.")) return;

  let ObjParam = {
    trid: trid,
    remarks: remark
  }
  $.ajax({
    url: '/Dashboards/UpdateHistoryRemark',
    method: 'PUT',
    data: ObjParam,
    success: function (res) {
      BindDataTableRemark();
      $('#trid').val(null);
      $('#txtRemark').val(null);

      $("#btnAddRemark").addClass("btn btn-success mt-2");
      $("#btnAddRemark").prop("style", "display:block;");

      $("#btnUpdateRemark").removeClass("btn btn-info mt-2");
      $("#btnUpdateRemark").prop("style", "display:none;");

    },
    error: function () {
      alert("Error saving data");
    }
  });

});

function EditItem(trid) {
  $.ajax({
    url: '/Dashboards/GetHistoryRemarkByid',
    method: 'GET',
    data: { trid: trid },
    success: function (res) {
      console.log(res);
      $('#trid').val(trid);
      $('#txtRemark').val(res[2]);
    },
    error: function () {
      alert("Error saving data");
    }
  });

  $("#btnAddRemark").removeClass("btn btn-success mt-2");
  $("#btnAddRemark").prop("style", "display:none;");

  $("#btnUpdateRemark").addClass("btn btn-info mt-2");
  $("#btnUpdateRemark").prop("style", "display:block;");

}
///------- Cfg Max Min
var cfgMaxMinModal = new bootstrap.Modal(document.getElementById("cfgMaxMinModal"));
$("#btnCfgMaxMin").click(function () {
  $('#txtMaxFail').val($('#lblMaxFail').html());
  $('#txtMinFail').val($('#lblMinFail').html());
  cfgMaxMinModal.show();
});
// Change to an async function
async function GetaxMinFailParam(series) {
  const ObjParam = { series: series, mnufunc: '3' };

  try {
    // We 'await' the ajax call so the function pauses until data returns
    const res = await $.ajax({
      url: '/AdminCfg/GetMinMaxPassFailParam',
      method: 'GET',
      data: ObjParam
    });

    // Update UI elements as you were doing
    console.log(res);
    $("#lblCfgSeries").html("B" + series);
    $("#lblCfgMnuFunc").prop("style", "display:none;");
    $("#lblMaxFail").text(res.max_fail);
    $("#lblMinFail").text(res.min_fail);

    // Return the values as an array
    return [res.max_fail, res.min_fail];
  } catch (error) {
    alert("Error fetching data");
    return [null, null]; // Return defaults on error
  }
}

$("#btnUpdateCfgMaxMin").click(function () {
  let series = $('#ddlSeries').val();
  let MaxFail = $('#txtMaxFail').val();
  let MinFail = $('#txtMinFail').val();
  if (series == null || series == '' && MaxFail == '' && MinFail == '') {
    alert("No data"); return;
  }
  if (!confirm("💾 \r Confirm update config.")) return;

  const ObjParam = {
    series: series,
    mnufunc: '3',
    max_fail: MaxFail,
    min_fail: MinFail
  };

  $.ajax({
    url: '/AdminCfg/SaveMinMaxPassFailParam',
    method: 'PUT',
    data: ObjParam,
    success: function (res) {
      alert(res.message);
      $("#lblMaxFail").html(MaxFail);
      $("#lblMinFail").html(MinFail);
      cfgMaxMinModal.hide();
      window.location.reload();
    },
    error: function () {
      alert("Error saving data");
    }
  });


});
