const SetMaxFail = 5;
const SetMinFail = 2;

$(document).ready(function () {

  const kpiFunctions = [
    function () {
      loadKPIB4B5("3");
      loadAutoThreader("3");
      loadButtonHold("3");
      loadBobbinCase("3");
      loadSewingFoot("3");
      loadDifferanceWeight("3");
      loadThreadTension("3");
      loadTTAAdjustment("3");
      loadBalanceRough("3");
      loadBalanceFine("3");
      loadBDFBalance("3");
      loadBasePlate("3");
      SetRemarkSerial("3");
    },
    function () {
      loadKPIB4B5("4");
      loadAutoThreader("4");
      loadButtonHold("4");
      loadBobbinCase("4");
      loadSewingFoot("4");
      loadDifferanceWeight("4");
      loadThreadTension("4");
      loadTTAAdjustment("4");
      loadBalanceRough("4");
      loadBalanceFine("4");
      loadBDFBalance("4");
      loadBasePlate("4");
      SetRemarkSerial("4");
    },
    function () {
      loadKPIB4B5("5");
      loadAutoThreader("5");
      loadButtonHold("5");
      loadBobbinCase("5");
      loadSewingFoot("5");
      loadDifferanceWeight("5");
      loadThreadTension("5");
      loadTTAAdjustment("5");
      loadBalanceRough("5");
      loadBalanceFine("5");
      loadBDFBalance("5");
      loadBasePlate("5");
      SetRemarkSerial("5");
    },
    function () {
      loadKPIB4B5("7");
      loadAutoThreader("7");
      loadButtonHold("7");
      loadBobbinCase("7");
      loadSewingFoot("7");
      loadDifferanceWeight("7");
      loadThreadTension("7");
      loadTTAAdjustment("7");
      loadBalanceRough("7");
      loadBalanceFine("7");
      loadBDFBalance("7");
      loadBasePlate("7");
      SetRemarkSerial("7");
    },
    function () {
      loadKPIB4B5("9 PAM");
      loadAutoThreader("9 PAM");
      loadButtonHold("9 PAM");
      loadBobbinCase("9 PAM");
      loadSewingFoot("9 PAM");
      loadDifferanceWeight("9 PAM");
      loadThreadTension("9 PAM");
      loadTTAAdjustment("9 PAM");
      loadBalanceRough("9 PAM");
      loadBalanceFine("9 PAM");
      loadBDFBalance("9 PAM");
      loadBasePlate("9 PAM");
      SetRemarkSerial("9 PAM");
    },
    function () {
      loadKPIB4B5("9 Socle");
      loadAutoThreader("9 Socle");
      loadButtonHold("9 Socle");
      loadBobbinCase("9 Socle");
      loadSewingFoot("9 Socle");
      loadDifferanceWeight("9 Socle");
      loadThreadTension("9 Socle");
      loadTTAAdjustment("9 Socle");
      loadBalanceRough("9 Socle");
      loadBalanceFine("9 Socle");
      loadBDFBalance("9 Socle");
      loadBasePlate("9 Socle");
      SetRemarkSerial("9 Socle");
    },
    function () {
      loadKPIB4B5("3");
      loadAutoThreader("3");
      loadButtonHold("3");
      loadBobbinCase("3");
      loadSewingFoot("3");
      loadDifferanceWeight("3");
      loadThreadTension("3");
      loadTTAAdjustment("3");
      loadBalanceRough("3");
      loadBalanceFine("3");
      loadBDFBalance("3");
      loadBasePlate("3");
      SetRemarkSerial("3");
    }

  ];

  let currentIndex = 0;
  let curModel = $("#curModel").val();
  console.log(curModel);
  if (curModel == '9 Socle') {
    currentIndex = 5;
    GetPassFailScore("9");
  } else if (curModel == '9 PAM') {
    currentIndex = 4;
    GetPassFailScore("9");
  } else if (curModel == '7') {
    currentIndex = 3;
    GetPassFailScore("7");
  } else if (curModel == '5') {
    currentIndex = 2;
    GetPassFailScore("5");
  } else if (curModel == '4') {
    currentIndex = 1;
    GetPassFailScore("4");
  } else if (curModel == '3') {
    currentIndex = 0;
    GetPassFailScore("3");
  }

  kpiFunctions[currentIndex]();
  setBgButton(curModel);

  setVisibleDisplay(curModel);
  disableRemarkBtn();
  BindDataTableTop10Failed(curModel);
  BindDataTableDailyProd(curModel);
  //drawDailyProductionSimple(curModel);

  // Daniel Req.
  $("#pduTitle").html(`Production Data Utilization Dashboard - B${curModel}`);
  $("#btnB9P").text("B9");
  $("#btnB9S").removeClass();
  document.getElementById("btnB9S").style.display = "none";

  GetPassFailScore(curModel);
});
function disableRemarkBtn() {
  document.getElementById("btn_rmk_mnu1").style.display = "none";
  document.getElementById("btn_rmk_mnu2").style.display = "none";
  document.getElementById("btn_rmk_mnu3").style.display = "none";
  document.getElementById("btn_rmk_mnu4").style.display = "none";
  document.getElementById("btn_rmk_mnu5").style.display = "none";
  document.getElementById("btn_rmk_mnu6").style.display = "none";
  document.getElementById("btn_rmk_mnu7").style.display = "none";
  document.getElementById("btn_rmk_mnu8").style.display = "none";
  document.getElementById("btn_rmk_mnu9").style.display = "none";
  document.getElementById("btn_rmk_mnu91").style.display = "none";
  document.getElementById("btn_rmk_mnu92").style.display = "none";
  document.getElementById("btn_rmk_mnu10").style.display = "none";
}
function callFuncButton(serial) {
  let ifB9Only = serial;
  if (serial == '9 PAM') {
    $("#curModel").val('9P');
    ifB9Only = "9";
  } else if (serial == '9 Socle') {
    $("#curModel").val('9S');
    ifB9Only = "9";
  } else {
    $("#curModel").val(serial);
  }
  let serial_model = $("#curModel").val();
  setVisibleDisplay(serial_model);

  loadKPIB4B5(serial);
  loadAutoThreader(serial);
  loadButtonHold(serial);
  loadBobbinCase(serial);
  loadSewingFoot(serial);
  loadDifferanceWeight(serial);
  loadThreadTension(serial);
  loadTTAAdjustment(serial);
  loadBalanceRough(serial);
  loadBalanceFine(serial);
  loadBDFBalance(serial);
  loadBasePlate(serial);

  SetRemarkSerial(serial_model);

  BindDataTableTop10Failed(ifB9Only);
  BindDataTableDailyProd(ifB9Only);

  //drawDailyProductionSimple(ifB9Only);
  $("#btnB9S").removeClass();
  document.getElementById("btnB9S").style.display = "none";
  $("#pduTitle").html(`Production Data Utilization Dashboard - B${ifB9Only}`);

  GetPassFailScore(ifB9Only);
}
// Release Bachground color for all button
function GetPassFailScore(serial) {
  $("#btnGreenStatus").html('Minimum fail ratio [ < ' + SetMinFail + '%]');
  $("#btnYellowStatus").html('Between Max [' + SetMaxFail + '%] & Min ['+ SetMinFail +'%] ');
  $("#btnRedStatus").html('Maximum fail ratio [ > ' + SetMaxFail + '%]');

  $.ajax({
    url: '/AdminCfg/GetPassFailScore',
    method: 'GET',
    data: {
      lineid: serial
    },
    success: function (data) {
      console.log(data[0]);
      if (data.length != 0) {
        //--> Menu 1
        //--> Menu 2 Start (*This function For Max Only)
        const maxValue_f2 = parseFloat(data[0]["maxf2"]);
        const minValue_f2 = parseFloat(data[0]["minf2"]);
        const maxLimit_f2 = parseFloat(SetMaxFail);
        const minLimit_f2 = parseFloat(SetMinFail);
        //if (maxValue_f2 > maxLimit_f2 || minValue_f2 > minLimit_f2) {
        const container_f2 = $('#accum_mnu2');
        container_f2.empty();
        container_f2.append(`Total [${data[0]["totalf2"]}] </br> 
          Max: ${data[0]["param_maxf2"]}, [${formatNumber(maxValue_f2, 2)} %] </br>
        `);

        if (maxValue_f2 > maxLimit_f2) {
          $('#bg_param2').removeClass()
            .addClass('card h-100 machine-status-orange');
        } else {
          $('#bg_param2').removeClass()
            .addClass('card h-100 machine-status-green');
        }

        //--> Menu 3 Start
        const maxValue_f3 = parseFloat(data[0]["maxf3"]);
        const minValue_f3 = parseFloat(data[0]["minf3"]);
        const maxLimit_f3 = parseFloat(SetMaxFail);
        const minLimit_f3 = parseFloat(SetMinFail);
        //console.log(maxValue_f3 + ':' + maxLimit_f3 + ':' + minValue_f3 + ':' + minLimit_f3);
        const container_f3 = $('#accum_mnu3');
        container_f3.empty();
        container_f3.append(`Total [${data[0]["totalf3"]}] </br> 
          Max: ${data[0]["param_maxf3"]}, [${formatNumber(maxValue_f3, 2)}%] </br>
          Min: ${data[0]["param_minf3"]}, [${formatNumber(minValue_f3, 2)}%] 
        `);
        if (maxValue_f3 > maxLimit_f3 || minValue_f3 > minLimit_f3) {
          $('#bg_param3').removeClass()
            .addClass('card h-100 machine-status-orange');
        } else if ((maxValue_f3 <= maxLimit_f3 && maxValue_f3 >= minLimit_f3)
          || (minValue_f3 <= maxLimit_f3 && minValue_f3 >= minLimit_f3)) {
          $('#bg_param3').removeClass()
            .addClass('card h-100 machine-status-yellow');
        } else {
          $('#bg_param3').removeClass()
            .addClass('card h-100 machine-status-green');
        }


        //--> Menu 5 Start
        const maxValue_f5 = parseFloat(data[0]["maxf5"]);
        const minValue_f5 = parseFloat(data[0]["minf5"]);
        const maxLimit_f5 = parseFloat(SetMaxFail);
        const minLimit_f5 = parseFloat(SetMinFail);

        if (maxValue_f5 > maxLimit_f5 || minValue_f5 > minLimit_f5) {
          $('#bg_param5').removeClass()
            .addClass('card h-100 machine-status-orange');
        } else if ((maxValue_f5 <= maxLimit_f5 && maxValue_f5 >= minLimit_f5)
          || (minValue_f5 <= maxLimit_f5 && minValue_f5 >= minLimit_f5)) {
          $('#bg_param5').removeClass()
            .addClass('card h-100 machine-status-yellow');
        } else {
          $('#bg_param5').removeClass();
          $('#bg_param5').addClass('card h-100 machine-status-green');
        }

        //--> Menu 7 Start
        const maxValue_f7 = parseFloat(data[0]["maxf7"]);
        const minValue_f7 = parseFloat(data[0]["minf7"]);
        const maxLimit_f7 = parseFloat(SetMaxFail);
        const minLimit_f7 = parseFloat(SetMinFail);
        const container_f7 = $('#accum_mnu7');
        container_f7.empty();
        container_f7.append(`Total [${data[0]["totalf7"]}] </br> 
          Max: ${data[0]["param_maxf7"]}, [${formatNumber(maxValue_f7, 2)}%] </br>
          Min: ${data[0]["param_minf7"]}, [${formatNumber(minValue_f7, 2)}%] 
        `);
        if (maxValue_f7 > maxLimit_f7 || minValue_f7 > minLimit_f7) {
          $('#bg_param7').removeClass()
            .addClass('card h-100 machine-status-orange');
        } else if ((maxValue_f7 <= maxLimit_f7 && maxValue_f7 >= minLimit_f7)
          || (minValue_f7 <= maxLimit_f7 && minValue_f7 >= minLimit_f7)) {
          $('#bg_param7').removeClass()
            .addClass('card h-100 machine-status-yellow');
        } else {
          $('#bg_param7').removeClass();
          $('#bg_param7').addClass('card h-100 machine-status-green');
        }

        //--> Menu 9 Start
        const maxValue_f9 = parseFloat(data[0]["maxf9"]);
        const minValue_f9 = parseFloat(data[0]["minf9"]);
        const maxLimit_f9 = parseFloat(SetMaxFail);
        const minLimit_f9 = parseFloat(SetMinFail);
        const container_f9 = $('#accum_mnu9');
        container_f9.empty();
        container_f9.append(`Total [${data[0]["totalf9"]}] </br> 
          Max: ${data[0]["param_maxf9"]}, [${formatNumber(maxValue_f9, 2)}%] </br>
          Min: ${data[0]["param_minf9"]}, [${formatNumber(minValue_f9, 2)}%] 
        `);
        if (maxValue_f9 > maxLimit_f9 || minValue_f9 > minLimit_f9) {
          $('#bg_param9').removeClass()
            .addClass('card h-100 machine-status-orange');
        } else if ((maxValue_f9 <= maxLimit_f9 && maxValue_f9 >= minLimit_f9)
          || (minValue_f9 <= maxLimit_f9 && minValue_f9 >= minLimit_f9)) {
          $('#bg_param9').removeClass()
            .addClass('card h-100 machine-status-yellow');
        } else {
          $('#bg_param9').removeClass();
          $('#bg_param9').addClass('card h-100 machine-status-green');
        }

        
      }
    },
    error: function () {
    }
  });
}
function SetRemarkSerial(curModel) {
  console.log(curModel);
  BindDataTableRemarkLasMsg('A', "0");
  BindDataTableRemarkLasMsg('A', curModel);

  BindDataTableRemarkLasMsg('1', curModel);
  BindDataTableRemarkLasMsg('2', curModel);
  BindDataTableRemarkLasMsg('3', curModel);
  BindDataTableRemarkLasMsg('4', curModel);
  BindDataTableRemarkLasMsg('5', curModel);
  BindDataTableRemarkLasMsg('6', curModel);
  BindDataTableRemarkLasMsg('7', curModel);
  BindDataTableRemarkLasMsg('8', curModel);
  BindDataTableRemarkLasMsg('9', curModel);
  BindDataTableRemarkLasMsg('91', curModel);
  BindDataTableRemarkLasMsg('92', curModel);
  BindDataTableRemarkLasMsg('10', curModel);
}
function setVisibleDisplay(serial) {
  $.ajax({
    url: '/AdminCfg/GetTopviewCfg',
    method: 'GET',
    data: {
      lineid: serial
    },
    success: function (data) {
      console.log(data[0]);
      //console.log(data[0]["view1"]);
      if (data != null) {
        if (data[0]["view1"] == 1) document.getElementById("display_param1").style.display = "block"; else document.getElementById("display_param1").style.display = "none";
        if (data[0]["view2"] == 1) document.getElementById("display_param2").style.display = "block"; else document.getElementById("display_param2").style.display = "none";
        if (data[0]["view3"] == 1) document.getElementById("display_param3").style.display = "block"; else document.getElementById("display_param3").style.display = "none";
        if (data[0]["view4"] == 1) document.getElementById("display_param4").style.display = "block"; else document.getElementById("display_param4").style.display = "none";
        if (data[0]["view5"] == 1) document.getElementById("display_param5").style.display = "block"; else document.getElementById("display_param5").style.display = "none";
        if (data[0]["view6"] == 1) document.getElementById("display_param6").style.display = "block"; else document.getElementById("display_param6").style.display = "none";
        if (data[0]["view7"] == 1) document.getElementById("display_param7").style.display = "block"; else document.getElementById("display_param7").style.display = "none";
        if (data[0]["view8"] == 1) document.getElementById("display_param8").style.display = "block"; else document.getElementById("display_param8").style.display = "none";
        if (data[0]["view9"] == 1) document.getElementById("display_param9").style.display = "block"; else document.getElementById("display_param9").style.display = "none";
        if (data[0]["view10"] == 1) document.getElementById("display_param10").style.display = "block"; else document.getElementById("display_param10").style.display = "none";
        if (data[0]["view91"] == 1) document.getElementById("display_param11").style.display = "block"; else document.getElementById("display_param11").style.display = "none";
        if (data[0]["view92"] == 1) document.getElementById("display_param12").style.display = "block"; else document.getElementById("display_param12").style.display = "none";
      }
    },
    error: function () {
    }
  });
}
function loadKPIB4B5(serial) {

  const imgPath = 'img/avatars/cutcurrent.b.png';

  $.ajax({
    url: '/KPIs/GetData',
    method: 'GET',
    data: {
      serial: serial
    },
    success: function (data) {
      console.log(data);
      const container = $('#kpiContainer');
      container.empty();
      var dtFrom = "";
      if (data[0] != null) {
        dtFrom = data[0].split("-")[2] + "/" + data[0].split("-")[1] + "/" + data[0].split("-")[0];
      }
      if (data[1] != null) {
        dtTo = data[1].split("-")[2] + "/" + data[1].split("-")[1] + "/" + data[1].split("-")[0];
      }
      var iTotal = parseFloat(data[2]);
      var iClosetoCut = parseFloat(data[3]);
      var yClosetoCut = (iClosetoCut / iTotal) * 100;
      var tClosetoCut = "";
      var msgClosetoCut = "";
      if (yClosetoCut >= 10) {
        tClosetoCut = " fas fa-arrow-down text-warning";
        msgClosetoCut = "Ã¢â€ â€™";
      }

      var iMaxCut = parseFloat(data[4]);
      var yMaxCut = (iMaxCut / iTotal) * 100;
      var tMaxCut = "";
      var msgMaxCut = "";
      if (yMaxCut >= 5) {
        tMaxCut = " fas fa-arrow-down text-danger";
        msgMaxCut = "Ã¢â€ â€œ";
      }

      var iNormalCut = parseFloat(data[5]);
      var yNormalCut = (iNormalCut / iTotal) * 100;

      var iYield = parseFloat(100 - (((iMaxCut) / iTotal) * 100));
      var tYield = "";
      var msgYield = "";
      if (isNaN(iYield)) iYield = 0;
      if (iYield == 0) {
        tYield = "";
        msgYield = "";
      } else if (iYield >= 90) {
        tYield = " fas fa-arrow-up text-success";
        msgYield = "Ã¢â€ â€˜";
      } else if (iYield >= 80 && iYield < 90) {
        tYield = " fas fa-arrow-right text-warning";
        msgYield = "Ã¢â€ â€™";
      } else if (iYield < 80) {
        tYield = " fas fa-arrow-down text-danger";
        msgYield = "Ã¢â€ â€œ";
      }

      console.log(iTotal, ':', iClosetoCut, ':', iMaxCut, ':', iNormalCut, ':', iYield);
      var html = '';
      html = `
              <div class="kpi-card">
                <div class="row">
                  <div class="col-6 text-start">
                    <div><strong><h5 class="text-secondary">Model B${serial}  </h5></strong></div>
                    <div class="text-bold">${dtFrom} - ${dtTo}</div>
                    <p class="text-center"><button class="btn" onclick="GotoCuttingDetail('${serial}');"><img src="${imgPath}" alt="Click for detail" /></button></p>
                  </div>
                  <div class="col-6 mb-0 text-start">
                    <div class="value">Summary Data <br/>
                      <label id="accum_mnu2"></label>
                    </div>
                  </div>
                </div>
              </div>`;


      container.append(html);

    },
    error: function () {
      $('#kpiContainer').html('<div class="text-danger">Failed to load data.</div>');
    }
  });
  setBgButton(serial);
}
function formatNumber(value, fix) {
  if (isNaN(value)) return '';

  const rounded = parseFloat(value).toFixed(fix);
  const parts = rounded.split(".");
  const integerPart = parseInt(parts[0]).toLocaleString();
  const decimalPart = parts[1];

  return `${integerPart}.${decimalPart}`;
}
function loadAutoThreader(serial) {
  const imgPath = 'img/avatars/autothreader.png';
  const container = $('#kpiAutoThreader');
  container.empty();
  let dtFrom = '';
  let dtTo = '';
  var html = '';
  html = `
              <div class="kpi-card">
                <div class="row">
                  <div class="col-6 text-start">
                    <div><strong><h5 class="text-secondary">Model B${serial}  </h5></strong></div>
                    <div class="text-bold">${dtFrom} - ${dtTo}</div>
                    <p class="text-center"><button class="btn" onclick="alert('This function is under development.');"><img src="${imgPath}" alt="Click for detail" /></button></p>
                  </div>
                  <div class="col-6 mb-0 text-start">
                    <div class="value">Summary Data <br/>
                      <label id="accum_mnu1"></label>
                    </div>
                  </div>
                </div>
              </div>`;
  container.append(html);
}
function loadButtonHold(serial) {
  const imgPath = 'img/avatars/buttonhold.b.png';
  const container = $('#kpiButtonHoldInfo');
  container.empty();
  //GetDataKPITopView
  $.ajax({
    url: '/Foot3A/GetDataKPITopView',
    method: 'GET',
    data: {
      serial: serial
    },
    success: function (data) {
      console.log(data);
      const container = $('#kpiButtonHoldInfo');
      container.empty();
      var dtFrom = "";
      if (data[0] != null) {
        dtFrom = data[0].split("-")[2] + "/" + data[0].split("-")[1] + "/" + data[0].split("-")[0];
      }
      if (data[1] != null) {
        dtTo = data[1].split("-")[2] + "/" + data[1].split("-")[1] + "/" + data[1].split("-")[0];
      }
      var iTotal = parseFloat(data[2]);
      console.log(iTotal);
      var html = '';

      html = `
              <div class="kpi-card">
                <div class="row">
                  <div class="col-6 text-start">
                    <div><strong><h5 class="text-secondary">Model B${serial}  </h5></strong></div>
                    <div class="text-bold">${dtFrom} - ${dtTo}</div>
                    <p class="text-center"><button class="btn" onclick="GotoFoot3A('${serial}');"><img src="${imgPath}" alt="Click for detail" /></button></p>
                  </div>
                  <div class="col-6 mb-0 text-start">
                    <div class="value">Summary Data <br/>
                      <label id="accum_mnu3"></label>
                    </div>
                  </div>
                </div>
              </div>`;
      container.append(html);
      //setAlarmBgColorFoot3A(serial);
    },
    error: function () {
      $('#kpiButtonHold').html('<div class="text-danger">Failed to load data.</div>');
    }
  });
}

