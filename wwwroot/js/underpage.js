$(document).ready(function () {
  //$('#loadingModal').modal('show');
  const params = new URLSearchParams(window.location.search);
  const pageid = params.get("pageid");
  $('#lblUndermaintenance').html("Model B" + pageid);

});
