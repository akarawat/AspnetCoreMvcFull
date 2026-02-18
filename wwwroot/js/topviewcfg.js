$(document).ready(function () {
  setDisplayCfg();
  //$("#b3_92").prop('checked', false);
  //$("#b3_92").prop('checked', true);
});
function setDisplay(id) {
  var chk = $("#" + id).prop('checked');
  if (!confirm('Confirm to set view?')) {
    location.href = "/AdminCfg/TopviewCfg";
  } else {
    var status = 0;
    if (chk) status = 1; else status = 0;
    var lineid = id.split('_')[0].replace('b', '');
    var viewno = 'view' + id.split('_')[1];
    var objForm = {
      lineid: lineid,
      viewno: viewno,
      status: status
    }
    //console.log(objForm); //UpdateTopviewCfg
    $.ajax({
      type: "PUT",
      url: "/AdminCfg/UpdateTopviewCfg",
      data: objForm,
      success: function (response) {
        location.href = "/AdminCfg/TopviewCfg";
      },
      complete: function () {
      },
      error: function (xhr) {
        alert("เกิดข้อผิดพลาด: " + xhr.responseText);
      }
    });
  }
}
function setDisplayCfg() {
  $.ajax({
    type: "GET",
    url: "/AdminCfg/GetTopviewCfg",
    data: null,
    beforeSend: function () {
    },
    success: function (response) {
      response.forEach(function (item) {
        let LineId = "";
        let LineValue = "";
        for (const key in item) {
          if (item.hasOwnProperty(key)) {
            
            const value = item[key];
            if (LineId != key) {
              LineId = key;
              if (LineId == 'lineid') {
                LineValue = value;
                //console.log(LineValue);
                if (LineValue == '3') {

                }
              }
              //console.log(value);
              if (LineValue != '') {
                //console.log(`${LineValue}`, `Key: ${key}, Value: ${value}`);
                SetDisplayTopView(`${LineValue}`, `${key}`, `${value}`);
              }              
            }
            //console.log(`Key: ${key}, Value: ${value}`);
            //if (key == 'lineid' && value == '3'){
            //  console.log(value);
            //}
          }
        }
      });
    },
    complete: function () {
    },
    error: function (xhr) {
      alert("เกิดข้อผิดพลาด: " + xhr.responseText);
    }
  });
}

function SetDisplayTopView(lineId, viewno, flag) {
  let vno = viewno.replace('view', '');
  //console.log(vno, ':', flag);
  //if (lineId == '3') {
  //  //b9p_1, b7_9
  var flg = false;
  if (flag == 1) flg = true; else flg = false;
  //  //-->console.log(vno, ':', flg);
  //  //-->$("#b3_" + vno + "").prop('checked', flg);
  //}
  $("#b" + lineId + "_" + vno + "").prop('checked', flg);


  if (lineId == '9P' || lineId == '9S') {
    //b9p_1, b7_9
  var flg = false;
  if (flag == 1) flg = true; else flg = false;
    //console.log(vno, ':', flg);
    //console.log(lineId.toLowerCase());
    //-->$("#b3_" + vno + "").prop('checked', flg);
    $("#b" + lineId.toLowerCase() + "_" + vno + "").prop('checked', flg);
  }
  

  //
}