function loadBobbinCase(serial) {
  const imgPath = 'img/avatars/autothreader.png';
  const container = $('#kpiBobbinCase');
  container.empty();
  let dtFrom = '';
  let dtTo = '';
  var html = '';
  html = `
              <div class="kpi-card">
                <div class="row">
                  <div class="col-6 text-start">
                    <div><strong><h5 class="text-secondary">Model B${serial}  </h5></strong></div>
                    <div class="text-bold">${dtFrom} - ${dtTo}</div>
                    <p class="text-center"><button class="btn" onclick="alert('This function is under development.');"><img src="${imgPath}" alt="Click for detail" /></button></p>
                  </div>
                  <div class="col-6 mb-0 text-start">
                    <div class="value">Summary Data <br/>
                      <label id="accum_mnu4"></label>
                    </div>
                  </div>
                </div>
              </div>`;
  container.append(html);
}
function loadSewingFoot(serial) {
  const imgPath = 'img/avatars/autothreader.png';
  const container = $('#kpiSewingFoot');
  container.empty();
  let dtFrom = '';
  let dtTo = '';
  var html = '';
  html = `
              <div class="kpi-card">
                <div class="row">
                  <div class="col-6 text-start">
                    <div><strong><h5 class="text-secondary">Model B${serial}  </h5></strong></div>
                    <div class="text-bold">${dtFrom} - ${dtTo}</div>
                    <p class="text-center"><button class="btn" onclick="alert('This function is under development.');"><img src="${imgPath}" alt="Click for detail" /></button></p>
                  </div>
                  <div class="col-6 mb-0 text-start">
                    <div class="value">Summary Data <br/>
                      <label id="accum_mnu5"></label>
                    </div>
                  </div>
                </div>
              </div>`;
  container.append(html);
}
function loadDifferanceWeight(serial) {
  const imgPath = 'img/avatars/autothreader.png';
  const container = $('#kpiDifferanceWeight');
  container.empty();
  let dtFrom = '';
  let dtTo = '';
  var html = '';
  html = `
              <div class="kpi-card">
                <div class="row">
                  <div class="col-6 text-start">
                    <div><strong><h5 class="text-secondary">Model B${serial}  </h5></strong></div>
                    <div class="text-bold">${dtFrom} - ${dtTo}</div>
                    <p class="text-center"><button class="btn" onclick="alert('This function is under development.');"><img src="${imgPath}" alt="Click for detail" /></button></p>
                  </div>
                  <div class="col-6 mb-0 text-start">
                    <div class="value">Summary Data <br/>
                      <label id="accum_mnu6"></label>
                    </div>
                  </div>
                </div>
              </div>`;
  container.append(html);
}
function loadThreadTension(serial) {
  //-->Mnu 7. Thread Tension
  const imgPath = 'img/avatars/buttonholdbi.b.png';
  const container = $('#kpiThreadTension');
  container.empty();

  $.ajax({
    url: '/TTA/GetTTADashboardOutput',
    method: 'GET',
    data: {
      serial: serial
    },
    success: function (data) {
      console.log(data);
      const container = $('#kpiThreadTension');
      container.empty();
      var dtFrom = "";
      if (data[0] != null) {
        dtFrom = data[0].split("-")[2] + "/" + data[0].split("-")[1] + "/" + data[0].split("-")[0];
      }
      if (data[1] != null) {
        dtTo = data[1].split("-")[2] + "/" + data[1].split("-")[1] + "/" + data[1].split("-")[0];
      }
      var iTotal = parseFloat(data[2]);
      console.log(iTotal);
      var html = '';
      html = `<div><strong><h5 class="text-secondary">Model B${serial}  </h5></strong></div>
              <div class="text-bold">${dtFrom} - ${dtTo}</div>
              <p class="text-center"><button class="btn" onclick="GotoTTA('${serial}');">
              <img src="${imgPath}" alt="Click for detail" /></button></p>`;
      container.append(html);

      $("#lblTTATotalTest").html(`<div class="value">Summary Data <br/>
                      <label id="accum_mnu7"></label>
                    </div>`);
      //setAlarmBgColorFoot3A(serial);
    },
    error: function () {
      //$('#kpiButtonHold').html('<div class="text-danger">Failed to load data.</div>');
    }
  });

}
function loadTTAAdjustment(serial) {
  const imgPath = 'img/avatars/autothreader.png';
  const container = $('#kpiTTAAdjustment');
  container.empty();
  let dtFrom = '';
  let dtTo = '';
  var html = '';
  html = `
              <div class="kpi-card">
                <div class="row">
                  <div class="col-6 text-start">
                    <div><strong><h5 class="text-secondary">Model B${serial}  </h5></strong></div>
                    <div class="text-bold">${dtFrom} - ${dtTo}</div>
                    <p class="text-center"><button class="btn" onclick="alert('This function is under development.');"><img src="${imgPath}" alt="Click for detail" /></button></p>
                  </div>
                  <div class="col-6 mb-0 text-start">
                    <div class="value">Summary Data <br/>
                      <label id="accum_mnu8"></label>
                    </div>
                  </div>
                </div>
              </div>`;
  container.append(html);
}
function loadBalanceRough(serial) {
  $("#lblMnu9").html("9. Balance Adjustment");
  const imgPath = 'img/avatars/balance.b.png';
  const container = $('#kpiBalanceRough');
  container.empty();

  $.ajax({
    url: '/BalanceAdjust/GetBalanceAdjustOutput',
    method: 'GET',
    data: {
      serial: serial
    },
    success: function (data) {
      console.log(data);
      const container = $('#kpiBalanceRough');
      container.empty();
      var dtFrom = "";
      if (data[0] != null) {
        dtFrom = data[0].split("-")[2] + "/" + data[0].split("-")[1] + "/" + data[0].split("-")[0];
      }
      if (data[1] != null) {
        dtTo = data[1].split("-")[2] + "/" + data[1].split("-")[1] + "/" + data[1].split("-")[0];
      }
      var iTotal = parseFloat(data[2]);
      console.log(iTotal);
      var html = '';

      html = `<div><strong><h5 class="text-secondary">Model B${serial}  </h5></strong></div>
              <div class="text-bold">${dtFrom} - ${dtTo}</div>
              <p class="text-center"><button class="btn" onclick="GotoBalanceAdj('${serial}');">
              <img src="${imgPath}" alt="Click for detail" /></button></p>`;
      container.append(html);
      $("#lblBalAdjTotalTest").html(`<div class="value">Summary Data <br/>
                      <label id="accum_mnu9"></label>
                    </div>`);
      //setAlarmBgColorFoot3A(serial);
    },
    error: function () {
      //$('#kpiButtonHold').html('<div class="text-danger">Failed to load data.</div>');
    }
  });
}
function loadBalanceFine(serial) {
  const imgPath = 'img/avatars/autothreader.png';
  const container = $('#kpiBalanceFine');
  container.empty();
  let dtFrom = '';
  let dtTo = '';
  var html = '';
  html = `
              <div class="kpi-card">
                <div class="row">
                  <div class="col-6 text-start">
                    <div><strong><h5 class="text-secondary">Model B${serial}  </h5></strong></div>
                    <div class="text-bold">${dtFrom} - ${dtTo}</div>
                    <p class="text-center"><button class="btn" onclick="alert('This function is under development.');"><img src="${imgPath}" alt="Click for detail" /></button></p>
                  </div>
                  <div class="col-6 mb-0 text-start">
                    <div class="value">Total ${0}</div>
                  </div>
                </div>
              </div>`;
  container.append(html);
}
function loadBDFBalance(serial) {
  const imgPath = 'img/avatars/autothreader.png';
  const container = $('#kpiBDFBalance');
  container.empty();
  let dtFrom = '';
  let dtTo = '';
  var html = '';
  html = `
              <div class="kpi-card">
                <div class="row">
                  <div class="col-6 text-start">
                    <div><strong><h5 class="text-secondary">Model B${serial}  </h5></strong></div>
                    <div class="text-bold">${dtFrom} - ${dtTo}</div>
                    <p class="text-center"><button class="btn" onclick="alert('This function is under development.');"><img src="${imgPath}" alt="Click for detail" /></button></p>
                  </div>
                  <div class="col-6 mb-0 text-start">
                    <div class="value">Total ${0}</div>
                  </div>
                </div>
              </div>`;
  container.append(html);
}
function loadBasePlate(serial) {
  const imgPath = 'img/avatars/autothreader.png';
  const container = $('#kpiBasePlate');
  container.empty();
  let dtFrom = '';
  let dtTo = '';
  var html = '';
  html = `
              <div class="kpi-card">
                <div class="row">
                  <div class="col-6 text-start">
                    <div><strong><h5 class="text-secondary">Model B${serial}  </h5></strong></div>
                    <div class="text-bold">${dtFrom} - ${dtTo}</div>
                    <p class="text-center"><button class="btn" onclick="alert('This function is under development.');"><img src="${imgPath}" alt="Click for detail" /></button></p>
                  </div>
                  <div class="col-6 mb-0 text-start">
                    <div class="value">Total ${0}</div>
                  </div>
                </div>
              </div>`;
  container.append(html);
}

