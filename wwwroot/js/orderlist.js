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

/*
$(document).ready(function () {
  $.ajax({
    url: "/ASSPrdData/GetOrderItemList",
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
*/
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
      location.href = "/ASSPrdData/OrderList?search=" + itemNo;
      //$.ajax({
      //  url: "/ASSPrdData/SetOrderApproveOrCancel?search=" + itemNo,
      //  type: "GET",
      //  data: null,
      //  success: function (response) {
      //    console.log(response);
      //  }, error: function (request, status, error) { }
      //});

    }
  } // missing closing if brace
});

function OpenDetail(docNo) {
  location.href = "/ASSPrdData/OrderDetail?docNo=" + docNo;
}

