var myModal = new bootstrap.Modal(document.getElementById("loadingModal"));
var remarkModal = new bootstrap.Modal(document.getElementById("remarkModal"));
let timeInterval = 3000;
const adminList = ['SAKULCHAI.P', 'SUPONG.C'];
async function loadmeasureChartLower(flagrange) {
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
    $("#criteria1").prop('checked', false);
    $("#criteria2").prop('checked', false);
    $("#criteria3").prop('checked', false);
    $("#criteria4").prop('checked', false);
  }
    const series = $('#ddlSeries').val();
    const dtstart = $('#fromDate').val();
    const dtend = $('#toDate').val();

    // เรียกข้อมูลจาก API
    const query = new URLSearchParams({ series, dtstart, dtend, flagrange }).toString();
  const response = await fetch(`/TTA/GetDataTTAAll?${query}`);
    const jsonData = await response.json();
    console.log(jsonData);
  //if (jsonData[0].startDate != null) {
    if (jsonData.length != 0) {
      var formDt = jsonData[0].productionDate.split('T')[0];
      var toDate = jsonData[jsonData.length - 1].productionDate.split('T')[0];
      //console.log(response[response.length - 1]);
      //console.log(formDt + ":" + toDate);
      $('#fromDate').val(formDt);
      $('#toDate').val(toDate);
    }
      //// Draw table
      ////-- Start Tables
      BindDataTable(flagrange);
      BindDataTableOffset(flagrange);
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
      x: d.startDate_txt,
      y: d.valueA,
      serial: d.serial
    }));

    const valueBDataset = jsonData.map(d => ({
      x: d.startDate_txt,
      y: d.valueB,
      serial: d.serial
    }));

    // วันที่ไม่ซ้ำและเรียงจากน้อยไปมาก
    const sortedDates = [...new Set(jsonData.map(d => d.startDate_txt))].sort((a, b) => {
      const [da, ma, ya] = a.split('-').map(Number);
      const [db, mb, yb] = b.split('-').map(Number);
      return new Date(ya, ma - 1, da) - new Date(yb, mb - 1, db);
    });

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
      .map(item => item.startDate_txt);
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
    
    const minToleranceA = sortedDates.map(date => ({ x: date, y: minA }));
    const maxToleranceA = sortedDates.map(date => ({ x: date, y: minB }));
    const minToleranceB = sortedDates.map(date => ({ x: date, y: maxA }));
    const maxToleranceB = sortedDates.map(date => ({ x: date, y: maxB }));

  // เขียน Proposal อธิบาย Modify Label Form MC. Configuration
  $("#lblSummaryTest").html("Proposal");
  $("#lblTotalTest").html("<br/><font>Date range accumulation.<br/> Total [" + validSerialDates.length + "]</font>");

  $("#lblTotalClosetoCut").prop("style", "display:none;");
  $("#lblTotalMaxCut").prop("style", "display:none;");
  $("#lblTotalNormalCut").prop("style", "display:none;");
  $("#lblPrdYeild").prop("style", "display:none;");
  $("#lblMinTotal").prop("style", "display:none;");
  $("#lblAlarmB").prop("style", "display:none;");
  $("#lblAlarmB_info").prop("style", "display:none;");
  $("#lblAlarmA").prop("style", "display:none;");
  $("#lblAlarmA_info").prop("style", "display:none;");
  
}

$(document).ready(function () {
  //$('#loadingModal').modal('show');
  const params = new URLSearchParams(window.location.search);
  const series = params.get("series");
  GetTTAAll(series);
  let flagrange = params.get("flagrange");
  if (flagrange == null) {
    flagrange = 'W';
  }

  //$("#infoCol1").prop("style", "display:none;");
  //$("#infoCol1").removeClass();

  //$("#infoCol2").prop("style", "display:none;");
  //$("#infoCol2").removeClass();

  console.log("rang: ", flagrange);
  $('#lblSeries').html("Model B" + series);
  $('#ddlSeries').val(series);
  $('#txtSerial').val(series);
  $("#BtnBoxPlot").prop("style", "display:none;");
  loadmeasureChartLower(flagrange);

  $("#spanNormalCut").html("");
  $("#spanCutMaxWarn").html("");
  $("#spanCutMaxAlarm").html("");
  $("#spanPrdYeild").html("");

  // Start Admin authen
  $("#btnCfgMaxMin").removeClass("btn btn-sm btn-secondary");
  $("#btnCfgMaxMin").prop("style", "display:none;");

  $("#btnCfgMaxMinLower").removeClass("btn btn-sm btn-secondary");
  $("#btnCfgMaxMinLower").prop("style", "display:none;");

  $("#btnCfgMaxMinHigher").removeClass("btn btn-sm btn-secondary");
  $("#btnCfgMaxMinHigher").prop("style", "display:none;");

  $("#btnCfgMaxMinHighest").removeClass("btn btn-sm btn-secondary");
  $("#btnCfgMaxMinHighest").prop("style", "display:none;");

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

        $("#btnCfgMaxMinLower").addClass("btn btn-sm btn-secondary");
        $("#btnCfgMaxMinLower").prop("style", "display:block;");

        $("#btnCfgMaxMinHigher").addClass("btn btn-sm btn-secondary");
        $("#btnCfgMaxMinHigher").prop("style", "display:block;");

        $("#btnCfgMaxMinHighest").addClass("btn btn-sm btn-secondary");
        $("#btnCfgMaxMinHighest").prop("style", "display:block;");
      }
    },
    error: function () { }
  });
  // End Admin authen

  setBgButton(series);
  //---> Man. ปิดก่อน setAlarmBgColor(series);
  
  loadTTABoxPlot('W');
  $("#criteria2").prop('checked', true);
});

