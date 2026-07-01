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
function setBgButton(serial) {
  const map = { '3': 'btnB3', '4': 'btnB4', '5': 'btnB5', '7': 'btnB7', '9': 'btnB9' };
  ['btnB3','btnB4','btnB5','btnB7','btnB9'].forEach(id => {
    $('#' + id).removeClass('btn-light-secondary').addClass('btn-light');
  });
  const active = map[serial];
  if (active) $('#' + active).removeClass('btn-light').addClass('btn-light-secondary');
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
