$(document).ready(function () {
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

const ctx = document.getElementById('myChart');
const data = {
  datasets: [{
    label: 'Max thread cut current Dataset',
    data: [{
      x: -10,
      y: 0
    }, {
      x: 0,
      y: 10
    }, {
      x: 10,
      y: 5
    }, {
      x: 0.5,
      y: 5.5
    }],
    backgroundColor: 'rgb(255, 99, 132)'
  }],
};

new Chart(ctx, {
  type: 'scatter',
  data: data,
  options: {
    scales: {
      x: {
        type: 'linear',
        position: 'bottom'
      }
    }
  }
});