// เรียก Chart เมื่อโหลดหน้า
//document.addEventListener('DOMContentLoaded', loadmeasureChartLower);

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
  location.href = "/TTA/?fullscreen=true&series=" + serial;
}

// เพิ่ม Parameter Code ตรงนี้ เช่น 1000, 2000, 3000
function GetTTAAll(series) {
  let paramcode = '1000'; // B4,B5
  if (series == '7') {
    paramcode = '2000';
  } else if (series == '4' || series == '5') {
    paramcode = '1000';
  } else if (series == '7') {
    paramcode = '3000';
  }
  $.ajax({
    type: "GET",
    url: "/TTA/GetKPIParamsByKey",
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
    url: "/TTA/GetDataTTAAll",
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
        .map(item => item.startDate_txt);
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
      //$("#lbl7DTotalTest").html("<font>7 Days Alarm.<br/> Total [" + validSerialDates.length + "]</font>");

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
  if (confirm("Confirm to Export")) {
    await exportToExcel();
    await exportToExcelOffset();
  }
});
async function BindDataTable(flagrange) {
  // อ่านค่าจาก input
  if (flagrange == '') {
    flagrange = 'D';
    //return;
  }
  if (flagrange == 'W' || flagrange == 'M' || flagrange == 'HY') {
    $('#fromDate').val(null);
    $('#toDate').val(null);
  }
  else if (flagrange == undefined) {
    $("#criteria1").prop('checked', false);
    $("#criteria2").prop('checked', false);
    $("#criteria3").prop('checked', false);
    $("#criteria4").prop('checked', false);
  }
  const series = $('#ddlSeries').val();
  const dtstart = $('#fromDate').val();
  const dtend = $('#toDate').val();

  // เรียกข้อมูลจาก API
  const query = new URLSearchParams({ series, dtstart, dtend, flagrange }).toString();
  const response = await fetch(`/TTA/GetDataTTAAllExcel?${query}`);

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
      { data: 'productionDate_txt' },
      { data: 'serial' },
      { data: 'modelname' },
      { data: 'CDPdiff' },
      { data: 'CDPlower' },
      { data: 'CDPhigher' },
      { data: 'CDPhighest' }
    ]
  });
  //-- End Tables
  return;
}
async function BindDataTableOffset(flagrange) {
  // อ่านค่าจาก input
  if (flagrange == '') {
    flagrange = 'D';
    //return;
  }
  if (flagrange == 'W' || flagrange == 'M' || flagrange == 'HY') {
    $('#fromDate').val(null);
    $('#toDate').val(null);
  }
  else if (flagrange == undefined) {
    $("#criteria1").prop('checked', false);
    $("#criteria2").prop('checked', false);
    $("#criteria3").prop('checked', false);
    $("#criteria4").prop('checked', false);
  }
  const series = $('#ddlSeries').val();
  const dtstart = $('#fromDate').val();
  const dtend = $('#toDate').val();

  // เรียกข้อมูลจาก API
  const query = new URLSearchParams({ series, dtstart, dtend, flagrange }).toString();
  const response = await fetch(`/TTA/GetDataTTAOFfsetAllExcel?${query}`);

  if (!response.ok) {
    alert("Get data failed.");
    return;
  }

  const result = await response.json();
  const data = result;           // ✅ ดึงข้อมูล
  if (data.length == 0) {
    return;
  }
  // Draw table
  //-- Start Tables
  if ($.fn.DataTable.isDataTable('#bindDataTableOffset')) {
    $('#bindDataTableOffset').DataTable().clear().destroy();
  }
  $('#bindDataTableOffset').DataTable({
    data: data,
    order: [[0, 'desc']],
    pageLength: 50,
    sort: false,
    columns: [
      { data: 'productionDate_txt' },
      { data: 'serial' },
      { data: 'modelname' },
      { data: 'OFSLow' },
      { data: 'OFShigher' },
      { data: 'OFShighest' }
    ]
  });
  //-- End Tables
  return;
}
async function exportToExcel(flagrange) {
  let model_code = "TTA Export " + $("#lblSeries").html();
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
    flagrange = 'D';
    //return;
  }
  if (flagrange == 'W' || flagrange == 'M' || flagrange == 'HY') {
    $('#fromDate').val(null);
    $('#toDate').val(null);
  }
  else if (flagrange == undefined) {
    $("#criteria1").prop('checked', false);
    $("#criteria2").prop('checked', false);
    $("#criteria3").prop('checked', false);
    $("#criteria4").prop('checked', false);
  }
  const series = $('#ddlSeries').val();
  const dtstart = $('#fromDate').val();
  const dtend = $('#toDate').val();

  // เรียกข้อมูลจาก API
  const query = new URLSearchParams({ series, dtstart, dtend, flagrange }).toString();
  const response = await fetch(`/TTA/GetDataTTAAllExcel?${query}`);

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
    "Date",
    "Serial",
    "Model",
    "Diff",
    "Lower",
    "Higher",
    "Highest"
  ];
