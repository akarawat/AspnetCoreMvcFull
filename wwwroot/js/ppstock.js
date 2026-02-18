/**
 * Account Settings - Account
 */

'use strict';

document.addEventListener('DOMContentLoaded', function (e) {
  (function () {
    const deactivateAcc = document.querySelector('#formAccountDeactivation');

    // Update/reset user image of account page
    let accountUserImage = document.getElementById('uploadedAvatar');
    const fileInput = document.querySelector('.account-file-input'),
      resetFileInput = document.querySelector('.account-image-reset');

    if (accountUserImage) {
      const resetImage = accountUserImage.src;
      fileInput.onchange = () => {
        if (fileInput.files[0]) {
          accountUserImage.src = window.URL.createObjectURL(fileInput.files[0]);
        }
      };
      resetFileInput.onclick = () => {
        fileInput.value = '';
        accountUserImage.src = resetImage;
      };
    }
  })();
});


$(document).ready(function () {
  $.ajax({
    url: "/ASSPrdData/GetToolItemList",
    type: "GET",
    data: null,
    success: function (response) {
      console.log(response);
    },
    error: function (request, status, error) {
      alert(request.responseText);
    }
  });
});

$("#btnSubmit").click(function () {
  let idDISPNAME = $("#idDISPNAME").val();
  let idSAMACC = $("#idSAMACC").val();
  let idUEMAIL = $("#idUEMAIL").val();
  let idappleave = $("#idappleave").val();
  console.log(idDISPNAME);
  if (idSAMACC == null || idDISPNAME == null) return;
  if (!confirm('Confirm to submit form?')) return;

  let objForm = {
    DISPNAME: idDISPNAME,
    SAMACC: idSAMACC,
    UEMAIL: idUEMAIL,
    appleave: idappleave
  }
  $.ajax({
    url: "/Pages/AddNewUsers",
    type: "POST",
    data: objForm,
    success: function (response) {
      console.log(response[0], response[1], response[2]);
      if (response[0] == "0") {
        alert("ไม่สามารถบันทึกข้อมูลได้"); return;
      } else {
        alert("บันทึกข้อมูลเสร็จสมบูรณ์"); return;
      }
    }, error: function (request, status, error) { }
  });

});

$("#btnUploadItemno").click(function () {
  if (!confirm('ยืนยันการ Upload Excel Itemno.')) return;

});

//searchItems /ASSPrdData/StockTools
$("#searchItems").on("change paste keyup cut select", function () {
  
});

$("#searchItems").keyup(function (e) {
  var code = e.key; // recommended to use e.key, it's normalized across devices and languages
  if (code === "Enter") e.preventDefault();
  if (code === " " || code === "Enter" || code === "," || code === ";") {
    let itemNo = $("#searchItems").val();
    if (itemNo.length >= 3) {
      console.log(itemNo);
      location.href = "/ASSPrdData/StockTools?search=" + itemNo;
      //$.ajax({
      //  url: "/ASSPrdData/StockTools?search=" + itemNo,
      //  type: "GET",
      //  data: null,
      //  success: function (response) {
      //    console.log(response);
      //  }, error: function (request, status, error) { }
      //});

    }
  } // missing closing if brace
});

