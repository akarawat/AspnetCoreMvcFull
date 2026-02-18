$(document).ready(function () {

});

$('.btnSave').on('click', function () {
  if (!confirm("💾 \r Confirm save configuration.")) return;
  const row = $(this).closest('tr');
  const model = {
    series:  $("#input_0").val(),
    mnufunc: $("#input_1").val(),
    max_fail: $("#input_2").val(),
    min_fail: $("#input_3").val(),
    param_1: $("#input_4").val(),
    param_2: $("#input_5").val(),
    param_3: $("#input_6").val(),
    param_4: $("#input_7").val(),
    param_5: $("#input_8").val(),
    remarks: $("#input_11").val()
  };
  console.log(model);
  $.ajax({
    url: '/AdminCfg/SavePassFailParameters',
    method: 'POST',
    data: model,
    success: function (res) {
      alert(res.message);
      location.href = "/AdminCfg/PassFailConfig";
    },
    error: function () {
      alert("Error saving data");
    }
  });
});

$('.btnDelete').on('click', function () {
  if (!confirm("🗑️ \r Confirm delete configuration.")) return;
  const row = $(this).closest('tr');
  const model = {
    id: row.data('id')
  };

  $.ajax({
    url: '/AdminCfg/DeletePassFailParameters',
    method: 'POST',
    data: model,
    success: function (res) {
      alert(res.message);
      location.href = "/AdminCfg/PassFailConfig";
    },
    error: function () {
      alert("Error saving data");
    }
  });
});

$('.btnUpdate').on('click', function () {
  if (!confirm("💾 \r Confirm save configuration.")) return;
  const row = $(this).closest('tr');
  const model = {
    id: row.data('id'),
    series: row.find('td:eq(0) input').val(),
    mnufunc: row.find('td:eq(1) input').val(),
    max_fail: row.find('td:eq(2) input').val(),
    min_fail: row.find('td:eq(3) input').val(),
    param_1: row.find('td:eq(4) input').val(),
    param_2: row.find('td:eq(5) input').val(),
    param_3: row.find('td:eq(6) input').val(),
    param_4: row.find('td:eq(7) input').val(),
    param_5: row.find('td:eq(8) input').val(),
    remarks: row.find('td:eq(9) textarea').val()
  };
  console.log(model);
  $.ajax({
    url: '/AdminCfg/UpdatePassFailParameters',
    method: 'PUT',
    data: model,
    success: function (res) {
      alert(res.message);
      location.href = "/AdminCfg/PassFailConfig";
    },
    error: function () {
      alert("Error saving data");
    }
  });
});
