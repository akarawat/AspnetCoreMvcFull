using AspnetCoreMvcFull.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Data;
using System.Diagnostics;
using System.Reflection.Metadata.Ecma335;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace AspnetCoreMvcFull.Controllers;

public class KPIsController : Controller
{
  private readonly ILogger<KPIsController> _logger;
  private readonly IConfiguration _configuration;
  public KPIsController(ILogger<KPIsController> logger, IConfiguration configuration)
  {
    _logger = logger;
    _configuration = configuration;
  }
  public IActionResult IndexBak() => View();
  public IActionResult Index(string fullscreen)
  {
    //HttpContext.Session.SetString(SessionModel.SAMNAME, "Bernina Temporary User");
    string isFullscreen = Request.Query["fullscreen"]; // หรือ TempData
    if (isFullscreen ==  null)
    {
      ViewData["isFullscreen"] = "false";
    }
    else
    {
      ViewData["isFullscreen"] = isFullscreen.ToString().ToLower();
    }
      
    return View();
  }
  [HttpGet]
  public IActionResult GetDataBak()
  {
    var data = new List<KPIItem>
        {
            new KPIItem { Title = "Cutting Current", Value = 15.4, Average = 15.4, StdDev = 2.3, Status = "OK", Direction = "up" },
            new KPIItem { Title = "Power Consumption", Value = -4.9, Average = 0.7, StdDev = 0.7, Status = "PROBLEM", Direction = "right" },
            new KPIItem { Title = "Balance Adjustm", Value = 2.8, Average = 2.8, StdDev = 0.3, Status = "WARNING", Direction = "up" },
            new KPIItem { Title = "Operating Speed", Value = 104.7, Average = 7.6, StdDev = 7.6, Status = "OK", Direction = "up" },
            new KPIItem { Title = "Flow Rate", Value = 18.1, Average = 18.1, StdDev = 2.9, Status = "PROBLEM", Direction = "down" },
            new KPIItem { Title = "Cycle Time", Value = 38.6, Average = 4.2, StdDev = 4.2, Status = "OK", Direction = "up" },
            new KPIItem { Title = "Statistics Error", Value = 2.1, Average = 0.5, StdDev = 0.5, Status = "WARNING", Direction = "down" },
            new KPIItem { Title = "Force Index", Value = 58.3, Average = 5.0, StdDev = 5.0, Status = "OK", Direction = "up" },
        };

    return Json(data);
  }
  [HttpGet]
  public IActionResult GetDataBak3()
  {
    IConfiguration _configuration = new ConfigurationBuilder()
        .SetBasePath(Directory.GetCurrentDirectory())
        .AddJsonFile("appsettings.json")
        .Build();

    string connStr = _configuration["ConnectionStrings:connBtBiDataUtilize"];

    List<KPIItem> result = new List<KPIItem>();

    using (SqlConnection conn = new SqlConnection(connStr))
    {
      conn.Open();

      SqlCommand cmd = new SqlCommand("SP_KPIs_GetData", conn);
      cmd.CommandType = CommandType.StoredProcedure;

      SqlDataReader rdr = cmd.ExecuteReader();
      while (rdr.Read())
      {
        result.Add(new KPIItem
        {
          Title = rdr["Title"].ToString(),
          Value = Convert.ToDouble(rdr["Value"]),
          Average = Convert.ToDouble(rdr["Average"]),
          StdDev = Convert.ToDouble(rdr["StdDev"]),
          Status = rdr["Status"].ToString(),
          Direction = rdr["Direction"].ToString()
        });
      }

      conn.Close();
    }

    return Json(result);
  }
  [HttpGet]
  public JsonResult GetDataBak4(string serial)
  {
    IConfiguration _configuration = new ConfigurationBuilder()
        .SetBasePath(Directory.GetCurrentDirectory())
        .AddJsonFile("appsettings.json")
        .Build();

    string connStr = _configuration["ConnectionStrings:connBtBiDataUtilize"];

    List<KPIThreadCut> result = new List<KPIThreadCut>();


    using (SqlConnection conn = new SqlConnection(connStr))
    {
      conn.Open();
      SqlCommand cmd = new SqlCommand("SP_KPIDashboard_MachineTestSummary", conn);
      cmd.CommandType = CommandType.StoredProcedure;
      cmd.Parameters.AddWithValue("@serial", SqlDbType.VarChar).Value = serial;

      SqlDataReader rdr = cmd.ExecuteReader();
      while (rdr.Read())
      {
        result.Add(new KPIThreadCut
        {
          TotalTests = Convert.ToInt32(rdr["TotalTests"]),
          DefectCutterCount = Convert.ToInt32(rdr["DefectCutterCount"]),
          DefectNormalCount = Convert.ToInt32(rdr["DefectNormalCount"]),
          TotalDefects = Convert.ToInt32(rdr["TotalDefects"]),
          OutputPercent = Convert.ToDouble(rdr["OutputPercent"])
        });
      }

      conn.Close();
    }

    return Json(result);
  }
  [HttpGet]
  public JsonResult GetData(string serial)
  {
    IConfiguration _configuration = new ConfigurationBuilder()
                        .SetBasePath(Directory.GetCurrentDirectory())
                        .AddJsonFile("appsettings.json")
                        .Build();
    string SqlconString = _configuration[key: "ConnectionStrings:connBtBiDataUtilize"];
    string[] result = new string[6];
    int itotalTest = 0;
    int itotalCloseCut = 0;
    int itotalMaxCut = 0;
    int itotalNormalCut = 0;
    try
    {
      SqlConnection sqlCon = null;
      using (sqlCon = new SqlConnection(SqlconString))
      {
        sqlCon.Open();

        SqlCommand cmd = new SqlCommand("SP_GetThreadCuttDashboardOutput", sqlCon);
        //SqlCommand cmd = new SqlCommand("SP_GetThreadCuttDashboardOutput_TMP", sqlCon); //-- กรณีไม่มีข้อมูลมันจะเห็น Dummy วันที่เป็น 1 เลยต้องสร้าง TMP ขึ้นมาไม่ให้นับ
        cmd.CommandType = CommandType.StoredProcedure;
        cmd.Parameters.AddWithValue("@serial", SqlDbType.VarChar).Value = serial;
        
        cmd.Parameters.AddWithValue("@fromDate", null);
        cmd.Parameters.AddWithValue("@toDate", null);

        cmd.Parameters.Add("@fromDateOut", SqlDbType.DateTime);
        cmd.Parameters["@fromDateOut"].Direction = ParameterDirection.Output;
        cmd.Parameters.Add("@toDateOut", SqlDbType.DateTime);
        cmd.Parameters["@toDateOut"].Direction = ParameterDirection.Output;

        cmd.Parameters.Add("@totalTest", SqlDbType.Int);
        cmd.Parameters["@totalTest"].Direction = ParameterDirection.Output;

        cmd.Parameters.Add("@totalCloseCut", SqlDbType.Int);
        cmd.Parameters["@totalCloseCut"].Direction = ParameterDirection.Output;

        cmd.Parameters.Add("@totalMaxCut", SqlDbType.Int);
        cmd.Parameters["@totalMaxCut"].Direction = ParameterDirection.Output;

        cmd.Parameters.Add("@totalNormalCut", SqlDbType.Int);
        cmd.Parameters["@totalNormalCut"].Direction = ParameterDirection.Output;

        cmd.ExecuteNonQuery();
        DateTime _dtFrom = Convert.ToDateTime(cmd.Parameters["@fromDateOut"].Value == DBNull.Value ? null : cmd.Parameters["@fromDateOut"].Value);
        DateTime _dtTo = Convert.ToDateTime(cmd.Parameters["@toDateOut"].Value == DBNull.Value ? null : cmd.Parameters["@toDateOut"].Value);
        result[0] = _dtFrom == null ? "" : _dtFrom.ToString("yyyy-MM-dd");
        result[1] = _dtTo == null ? "" : _dtTo.ToString("yyyy-MM-dd");
        result[2] = cmd.Parameters["@totalTest"].Value.ToString();
        result[3] = cmd.Parameters["@totalCloseCut"].Value.ToString();
        result[4] = cmd.Parameters["@totalMaxCut"].Value.ToString();
        result[5] = cmd.Parameters["@totalNormalCut"].Value.ToString();

        sqlCon.Close();
      }
    }
    catch (Exception ex)
    {
    }

    return Json(result);
  }

