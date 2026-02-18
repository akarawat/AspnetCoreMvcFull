var loadingModal = new bootstrap.Modal(document.getElementById("loadingModal"));
$(document).ready(function () {
  loadingModal.show();
  // Date Init
  var d = new Date();
  //var dtSt = new Date(d.getFullYear() - 1, d.getMonth() + 1, d.getDate()); // November 2, 2014
  //var dtEn = new Date(d.getFullYear(), d.getMonth() + 1, d.getDate()); // November 11, 2014
  var curmm = (d.getMonth() + 1);
  var txtcurmm = "";
  if (curmm <= 9) { txtcurmm = "0" + curmm.toString(); }
  else { txtcurmm = curmm.toString(); }
  var dtSt = "" + d.getFullYear() - 1 + "-" + txtcurmm + "-" + d.getDate() + "";
  var dtEn = "" + d.getFullYear() + "-" + txtcurmm + "-" + d.getDate() + "";
  console.log(dtSt);
  console.log(dtEn);
  $("#dateStart").val(dtSt);
  $("#dateEnd").val(dtEn);

  // Start Chart
  let arrdt = [];
  let arrnordata = [];
  let arraftdata = [];
  let arrbfodata = [];
  let arrrpm = [];
  var ObjData = {
    txtStDate: null,
    txtEnDate: null
  }
  $.ajax({
    type: "POST",
    data: ObjData,
    url: '/ASSPrdData/GetSocleMainDrive',
    
    success: function (data) {
      RenderData(data);
      setInterval(loadingModal.hide(), 3000);
    },
    error: function (xhr, status, error) {
      console.error("เกิดข้อผิดพลาด:", error);
    }
  });
  

});

$("#dateStart").on("change", function () {
  var start_date = moment($(this).val()).format('YYYY-MM-DD');
});
$("#dateEnd").on("change", function () {
  var end_date = moment($(this).val()).format('YYYY-MM-DD');
});