// แปลงข้อมูล JSON เป็น Array สำหรับ export
  const dataRows = data.map(row => [
    row.productionDate_txt,
    row.serial,
    row.modelname,
    row.CDPdiff,
    row.CDPlower,
    row.CDPhigher,
    row.CDPhighest
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
  XLSX.utils.book_append_sheet(workbook, worksheet, "ThreadTension");

  // บันทึกเป็นไฟล์ Excel
  XLSX.writeFile(workbook, `${model_code} ${txt_date_st}_${txt_end_dt}.xlsx`);
}

async function exportToExcelOffset(flagrange) {
  let model_code = "TTA Offset Export " + $("#lblSeries").html();
  let txt_date_st = $("#fromDate").val().slice(-2) + '-' + $("#fromDate").val().slice(5, 7) + '-' + $("#fromDate").val().slice(0, 4);
  let txt_end_dt = $("#toDate").val().slice(-2) + '-' + $("#toDate").val().slice(5, 7) + '-' + $("#toDate").val().slice(0, 4);
  //const query = new URLSearchParams({
  //  dt_st: $("#fromDate").val(),
  //  dt_en: $("#toDate").val()
  //});
  //console.log(query.toString());
  //return;

  // อ่านค่าจาก input
  if (flagrange == '') {
    flagrange = 'D';
    //return;
  }
  if (flagrange == 'W' || flagrange == 'M' || flagrange == 'HY') {
    $('#fromDate').val(null);
    $('#toDate').val(null);
  }
  else if (flagrange == undefined) {
    $("#criteria1").prop('checked', false);
    $("#criteria2").prop('checked', false);
    $("#criteria3").prop('checked', false);
    $("#criteria4").prop('checked', false);
  }
  const series = $('#ddlSeries').val();
  const dtstart = $('#fromDate').val();
  const dtend = $('#toDate').val();

  // เรียกข้อมูลจาก API
  const query = new URLSearchParams({ series, dtstart, dtend, flagrange }).toString();
  const response = await fetch(`/TTA/GetDataTTAOFfsetAllExcel?${query}`);

  if (!response.ok) {
    alert("Export failed.");
    return;
  }

  const result = await response.json();
  const data = result;           // ✅ ดึงข้อมูล
  if (data.length == 0) {
    return;
  }
  const customHeaderRows = [
    [`Export By: ${model_code}`],                // Row 1
    [`Date : ${txt_date_st} to ${txt_end_dt}`],               // Row 2
    [``]     // Row 3
  ];
  // กำหนดชื่อคอลัมน์ Excel (Row 4)
  const headerRow = [
    "Date",
    "Serial",
    "Model",
    "Lower",
    "Higher",
    "Highest"
  ];
  // แปลงข้อมูล JSON เป็น Array สำหรับ export
  const dataRows = data.map(row => [
    row.productionDate_txt,
    row.serial,
    row.modelname,
    row.OFSLow,
    row.OFShigher,
    row.OFShighest
  ]);
  // ✅ แถว Total
  const totalRow = ["", "", "Total", dataRows.length, "Items", ""];

  // รวมทั้งหมด
  const finalSheetData = [
    ...customHeaderRows,
    headerRow,
    ...dataRows,
    totalRow  // ✅ ใส่ท้ายสุด
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(finalSheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "OffsetDataThreadTension");
  XLSX.writeFile(workbook, `${model_code} ${txt_date_st}_${txt_end_dt}.xlsx`);
}


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
    menuno: '7',
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
  let menuno = '7';
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
            <i id="btnItemEdit" class="ri-save-3-fill text-success" onclick="javascript:EditItem('${data}','${row.remarks}');" style="cursor:pointer; font-size: 24px;" title='Edit'></i>
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
function EditItem(trid, remarks) {
  $("#btnAddRemark").removeClass("btn btn-success mt-2");
  $("#btnAddRemark").prop("style", "display:none;");

  $("#btnUpdateRemark").addClass("btn btn-info mt-2");
  $("#btnUpdateRemark").prop("style", "display:block;");
  
  $('#trid').val(trid);
  $('#txtRemark').val(remarks);
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

///------- Cfg Max Min
var cfgMaxMinModal = new bootstrap.Modal(document.getElementById("cfgMaxMinModal"));
$("#btnCfgMaxMin").click(function () {
  //$('#txtMaxFail').val($('#lblMaxFail').html());
  //$('#txtMinFail').val($('#lblMinFail').html());
  //cfgMaxMinModal.show();
});
function SetMaxMinParameter(flag) {
  if (flag == 'Diff') {
    $("#hidParam_1").val('ttadiff');
    $("#lblParam_1").text(" Diff Max Fail");

    $('#txtMaxFail').val($('#lblMaxFail').html());
    $('#txtMinFail').val($('#lblMinFail').html());
  } else if (flag == 'Lower') {
    $("#hidParam_1").val('ttalower');
    $("#lblParam_1").text(" Lower Max Fail");

    $('#txtMaxFail').val($('#lblMaxFailLower').html());
    $('#txtMinFail').val($('#lblMinFailLower').html());
  } else if (flag == 'Higher') {
    $("#hidParam_1").val('ttahigher');
    $("#lblParam_1").text(" Higher Max Fail");

    $('#txtMaxFail').val($('#lblMaxFailHigher').html());
    $('#txtMinFail').val($('#lblMinFailHigher').html());
  } else if (flag == 'Highest') {
    $("#hidParam_1").val('ttahighest');
    $("#lblParam_1").text(" Highest Max Fail");

    $('#txtMaxFail').val($('#lblMaxFailHighest').html());
    $('#txtMinFail').val($('#lblMinFailHighest').html());
  }
  
  cfgMaxMinModal.show();
}
function GetaxMinFailParam() {
  let series = $('#ddlSeries').val();
  const ObjParam = {
    series: series,
    mnufunc: '7'
  };

  $.ajax({
    url: '/AdminCfg/GetTTAMinMaxPassFailParam',
    method: 'GET',
    data: ObjParam,
    success: function (res) {
      console.log(res);
      $("#lblCfgSeries").html("B" + series);
      $("#lblCfgSeriesLower").html("B" + series);
      $("#lblCfgSeriesHigher").html("B" + series);
      $("#lblCfgSeriesHighest").html("B" + series);
      $("#lblCfgMnuFunc").prop("style", "display:none;");

      $("#lblMaxFail").html(res.max_fail);
      $("#lblMinFail").html(res.min_fail);

      $("#lblMaxFailLower").html(res.max_failLower);
      $("#lblMinFailLower").html(res.min_failLower);

      $("#lblMaxFailHigher").html(res.max_failHigher);
      $("#lblMinFailHigher").html(res.min_failHigher);

      $("#lblMaxFailHighest").html(res.max_failHighest);
      $("#lblMinFailHighest").html(res.min_failHighest);

    },
    error: function () {
      alert("Error getting data");
    }
  });
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
    mnufunc: '7',
    param_1: $("#hidParam_1").val(),
    max_fail: MaxFail,
    min_fail: MinFail
  };

  $.ajax({
    url: '/AdminCfg/SaveMinMaxPassFailParamTTA',
    method: 'PUT',
    data: ObjParam,
    success: function (res) {
      alert(res.message);
      $("#lblMaxFail").html(MaxFail);
      $("#lblMinFail").html(MinFail);
      cfgMaxMinModal.hide();
      loadTTABoxPlot("W");
    },
    error: function () {
      alert("Error saving data");
    }
  });
});

let boxWidth = 800;
let boxHigh = 300;
async function loadTTABoxPlot(flagrange) {
  GetaxMinFailParam();
  //const fromDate = $('#fromDate').val();
  //const toDate = $('#toDate').val();
  //const flagrange = $('input[name="criteria"]:checked').val() ?? '';
  
  const series = $('#ddlSeries').val();
  const fromDate = $('#fromDate').val();
  const toDate = $('#toDate').val();
  // อ่านค่าจาก input
  if (flagrange == '') {
    flagrange = 'D';
    boxWidth = 450;
    boxHigh = 100;

    //const boxW = 450, boxH = 300;

    //["#ttaBoxPlotChart", "#ttaLowBoxPlotChart", "#ttaHierBoxPlotChart", "#ttaHiesBoxPlotChart"]
    //  .forEach(sel => {
    //    $(sel).attr({ width: boxW, height: boxH }).css({ width: boxW, height: boxH });
    //  });

    //return;
  }
  if (flagrange == 'W' || flagrange == 'M' || flagrange == 'HY') {
    $('#fromDate').val(null);
    $('#toDate').val(null);
    boxWidth = 0;
    boxHigh = 0;

  }
  else if (flagrange == undefined) {
    $("#criteria1").prop('checked', false);
    $("#criteria2").prop('checked', false);
    $("#criteria3").prop('checked', false);
    $("#criteria4").prop('checked', false);
  }

  //#DIFF
  
  const queryDiff = new URLSearchParams({
    series, criteria:'Dif', fromDate, toDate, flagrange
  }).toString();
  console.log(queryDiff);
  const responseDiff = await fetch(`/TTA/GetTTABoxPlot?${queryDiff}`);
  const dataDiff = await responseDiff.json();
  console.log("BoxPlotData:", dataDiff);
  drawTTABoxPlot(dataDiff, boxWidth, boxHigh);

  //#LOW
  const queryLow = new URLSearchParams({
    series, criteria:'Low', fromDate, toDate, flagrange
  }).toString();
  const responseLow = await fetch(`/TTA/GetTTABoxPlot?${queryLow}`);
  const dataLow = await responseLow.json();
  //console.log("BoxPlotData:", dataLow);
  drawTTALowBoxPlot(dataLow, boxWidth, boxHigh);
  //#LOW OFFSET
  const queryLowOff = new URLSearchParams({
    series, criteria: 'Low', fromDate, toDate, flagrange
  }).toString();
  const responseLowOff = await fetch(`/TTA/GetTTABoxPlotOffset?${queryLowOff}`);
  const dataLowOff = await responseLowOff.json();
  drawTTALowOffBoxPlot(dataLowOff, boxWidth, boxHigh);

  //#HIER
  const queryHier = new URLSearchParams({
    series, criteria:'High', fromDate, toDate, flagrange
  }).toString();
  const responseHier = await fetch(`/TTA/GetTTABoxPlot?${queryHier}`);
  const dataHier = await responseHier.json();
  //console.log("BoxPlotData:", dataHier);
  drawTTAHierBoxPlot(dataHier, boxWidth, boxHigh);
  //#HIER OFFSET
  const queryHierOff = new URLSearchParams({
    series, criteria: 'High', fromDate, toDate, flagrange
  }).toString();
  const responseHierOff = await fetch(`/TTA/GetTTABoxPlotOffset?${queryHierOff}`);
  const dataHierOff = await responseHierOff.json();
  drawTTAHierOffBoxPlot(dataHierOff, boxWidth, boxHigh);

  //#HIES
  const queryHies = new URLSearchParams({
    series, criteria: 'Hies', fromDate, toDate, flagrange
  }).toString();
  const responseHies = await fetch(`/TTA/GetTTABoxPlot?${queryHies}`);
  const dataHies = await responseHies.json();
  //console.log("BoxPlotData:", dataHier);
  drawTTAHiesBoxPlot(dataHies, boxWidth, boxHigh);
  //#HIES OFFSET
  const queryHiesOff = new URLSearchParams({
    series, criteria: 'Hies', fromDate, toDate, flagrange
  }).toString();
  const responseHiesOff = await fetch(`/TTA/GetTTABoxPlotOffset?${queryHiesOff}`);
  const dataHiesOff = await responseHiesOff.json();
  //console.log("BoxPlotData:", dataHier);
  drawTTAHiesOffBoxPlot(dataHiesOff, boxWidth, boxHigh);

}

let ttaChart;
function drawTTABoxPlot(data) {

  const min_limit = parseInt($("#lblMinFail").html());
  const max_limit = parseInt($("#lblMaxFail").html());
  console.log(min_limit + ":" + max_limit);
  const labels = data.map(d =>
    new Date(d.LogDay).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    })
  );

  const dataset = data.map(d => ({
    min: d.Min,
    q1: d.Q1,
    median: d.Median,
    q3: d.Q3,
    max: d.Max
  }));

  /* ===============================
     Highlight Logic
  =============================== */
  const boxColors = dataset.map(v => {
    const isFail = v.max > max_limit || v.min < min_limit;

    return isFail
      ? 'rgba(255, 99, 132, 0.55)'   // 🔴 FAIL
      : 'rgba(0, 128, 255, 0.45)';  // 🔵 PASS
  });

  // หาค่า Min/Max จาก dataset
  const globalMin = Math.min(...dataset.map(x => x.min));
  const globalMax = Math.max(...dataset.map(x => x.max));
  let margin = min_limit;
  // เพิ่ม margin
  let marginMin = 0;
  if (globalMin < margin) {
    marginMin = globalMin - 10;
  } else {
    marginMin = min_limit - 10;
  }
  const yMin = marginMin;
  const yMax = globalMax + 10;//+ (margin + 20);

  if (ttaChart) {
    ttaChart.destroy();
    ttaChart = null;
  }

  const ctx = document.getElementById('ttaBoxPlotChart');

  ttaChart = new Chart(ctx, {
    data: {
      labels,
      datasets: [
        /* ================= Boxplot ================= */
        {
          type: 'boxplot',
          label: 'Diff Value',
          data: dataset,
          borderColor: 'black',
          backgroundColor: boxColors
        },

        /* ================= Min Limit ================= */
        {
          type: 'line',
          label: 'Min Limit (' + $("#lblMinFail").html() +')',
          data: labels.map(() => min_limit),
          borderColor: 'rgba(255, 159, 64, 0.9)',
          borderDash: [6, 6],
          borderWidth: 2,
          pointRadius: 0
        },

        /* ================= Max Limit ================= */
        {
          type: 'line',
          label: 'Max Limit (' + $("#lblMaxFail").html() +')',
          data: labels.map(() => max_limit),
          
          borderColor: 'rgba(255, 99, 132, 0.9)',
          borderDash: [6, 6],
          borderWidth: 2,
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          callbacks: {
            afterBody: (ctx) => {
              const v = ctx[0].raw;
              const fail = v.max > max_limit || v.min < min_limit;
              return fail ? '⚠️ Out of Spec' : '✔ In Spec';
            }
          }
        }
      },
      scales: {
        y: {
          min: yMin,
          max: yMax,
          title: {
            display: true,
            text: 'TTA Diff Value'
          }
        }
      }
    }
  });
}
let ttaLowChart;
function drawTTALowBoxPlot(data) {

  const min_limit = parseInt($("#lblMinFailLower").html());
  const max_limit = parseInt($("#lblMaxFailLower").html());

  const labels = data.map(d =>
    new Date(d.LogDay).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    })
  );

  const dataset = data.map(d => ({
    min: d.Min,
    q1: d.Q1,
    median: d.Median,
    q3: d.Q3,
    max: d.Max
  }));

  /* ===============================
     Highlight Logic
  =============================== */
  const boxColors = dataset.map(v => {
    const isFail = v.max > max_limit || v.min < min_limit;

    return isFail
      ? 'rgba(255, 99, 132, 0.55)'   // 🔴 FAIL
      : 'rgba(0, 128, 255, 0.45)';  // 🔵 PASS
  });

  // หาค่า Min/Max จาก dataset
  const globalMin = Math.min(...dataset.map(x => x.min));
  const globalMax = Math.max(...dataset.map(x => x.max));

  // เพิ่ม margin
  const margin = min_limit;
  const yMin = globalMin - (margin + 20);
  const yMax = globalMax + (margin + 20);

  if (ttaLowChart) {
    ttaLowChart.destroy();
    ttaLowChart = null;
  }

  const ctx = document.getElementById('ttaLowBoxPlotChart');

  ttaLowChart = new Chart(ctx, {
    data: {
      labels,
      datasets: [
        /* ================= Boxplot ================= */
        {
          type: 'boxplot',
          label: 'Lower Value',
          data: dataset,
          borderColor: 'black',
          backgroundColor: boxColors
        },

        /* ================= Min Limit ================= */
        {
          type: 'line',
          label: 'Min Limit (' + $("#lblMinFailLower").html() +')',
          data: labels.map(() => min_limit),
          borderColor: 'rgba(255, 159, 64, 0.9)',
          borderDash: [6, 6],
          borderWidth: 2,
          pointRadius: 0
        },

        /* ================= Max Limit ================= */
        {
          type: 'line',
          label: 'Max Limit (' + $("#lblMaxFailLower").html() +')',
          data: labels.map(() => max_limit),
          borderColor: 'rgba(255, 99, 132, 0.9)',
          borderDash: [6, 6],
          borderWidth: 2,
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          callbacks: {
            afterBody: (ctx) => {
              const v = ctx[0].raw;
              const fail = v.max > max_limit || v.min < min_limit;
              return fail ? '⚠️ Out of Spec' : '✔ In Spec';
            }
          }
        }
      },
      scales: {
        y: {
          min: yMin,
          max: yMax,
          title: {
            display: true,
            text: 'TTA Lower Value'
          }
        }
      }
    }
  });
}


