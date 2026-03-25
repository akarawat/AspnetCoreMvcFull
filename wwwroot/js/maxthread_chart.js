var myModal = new bootstrap.Modal(document.getElementById("loadingModal"));
let timeInterval = 3000;
const adminList = ['SAKULCHAI.P', 'SUPONG.C'];
$(document).ready(function () {
  //$('#loadingModal').modal('show');
  const params = new URLSearchParams(window.location.search);
  const series = params.get("series");
  $('#lblSeries').html("Model B" + series);
  $('#ddlSeries').val(series);
  $('#txtSerial').val(series);
  $("#BtnBoxPlot").prop("style", "display:none;");
  loadThreadCutChart();
  setBgButton(series);
  $("#spanYeildFormular").html(``);
  // Load Bar Chart
  /* ปิดชั่วคราว
  $.ajax({
    url: "/ASSPrdData/GetThreadCutSummaryChart",
    method: "GET",
    success: function (data) {
      //console.log(data);
      const labels = data.map(d => d.productionDate);
      const failCutt = data.map(d => d.fail_cutt);
      const failNormal = data.map(d => d.fail_normal);
      const totalTest = data.map(d => d.total_test);

      const ctx = document.getElementById("threadCutChart").getContext("2d");
      new Chart(ctx, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [
            {
              label: "fail_cutt",
              data: failCutt,
              backgroundColor: "#f04880",
              stack: 'stack1'
            },
            {
              label: "fail_normal",
              data: failNormal,
              backgroundColor: "#ffa600",
              stack: 'stack1'
            },
            {
              label: "total_test",
              data: totalTest,
              backgroundColor: "#309611",
              stack: 'stack1'
            }
          ]
        },
        options: {
          plugins: {
            tooltip: {
              mode: 'index',
              intersect: false
            }
          },
          responsive: true,
          interaction: {
            mode: 'index',
            intersect: false
          },
          scales: {
            x: {
              stacked: true
            },
            y: {
              stacked: true,
              beginAtZero: true
            }
          }
        }
      });
      // End Load Barchart

      // Start Load Eff Table
      if ($.fn.DataTable.isDataTable('#bindEffDataTable')) {
        $('#bindEffDataTable').DataTable().clear().destroy();
      }
      $('#bindEffDataTable').DataTable({
        data: data,
        columns: [
          {
            data: 'productionDate',
            render: function (data, type, row) {
              return `${data.split('T')[0]}`;
            }
          },
          { data: 'fail_cutt' },
          { data: 'fail_normal' },
          { data: 'total_test' },
          {
            data: 'efficiency',
            render: function (data, type, row) {
              return `${data} %`;
            } }
        ],
        paging: true,
        info: false,
        pageLength: 5
      });
      // End Load Eff Table
    }
  });
  */

  $("#lblPrdYeild").prop("style", "display:none;");
  $("#lblTotalNormalCut").prop("style", "display:none;");
  $("#lblTotalMaxCut").prop("style", "display:none;");
  $("#lblTotalClosetoCut").prop("style", "display:none;");
  $("#lblMinTotal").prop("style", "display:none;");

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

  GetaxMinFailParam();
});