function GotoCuttingDetail(series) {
  var url = '/ASSPrdData/MaxThread?fullscreen=true&series=' + series;
  window.location.href = url;

}
function GotoFoot3A(series) {
  var url = '/Foot3a/?fullscreen=true&series=' + series;
  window.location.href = url;

}
function GotoTTA(series) {
  var url = '/TTA/?fullscreen=true&series=' + series;
  window.location.href = url;

}
function GotoBalanceAdj(series) {
  var url = '/BalanceAdjust/?fullscreen=true&series=' + series;
  window.location.href = url;

}
function GotoDetail(groupData) {
  if (groupData == "Cutting Current") {
    var url = '/ASSPrdData/MaxThread';
    window.location.href = url;
  } else {
    alert("Ã¢â€ºâ€ This function is under testing");
  }
}
// Toggle full screen
document.getElementById("toggleFullscreenBtn").addEventListener("click", function () {
  const isFull = localStorage.getItem("isFullscreen") === "true";
  localStorage.setItem("isFullscreen", (!isFull).toString());
  window.location.href = "?fullscreen=" + isFull;

});
function setAlarmBgColorFoot3A(series) {
  let paramcode = '1000'; // B4,B5
  if (series == '7') {
    paramcode = '2000';
  } else if (series == '4' || series == '5') {
    paramcode = '1000';
  } else if (series == '3') {
    paramcode = '3000';
  }
  $.ajax({
    type: "GET",
    url: "/Foot3A/GetKPIParamsByKey",
    data: { param_code: paramcode },
    beforeSend: function () {

    },
    success: function (response) {
      if (response.length == 10) {

        let McParam1 = response[0];
        let McParam2 = response[1];
        let McParam3 = response[2];//25
        let McParam4 = response[3];//35
        let McParam5 = response[4];//60
        let McParam6 = response[5];//80
        let McParam7 = response[6];//15%
        let McParam8 = response[7];//5%
        let McParam9 = response[8];//
        let McParam10 = response[9];// Remarks

        $.ajax({
          type: "GET",
          url: "/Foot3A/GetDataFoot3A",
          data: { series: series, dtstart: null, dtend: null, flagrange: 'W' },
          beforeSend: function () {

          },
          success: function (response) {
            let minA = 0; let minB = 0;
            let maxA = 0; let maxB = 0;
            minA = McParam3;
            minB = McParam4;
            maxA = McParam5;
            maxB = McParam6;

            const jsonData = response;
            const validSerialDates = jsonData
              .filter(item => item.serial.length > 5 && item.serial.trim() !== '')
              .map(item => item.startDate_txt);
            const totalCount = validSerialDates.length;

            const valueALow = jsonData.filter(item => item.valueA !== null && item.valueA <= 25 && item.serial.length > 5); //item.valueA <= 25
            const countValueALow = valueALow.length;
            const percentValueALow = ((countValueALow / totalCount) * 100).toFixed(2);

            const valueBHigh = jsonData.filter(item => item.valueB !== null && item.valueB > 80 && item.serial.length > 5); //item.valueB > 80
            const countValueBHigh = valueBHigh.length;
            const percentValueBHigh = ((countValueBHigh / totalCount) * 100).toFixed(2);

            console.log(`valueA <= 25: ${countValueALow} Ã Â¸Â£Ã Â¸Â²Ã Â¸Â¢Ã Â¸ÂÃ Â¸Â²Ã Â¸Â£ (${percentValueALow}%)`);
            console.log(`valueB >= 80: ${countValueBHigh} Ã Â¸Â£Ã Â¸Â²Ã Â¸Â¢Ã Â¸ÂÃ Â¸Â²Ã Â¸Â£ (${percentValueBHigh}%)`);

            //--- 7 Day Zone ---------------
            /*$("#lbl7DTotalTest").html("<font>7 Days Alarm.<br/></font>");*/

            if ((percentValueBHigh >= McParam7) || (percentValueALow >= McParam8)) {
              //--> $('#kpiButtonHold').addClass('bg-warning');
            }

          },
          complete: function () {
          },
          error: function (xhr) {

          }
        });
      }
    },
    complete: function () {
    },
    error: function (xhr) {

    }
  });
}
var remarkModal = new bootstrap.Modal(document.getElementById("remarkModal"));
function PublicRemark() {
  mnuRemark("A");
}
function mnuRemark(mnu) {
  //alert(mnu);
  let curModel = $("#curModel").val();
  if (mnu != 'A') {
    $("#lblTitleRemark").html("Add remark for Menu No." + mnu + ", Model B" + curModel);
    $("#rdoRemark2").val(curModel);
    $("#rdoRemark2").prop("checked", true);
  } else {
    $("#lblTitleRemark").html("Add remark");
  }

  $("#btnAddRemark").addClass("btn btn-success mt-2");
  $("#btnUpdateRemark").prop("style", "display:none;");
  $("#btnUpdateRemark").removeClass("btn btn-info mt-2");
  $('#trid').val(null);
  $('#txtRemark').val(null);
  $('#lblmnu').val(mnu);

  if (mnu == 'A') {
    $("#divForGlobal").prop("style", "display:block;");
    $("#lblRdoRemark2").html("Remark publish for Model B" + curModel);
    $("#rdoRemark2").val(curModel);
  } else {
    $("#divForGlobal").prop("style", "display:none;");
    $("#lblRdoRemark2").html(null);
  }
  remarkModal.show();

  //K Supong Request to close discussed 22/12/25
  BindDataTableRemark(mnu);

}