let ttaLowOffChart;
function drawTTALowOffBoxPlot(data) {
  const labels = data.map(d =>
    new Date(d.LogDay).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    })
  );

  const dataset = data.map(d => ({
    min: d.Min,
    q1: d.Q1,
    median: d.Median,
    q3: d.Q3,
    max: d.Max
  }));

  // หาค่า Min/Max จาก dataset
  const globalMin = Math.min(...dataset.map(x => x.min));
  const globalMax = Math.max(...dataset.map(x => x.max));

  // เพิ่ม margin
  const margin = 10;
  const yMin = globalMin - margin;
  const yMax = globalMax + margin;

  if (ttaLowOffChart) ttaLowOffChart.destroy();

  const ctx = document.getElementById('ttaLowOffBoxPlotChart');

  ttaLowOffChart = new Chart(ctx, {
    type: 'boxplot',
    data: {
      labels,
      datasets: [{
        label: 'Lower Offset',
        data: dataset,
        borderColor: 'black',
        backgroundColor: 'rgba(127, 187, 130, 0.4)'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          min: yMin,
          max: yMax,
          title: {
            display: true,
            //text: 'TTA Lower Value'
          }
        }
      }
    }
  });

}

let ttaHierChart;
function drawTTAHierBoxPlot(data) {

  const min_limit = parseInt($("#lblMinFailHigher").html());
  const max_limit = parseInt($("#lblMaxFailHigher").html());

  const labels = data.map(d =>
    new Date(d.LogDay).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    })
  );

  const dataset = data.map(d => ({
    min: d.Min,
    q1: d.Q1,
    median: d.Median,
    q3: d.Q3,
    max: d.Max
  }));

  /* ===============================
     Highlight Logic
  =============================== */
  const boxColors = dataset.map(v => {
    const isFail = v.max > max_limit || v.min < min_limit;

    return isFail
      ? 'rgba(255, 99, 132, 0.55)'   // 🔴 FAIL
      : 'rgba(0, 128, 255, 0.45)';  // 🔵 PASS
  });

  // หาค่า Min/Max จาก dataset
  const globalMin = Math.min(...dataset.map(x => x.min));
  const globalMax = Math.max(...dataset.map(x => x.max));

  // เพิ่ม margin
  const margin = min_limit;
  const yMin = globalMin - (margin + 20);
  const yMax = globalMax + (margin + 20);

  if (ttaHierChart) {
    ttaHierChart.destroy();
    ttaHierChart = null;
  }

  const ctx = document.getElementById('ttaHierBoxPlotChart');

  ttaHierChart = new Chart(ctx, {
    data: {
      labels,
      datasets: [
        /* ================= Boxplot ================= */
        {
          type: 'boxplot',
          label: 'Higher Value',
          data: dataset,
          borderColor: 'black',
          backgroundColor: boxColors
        },

        /* ================= Min Limit ================= */
        {
          type: 'line',
          label: 'Min Limit (' + $("#lblMinFailHigher").html() +')',
          data: labels.map(() => min_limit),
          borderColor: 'rgba(255, 159, 64, 0.9)',
          borderDash: [6, 6],
          borderWidth: 2,
          pointRadius: 0
        },

        /* ================= Max Limit ================= */
        {
          type: 'line',
          label: 'Max Limit (' + $("#lblMaxFailHigher").html() +')',
          data: labels.map(() => max_limit),
          borderColor: 'rgba(255, 99, 132, 0.9)',
          borderDash: [6, 6],
          borderWidth: 2,
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          callbacks: {
            afterBody: (ctx) => {
              const v = ctx[0].raw;
              const fail = v.max > max_limit || v.min < min_limit;
              return fail ? '⚠️ Out of Spec' : '✔ In Spec';
            }
          }
        }
      },
      scales: {
        y: {
          min: yMin,
          max: yMax,
          title: {
            display: true,
            text: 'TTA Higher Value'
          }
        }
      }
    }
  });
}

