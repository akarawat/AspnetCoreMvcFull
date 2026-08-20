using AspnetCoreMvcFull.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Data;

namespace AspnetCoreMvcFull.Controllers;

// #PDU-Web — Dashboard for Upper Feed Test data (dbo.mig_UpperFeedTest),
// migrated from DB1 by SP_BATLNK_MigUpperFeedTest.
public class UpperFeedTestController : Controller
{
  private readonly IConfiguration _configuration;

  public UpperFeedTestController(IConfiguration configuration)
  {
    _configuration = configuration;
  }

  // -----------------------------------------------------------------------
  // GET /UpperFeedTest?series=9&fullscreen=true
  // -----------------------------------------------------------------------
  public IActionResult Index(string? series, string? fullscreen)
  {
    string[] validSeries = { "3", "4", "5", "7", "9" };
    string activeSeries = validSeries.Contains(series) ? series : "9";
    ViewData["ActiveSeries"] = activeSeries;

    bool isFullscreen = fullscreen?.ToLower() == "true";
    ViewData["isFullscreen"] = isFullscreen;
    ViewData["isMenu"] = !isFullscreen;
    ViewData["isNavbar"] = !isFullscreen;
    ViewData["menuFixed"] = isFullscreen ? "" : "menu-fixed";
    ViewData["navbarType"] = isFullscreen ? "layout-navbar-hidden" : "layout-navbar-fixed";

    return View();
  }

  // -----------------------------------------------------------------------
  // GET /UpperFeedTest/GetUpperFeedTest?series=9&flagrange=W
  // SP: SP_GetUpperFeedTest
  // -----------------------------------------------------------------------
  [HttpGet]
  public JsonResult GetUpperFeedTest(string? series, string? flagrange, string? dt_from, string? dt_to)
  {
    string connStr = _configuration["ConnectionStrings:connBtBiDataUtilize"];
    var result = new List<UpperFeedTestModel>();

    using (SqlConnection conn = new SqlConnection(connStr))
    {
      conn.Open();
      SqlCommand cmd = new SqlCommand("SP_GetUpperFeedTest", conn);
      cmd.CommandType = CommandType.StoredProcedure;
      cmd.Parameters.AddWithValue("@series", string.IsNullOrEmpty(series) ? (object)DBNull.Value : series);
      cmd.Parameters.AddWithValue("@flagrange", string.IsNullOrEmpty(flagrange) ? "W" : flagrange);
      cmd.Parameters.AddWithValue("@dt_from", string.IsNullOrEmpty(dt_from) ? (object)DBNull.Value : dt_from);
      cmd.Parameters.AddWithValue("@dt_to", string.IsNullOrEmpty(dt_to) ? (object)DBNull.Value : dt_to);

      SqlDataReader rdr = cmd.ExecuteReader();
      while (rdr.Read())
      {
        var pd = Convert.ToDateTime(rdr["productionDate"]);
        result.Add(new UpperFeedTestModel
        {
          serial = rdr["serial"]?.ToString(),
          productionDate = pd,
          productionDate_txt = pd.ToString("dd-MM-yyyy HH:mm"),
          productionDate_ts = new DateTimeOffset(pd).ToUnixTimeMilliseconds(),
          series = rdr["series"]?.ToString(),
          name = rdr["name"]?.ToString(),
          testDefinitionId = rdr["testDefinitionId"]?.ToString(),
          balance = rdr["Balance"] == DBNull.Value ? (double?)null : Convert.ToDouble(rdr["Balance"]),
          balanceUpperFeed = rdr["BalanceUpperFeed"] == DBNull.Value ? (double?)null : Convert.ToDouble(rdr["BalanceUpperFeed"])
        });
      }
      conn.Close();
    }
    return Json(result);
  }
}
