$(document).ready(function () {
  //loadBoxPlotData();

  /* ปิดชั่วคราว
  $.ajax({
    url: '/ASSPrdData/GetMaxThreadBoxPlotData', // ตรวจสอบชื่อ Controller และ Action ของคุณ
    type: 'GET',
    dataType: 'json',
    success: function (apiData) {
      console.log(apiData);
      // Start Load Boxplot Table
      if ($.fn.DataTable.isDataTable('#bindBoxPlotDataTable')) {
        $('#bindBoxPlotDataTable').DataTable().clear().destroy();
      }
      $('#bindBoxPlotDataTable').DataTable({
        data: apiData,
        columns: [
          { data: 'metric' },
          {
            data: 'min',
            render: function (data, type, row) {
              // ตรวจสอบว่าข้อมูลเป็นตัวเลขหรือไม่ และไม่เป็น null/undefined
              if (typeof data === 'number' && data !== null) {
                return data.toFixed(2); // แปลงเป็นสตริงที่มีทศนิยม 2 ตำแหน่ง
              }
              return data; // คืนค่าเดิมถ้าไม่ใช่ตัวเลข หรือเป็น null/undefined
            }
          },
          {
            data: 'q1',
            render: function (data, type, row) {
              if (typeof data === 'number' && data !== null) {
                return data.toFixed(2);
              }
              return data;
            }
          },
          {
            data: 'median',
            render: function (data, type, row) {
              if (typeof data === 'number' && data !== null) {
                return data.toFixed(2);
              }
              return data;
            }
          },
          {
            data: 'q3',
            render: function (data, type, row) {
              if (typeof data === 'number' && data !== null) {
                return data.toFixed(2);
              }
              return data;
            }
          },
          {
            data: 'max',
            render: function (data, type, row) {
              if (typeof data === 'number' && data !== null) {
                return data.toFixed(2);
              }
              return data;
            }
          }
          // เพิ่มคอลัมน์อื่นๆ ถ้ามี
        ],
        dom: 't',
        paging: false,
        info: false,
        pageLength: 5
      });
      // End Load Boxplot Table

      const labels = apiData.map(item => item.metric);
      const boxplotData = apiData.map(item => ({
        min: item.min,
        q1: item.q1,
        median: item.median,
        q3: item.q3,
        max: item.max
      }));

      const ctx = document.getElementById('myBoxPlotChart').getContext('2d');

      new Chart(ctx, {
        type: 'boxplot',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Data Distribution',
              backgroundColor: 'rgba(75, 192, 192, 0.5)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
              data: boxplotData // ใช้ข้อมูลที่ Map มาแล้ว
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Boxplot from Database Data'
            },
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Value'
              }
            }
          }
        }
      });
    },
    error: function (xhr, status, error) {
      console.error("Error fetching data:", error);
    }
  });
  */
});
// Your desired JSON data
const jsonData = {
  maxCurrentCutter: [6.16, 4.26, 7.42, 4.7, 5.45, 5, 4.31, 4.71, 7.02, 7.13],
  maxCurrentNormal: [1.89, 1.61, 2.69, 1.7, 2.44, 2.19, 3.48, 2.83, 1.92, 2.14],
  efficiency: [54.26, 52.13, 53.52, 58.46, 50.0, 50.0, 55.91, 54.17, 50.0, 51.25]
};

function loadBoxPlotData() {
  //url: '/ASSPrdData/GetBoxPlotData',
  $.ajax({
    url: '/ASSPrdData/GetMaxThreadBoxPlotData',
    type: 'GET',
    success: function (data) {
      console.log("📊 BoxPlotData:", data);
      renderBoxPlot(data);
    }
  });
}

function renderBoxPlot(boxPlotData) {
  const ctx = document.getElementById('myBoxPlotChart').getContext('2d');

  const myBoxPlotChart = new Chart(ctx, {
    type: 'boxplot', // This type is provided by the Chart.js Boxplot Plugin
    data: {
      labels: ['Max Current Cutter', 'Max Current Normal', 'Efficiency'],
      datasets: [
        {
          label: 'Data Distribution',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
          data: [
            boxPlotData.maxCurrentCutter,
            boxPlotData.maxCurrentNormal,
            boxPlotData.efficiency
          ]
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Boxplot Example from JSON Data'
        },
        legend: {
          display: false // Hide dataset legend as there's only one
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Value'
          }
        }
      }
    }
  });

}