let myChartInstance = null; // ตัวแปรเก็บ Chart instance
function RenderData(data) {
  
  console.log("ผลลัพธ์จาก Controller:", data);
  // ใช้งาน data ได้ตามต้องการ เช่นแสดงใน ChartJS

  // ข้อมูลหลัก: มี 3 Label และในแต่ละ Label มี Method A-F
  // ---> Pilot
  const methodDataAll = data;

  /*
  const methodDataAll = [
    [ // Label 1
      { snlabel: '990 61797183x', method: '0RPM100', value: 1.8 },
      { snlabel: '990 61797183x', method: '0RPM900', value: 1.7 },
      { snlabel: '990 61797183x', method: '0RPM1200', value: 1.27 },
      { snlabel: '990 61797183x', method: '1RPM100', value: 1.52 },
      { snlabel: '990 61797183x', method: '1RPM900', value: 2.45 },
      { snlabel: '990 61797183x', method: '1RPM1200', value: 2.46 }
    ],
    [ // Label 2
      { snlabel: '990 61797182', method: '0RPM100', value: 2.04 },
      { snlabel: '990 61797182', method: '0RPM900', value: 1.91 },
      { snlabel: '990 61797182', method: '0RPM1200', value: 1.41 },
      { snlabel: '990 61797182', method: '1RPM100', value: 1.69 },
      { snlabel: '990 61797182', method: '1RPM900', value: 2.53 },
      { snlabel: '990 61797182', method: '1RPM1200', value: 2.79 }
    ],
    [ // Label 3
      { snlabel: '990 61797181', method: '0RPM100', value: 1.78 },
      { snlabel: '990 61797181', method: '0RPM900', value: 1.68 },
      { snlabel: '990 61797181', method: '0RPM1200', value: 1.26 },
      { snlabel: '990 61797181', method: '1RPM100', value: 1.62 },
      { snlabel: '990 61797181', method: '1RPM900', value: 2.69 },
      { snlabel: '990 61797181', method: '1RPM1200', value: 2.8 }
    ],
    [ // Label 4
      { snlabel: '990 61797180', method: '0RPM100', value: 1.08 },
      { snlabel: '990 61797180', method: '0RPM900', value: 1.58 },
      { snlabel: '990 61797180', method: '0RPM1200', value: 1.36 },
      { snlabel: '990 61797180', method: '1RPM100', value: 1.02 },
      { snlabel: '990 61797180', method: '1RPM900', value: 2.99 },
      { snlabel: '990 61797180', method: '1RPM1200', value: 2.7 }
    ]
  ];
  */

  //console.log(methodDataAll);
  const methodColors = {
    '0RPM100': '#abebc6',
    '0RPM900': '#82e0aa',
    '0RPM1200': '#2ecc71',
    '1RPM100': '#edbb99',
    '1RPM900': '#e59866',
    '1RPM1200': '#dc7633'
  };

  const labels = [];// = ['990 61797183x', '990 61797182', '990 61797181', '990 61797180'];

  // รวมข้อมูลทั้งหมดเข้า dataset เดียว และแยกสีตาม Method
  const methodPoints = {}; // group by method

  methodDataAll.forEach((set, labelIndex) => {
    let newSn = '';
    set.forEach((item) => {
      if (!methodPoints[item.method]) methodPoints[item.method] = [];
      let hook = item.method.substr(0, 1);
      let posx = 0;
      if (hook == 0) {
        posx = labelIndex + 1 + (0) * 0.2; // jitter กำหนดตำแหน่ง
      } else {
        posx = labelIndex + 1 + (0.5) * 0.2; // jitter กำหนดตำแหน่ง
      }

      methodPoints[item.method].push({
        x: posx,
        y: item.value,
        label: item.snlabel,
        label_conc: item.snlabel + '#'
        //label: labels[labelIndex]
      });
      if (newSn == '') {
        newSn = item.snlabel;
        labels.push(item.snlabel);
      }
    });
    newSn = '';
  });

  const datasets = Object.entries(methodPoints).map(([method, data]) => ({
    label: method,
    data: data,
    backgroundColor: methodColors[method],
    pointRadius: 3,
    datalabels: {
      align: 'top',
      font: { size: 10 },
      //formatter: (v) => `${method.split(' ')[1]}: ${v.y.toFixed(1)}`
      formatter: (v) => `${v.y.toFixed(1)}`
    }
  }));

  //const ctx = document.getElementById('myChart');
  const ctx = document.getElementById('myChart');
  if (myChartInstance) {
    myChartInstance.destroy();
  }
  myChartInstance = new Chart(ctx, {

    type: 'scatter',
    data: { datasets },
    options: {
      // #Tooltips plugin เดิม ที่แสดงเฉพาะ Label กับ X,Y
      //plugins: {
      //  datalabels: { clip: true },
      //  legend: { position: 'top' }
      //}

      // #Tooltips plugin ใหม่ ที่แสดงเฉพาะ Label กับ X,Y
      plugins: {
        tooltip: {
          callbacks: {
            label: function (datasets) {
              const point = datasets.raw;
              return `SN: ${point.label} : ${point.y.toFixed(2)}`;
            }
          }
        }
      }
      ,
      scales: {
        x: {
          type: 'linear',
          position: 'bottom',
          min: 0.5,
          max: labels.length + 0.5,
          ticks: {
            stepSize: 1,
            callback: (val) => '' // ไม่แสดงอะไรในแกนหลัก
          },
          grid: {
            drawOnChartArea: true
          }
        },
        xLabels: {
          type: 'category',
          position: 'bottom',
          labels: labels, // ['Label 1', 'Label 2', 'Label 3'] ตามจำนวน Array 
          grid: {
            drawOnChartArea: false // ซ่อนเส้นตาราง
          },
          ticks: {
            font: {
              weight: 'bold',
              size: 12
            }
          },
          offset: true,
          title: {
            display: true,
            text: 'Serial No.'
          }
        },
        y: {
          title: {
            display: true,
            text: '' //แสดงข้อความแกน Y
          }
        }
      }
    },
    plugins: [ChartDataLabels] 

  });

  // Start GridTable
  if ($.fn.DataTable.isDataTable('#bindDataTable')) {
    // ถ้ามีอยู่แล้ว ให้ล้างและทำลาย
    $('#bindDataTable').DataTable().clear().destroy();
  }

  const flatData = data.flat();
  $('#bindDataTable').DataTable({
    data: flatData,
    layout: {
      bottomEnd: {
        paging: {
          firstLast: false
        }
      }
    },
    "paging": true,
    "pageLength": 50,
    "oLanguage": {
      "sSearch": "Quick Search:"
    },
    columns: [
      { data: 'stDate' },
      { data: 'snlabel' },
      { data: 'method' },
      { data: 'value' }
    ],
    dom: 'Bfrtip',
    buttons: [
      {
        extend: 'excelHtml5',
        title: 'Data Export',
        text: 'Export to Excel'
      }
    ]

  });

  //---> End Dataset

}
function post(path, params, method = 'post') {

  // The rest of this code assumes you are not using a library.
  // It can be made less verbose if you use one.
  const form = document.createElement('form');
  form.method = method;
  form.action = path;

  for (const key in params) {
    if (params.hasOwnProperty(key)) {
      const hiddenField = document.createElement('input');
      hiddenField.type = 'hidden';
      hiddenField.name = key;
      hiddenField.value = params[key];

      form.appendChild(hiddenField);
    }
  }

  document.body.appendChild(form);
  form.submit();
}
function GetSearch_bk() {
  var dtSt = $("#dateStart").val();
  var dtEn = $("#dateEnd").val();
  let objForm = {
    txtStDate: dtSt,
    txtEnDate: dtEn
  }
  fetch("/ASSPrdData/GetSocleMainDrive", {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(objForm)
  })
    .then(response => response.json())
    .then(() => {
      RenderData(response);
    })
    .catch(error => console.error('Unable to add item.', error));

}
function GetSearch() {
  loadingModal.show();
  var dtSt = $("#dateStart").val();
  var dtEn = $("#dateEnd").val();
  let objForm = {
    txtStDate: dtSt,
    txtEnDate: dtEn
  }
  //--> Start Ajax
  //post("/ASSPrdData/GetSocleMainDrive", objForm);
  
  $.ajax({
    type: "POST",
    data: objForm,
    url: '/ASSPrdData/GetSocleMainDrive',
    success: function (response) {
      console.log("จาก Controler2: ", response);
      RenderData(response);
      setInterval(loadingModal.hide(), 3000);
    },
    error: function (response) {
      alert(response.responseText);
    }
  });
  
  //--> End Ajax
}