  [HttpGet]
  public IActionResult GetData2Bak()
  {
    var data = new List<KPIItem2>
    {
        new KPIItem2 { title = "Output Flow", currentValue = 47, lastDay = 47, last2Weeks = 49, last6Months = 48, status = "down" },
        new KPIItem2 { title = "Pressure Difference", currentValue = 1.80, lastDay = 1.78, last2Weeks = 1.80, last6Months = 1.80, status = "up" },
        new KPIItem2 { title = "Torque Deviation", currentValue = 9.7, lastDay = 10.1, last2Weeks = 9.9, last6Months = 9.9, status = "down" },
        new KPIItem2 { title = "Cycle Time", currentValue = 42.8, lastDay = 42.4, last2Weeks = 42.4, last6Months = 42.4, status = "up" },
    };

    // เพิ่ม icon และสีตาม status
    foreach (var item in data)
    {
      item.statusIcon = item.status == "up" ? "⬆️" : "⬇️";
      item.statusColor = item.status == "up" ? "success" : "danger";
    }

    return Json(data);
  }
  [HttpGet]
  public IActionResult GetData2()
  {
    IConfiguration _configuration = new ConfigurationBuilder()
        .SetBasePath(Directory.GetCurrentDirectory())
        .AddJsonFile("appsettings.json")
        .Build();

    string connStr = _configuration["ConnectionStrings:connBtBiDataUtilize"];

    List<KPIItem2> result = new List<KPIItem2>();

    using (SqlConnection conn = new SqlConnection(connStr))
    {
      conn.Open();

      SqlCommand cmd = new SqlCommand("SP_KPIs2_GetData", conn);
      cmd.CommandType = CommandType.StoredProcedure;
      
      SqlDataReader rdr = cmd.ExecuteReader();
      while (rdr.Read())
      {
        result.Add(new KPIItem2
        {
          title = rdr["title"].ToString(),
          currentValue = Convert.ToDouble(rdr["currentValue"]),
          lastDay = Convert.ToDouble(rdr["lastDay"]),
          last2Weeks = Convert.ToDouble(rdr["last2Weeks"]),
          last6Months = Convert.ToDouble(rdr["last6Months"]),
          status = rdr["status"].ToString(),
          statusIcon = rdr["status"].ToString() == "up" ? "⬆️" : "⬇️",
          statusColor = rdr["status"].ToString() == "up" ? "success" : "danger"
        });
      }

      conn.Close();
    }

    return Json(result);
  }
}
