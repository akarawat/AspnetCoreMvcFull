using AspnetCoreMvcFull.Models;
using Azure;
using ExcelDataReader;
using Microsoft.AspNetCore.Components.Forms;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Microsoft.SqlServer.Server;
using System.Data;
using System.Diagnostics;
using System.Diagnostics.Metrics;
using System.Globalization;
using System.Text.Json;

namespace AspnetCoreMvcFull.Controllers;

public class AdminCfgController : Controller
{
  private readonly ILogger<AdminCfgController> _logger;
  private readonly IConfiguration _configuration;
  public AdminCfgController(ILogger<AdminCfgController> logger, IConfiguration configuration)
  {
    _logger = logger;
    _configuration = configuration;
  }
  public IActionResult TopviewCfg(string? user)
  {
    string AuthenUrl = _configuration[key: "TBCorApiServices:AuthenUrl"];
    string sSAMNAME = "";
    sSAMNAME = HttpContext.Session.GetString(SessionModel.SAMNAME) ?? "";
    //--->  Criteria for Authen
    /* Authen */
    if (user != null)
    {
      if (user == null && (HttpContext.Session.GetString(SessionModel.SAMNAME) == null ||
        HttpContext.Session.GetString(SessionModel.SAMNAME) == ""
        ))
      {
        Response.Redirect(AuthenUrl);
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
    }

    if (user == null && (HttpContext.Session.GetString(SessionModel.SAMNAME) == null ||
        HttpContext.Session.GetString(SessionModel.SAMNAME) == ""
        ))
    {
      Response.Redirect(AuthenUrl);
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
    /* Authen */
    if (HttpContext.Session.GetString("SETMODEL") == null)
    {
      HttpContext.Session.SetString("SETMODEL", "5");
    }

    return View();
  }
  [HttpGet]
  public JsonResult GetTopviewCfg(string? lineid)
  {
    string connStr = _configuration["ConnectionStrings:connBtBiDataUtilize"];
    List<KpiParamsModel> result = new List<KpiParamsModel>();
    using (SqlConnection conn = new SqlConnection(connStr))
    {
      conn.Open();
      SqlCommand cmd = new SqlCommand("SP_GetTopViewByLine", conn);
      cmd.CommandType = CommandType.StoredProcedure;
      cmd.Parameters.AddWithValue("@lineid", SqlDbType.VarChar).Value = lineid;

      SqlDataReader rdr = cmd.ExecuteReader();
      while (rdr.Read())
      {
        result.Add(new KpiParamsModel
        {
          id = Convert.ToInt32(rdr["id"]),
          lineid = rdr["lineid"].ToString(),
          view1  = Convert.ToInt32(rdr["view1 "]),
          view2  = Convert.ToInt32(rdr["view2"]),
          view3  = Convert.ToInt32(rdr["view3"]),
          view4  = Convert.ToInt32(rdr["view4"]),
          view5  = Convert.ToInt32(rdr["view5"]),
          view6  = Convert.ToInt32(rdr["view6"]),
          view7  = Convert.ToInt32(rdr["view7"]),
          view8  = Convert.ToInt32(rdr["view8"]),
          view9  = Convert.ToInt32(rdr["view9"]),
          view91 = Convert.ToInt32(rdr["view91"]),
          view92 = Convert.ToInt32(rdr["view92"]),
          view10 = Convert.ToInt32(rdr["view10"])
        });
      }
      conn.Close();
    }
    return Json(result);
  }
  [HttpGet]
  public JsonResult GetPassFailScore(string? lineid)
  {
    string connStr = _configuration["ConnectionStrings:connBtBiDataUtilize"];
    List<LineFailScoreModel> result = new List<LineFailScoreModel>();
    using (SqlConnection conn = new SqlConnection(connStr))
    {
      conn.Open();
      SqlCommand cmd = new SqlCommand("SP_GetPassFailByLineId", conn);
      cmd.CommandType = CommandType.StoredProcedure;
      cmd.Parameters.AddWithValue("@lineid", SqlDbType.VarChar).Value = lineid;

      SqlDataReader rdr = cmd.ExecuteReader();
      while (rdr.Read())
      {
        result.Add(new LineFailScoreModel
        {
          maxf1 = Convert.ToDouble(rdr["maxf1"]),
          maxf2 = Convert.ToDouble(rdr["maxf2"]),
          maxf3 = Convert.ToDouble(rdr["maxf3"]),
          maxf4 = Convert.ToDouble(rdr["maxf4"]),
          maxf5 = Convert.ToDouble(rdr["maxf5"]),
          maxf6 = Convert.ToDouble(rdr["maxf6"]),
          maxf7 = Convert.ToDouble(rdr["maxf7"]),
          maxf8 = Convert.ToDouble(rdr["maxf8"]),
          maxf9 = Convert.ToDouble(rdr["maxf9"]),
          maxf91 = Convert.ToDouble(rdr["maxf91"]),
          maxf92 = Convert.ToDouble(rdr["maxf92"]),
          maxf10 = Convert.ToDouble(rdr["maxf10"]),

          minf1 = Convert.ToDouble(rdr["minf1"]),
          minf2 = Convert.ToDouble(rdr["minf2"]),
          minf3 = Convert.ToDouble(rdr["minf3"]),
          minf4 = Convert.ToDouble(rdr["minf4"]),
          minf5 = Convert.ToDouble(rdr["minf5"]),
          minf6 = Convert.ToDouble(rdr["minf6"]),
          minf7 = Convert.ToDouble(rdr["minf7"]),
          minf8 = Convert.ToDouble(rdr["minf8"]),
          minf9 = Convert.ToDouble(rdr["minf9"]),
          minf91 = Convert.ToDouble(rdr["minf91"]),
          minf92 = Convert.ToDouble(rdr["minf92"]),
          minf10 = Convert.ToDouble(rdr["minf10"]),

          totalf1 = Convert.ToInt32(rdr["totalf1"]),
          totalf2 = Convert.ToInt32(rdr["totalf2"]),
          totalf3 = Convert.ToInt32(rdr["totalf3"]),
          totalf4 = Convert.ToInt32(rdr["totalf4"]),
          totalf5 = Convert.ToInt32(rdr["totalf5"]),
          totalf6 = Convert.ToInt32(rdr["totalf6"]),
          totalf7 = Convert.ToInt32(rdr["totalf7"]),
          totalf8 = Convert.ToInt32(rdr["totalf8"]),
          totalf9 = Convert.ToInt32(rdr["totalf9"]),

          param_maxf1 = Convert.ToDouble(rdr["param_maxf1"]),
          param_minf1 = Convert.ToDouble(rdr["param_minf1"]),
          param_maxf2 = Convert.ToDouble(rdr["param_maxf2"]),
          param_minf2 = Convert.ToDouble(rdr["param_minf2"]),
          param_maxf3 = Convert.ToDouble(rdr["param_maxf3"]),
          param_minf3 = Convert.ToDouble(rdr["param_minf3"]),
          param_maxf4 = Convert.ToDouble(rdr["param_maxf4"]),
          param_minf4 = Convert.ToDouble(rdr["param_minf4"]),
          param_maxf5 = Convert.ToDouble(rdr["param_maxf5"]),
          param_minf5 = Convert.ToDouble(rdr["param_minf5"]),
          param_maxf6 = Convert.ToDouble(rdr["param_maxf6"]),
          param_minf6 = Convert.ToDouble(rdr["param_minf6"]),
          param_maxf7 = Convert.ToDouble(rdr["param_maxf7"]),
          param_minf7 = Convert.ToDouble(rdr["param_minf7"]),
          param_maxf8 = Convert.ToDouble(rdr["param_maxf8"]),
          param_minf8 = Convert.ToDouble(rdr["param_minf8"]),
          param_maxf9 = Convert.ToDouble(rdr["param_maxf9"]),
          param_minf9 = Convert.ToDouble(rdr["param_minf9"])


        });
      }
      conn.Close();
    }
    return Json(result);
  }
  [HttpPut]
  public JsonResult UpdateTopviewCfg(TopViewModel obj)
  {
    string connStr = _configuration["ConnectionStrings:connBtBiDataUtilize"];
    string[] result = new string[3];
    using (SqlConnection conn = new SqlConnection(connStr))
    {
      try
      {
        conn.Open();
        SqlCommand cmd = new SqlCommand("SP_UpdateTopViewByLine", conn);
        cmd.CommandType = CommandType.StoredProcedure;
        cmd.Parameters.AddWithValue("@lineid", SqlDbType.VarChar).Value = obj.lineid;
        cmd.Parameters.AddWithValue("@status", SqlDbType.Int).Value = obj.status;
        cmd.Parameters.AddWithValue("@viewno", SqlDbType.VarChar).Value = obj.viewno;
        cmd.ExecuteNonQuery();
        conn.Close();
        result[0] = "1";
        result[1] = "Success";
      }
      catch
      {
        result[0] = "0";
        result[1] = "Error";
      }
      
    }
    return Json(result);
  }
  public IActionResult MachineParam()
  {
    List<TopviewCfgModel> list = new List<TopviewCfgModel>();
    string conStr = _configuration["ConnectionStrings:connBtBiDataUtilize"];

    using (SqlConnection con = new SqlConnection(conStr))
    using (SqlCommand cmd = new SqlCommand("SELECT * FROM kpi_params ORDER BY id DESC", con))
    {
      con.Open();
      SqlDataReader rdr = cmd.ExecuteReader();
      while (rdr.Read())
      {
        list.Add(new TopviewCfgModel
        {
          id = Convert.ToInt32(rdr["id"]),
          param_code = rdr["param_code"].ToString(),
          param_func = rdr["param_func"].ToString(),
          mc_model = rdr["mc_model"].ToString(),
          param_1 = rdr["param_1"].ToString(),
          param_2 = rdr["param_2"].ToString(),
          param_3 = rdr["param_3"].ToString(),
          param_4 = rdr["param_4"].ToString(),
          param_5 = rdr["param_5"].ToString(),
          param_6 = rdr["param_6"].ToString(),
          param_7 = rdr["param_7"].ToString(),
          remarks = rdr["remarks"].ToString()
        });
      }
    }

    return View(list);
  }

  [HttpPost]
  public JsonResult SaveKPIParameters(TopviewCfgModel model)
  {
    string conStr = _configuration["ConnectionStrings:connBtBiDataUtilize"];

    using (SqlConnection con = new SqlConnection(conStr))
    using (SqlCommand cmd = new SqlCommand("SP_CreateUpdateKPIParams", con))
    {
      cmd.CommandType = CommandType.StoredProcedure;
      cmd.Parameters.AddWithValue("@id", model.id);
      cmd.Parameters.AddWithValue("@param_code", model.param_code ?? (object)DBNull.Value);
      cmd.Parameters.AddWithValue("@param_func", model.param_func ?? (object)DBNull.Value);
      cmd.Parameters.AddWithValue("@mc_model", model.mc_model ?? (object)DBNull.Value);
      cmd.Parameters.AddWithValue("@param_1", model.param_1 ?? (object)DBNull.Value);
      cmd.Parameters.AddWithValue("@param_2", model.param_2 ?? (object)DBNull.Value);
      cmd.Parameters.AddWithValue("@param_3", model.param_3 ?? (object)DBNull.Value);
      cmd.Parameters.AddWithValue("@param_4", model.param_4 ?? (object)DBNull.Value);
      cmd.Parameters.AddWithValue("@param_5", model.param_5 ?? (object)DBNull.Value);
      cmd.Parameters.AddWithValue("@param_6", model.param_6 ?? (object)DBNull.Value);
      cmd.Parameters.AddWithValue("@param_7", model.param_7 ?? (object)DBNull.Value);
      cmd.Parameters.AddWithValue("@remarks", model.remarks ?? (object)DBNull.Value);

      con.Open();
      cmd.ExecuteNonQuery();
    }

    return Json(new { success = true, message = "Saved successfully" });
  }
  [HttpPost]
  public JsonResult DeleteKPIParameters(TopviewCfgModel model)
  {
    string conStr = _configuration["ConnectionStrings:connBtBiDataUtilize"];

    using (SqlConnection con = new SqlConnection(conStr))
    using (SqlCommand cmd = new SqlCommand("SP_DeleteKPIParams", con))
    {
      cmd.CommandType = CommandType.StoredProcedure;
      cmd.Parameters.AddWithValue("@id", model.id);
      con.Open();
      cmd.ExecuteNonQuery();
    }

    return Json(new { success = true, message = "Deleted successfully" });
  }
  [HttpPost]
  public JsonResult SavePassFailParameters(PassFailModel model)
  {
    string conStr = _configuration["ConnectionStrings:connBtBiDataUtilize"];

    using (SqlConnection con = new SqlConnection(conStr))
    using (SqlCommand cmd = new SqlCommand("SP_PassFailParam_Create", con))
    {
      cmd.CommandType = CommandType.StoredProcedure;
      cmd.Parameters.AddWithValue("@series", model.series ?? (object)DBNull.Value);
      cmd.Parameters.AddWithValue("@mnufunc", model.mnufunc ?? (object)DBNull.Value);
      cmd.Parameters.AddWithValue("@max_fail", model.max_fail ?? (object)DBNull.Value);
      cmd.Parameters.AddWithValue("@min_fail", model.min_fail ?? (object)DBNull.Value);
      cmd.Parameters.AddWithValue("@param_1", model.param_1 ?? (object)DBNull.Value);
      cmd.Parameters.AddWithValue("@param_2", model.param_2 ?? (object)DBNull.Value);
      cmd.Parameters.AddWithValue("@param_3", model.param_3 ?? (object)DBNull.Value);
      cmd.Parameters.AddWithValue("@param_4", model.param_4 ?? (object)DBNull.Value);
      cmd.Parameters.AddWithValue("@param_5", model.param_5 ?? (object)DBNull.Value);
      cmd.Parameters.AddWithValue("@remarks", model.remarks ?? (object)DBNull.Value);

      con.Open();
      cmd.ExecuteNonQuery();
    }

    return Json(new { success = true, message = "Saved successfully" });
  }
  [HttpGet]
  public JsonResult GetMinMaxPassFailParam(PassFailModel model)
  {
    string conStr = _configuration["ConnectionStrings:connBtBiDataUtilize"];
    string maxFail;
    string minFail;
    using (SqlConnection con = new SqlConnection(conStr))
    using (SqlCommand cmd = new SqlCommand("SP_PassFailParam_GetParam", con))
    {
      cmd.CommandType = CommandType.StoredProcedure;
      cmd.Parameters.AddWithValue("@series", model.series ?? (object)DBNull.Value);
      cmd.Parameters.AddWithValue("@mnufunc", model.mnufunc ?? (object)DBNull.Value);

      cmd.Parameters.Add("@max_fail", SqlDbType.VarChar, 25);
      cmd.Parameters["@max_fail"].Direction = ParameterDirection.Output;
      cmd.Parameters.Add("@min_fail", SqlDbType.VarChar, 25);
      cmd.Parameters["@min_fail"].Direction = ParameterDirection.Output;

      con.Open();
      cmd.ExecuteNonQuery();
      maxFail = cmd.Parameters["@max_fail"].Value == DBNull.Value ? "0" : cmd.Parameters["@max_fail"].Value.ToString();
      minFail = cmd.Parameters["@min_fail"].Value == DBNull.Value ? "0" : cmd.Parameters["@min_fail"].Value.ToString();

    }
    return Json(new { success = true, message = "Saved successfully", max_fail = maxFail, min_fail = minFail });
  }
  [HttpGet]
  public JsonResult GetTTAMinMaxPassFailParam(PassFailModel model)
  {
    string conStr = _configuration["ConnectionStrings:connBtBiDataUtilize"];
    string maxFail;
    string minFail;
    string maxFailLower;
    string minFailLower;
    string maxFailHigher;
    string minFailHigher;
    string maxFailHighest;
    string minFailHighest;
    using (SqlConnection con = new SqlConnection(conStr))
    using (SqlCommand cmd = new SqlCommand("SP_PassFailParam_GetParamTTA", con))
    {
      cmd.CommandType = CommandType.StoredProcedure;
      cmd.Parameters.AddWithValue("@series", model.series ?? (object)DBNull.Value);
      cmd.Parameters.AddWithValue("@mnufunc", model.mnufunc ?? (object)DBNull.Value);

      cmd.Parameters.Add("@max_fail", SqlDbType.VarChar, 25);
      cmd.Parameters["@max_fail"].Direction = ParameterDirection.Output;
      cmd.Parameters.Add("@min_fail", SqlDbType.VarChar, 25);
      cmd.Parameters["@min_fail"].Direction = ParameterDirection.Output;

      cmd.Parameters.Add("@max_failLower", SqlDbType.VarChar, 25);
      cmd.Parameters["@max_failLower"].Direction = ParameterDirection.Output;
      cmd.Parameters.Add("@min_failLower", SqlDbType.VarChar, 25);
      cmd.Parameters["@min_failLower"].Direction = ParameterDirection.Output;

      cmd.Parameters.Add("@max_failHigher", SqlDbType.VarChar, 25);
      cmd.Parameters["@max_failHigher"].Direction = ParameterDirection.Output;
      cmd.Parameters.Add("@min_failHigher", SqlDbType.VarChar, 25);
      cmd.Parameters["@min_failHigher"].Direction = ParameterDirection.Output;

      cmd.Parameters.Add("@max_failHighest", SqlDbType.VarChar, 25);
      cmd.Parameters["@max_failHighest"].Direction = ParameterDirection.Output;
      cmd.Parameters.Add("@min_failHighest", SqlDbType.VarChar, 25);
      cmd.Parameters["@min_failHighest"].Direction = ParameterDirection.Output;

      con.Open();
      cmd.ExecuteNonQuery();

      maxFail = cmd.Parameters["@max_fail"].Value == DBNull.Value ? "0" : cmd.Parameters["@max_fail"].Value.ToString();
      minFail = cmd.Parameters["@min_fail"].Value == DBNull.Value ? "0" : cmd.Parameters["@min_fail"].Value.ToString();

      maxFailLower = cmd.Parameters["@max_failLower"].Value == DBNull.Value ? "0" : cmd.Parameters["@max_failLower"].Value.ToString();
      minFailLower = cmd.Parameters["@min_failLower"].Value == DBNull.Value ? "0" : cmd.Parameters["@min_failLower"].Value.ToString();

      maxFailHigher = cmd.Parameters["@max_failHigher"].Value == DBNull.Value ? "0" : cmd.Parameters["@max_failHigher"].Value.ToString();
      minFailHigher = cmd.Parameters["@min_failHigher"].Value == DBNull.Value ? "0" : cmd.Parameters["@min_failHigher"].Value.ToString();

      maxFailHighest = cmd.Parameters["@max_failHighest"].Value == DBNull.Value ? "0" : cmd.Parameters["@max_failHighest"].Value.ToString();
      minFailHighest = cmd.Parameters["@min_failHighest"].Value == DBNull.Value ? "0" : cmd.Parameters["@min_failHighest"].Value.ToString();

    }
    return Json(new {
      success = true,
      message = "Retrieved successfully",
      max_fail = maxFail,
      min_fail = minFail,
      max_failLower = maxFailLower,
      min_failLower = minFailLower,
      max_failHigher = maxFailHigher,
      min_failHigher = minFailHigher,
      max_failHighest = maxFailHighest,
      min_failHighest = minFailHighest

    });
  }
  [HttpPut]
  public JsonResult SaveMinMaxPassFailParamTTA(PassFailModel model)
  {
    string conStr = _configuration["ConnectionStrings:connBtBiDataUtilize"];

    using (SqlConnection con = new SqlConnection(conStr))
    using (SqlCommand cmd = new SqlCommand("SP_PassFailParam_CreateOrUpdateTTA", con))
    {
      cmd.CommandType = CommandType.StoredProcedure;
      cmd.Parameters.AddWithValue("@series", model.series ?? (object)DBNull.Value);
      cmd.Parameters.AddWithValue("@mnufunc", model.mnufunc ?? (object)DBNull.Value);
      cmd.Parameters.AddWithValue("@param_1", model.param_1 ?? (object)DBNull.Value);
      cmd.Parameters.AddWithValue("@max_fail", model.max_fail ?? (object)DBNull.Value);
      cmd.Parameters.AddWithValue("@min_fail", model.min_fail ?? (object)DBNull.Value);

      con.Open();
      cmd.ExecuteNonQuery();
    }
    return Json(new { success = true, message = "Saved successfully" });
  }
  [HttpPut]
  public JsonResult SaveMinMaxPassFailParam(PassFailModel model)
  {
    string conStr = _configuration["ConnectionStrings:connBtBiDataUtilize"];

    using (SqlConnection con = new SqlConnection(conStr))
    using (SqlCommand cmd = new SqlCommand("SP_PassFailParam_CreateOrUpdate", con))
    {
      cmd.CommandType = CommandType.StoredProcedure;
      cmd.Parameters.AddWithValue("@series", model.series ?? (object)DBNull.Value);
      cmd.Parameters.AddWithValue("@mnufunc", model.mnufunc ?? (object)DBNull.Value);
      cmd.Parameters.AddWithValue("@max_fail", model.max_fail ?? (object)DBNull.Value);
      cmd.Parameters.AddWithValue("@min_fail", model.min_fail ?? (object)DBNull.Value);

      con.Open();
      cmd.ExecuteNonQuery();
    }
    return Json(new { success = true, message = "Saved successfully" });
  }
  [HttpPost]
  public JsonResult DeletePassFailParameters(PassFailModel model)
  {
    string conStr = _configuration["ConnectionStrings:connBtBiDataUtilize"];

    using (SqlConnection con = new SqlConnection(conStr))
    using (SqlCommand cmd = new SqlCommand("SP_PassFailParam_Delete", con))
    {
      cmd.CommandType = CommandType.StoredProcedure;
      cmd.Parameters.AddWithValue("@id", model.id);
      con.Open();
      cmd.ExecuteNonQuery();
    }

    return Json(new { success = true, message = "Deleted successfully" });
  }
  [HttpPut]
  public JsonResult UpdatePassFailParameters(PassFailModel model)
  {
    string conStr = _configuration["ConnectionStrings:connBtBiDataUtilize"];

    using (SqlConnection con = new SqlConnection(conStr))
    using (SqlCommand cmd = new SqlCommand("SP_PassFailParam_Update", con))
    {
      cmd.CommandType = CommandType.StoredProcedure;
      cmd.Parameters.AddWithValue("@id", model.id);
      cmd.Parameters.AddWithValue("@series", model.series ?? (object)DBNull.Value);
      cmd.Parameters.AddWithValue("@mnufunc", model.mnufunc ?? (object)DBNull.Value);
      cmd.Parameters.AddWithValue("@max_fail", model.max_fail ?? (object)DBNull.Value);
      cmd.Parameters.AddWithValue("@min_fail", model.min_fail ?? (object)DBNull.Value);
      cmd.Parameters.AddWithValue("@param_1", model.param_1 ?? (object)DBNull.Value);
      cmd.Parameters.AddWithValue("@param_2", model.param_2 ?? (object)DBNull.Value);
      cmd.Parameters.AddWithValue("@param_3", model.param_3 ?? (object)DBNull.Value);
      cmd.Parameters.AddWithValue("@param_4", model.param_4 ?? (object)DBNull.Value);
      cmd.Parameters.AddWithValue("@param_5", model.param_5 ?? (object)DBNull.Value);
      cmd.Parameters.AddWithValue("@remarks", model.remarks ?? (object)DBNull.Value);

      con.Open();
      cmd.ExecuteNonQuery();
    }

    return Json(new { success = true, message = "Saved successfully" });
  }
  public IActionResult PassFailConfig(string? user)
  {
    string AuthenUrl = _configuration[key: "TBCorApiServices:AuthenUrl"];
    string sSAMNAME = "";
    sSAMNAME = HttpContext.Session.GetString(SessionModel.SAMNAME) ?? "";
    //--->  Criteria for Authen
    /* Debug */
    if (user != null)
    {
      if (user == null && (HttpContext.Session.GetString(SessionModel.SAMNAME) == null ||
        HttpContext.Session.GetString(SessionModel.SAMNAME) == ""
        ))
      {
        Response.Redirect(AuthenUrl);
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
    }
    if (user == null && (HttpContext.Session.GetString(SessionModel.SAMNAME) == null ||
        HttpContext.Session.GetString(SessionModel.SAMNAME) == ""
        ))
    {
      Response.Redirect(AuthenUrl);
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
    /* Authen */
    string conStr = _configuration["ConnectionStrings:connBtBiDataUtilize"];
    if (HttpContext.Session.GetString("SETMODEL") == null)
    {
      HttpContext.Session.SetString("SETMODEL", "5");
    }

    List<PassFailModel> result = new List<PassFailModel>();
    using (SqlConnection conn = new SqlConnection(conStr))
    {
      conn.Open();
      SqlCommand cmd = new SqlCommand("SP_PassFailParam_Get", conn);
      cmd.CommandType = CommandType.StoredProcedure;
      cmd.Parameters.AddWithValue("@id", SqlDbType.VarChar).Value = DBNull.Value;
      cmd.Parameters.AddWithValue("@series", SqlDbType.VarChar).Value = DBNull.Value;
      cmd.Parameters.AddWithValue("@mnufunc", SqlDbType.VarChar).Value = DBNull.Value;

      SqlDataReader rdr = cmd.ExecuteReader();
      while (rdr.Read())
      {
        result.Add(new PassFailModel
        {
          id = Convert.ToInt32(rdr["id"]),
          series = rdr["series"].ToString(),
          mnufunc = rdr["mnufunc"].ToString(),
          max_fail = rdr["max_fail"].ToString(),
          min_fail = rdr["min_fail"].ToString(),
          param_1 = rdr["param_1"].ToString(),
          param_2 = rdr["param_2"].ToString(),
          param_3 = rdr["param_3"].ToString(),
          param_4 = rdr["param_4"].ToString(),
          param_5 = rdr["param_5"].ToString(),
          remarks = rdr["remarks"].ToString()
        });
      }
      conn.Close();
    }
      return View(result);
  }
  [HttpGet]
  public JsonResult GetPassFailConfig(PassFailModel obj)
  {
    string connStr = _configuration["ConnectionStrings:connBtBiDataUtilize"];
    List<PassFailModel> result = new List<PassFailModel>();
    using (SqlConnection conn = new SqlConnection(connStr))
    {
      conn.Open();
      SqlCommand cmd = new SqlCommand("SP_PassFailParam_Get", conn);
      cmd.CommandType = CommandType.StoredProcedure;
      cmd.Parameters.AddWithValue("@id", SqlDbType.VarChar).Value = DBNull.Value;
      cmd.Parameters.AddWithValue("@series", SqlDbType.VarChar).Value = DBNull.Value;
      cmd.Parameters.AddWithValue("@mnufunc", SqlDbType.VarChar).Value = DBNull.Value;

      SqlDataReader rdr = cmd.ExecuteReader();
      while (rdr.Read())
      {
        result.Add(new PassFailModel
        {
          id = Convert.ToInt32(rdr["id"]),
          series = rdr["series"].ToString(),
          mnufunc = rdr["mnufunc"].ToString(),
          max_fail = rdr["max_fail"].ToString(),
          min_fail = rdr["min_fail"].ToString(),
          param_1 = rdr["param_1"].ToString(),
          param_2 = rdr["param_2"].ToString(),
          param_3 = rdr["param_3"].ToString(),
          param_4 = rdr["param_4"].ToString(),
          param_5 = rdr["param_5"].ToString(),
          remarks = rdr["remarks"].ToString()
        });
      }
      conn.Close();
    }
    return Json(result);
  }

  [HttpGet]
  public JsonResult GetSAMLogin()
  {
    string samUser = "";
    if (HttpContext.Session.GetString(SessionModel.SAMNAME) != null)
    {
      samUser = HttpContext.Session.GetString(SessionModel.SAMNAME);
    }
    return Json(new { samlogin = samUser});
  }
}
