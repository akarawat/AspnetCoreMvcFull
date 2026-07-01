// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.
$("#btnGotoHome").click(function () {
  //window.document.location.href = "/";
  var win = window.open("about:blank", "_self");
  win.close();
});

function ConfirmLogout() {
  if (!confirm("Confirm to logout?")) return;
  window.open('', '_self').close();
}
function formatNumber(value, fix) {
  if (isNaN(value)) return '';

  const rounded = parseFloat(value).toFixed(fix); // ปัดเศษทศนิยมให้เหลือ 4 ตำแหน่ง
  const parts = rounded.split(".");
  const integerPart = parseInt(parts[0]).toLocaleString(); // ใส่ comma separator
  const decimalPart = parts[1];

  return `${integerPart}.${decimalPart}`;
}
function formatDate(dateStr) {
  const d = new Date(dateStr);

  const pad = (n) => n.toString().padStart(2, "0");

  const day = pad(d.getDate());
  const month = pad(d.getMonth() + 1);
  const year = d.getFullYear();

  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  const seconds = pad(d.getSeconds());

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}
function setBgButton(serial) {
  if (serial == "4") {
    $("#btnB3").removeClass();
    $("#btnB4").removeClass();
    $("#btnB5").removeClass();
    $("#btnB7").removeClass();
    $("#btnB9P").removeClass();
    $("#btnB9S").removeClass();

    $("#btnB3").addClass("btn btn-light h-20");
    $("#btnB4").addClass("btn btn-light-secondary h-20");
    $("#btnB5").addClass("btn btn-light h-20");
    $("#btnB7").addClass("btn btn-light h-20");
    $("#btnB9P").addClass("btn btn-light h-20");
    $("#btnB9S").addClass("btn btn-light h-20");
  } else if (serial == "5") {
    $("#btnB3").removeClass();
    $("#btnB4").removeClass();
    $("#btnB5").removeClass();
    $("#btnB7").removeClass();
    $("#btnB9P").removeClass();
    $("#btnB9S").removeClass();
    $("#btnB3").addClass("btn btn-light h-20");
    $("#btnB4").addClass("btn btn-light h-20");
    $("#btnB5").addClass("btn btn-light-secondary h-20");
    $("#btnB7").addClass("btn btn-light h-20");
    $("#btnB9P").addClass("btn btn-light h-20");
    $("#btnB9S").addClass("btn btn-light h-20");
  } else if (serial == "7") {
    $("#btnB3").removeClass();
    $("#btnB4").removeClass();
    $("#btnB5").removeClass();
    $("#btnB7").removeClass();
    $("#btnB9P").removeClass();
    $("#btnB9S").removeClass();
    $("#btnB3").addClass("btn btn-light h-20");
    $("#btnB4").addClass("btn btn-light h-20");
    $("#btnB5").addClass("btn btn-light h-20");
    $("#btnB7").addClass("btn btn-light-secondary h-20");
    $("#btnB9P").addClass("btn btn-light h-20");
    $("#btnB9S").addClass("btn btn-light h-20");
  } else if (serial == "9") {
    $("#btnB3").removeClass();
    $("#btnB4").removeClass();
    $("#btnB5").removeClass();
    $("#btnB7").removeClass();
    $("#btnB9P").removeClass();
    $("#btnB9S").removeClass();
    $("#btnB3").addClass("btn btn-light h-20");
    $("#btnB4").addClass("btn btn-light h-20");
    $("#btnB5").addClass("btn btn-light h-20");
    $("#btnB7").addClass("btn btn-light h-20");
    $("#btnB9P").addClass("btn btn-light-secondary h-20");
    $("#btnB9S").addClass("btn btn-light h-20");


  } else if (serial == "9 Socle") {
    $("#btnB3").removeClass();
    $("#btnB4").removeClass();
    $("#btnB5").removeClass();
    $("#btnB7").removeClass();
    $("#btnB9P").removeClass();
    $("#btnB9S").removeClass();
    $("#btnB3").addClass("btn btn-light h-20");
    $("#btnB4").addClass("btn btn-light h-20");
    $("#btnB5").addClass("btn btn-light h-20");
    $("#btnB7").addClass("btn btn-light h-20");
    $("#btnB9P").addClass("btn btn-light h-20");
    $("#btnB9S").addClass("btn btn-light-secondary h-20");
  } else if (serial == "3") {
    $("#btnB3").removeClass();
    $("#btnB4").removeClass();
    $("#btnB5").removeClass();
    $("#btnB7").removeClass();
    $("#btnB9P").removeClass();
    $("#btnB9S").removeClass();

    $("#btnB3").addClass("btn btn-light-secondary h-20");
    $("#btnB4").addClass("btn btn-light h-20");
    $("#btnB5").addClass("btn btn-light h-20");
    $("#btnB7").addClass("btn btn-light h-20");
    $("#btnB9P").addClass("btn btn-light h-20");
    $("#btnB9S").addClass("btn btn-light h-20");
  }

  $("#btnB9P").text("B9");
  $("#btnB9S").removeClass();
  document.getElementById("btnB9S").style.display = "none";
}


