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