function loadThreadCutChart(flagrange) {

  if (flagrange == 'W' || flagrange == 'M' || flagrange == 'HY') {
    //$('#fromDate').val(null);
    //$('#toDate').val(null);
  }
  else if (flagrange == undefined) {
    $("#criteria2").prop('checked', false);
    $("#criteria3").prop('checked', false);
    $("#criteria4").prop('checked', false);
  }

  const serial = $('#txtSerial').val();
  /*const machine = $('#ddlMachine').val();*/
  const series = $('#ddlSeries').val();
  const fromDate = $('#fromDate').val();
  const toDate = $('#toDate').val();

  $.ajax({
    type: "GET",
    url: "/ASSPrdData/GetThreadCutDashboard",
    data: {
      serial,
      /*machine,*/
      series,
      fromDate,
      toDate,
      flagrange
    },
    beforeSend: function () {
      // ✅ แสดง modal loading ก่อนส่งข้อมูล
      //$('#loadingModal').modal('show');
    },
    success: function (response) {
      // Draw Chart
      console.log(response);
      $("#lblTotalTest").html("<br/ >Total: <b>[" + response.length + "]</b>");
      let CountCutter = 0;
      let CountNormal = 0;

      response.forEach(item => {
        const cutter = parseFloat(item.maxCurrentCutter);
        const normal = parseFloat(item.maxCurrentNormal);
        const tolCutter = parseFloat(item.ToleranceCutter);
        const tolNormal = parseFloat(item.ToleranceNormal);
        if (cutter > tolCutter) {
          CountCutter++;
        }
        if (normal > tolNormal) {
          CountNormal++;
        }
      });
      $("#lblCountMaxFail").html("<br/ ><b>[" + CountCutter + "]</b>");
      $("#lblCountMinFail").html("<b>[" + CountNormal + "]</b>");

      //console.log(response.length);
      if (response[0] != null) {
        if (response[0].productionDate != null) {
          var formDt = response[0].productionDate.split('T')[0];
          var toDate = response[response.length - 1].productionDate.split('T')[0];
          //console.log(response[response.length - 1]);
          //console.log(formDt + ":" + toDate);
          //$('#fromDate').val(formDt);
          //$('#toDate').val(toDate);
        }
        drawThreadCutChart(response);


        // Draw table
        //-- Start Tables
        if ($.fn.DataTable.isDataTable('#bindDataTable')) {
          $('#bindDataTable').DataTable().clear().destroy();
        }

        // 1) Fillter data before send to DataTable
        const filteredData = response.filter(item =>
          item.productionDate_txt &&
          item.productionDate_txt.trim() !== ""
        );

        // 2) โหลดลง DataTable
        $('#bindDataTable').DataTable({
          data: filteredData,
          order: [[6, 'desc']],
          pageLength: 50,
          sort: false,
          columns: [
            {
              data: 'productionDate_txt',
              render: function (data, type, row) {
                return `${data}`;
              }
            },
            { data: 'serial' },
            {
              data: 'maxCurrentNormal',
              render: function (data, type, row) {
                let cutter = parseFloat(data);
                let cutterTol = parseFloat(row.ToleranceNormal);
                if (cutter >= cutterTol) {
                  return `<span class="text-danger">${data.toFixed(2) }</span>`;
                } else {
                  return `<span class="text-success">${data.toFixed(2) }</span>`;
                }
              }
            },
            { data: 'ToleranceNormal' },
            {
              data: 'maxCurrentCutter',
              render: function (data, type, row) {
                let cutter = parseFloat(data);
                let cutterTol = parseFloat(row.ToleranceCutter);
                if (cutter >= 5.0 && cutter < cutterTol) {
                  return `<span class="text-warning">${data.toFixed(2) }</span>`;
                } else if (cutter >= cutterTol) {
                  return `<span class="text-danger">${data.toFixed(2) }</span>`;
                } else {
                  return `<span class="text-success">${data.toFixed(2) }</span>`;
                }
              }
            },
            { data: 'ToleranceCutter' },
            { data: 'productionDate', visible: false }
          ]
        });

      }
      //-- End Tables
    },
    complete: function () {
      // ✅ ปิด modal loading หลังโหลดเสร็จ
      //$('#loadingModal').modal('hide');
    },
    error: function (xhr) {
      alert("เกิดข้อผิดพลาด: " + xhr.responseText);
    }
  });

  //GetThreadCuttDashboardOutput
  $.ajax({
    type: "GET",
    url: "/ASSPrdData/GetThreadCuttDashboardOutput",
    data: {
      serial,
      series,
      fromDate,
      toDate
    },
    beforeSend: function () {
      // ✅ แสดง modal loading ก่อนส่งข้อมูล
      //$('#loadingModal').modal('show');
    },
    success: function (response) {
      console.log(response);
      //$("#fromDate").val(response[0]);
      //$("#toDate").val(response[1]);
      var iTotal = response[2];
      $("#lblTotalTest").html("<br/ >Total: <b>" + response[2] + "</b>");

      var rPercClosetoMax = (response[3] / iTotal) * 100;
      var tClosetoCut = "";
      var msgClosetoCut = "";
      if (rPercClosetoMax >= 10) {
        $("#lblTotalClosetoCut").removeClass("text-success");
        $("#lblTotalClosetoCut").addClass("text-warning");
        tClosetoCut = " fas fa-arrow-down text-warning";
        msgClosetoCut = "→";
      } else {
        $("#lblTotalClosetoCut").removeClass("text-warning");
        
      }
      $("#lblTotalClosetoCut").html("Total close to max:<br/ > <b>" + response[3] + " [" + formatNumber(rPercClosetoMax, 2) + "%]</b>");

      var rPercMaxCut = (response[4] / iTotal) * 100;
      var tMaxCut = "";
      var msgMaxCut = "";
      if (rPercMaxCut >= 5) {
        $("#lblTotalMaxCut").removeClass("text-success");
        $("#lblTotalMaxCut").addClass("text-danger");
        tMaxCut = " fas fa-arrow-down text-danger";
        msgMaxCut = "↓";
      } else {
        $("#lblTotalMaxCut").removeClass("text-danger");
        
      }
      $("#lblTotalMaxCut").html("Total max cut:<br/ > <b>" + response[4] + " [" + formatNumber(rPercMaxCut, 2) + "%]</b>");

      var rPercNromalCut = (response[5] / iTotal) * 100;
      $("#lblTotalNormalCut").html("Total normal cut:<br/ > <b>" + response[5] + " [" + formatNumber(rPercNromalCut, 2) + "%]</b>");

      var iYield = 100 - rPercMaxCut;
      if (iYield >= 90) {
        $("#lblPrdYeild").removeClass("text-warning text-danger");
        $("#lblPrdYeild").addClass("text-success");
      } else if (iYield >= 80 && iYield < 90) {
        $("#lblPrdYeild").removeClass("text-success");
        $("#lblPrdYeild").addClass("text-warning");
      } else {
        $("#lblPrdYeild").removeClass("text-success text-warning");
        $("#lblPrdYeild").addClass("text-danger");
      }
      $("#lblPrdYeild").html("<b3>Production Yield<br/ > <b> [" + formatNumber(iYield, 2) + "%]</b></b3>");
    },
    complete: function () {
      // ✅ ปิด modal loading หลังโหลดเสร็จ
      //$('#loadingModal').modal('hide');
    },
    error: function (xhr) {
    }
  });
}
function viewThreadDataTable() {
  //$('#scatterDataTableModal').modal('show');
  var myModal = new bootstrap.Modal(document.getElementById("scatterDataTableModal"));
  myModal.show();
}
function drawThreadCutChartBak(data) {
  // กรองวันที่ไม่ซ้ำ เพื่อใช้เป็น labels (เฉพาะวันที่มีข้อมูลเท่านั้น)
  const uniqueDates = [...new Set(data.map(d => d.productionDate.split('T')[0]))];

  const cutter = data.map(d => ({
    x: d.productionDate.split('T')[0],
    y: d.maxCurrentCutter,
    serial: d.serial
  }));

  const normal = data.map(d => ({
    x: d.productionDate.split('T')[0],
    y: d.maxCurrentNormal,
    serial: d.serial
  }));

  const cutterTol = data.map(d => ({
    x: d.productionDate.split('T')[0],
    y: d.ToleranceCutter
  }));

  const normalTol = data.map(d => ({
    x: d.productionDate.split('T')[0],
    y: d.ToleranceNormal
  }));

  const ctx = document.getElementById('cutCurrentChart');
  if (window.myChartInstance) {
    window.myChartInstance.destroy(); // เคลียร์ chart เดิมก่อน
  }

  window.myChartInstance = new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: [
        {
          label: 'maxCurrentCutter',
          data: cutter,
          backgroundColor: 'orange'
        },
        {
          label: 'maxCurrentNormal',
          data: normal,
          backgroundColor: 'green'
        },
        {
          label: 'Cutter-tolerance',
          data: cutterTol,
          type: 'line',
          borderColor: 'red',
          borderWidth: 2,
          pointRadius: 0,
          tension: 0
        },
        {
          label: 'Normal-tolerance',
          data: normalTol,
          type: 'line',
          borderColor: 'blue',
          borderWidth: 2,
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
            label: (ctx) => `Serial: ${ctx.raw.serial ?? ''} | ${ctx.raw.y}`
          }
        },
        legend: {
          position: 'top'
        },
        title: {
          display: true,
          text: 'Max Thread Cut Current'
        }
      },
      scales: {
        x: {
          type: 'category', // ✅ แสดงเฉพาะค่าที่มีจริง ไม่เป็น timeline ต่อเนื่อง
          labels: uniqueDates, // ✅ เฉพาะวันที่มีข้อมูล
          title: {
            display: true,
            text: 'Date'
          }
        },
        y: {
          title: {
            display: true,
            text: '[A]'
          }
        }
      }
    }
  });
}
function drawThreadCutChart(data) {
  //console.log(data);
  // ✅ 1. เรียงลำดับข้อมูลก่อน (ascending date)
  data.sort((a, b) => new Date(a.productionDate) - new Date(b.productionDate));

  // ✅ 2. สร้าง labels ที่เรียงแล้ว
  const uniqueDates = [...new Set(data.map(d => d.productionDate.split('T')[0]))];

  // ✅ 3. สร้างชุดข้อมูลจากข้อมูลที่เรียงแล้ว
  const cutter = data.map(d => ({
    x: d.productionDate.split('T')[0],
    y: d.maxCurrentCutter,
    serial: d.serial
  }));

  const normal = data.map(d => ({
    x: d.productionDate.split('T')[0],
    y: d.maxCurrentNormal,
    serial: d.serial
  }));

  const cutterTol = data.map(d => ({
    x: d.productionDate.split('T')[0],
    y: d.ToleranceCutter
  }));

  const normalTol = data.map(d => ({
    x: d.productionDate.split('T')[0],
    y: d.ToleranceNormal
  }));
  const closeToCutter = data.map(d => ({
    x: d.productionDate.split('T')[0],
    y: d.CloseToCutter
  }));

  const ctx = document.getElementById('cutCurrentChart');
  if (window.myChartInstance) {
    window.myChartInstance.destroy(); // เคลียร์ chart เดิมก่อน
  }

  window.myChartInstance = new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: [
        {
          label: 'maxCurrentCutter',
          data: cutter,
          backgroundColor: 'orange'
        },
        {
          label: 'maxCurrentNormal',
          data: normal,
          backgroundColor: 'green'
        },
        {
          label: 'Cutter-tolerance',
          data: cutterTol,
          type: 'line',
          borderColor: 'red',
          borderWidth: 2,
          pointRadius: 0,
          tension: 0
        },
        {
          label: 'Normal-tolerance',
          data: normalTol,
          type: 'line',
          borderColor: 'blue',
          borderWidth: 2,
          pointRadius: 0,
          tension: 0
        },
        {
          label: 'Close-ToCutter',
          data: closeToCutter,
          type: 'line',
          borderColor: 'yellow',
          borderWidth: 2,
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
            label: (ctx) => `Serial: ${ctx.raw.serial ?? ''} | ${ctx.raw.y}`
          }
        },
        legend: {
          position: 'top'
        },
        title: {
          display: true,
          text: 'Max Thread Cut Current'
        }
      },
      scales: {
        x: {
          type: 'category',
          labels: uniqueDates,
          title: {
            display: true,
            text: 'Date'
          }
        },
        y: {
          title: {
            display: true,
            text: '[A]'
          }
        }
      }
    }
  });
}