async function BindDataTableRemarkLasMsg(menuno, series) {
  const query = new URLSearchParams({ menuno, series }).toString();
  const response = await fetch(`/Dashboards/GetHistoryRemarkLastMsg?${query}`);
  if (!response.ok) {
    //alert("Load remark failed.");
    return;
  } else {
    const jsonData = await response.json();
    //console.log(jsonData);

    if (menuno == "A" && series == "0") {
      $("#lblMsgRemarkHeader").html(`${jsonData[2]}`);
    }
    if (menuno == "A" && series != "0") {
      $("#lblMsgRemark").html(`${jsonData[2]}`);
    }


    if (menuno == "1") $("#rmk_serial1").html(`${jsonData[2]}`);
    if (menuno == "2") $("#rmk_serial2").html(`${jsonData[2]}`);
    if (menuno == "3") $("#rmk_serial3").html(`${jsonData[2]}`);
    if (menuno == "4") $("#rmk_serial4").html(`${jsonData[2]}`);
    if (menuno == "5") $("#rmk_serial5").html(`${jsonData[2]}`);
    if (menuno == "6") $("#rmk_serial6").html(`${jsonData[2]}`);
    if (menuno == "7") $("#rmk_serial7").html(`${jsonData[2]}`);
    if (menuno == "8") $("#rmk_serial8").html(`${jsonData[2]}`);
    if (menuno == "9") $("#rmk_serial9").html(`${jsonData[2]}`);
    if (menuno == "91") $("#rmk_serial91").html(`${jsonData[2]}`);
    if (menuno == "92") $("#rmk_serial92").html(`${jsonData[2]}`);
    if (menuno == "10") $("#rmk_serial10").html(`${jsonData[2]}`);

  }
}
async function BindDataTableRemark(mnu) {
  let menuno = mnu.toString();
  $('#lblmnu').val(menuno);
  let series = $("#curModel").val();

  const query = new URLSearchParams({ menuno, series }).toString();
  console.log(query);
  const response = await fetch(`/Dashboards/GetHistoryRemark?${query}`);

  if (!response.ok) {
    alert("Load remark failed.");
    return;
  }
  if ($.fn.DataTable.isDataTable('#bindDataTableRemark')) {
    console.log("Clear data");
    $('#bindDataTableRemark').DataTable().clear().destroy();
  }

  const result = await response.json();
  const data = result;
  //if (data.length == 0) {
  //  return;
  //}
  // Draw table
  //-- Start Tables

  $('#bindDataTableRemark').DataTable({
    data: data,
    order: [[0, 'desc']],
    pageLength: 50,
    columns: [
      { data: 'create_dt', visible: false },
      {
        data: 'trid',
        render: function (data, type, row) {
          if (row.remarks != '') {
            return `${row.remarks} <br/> <b>${row.create_dt_txt}</b>`;
          } else {
            return `-`;
          }
        }
      },
      {
        data: 'trid',
        render: function (data, type, row) {
          return `
            <i id="btnItemEdit" class="ri-save-3-fill text-success" onclick="javascript:EditItem('${data}');" style="cursor:pointer; font-size: 24px;" title='Edit'></i>
            <i id="btnItemDel" class="ri-delete-bin-2-fill text-danger" onclick="javascript:DeleteRemark('${data}');" style="cursor:pointer; font-size: 24px;" title='Delete'></i>
            `;
        }
      }
    ]
  });
  //-- End Tables
  return;
}
function DeleteRemark(trid) {

  let lblmnu = $('#lblmnu').val();
  $('#trid').val(trid);
  if (!confirm("ðŸ’¾ \r Confirm Delete remark.")) return;
  let ObjParam = {
    trid: trid
  }
  $.ajax({
    url: '/Dashboards/DeleteHistoryRemark',
    method: 'DELETE',
    data: ObjParam,
    success: function (res) {
      BindDataTableRemark(lblmnu);
      $('#trid').val(null);
    },
    error: function () {
      alert("Error saving data");
    }
  });
}
$("#btnAddRemark").click(function () {
  let lblmnu = $('#lblmnu').val();
  let series = $("#curModel").val();
  let remark = $('#txtRemark').val();
  let radioValue = document.querySelector('input[name="rdoRemark"]:checked')?.value;

  let warningMsg = "";
  if (radioValue == 0) {
    series = '0';
    warningMsg = "ðŸ’¾ \r Confirm add remark for all models";
  } else {
    warningMsg = "ðŸ’¾ \r Confirm add remark for B" + series;
  }


  if (series == null || series == '' && remark == '') {
    alert("No data"); return;
  }
  if (!confirm(warningMsg)) return;

  let ObjParam = {
    menuno: lblmnu,
    series: series,
    remarks: remark
  }
  $.ajax({
    url: '/Dashboards/InsHistoryRemark',
    method: 'POST',
    data: ObjParam,
    success: function (res) {
      window.location.reload();
    },
    error: function () {
      alert("Error saving data");
    }
  });


});
function EditItem(trid) {
  $.ajax({
    url: '/Dashboards/GetHistoryRemarkByid',
    method: 'GET',
    data: { trid: trid },
    success: function (res) {
      console.log(res);
      $('#trid').val(trid);
      $('#txtRemark').val(res[2]);
    },
    error: function () {
      alert("Error saving data");
    }
  });

  $("#btnAddRemark").removeClass("btn btn-success mt-2");
  $("#btnAddRemark").prop("style", "display:none;");

  $("#btnUpdateRemark").addClass("btn btn-info mt-2");
  $("#btnUpdateRemark").prop("style", "display:block;");

}

