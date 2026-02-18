using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using AspnetCoreMvcFull.Models;

namespace AspnetCoreMvcFull.Controllers;

public class AuthController : Controller
{
  public IActionResult ForgotPasswordBasic() => View();
  public IActionResult LoginBasic() => View();
  public IActionResult RegisterBasic() => View();
  public IActionResult LogoutSucc() {
    //HttpContext.Session.SetString(SessionModel.SAMNAME, "");
    //HttpContext.Session.Remove(SessionModel.SAMNAME);
    HttpContext.Session.Remove("_SAMNAME");
    HttpContext.Session.Remove("SAMNAME");
    return View();
  }
}
