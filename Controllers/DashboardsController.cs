using AspnetCoreMvcFull.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Data;
using System.Diagnostics;
using System.Reflection.Metadata.Ecma335;

namespace AspnetCoreMvcFull.Controllers;

public class DashboardsController : Controller
{
  private readonly ILogger<DashboardsController> _logger;
  private readonly IConfiguration _configuration;
  public DashboardsController(ILogger<DashboardsController> logger, IConfiguration configuration)
  {
    _logger = logger;
    _configuration = configuration;
  }
  public IActionResult IndexBak() => View();
  public IActionResult Index()
  {
    //HttpContext.Session.SetString(SessionModel.SAMNAME, "Bernina Temporary User");
    return View();
  }
  public IActionResult IndexBakAuth(string user) {
    string AuthenUrl = _configuration[key: "TBCorApiServices:AuthenUrl"];
    if (user == null && (HttpContext.Session.GetString(SessionModel.SAMNAME) == null ||
      HttpContext.Session.GetString(SessionModel.SAMNAME) == ""
      ))
    {
      //-->Response.Redirect("https://btauthen.berninathailand.com/?url=https://www.google.com/");
      Response.Redirect(AuthenUrl);
      //-->Response.Redirect(RootURL + "?url=https://www.google.com/");                
    }
    else if ((HttpContext.Session.GetString(SessionModel.SAMNAME) == null ||
      HttpContext.Session.GetString(SessionModel.SAMNAME) == "") && user != null)
    {
      string[] arrSamName = user.Split(new char[] { '\\' });
      if (arrSamName.Length == 2)
      {
        HttpContext.Session.SetString(SessionModel.SAMNAME, arrSamName[1]);
      }
    }

    return View();
  }