$("#btnUpdateRemark").click(function () {
  let lblmnu = $('#lblmnu').val();
  let trid = $('#trid').val();
  let remark = $('#txtRemark').val();
  if (remark == '') {
    alert("No data"); return;
  }
  if (!confirm("ðŸ’¾ \r Confirm Revise update remark.")) return;

  let ObjParam = {
    trid: trid,
    remarks: remark
  }
  $.ajax({
    url: '/Dashboards/UpdateHistoryRemark',
    method: 'PUT',
    data: ObjParam,
    success: function (res) {
      window.location.reload();
    },
    error: function () {
      alert("Error saving data");
    }
  });

});

async function BindDataTableTop10Failed(series) {

  const query = new URLSearchParams({ series }).toString();
  console.log(query);
  const response = await fetch(`/Dashboards/GetTop10Failed?${query}`);

  if (!response.ok) {
    alert("Load remark failed.");
    return;
  }
  if ($.fn.DataTable.isDataTable('#bindDataTableTop10')) {
    console.log("Clear data");
    $('#bindDataTableTop10').DataTable().clear().destroy();
  }

  const result = await response.json();
  const data = result;
  $('#bindDataTableTop10').DataTable({
    data: data,
    order: [[0, 'desc']],

    paging: false,
    searching: false,
    info: false,
    lengthChange: false,
    ordering: false,
    autoWidth: false,
    responsive: false,

    pageLength: 10,
    columns: [
      { data: 'Test', title: 'Test' },
      { data: 'fails', title: 'fails' },
      { data: 'ratio', title: 'ratio' },
    ]
  });
  //-- End Tables
  return;
}