// Toggle full screen
document.getElementById("toggleFullscreenBtn").addEventListener("click", function () {
  let series = $('#ddlSeries').val();
  const isFull = localStorage.getItem("isFullscreen") === "true";
  localStorage.setItem("isFullscreen", (!isFull).toString());
  // Reload เพื่อใช้ Razor Layout ใหม่
  window.location.href = "?fullscreen=" + isFull + "&series=" + series;

});


document.getElementById("btnExport").addEventListener("click", async () => {
  if (confirm("Confirm to Export")) {
    await exportToExcel();
  }
});

async function exportToExcel() {
  let flagrange = $("input[name='criteria']:checked").val();
  if (flagrange == 'W' || flagrange == 'M' || flagrange == 'HY') {
    $('#fromDate').val(null);
    $('#toDate').val(null);
  }
  else if (flagrange == undefined) {
    $("#criteria2").prop('checked', false);
    $("#criteria3").prop('checked', false);
    $("#criteria4").prop('checked', false);
  }

  // 🔥 1) อ่านค่าปฏิทินก่อน
  let serial = $('#txtSerial').val();
  let series = $('#ddlSeries').val();
  let fromDate = $('#fromDate').val();
  let toDate = $('#toDate').val();
  //console.log(fromDate + ":" + toDate); return;
  // 🔥 2) ถ้าเลือก W / M / HY → ให้ระบบกำหนดช่วงเอง แต่ไม่ลบค่าก่อนอ่าน
  //if (flagrange == 'W' || flagrange == 'M' || flagrange == 'HY') {
  //  fromDate = "";   // ปล่อยว่างให้ API จัดการ
  //  toDate = "";
  //}

  // เรียกข้อมูลจาก API
  const query = new URLSearchParams({ serial, series, fromDate, toDate, flagrange }).toString();
  console.log(query);
  const response = await fetch(`/ASSPrdData/GetThreadCutDashboard?${query}`);
  
  if (!response.ok) {
    alert("Export failed.");
    return;
  }
  
  const result = await response.json();
  console.log(result);

  const data = result;           // ✅ ดึงข้อมูล

  if (result.length == 0) {
    return;
  }

  // กำหนดแถวส่วนหัวเอง $("#start_dt").val(), $("#end_dt").val()
  const customHeaderRows = [
    [`Export Max Thread cutting Model : B${series}`],                // Row 1
    [`Date : ${fromDate} to ${toDate}`],               // Row 2
    [``]     // Row 3
  ];

  // productionDate	fail_cutt	fail_normal	total_test	efficiency
  const headerRow = [
    "Date",
    "Serial",
    "Max Normal",
    "Tol. Normal",
    "Max Cutter",
    "Tol. Cutter"
  ];

  // แปลงข้อมูล JSON เป็น Array สำหรับ export
  //const dataRows = data.map(row => [
  //  row.mas_wo,
  //  row.mas_itemno,
  //  row.mas_opr,
  //  row.mas_qty,
  //  row.rec_eff,
  //  row.create_dt
  //]);

  //rec_date, mas_wo, mas_itemno, mas_opr, mas_qty, mas_stdtime, mas_resource, mas_mc, mas_lab, emp_code, rec_setup, rec_mc, rec_lab, rec_aqty, rec_atotal, rec_eff
  const dataRows = data.map(row => [
    row.productionDate_txt,
    row.serial,
    row.maxCurrentNormal,
    row.ToleranceNormal,
    row.maxCurrentCutter,
    row.ToleranceCutter
  ]);

  // * กรณี อยากใส่ท้ายเอกสาร
  /*
  // ✅ คำนวณรวม mas_qty
  const totalQty = dataRows.reduce((sum, row) => sum + (parseFloat(row.mas_qty) || 0), 0);
  // ✅ แถว Total
  const totalRow = ["", "", "Total", totalQty, "", ""];
  */
  // ✅ แถว Total
  const totalRow = ["", "", "Total", dataRows.length, "items", ""];

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
  XLSX.utils.book_append_sheet(workbook, worksheet, "ThreadCutting");

  // บันทึกเป็นไฟล์ Excel
  XLSX.writeFile(workbook, `Max Thread cutting Model B${series}_${fromDate}_${toDate}.xlsx`);

}

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
  location.href = "/ASSPrdData/MaxThread?fullscreen=true&series=" + serial;
}

///------- Cfg Max Min
var cfgMaxMinModal = new bootstrap.Modal(document.getElementById("cfgMaxMinModal"));
$("#btnCfgMaxMin").click(function () {
  $('#txtMaxFail').val($('#lblMaxFail').html());
  $('#txtMinFail').val($('#lblMinFail').html());
  cfgMaxMinModal.show();
}); 

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
    menuno: '2',
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
  let menuno = '2';
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
          console.log(data + ":" + row.remarks);
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

function GetaxMinFailParam() {
  let series = $('#ddlSeries').val();
  const ObjParam = {
    series: series,
    mnufunc: '2'
  };

  $.ajax({
    url: '/AdminCfg/GetMinMaxPassFailParam',
    method: 'GET',
    data: ObjParam,
    success: function (res) {
      $("#lblCfgSeries").html("B" + series);
      $("#lblCfgMnuFunc").prop("style", "display:none;");
      $("#lblMaxFail").html(res.max_fail);
      $("#lblMinFail").html(res.min_fail);
    },
    error: function () {
      alert("Error saving data");
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
    mnufunc: '2',
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
    },
    error: function () {
      alert("Error saving data");
    }
  });


});