  [HttpPost]
  public JsonResult InsHistoryRemark(RemarkModel obj)
  {
    string[] strMsg = new string[3];
    IConfiguration _configuration = new ConfigurationBuilder()
                        .SetBasePath(Directory.GetCurrentDirectory())
                        .AddJsonFile("appsettings.json")
                        .Build();
    string DBConn = _configuration[key: "ConnectionStrings:connBtBiDataUtilize"];
    SqlConnection con = null;
    try
    {
      con = new SqlConnection(DBConn);
      con.Open();
      SqlCommand cmnd = new SqlCommand("SP_InsHistoryRemark", con);
      cmnd.CommandType = CommandType.StoredProcedure;
      cmnd.Parameters.AddWithValue("@menuno", SqlDbType.VarChar).Value = obj.menuno;
      cmnd.Parameters.AddWithValue("@series", SqlDbType.VarChar).Value = obj.series;
      cmnd.Parameters.AddWithValue("@remarks", SqlDbType.NVarChar).Value = obj.remarks;
      cmnd.ExecuteNonQuery();
    }
    catch (Exception ex)
    {
      strMsg[0] = "2";
      strMsg[1] = "error";
    }
    finally
    {
      strMsg[0] = "1";
      strMsg[1] = "success";

    }
    con.Close();
    return Json(strMsg);
  }
  [HttpDelete]
  public JsonResult DeleteHistoryRemark(RemarkModel obj)
  {
    string[] strMsg = new string[3];
    IConfiguration _configuration = new ConfigurationBuilder()
                        .SetBasePath(Directory.GetCurrentDirectory())
                        .AddJsonFile("appsettings.json")
                        .Build();
    string DBConn = _configuration[key: "ConnectionStrings:connBtBiDataUtilize"];
    SqlConnection con = null;
    try
    {
      con = new SqlConnection(DBConn);
      con.Open();
      SqlCommand cmnd = new SqlCommand("SP_DeleteHistoryRemark", con);
      cmnd.CommandType = CommandType.StoredProcedure;
      cmnd.Parameters.AddWithValue("@trid", SqlDbType.VarChar).Value = obj.trid;
      cmnd.ExecuteNonQuery();
    }
    catch (Exception ex)
    {
      strMsg[0] = "2";
      strMsg[1] = "error";
    }
    finally
    {
      strMsg[0] = "1";
      strMsg[1] = "success";

    }
    con.Close();
    return Json(strMsg);
  }
  [HttpPut]
  public JsonResult UpdateHistoryRemark(RemarkModel obj)
  {
    string[] strMsg = new string[3];
    IConfiguration _configuration = new ConfigurationBuilder()
                        .SetBasePath(Directory.GetCurrentDirectory())
                        .AddJsonFile("appsettings.json")
                        .Build();
    string DBConn = _configuration[key: "ConnectionStrings:connBtBiDataUtilize"];
    SqlConnection con = null;
    try
    {
      con = new SqlConnection(DBConn);
      con.Open();
      SqlCommand cmnd = new SqlCommand("SP_UpdateHistoryRemark", con);
      cmnd.CommandType = CommandType.StoredProcedure;
      cmnd.Parameters.AddWithValue("@trid", SqlDbType.VarChar).Value = obj.trid;
      cmnd.Parameters.AddWithValue("@remarks", SqlDbType.NVarChar).Value = obj.remarks;
      cmnd.ExecuteNonQuery();
    }
    catch (Exception ex)
    {
      strMsg[0] = "2";
      strMsg[1] = "error";
    }
    finally
    {
      strMsg[0] = "1";
      strMsg[1] = "success";

    }
    con.Close();
    return Json(strMsg);
  }
  [HttpGet]
  public JsonResult GetHistoryRemark(string menuno, string series)
  {
    IConfiguration _configuration = new ConfigurationBuilder()
        .SetBasePath(Directory.GetCurrentDirectory())
        .AddJsonFile("appsettings.json")
        .Build();

    string connStr = _configuration["ConnectionStrings:connBtBiDataUtilize"];

    List<RemarkModel> result = new List<RemarkModel>();


    using (SqlConnection conn = new SqlConnection(connStr))
    {
      conn.Open();
      SqlCommand cmd = new SqlCommand("SP_GetHistoryRemark", conn);
      cmd.CommandType = CommandType.StoredProcedure;
      cmd.Parameters.AddWithValue("@menuno", SqlDbType.VarChar).Value = menuno;
      cmd.Parameters.AddWithValue("@series", SqlDbType.VarChar).Value = series;
      SqlDataReader rdr = cmd.ExecuteReader();
      while (rdr.Read())
      {
        result.Add(new RemarkModel
        {
          trid = rdr["trid"].ToString(),
          series = rdr["series"]?.ToString(),
          create_dt = Convert.ToDateTime(rdr["create_dt"]),
          create_dt_txt = rdr["create_dt_txt"]?.ToString(),
          remarks = rdr["remarks"]?.ToString()
        });
      }

      conn.Close();
    }
    return Json(result);
  }
  [HttpGet]
  public JsonResult GetHistoryRemarkLastMsg(string menuno, string series)
  {
    string[] strMsg = new string[3];
    IConfiguration _configuration = new ConfigurationBuilder()
        .SetBasePath(Directory.GetCurrentDirectory())
        .AddJsonFile("appsettings.json")
        .Build();
    string connStr = _configuration["ConnectionStrings:connBtBiDataUtilize"];
    using (SqlConnection conn = new SqlConnection(connStr))
    {
      conn.Open();
      SqlCommand cmd = new SqlCommand("SP_GetHistoryRemarkLastMsg", conn);
      cmd.CommandType = CommandType.StoredProcedure;
      cmd.Parameters.AddWithValue("@menuno", SqlDbType.VarChar).Value = menuno;
      cmd.Parameters.AddWithValue("@series", SqlDbType.VarChar).Value = series; //@remarks
      cmd.Parameters.Add("@remarks", SqlDbType.NVarChar, 1024);
      cmd.Parameters["@remarks"].Direction = ParameterDirection.Output;
      cmd.ExecuteNonQuery();
      strMsg[0] = "1";
      strMsg[1] = "success";
      strMsg[2] = cmd.Parameters["@remarks"].Value == DBNull.Value ? "" : cmd.Parameters["@remarks"].Value.ToString();
      conn.Close();
    }
    return Json(strMsg);
  }
  [HttpGet]
  public JsonResult GetHistoryRemarkByid(string trid)
  {
    string[] strMsg = new string[3];
    IConfiguration _configuration = new ConfigurationBuilder()
        .SetBasePath(Directory.GetCurrentDirectory())
        .AddJsonFile("appsettings.json")
        .Build();
    string connStr = _configuration["ConnectionStrings:connBtBiDataUtilize"];
    using (SqlConnection conn = new SqlConnection(connStr))
    {
      conn.Open();
      SqlCommand cmd = new SqlCommand("SP_GetHistoryRemarkById", conn);
      cmd.CommandType = CommandType.StoredProcedure;
      cmd.Parameters.AddWithValue("@trid", SqlDbType.VarChar).Value = trid;
      cmd.Parameters.Add("@remarks", SqlDbType.NVarChar, 1024);
      cmd.Parameters["@remarks"].Direction = ParameterDirection.Output;
      cmd.ExecuteNonQuery();
      strMsg[0] = "1";
      strMsg[1] = "success";
      strMsg[2] = cmd.Parameters["@remarks"].Value == DBNull.Value ? "" : cmd.Parameters["@remarks"].Value.ToString();
      conn.Close();
    }
    return Json(strMsg);
  }