async function BindDataTableDailyProd(series) {
  //let series = $("#curModel").val();

  const query = new URLSearchParams({ series }).toString();
  const response = await fetch(`/Dashboards/GetDailyProduction?${query}`);

  if (!response.ok) {
    alert("Load remark failed.");
    return;
  }
  if ($.fn.DataTable.isDataTable('#bindDataTableDailyPrd')) {
    $('#bindDataTableDailyPrd').DataTable().clear().destroy();
  }

  const result = await response.json();
  console.log(result);
  //const data = result;
  // --- ส่วนที่แก้ไข: กรองข้อมูลที่ MachineCount > 0 ---
  const filteredData = result.filter(item => item.MachineCount > 0);
  $('#bindDataTableDailyPrd').DataTable({
    data: filteredData,
    order: [[0, 'desc']],

    //paging: false,    
    searching: true,
    info: false,
    lengthChange: false,
    ordering: false,
    autoWidth: false,
    responsive: false,

    pageLength: 10,
    columns: [
      { data: 'monitor_dt', title: 'Day' },
      { data: 'displayName', title: 'displayName' },
      { data: 'MachineCount', title: 'MachineCount' },
    ]
  });
  //-- End Tables
  //-- Render Chart
  renderChart(result);
  return;
}
// 1. ประกาศตัวแปรเก็บ Instance ของ Chart ไว้ข้างนอก
let myChartInstance = null;

