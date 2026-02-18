$(document).ready(function () {

});

$('.btnSave').on('click', function () {
  if (!confirm("💾 \r Confirm save configuration.")) return;
  const row = $(this).closest('tr');
  const model = {
    id: row.data('id'),
    param_code: row.find('td:eq(0) input').val(),
    param_func: row.find('td:eq(1) input').val(),
    mc_model: row.find('td:eq(2) input').val(),
    param_1: row.find('td:eq(3) input').val(),
    param_2: row.find('td:eq(4) input').val(),
    param_3: row.find('td:eq(5) input').val(),
    param_4: row.find('td:eq(6) input').val(),
    param_5: row.find('td:eq(7) input').val(),
    param_6: row.find('td:eq(8) input').val(),
    param_7: row.find('td:eq(9) input').val(),
    remarks: row.find('td:eq(10) textarea').val()
  };
  console.log(model);
  $.ajax({
    url: '/AdminCfg/SaveKPIParameters',
    method: 'POST',
    data: model,
    success: function (res) {
      alert(res.message);
      //location.href = "/AdminCfg/MachineParam";
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
    url: '/AdminCfg/DeleteKPIParameters',
    method: 'POST',
    data: model,
    success: function (res) {
      alert(res.message);
      location.href = "/AdminCfg/MachineParam";
    },
    error: function () {
      alert("Error saving data");
    }
  });
});
