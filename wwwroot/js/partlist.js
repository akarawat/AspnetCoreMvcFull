$(document).ready(function () {
  $.ajax({
    type: "GET",
    url: "/ASSPrdData/GetPartList",
    success: function (response) {
      //console.log(response);
      $('#bindDataTable').DataTable({
        data: response,
        columns: [
          { data: 'itemno', className: 'testNameClass' },
          { data: 'itemname' },
          { data: 'itemdoc' },
          { defaultContent: '<button type="button" class="btn btn-lg btn-outline-danger"> <i class="fa fa-folder"></i></button>' }

        ]
      });

      $('#bindDataTable').on('click', 'button', function (e) {
        //var data = e.r.row($(this).parents('tr')).data();
        alert($(this).parents('tr').find('.testNameClass')[0].innerHTML);
        //console.log(e.target.closest('tr').find('.testNameClass').val());
        //let data = table.row(e.target.closest('tr')).data();
        //alert(data[0] + "'s salary is: " + data[1]);
      });

      //$(".btnTest").on("click", function () {
      //  /*console.log($(this).parents('tr').find('.testNameClass').val());*/
      //  console.log($(this).parents('tr'));
      //});

    },
    error: function (response) {
      alert(response.responseText);
    }
  });
});


//$(document).ready(function () {
//  $.ajax({
//    url: "/ASSPrdData/GetToolItemList",
//    type: "GET",
//    data: null,
//    success: function (response) {
//      console.log(response);
//    },
//    error: function (request, status, error) {
//      alert(request.responseText);
//    }
//  });
//});

$("#btnSubmit").click(function () {
  
});