  [HttpGet]
  public JsonResult GetTop10Failed(string series)
  {
    IConfiguration _configuration = new ConfigurationBuilder()
        .SetBasePath(Directory.GetCurrentDirectory())
        .AddJsonFile("appsettings.json")
        .Build();

    string connStr = _configuration["ConnectionStrings:connBtBiDataUtilize"];

    List<Top10Model> result = new List<Top10Model>();


    using (SqlConnection conn = new SqlConnection(connStr))
    {
      conn.Open();
      SqlCommand cmd = new SqlCommand("SP_LNK_Top10Tailed", conn);
      cmd.CommandType = CommandType.StoredProcedure;
      cmd.Parameters.AddWithValue("@series", SqlDbType.VarChar).Value = series;
      SqlDataReader rdr = cmd.ExecuteReader();
      while (rdr.Read())
      {
        result.Add(new Top10Model
        {
          Test = rdr["Test"].ToString(),
          fails = Convert.ToInt32(rdr["fails"]),
          ratio = rdr["ratio"].ToString()
        });
      }

      conn.Close();
    }
    return Json(result);
  }
  [HttpGet]
  public JsonResult GetDailyProduction(string series)
  {
    IConfiguration _configuration = new ConfigurationBuilder()
        .SetBasePath(Directory.GetCurrentDirectory())
        .AddJsonFile("appsettings.json")
        .Build();

    string connStr = _configuration["ConnectionStrings:connBtBiDataUtilize"];

    List<DailyProdModel> result = new List<DailyProdModel>();


    using (SqlConnection conn = new SqlConnection(connStr))
    {
      conn.Open();
      SqlCommand cmd = new SqlCommand("SP_LNK_DailyProduction", conn);
      cmd.CommandType = CommandType.StoredProcedure;
      cmd.Parameters.AddWithValue("@series", SqlDbType.VarChar).Value = series;
      SqlDataReader rdr = cmd.ExecuteReader();
      while (rdr.Read())
      {
        result.Add(new DailyProdModel
        {
          monitor_dt = rdr["monitor_dt"].ToString(),
          Day = rdr["Day"].ToString(),
          series = rdr["series"].ToString(),
          displayName = rdr["displayName"].ToString(),
          MachineCount = Convert.ToInt32(rdr["MachineCount"])
        });
      }

      conn.Close();
    }
    return Json(result);
  }
}