function renderChart(data) {
  // ใส่ในฟังก์ชัน renderChart ก่อนเรียกใช้ getFormattedDate
  //console.log(data);
  //data.forEach(item => {
  //  if (!item.Day || !item.Day.includes('/')) {
  //    console.error('Invalid Date Format:', item);
  //  }
  //});
  // 1. ล้างค่ากราฟเก่า (ถ้ามี)
  if (myChartInstance) myChartInstance.destroy();

  // --- วิธีแก้ไข: ใช้การตัด String แทนการแปลงเป็น Object Date ทันที ---
  const getFormattedDate = (dateString) => {
    if (!dateString) return '';
    const datePart = dateString.split(' ')[0];

    // ตรวจสอบว่าใช้เครื่องหมายอะไร
    let parts;
    if (datePart.includes('-')) {
      parts = datePart.split('-'); // สำหรับ 11-02-2026
    } else {
      parts = datePart.split('/'); // สำหรับ 2/16/2026
    }

    if (parts.length !== 3) return '';

    // ตรวจสอบว่าส่วนไหนคือปี (ถ้าปีอยู่หน้าสุด หรือหลังสุด)
    let year = parts[0].length === 4 ? parts[0] : parts[2];
    let month = parts[0].length === 4 ? parts[1] : parts[0];
    let day = parts[0].length === 4 ? parts[2] : parts[1];

    // จัดเรียงเป็น YYYY-MM-DD
    return `${year.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };


  const rawDates = [...new Set(data.map(item => getFormattedDate(item.Day)))].sort();
  const displayNames = [...new Set(data.map(item => item.displayName))];
  const labels = rawDates.map(d => {
    const p = d.split('-');
    return `${p[2]}/${p[1]}/${p[0]}`;
  });

  // --- ส่วนที่เปลี่ยน: ใช้ Palette สี ---
  const colorPalette = [
    'rgba(54, 162, 235, 0.7)',
    'rgba(255, 99, 132, 0.7)',
    'rgba(255, 206, 86, 0.7)',
    'rgba(75, 192, 192, 0.7)',
    'rgba(153, 102, 255, 0.7)',
    'rgba(255, 159, 64, 0.7)',
    'rgba(0, 200, 83, 0.7)',
    'rgba(121, 85, 72, 0.7)',
    'rgba(96, 125, 139, 0.7)',
  ];

  const datasets = displayNames.map((name, index) => {
    return {
      label: name,
      data: rawDates.map(date => {
        const record = data.find(item =>
          getFormattedDate(item.Day) === date &&
          item.displayName === name
        );
        return record ? record.MachineCount : 0;
      }),
      // 1. ใช้สีจาก Palette โดยใช้ index ให้วนลูปถ้ามี displayName มากกว่าจำนวนสี
      backgroundColor: colorPalette[index % colorPalette.length],
      borderColor: colorPalette[index % colorPalette.length].replace('0.7', '1'), // ขอบสีเข้มขึ้นเล็กน้อย
      borderWidth: 1
    };
  });

  const ctx = document.getElementById('dailyProdChart').getContext('2d');

  myChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: datasets
    },
    options: {
      responsive: true,
      // 1. ลงทะเบียน Plugin และตั้งค่า
      plugins: {
        datalabels: {
          anchor: 'center',
          align: 'center',
          // --- ส่วนที่ปรับเปลี่ยน ---
          color: '#000000', // เปลี่ยนสีข้อความเป็นสีดำ
          font: {
            weight: 'bold',
            size: 14 // เพิ่มขนาด Font ตามต้องการ (เช่น 14px)
          },
          formatter: function (value, context) {
            // 2. ซ่อนเลข 0 ไม่ให้รกกราฟ
            return value > 0 ? value : '';
          }
        },
        title: {
          display: true,
          text: 'Daily Production Chart'
        }
      },
      scales: {
        x: { stacked: true },
        y: { stacked: true, beginAtZero: true }
      }
    },
    // 3. เรียกใช้งาน Plugin
    plugins: [ChartDataLabels]
  });

}
let dailyToggle = false;
function showDailyData() {
  if (!dailyToggle) {
    dailyToggle = true;
    $("#spanDailyData").prop("style", "display:block;");
  } else {
    dailyToggle = false;
    $("#spanDailyData").prop("style", "display:none;");
  }
}
