fetch('/ASSPrdData/GetMaxThreadData') // เรียก Controller
  .then(res => res.json())
  .then(data => {
    const cutterTolerance = data.length > 0 ? data[0].cutter : 5.5;
    const normalTolerance = data.length > 0 ? data[0].normal : 2.8;
    console.log(data);
    const cutterPoints = data.map(d => ({
      s: d.serial,
      x: d.startDate,
      y: d.maxCurrentCutter
    }));

    const normalPoints = data.map(d => ({
      s: d.serial,
      x: d.startDate,
      y: d.maxCurrentNormal
    }));
    //-- Start Tables
    $('#bindDataTable').DataTable({
      data: data,
      columns: [
        { data: 'serial' },
        { data: 'maxCurrentNormal' },
        { data: 'maxCurrentCutter' },
        { data: 'startDate' }
      ]
    });
    //-- End Tables

    //--- Start scatter chart
    const ctx = document.getElementById('scatterChart').getContext('2d');
    const scatterChart = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [
          {
            label: 'maxCurrentCutter',
            data: cutterPoints,
            backgroundColor: 'green',
            pointRadius: 3
          },
          {
            label: 'maxCurrentNormal',
            data: normalPoints,
            backgroundColor: 'orange',
            pointRadius: 3
          },
          {
            label: 'Cutter-tolerance',
            data: data.map(d => ({ x: d.startDate, y: cutterTolerance })),
            type: 'line',
            borderColor: 'red',
            borderWidth: 1,
            fill: false,
            pointRadius: 0
          },
          {
            label: 'Normal-tolerance',
            data: data.map(d => ({ x: d.startDate, y: normalTolerance })),
            type: 'line',
            borderColor: 'blue',
            borderWidth: 1,
            fill: false,
            pointRadius: 0
          }
        ]
      },
      options: {
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'day'
            },
            title: { display: true, text: 'Date' }
          },
          y: {
            title: { display: true, text: 'Ampere (A)' }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function (context) {
                const d = context.raw;
                return `Serial: ${d.s} | Current: ${d.y}`;
              }
            }
          }, 
          legend: { position: 'top' }
        }
      }
    });
    //--- End scatter chart
  });

