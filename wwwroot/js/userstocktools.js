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

function ModalAddNewUser() {
  var myModal = new bootstrap.Modal(document.getElementById("exampleModal"));
  myModal.show();
}
function ModalEditUser(trid, empcode) {
  var myModal = new bootstrap.Modal(document.getElementById("exampleModalEdit"));
  myModal.show();
  $("#lblTRID").val(trid);
  $("#emp_code").val(empcode);
}
function ModalDeleteUser(trid) {
  alert(trid);
}


$("#searchItems").keyup(function (e) {
  var code = e.key; // recommended to use e.key, it's normalized across devices and languages
  if (code === "Enter") e.preventDefault();
  if (code === " " || code === "Enter" || code === "," || code === ";") {
    let itemNo = $("#searchItems").val();
    if (itemNo.length >= 3) {
      console.log(itemNo);
      location.href = "/PPStock/UserStockTools?search=" + itemNo;
      //$.ajax({
      //  url: "/PPStock/StockTools?search=" + itemNo,
      //  type: "GET",
      //  data: null,
      //  success: function (response) {
      //    console.log(response);
      //  }, error: function (request, status, error) { }
      //});

    }
  } // missing closing if brace
});
function getEmpName() {

}
function AddNewEmp(){
  var emp_code = $("#emp_code").val();
  var user_func = $("#lblSelectUserFunc").val();
  var emp_samacc = $('[name="lst_emp_stock"]').val();
  var sel_spp = $('[name="lst_apprv_stock"]').val();
  console.log(emp_code, ", ", sel_spp, ", ", user_func, ", ", emp_samacc);
}
/*
$(document).on('change', 'input', function () {
  var options = $('datalist')[0].options;
  //var options = $('#opt_apprv_stock').options;
  var val = $(this).val();
  for (var i = 0; i < options.length; i++) {
    if (options[i].value === val) {
      console.log(val);
      break;
    }
  }
});
*/
//---> Data List Start
function qs(query, context) {
  return (context || document).querySelector(query);
}

function qsa(query, context) {
  return (context || document).querySelectorAll(query);
}

qs("#id_emp_stock").addEventListener('change', function (e) {
  var settxt;
  var options = qsa('#' + e.target.getAttribute('list') + ' > option'),
    values = [];
  [].forEach.call(options, function (option) {
    //console.log(option);
    values.push(option.value);
  });
  var currentValue = e.target.value;
  
  if (values.indexOf(currentValue) !== -1) {
    console.log('evento "change" %s %s', currentValue);
  }
  
});
qs("#id_apprv_stock").addEventListener('change', function (e) {
  var options = qsa('#' + e.target.getAttribute('list') + ' > option'),
    values = [];
  [].forEach.call(options, function (option) {
    values.push(option.value)
  });
  var currentValue = e.target.value;
  var currentText = e.target.text;
  if (values.indexOf(currentValue) !== -1) {
    console.log('evento "change" %s %s', currentValue, currentText);
  }
});
//---> Data List End
function CancelAddEmp() {

}
function SelectUserFunc(role) {
  //alert(role);
  if (role == 1) {
    $("#lblSelectUserFunc").val("ACK");
  } else if (role == 2) {
    $("#lblSelectUserFunc").val("STOCK");
  } else if (role == 3) {
    $("#lblSelectUserFunc").val("USER");
  } if (role == 9) {
    $("#lblSelectUserFunc").val("CANCEL");
  }
  
}