let ttaHierOffChart;
function drawTTAHierOffBoxPlot(data) {
  const labels = data.map(d =>
    new Date(d.LogDay).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    })
  );

  const dataset = data.map(d => ({
    min: d.Min,
    q1: d.Q1,
    median: d.Median,
    q3: d.Q3,
    max: d.Max
  }));

  // หาค่า Min/Max จาก dataset
  const globalMin = Math.min(...dataset.map(x => x.min));
  const globalMax = Math.max(...dataset.map(x => x.max));

  // เพิ่ม margin
  const margin = 10;
  const yMin = globalMin - margin;
  const yMax = globalMax + margin;

  if (ttaHierOffChart) ttaHierOffChart.destroy();

  const ctx = document.getElementById('ttaHierOffBoxPlotChart');

  ttaHierOffChart = new Chart(ctx, {
    type: 'boxplot',
    data: {
      labels,
      datasets: [{
        label: 'Higher Offset',
        data: dataset,
        borderColor: 'black',
        backgroundColor: 'rgba(127, 187, 130, 0.4)'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          min: yMin,
          max: yMax,
          title: {
            display: true,
            //text: 'TTA Hier Value'
          }
        }
      }
    }
  });

}

let ttaHiesChart;
function drawTTAHiesBoxPlot(data) {

  const min_limit = parseInt($("#lblMinFailHighest").html());
  const max_limit = parseInt($("#lblMaxFailHighest").html());

  const labels = data.map(d =>
    new Date(d.LogDay).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    })
  );

  const dataset = data.map(d => ({
    min: d.Min,
    q1: d.Q1,
    median: d.Median,
    q3: d.Q3,
    max: d.Max
  }));

  /* ===============================
     Highlight Logic
  =============================== */
  const boxColors = dataset.map(v => {
    const isFail = v.max > max_limit || v.min < min_limit;

    return isFail
      ? 'rgba(255, 99, 132, 0.55)'   // 🔴 FAIL
      : 'rgba(0, 128, 255, 0.45)';  // 🔵 PASS
  });

  // หาค่า Min/Max จาก dataset
  const globalMin = Math.min(...dataset.map(x => x.min));
  const globalMax = Math.max(...dataset.map(x => x.max));

  // เพิ่ม margin
  const margin = min_limit;
  const yMin = globalMin - (margin + 20);
  const yMax = globalMax + (margin + 20);

  if (ttaHiesChart) {
    ttaHiesChart.destroy();
    ttaHiesChart = null;
  }

  const ctx = document.getElementById('ttaHiesBoxPlotChart');

  ttaHiesChart = new Chart(ctx, {
    data: {
      labels,
      datasets: [
        /* ================= Boxplot ================= */
        {
          type: 'boxplot',
          label: 'Highest Value',
          data: dataset,
          borderColor: 'black',
          backgroundColor: boxColors
        },

        /* ================= Min Limit ================= */
        {
          type: 'line',
          label: 'Min Limit (' + $("#lblMinFailHighest").html() +')',
          data: labels.map(() => min_limit),
          borderColor: 'rgba(255, 159, 64, 0.9)',
          
          borderDash: [6, 6],
          borderWidth: 2,
          pointRadius: 0
        },

        /* ================= Max Limit ================= */
        {
          type: 'line',
          label: 'Max Limit (' + $("#lblMaxFailHighest").html() +')',
          data: labels.map(() => max_limit),
          borderColor: 'rgba(255, 99, 132, 0.9)',
          
          borderDash: [6, 6],
          borderWidth: 2,
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          callbacks: {
            afterBody: (ctx) => {
              const v = ctx[0].raw;
              const fail = v.max > max_limit || v.min < min_limit;
              return fail ? '⚠️ Out of Spec' : '✔ In Spec';
            }
          }
        }
      },
      scales: {
        y: {
          min: yMin,
          max: yMax,
          title: {
            display: true,
            text: 'TTA Highest Value'
          }
        }
      }
    }
  });
}
let ttaHiesOffChart;
function drawTTAHiesOffBoxPlot(data) {
  const labels = data.map(d =>
    new Date(d.LogDay).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    })
  );

  const dataset = data.map(d => ({
    min: d.Min,
    q1: d.Q1,
    median: d.Median,
    q3: d.Q3,
    max: d.Max
  }));

  // หาค่า Min/Max จาก dataset
  const globalMin = Math.min(...dataset.map(x => x.min));
  const globalMax = Math.max(...dataset.map(x => x.max));

  // เพิ่ม margin
  const margin = 10;
  const yMin = globalMin - margin;
  const yMax = globalMax + margin;

  if (ttaHiesOffChart) ttaHiesOffChart.destroy();

  const ctx = document.getElementById('ttaHiestOffBoxPlotChart');

  ttaHiesOffChart = new Chart(ctx, {
    type: 'boxplot',
    data: {
      labels,
      datasets: [{
        label: 'Higest Offset',
        data: dataset,
        borderColor: 'black',
        backgroundColor: 'rgba(127, 187, 130, 0.4)'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          min: yMin,
          max: yMax,
          title: {
            display: true,
            //text: 'TTA Higest Value'
          }
        }
      }
    }
  });

}
let dataToggle = false;
function showToggleData() {
  if (dataToggle === false) {
    dataToggle = true;
    document.getElementById("rawDataTable").style.display = "block";
    $("#btnDataToggle").text("HIDE DATA");
  } else {
    dataToggle = false;
    document.getElementById("rawDataTable").style.display = "none";
    $("#btnDataToggle").text("VIEW DATA");
  }
}
