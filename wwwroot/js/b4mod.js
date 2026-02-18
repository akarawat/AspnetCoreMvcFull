$(document).ready(function () {

  // Start Chart
  let arrdt = [];
  let arrnordata = [];
  let arraftdata = [];
  let arrbfodata = [];
  let arrrpm = [];
  var ObjData1 = {
    txtStDate: "2025-03-01",
    txtEnDate: "2025-03-31"
  }
    $.ajax({
      url: "/ASSPrdData/GetThreadCutterList",
      type: "post",
      data: ObjData1,
      success: function (response) {
        console.log(response);
        if (response != undefined) {

            response.forEach((repo) => { // Get By Foreach Insert into Variable
              Object.entries(repo).forEach(([key, value]) => {
                //console.log(`${key}: ${value}`);
                //## Date Data
                if (key == "dtstamptxt") { arrdt.push(value); }
                //## Fail limit Data
                if (key == "nordata") { arrnordata.push(value); }
                //## Before Data
                if (key == "bfodata") { arrbfodata.push(value); }
                //## After Data
                if (key == "aftdata") { arraftdata.push(value); }
                //## rpm
                if (key == "rpm") { arrrpm.push(value); }

              });
            });
          //---> START CHART
          const datas = [{
            type: 'line',
            label: 'hookMounted',
            data: arrbfodata,
            borderColor: 'rgb(0, 128, 0)'
          }, {
            type: 'line',
            label: 'duration',
            data: arrnordata,
            borderColor: 'rgb(140, 87, 255)'
          }, {
            type: 'line',
            label: 'averageCurrent',
            data: arraftdata,
            borderColor: 'rgb(245, 224, 0)'
          }, {
            type: 'line',
            label: 'RPM',
            data: arrrpm,
            borderColor: 'rgb(255, 102, 102)'
          }];
          const ctx = document.getElementById('myChart');
          const mixedChart = new Chart(ctx, {
            label: 'Max thread cut current Dataset',
            data: {
              datasets: datas,
              labels: arrdt
            },
            options: {
              scales: {
                y: {
                  beginAtZero: true,
                  min: -20,
                  max: 20
                }
              }
            }
          });
          console.log(datas);
          //---> End Chart
          //--> Start Data Table
          //var dataSet = [
          //  {
          //    "ddmmyy": "01/01/2025",
          //    "bfodata": -5,
          //    "aftdata": 5.5,
          //    "perc": "0%"
          //  },
          //  {
          //    "ddmmyy": "01/02/2025",
          //    "bfodata": -3,
          //    "aftdata": 8,
          //    "perc": "0%"
          //  }, {
          //    "ddmmyy": "01/03/2025",
          //    "bfodata": -3.5,
          //    "aftdata": 4.5,
          //    "perc": "0%"
          //  }, {
          //    "ddmmyy": "01/04/2025",
          //    "bfodata": -10,
          //    "aftdata": 3,
          //    "perc": "0%"
          //  }, {
          //    "ddmmyy": "01/05/2025",
          //    "bfodata": -1,
          //    "aftdata": 5,
          //    "perc": "0%"
          //  }
          //];
          //console.log(dataSet);
          $('#bindDataTable').DataTable({
            searching: true,
            data: response,
            "oLanguage": {
              "sSearch": "Quick Search:"
            },
            order: [[1, 'desc']],
            columns: [
              { data: 'dtstamp' },
              { data: 'dtstamptxt' },
              { data: 'rpm' },
              { data: 'bfodata' },
              { data: 'nordata' },
              { data: 'aftdata' }
            ],
            columnDefs: [{
              searchable: true,
            }],

            //columns: [
            //  { data: 'arrdt' },
            //  { data: 'arrnordata' },
            //  { data: 'arrbfodata' },
            //  { data: 'arrbfodata' }
            //]

          });
          //---> End Dataset
          $('.dataTables_filter input').off();
          
        }

      },
      error: function (request, status, error) {
        alert(request.responseText);
      }
    });

  // Start GridTable

});
function ModalSeries() {
  var myModal = new bootstrap.Modal(document.getElementById("modalSeries"));
  myModal.show();
}
function ModalMachine() {
  var myModal = new bootstrap.Modal(document.getElementById("modalMachine"));
  myModal.show();
}
function ModalCurrent() {
  var myModal = new bootstrap.Modal(document.getElementById("modalCurrent"));
  myModal.show();
}
//---ต้องทำ Dataset 2 ชุด


