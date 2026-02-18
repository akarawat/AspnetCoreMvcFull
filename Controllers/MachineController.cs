using AspnetCoreMvcFull.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Data;
using System.Diagnostics;
using System.Reflection.Metadata.Ecma335;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace AspnetCoreMvcFull.Controllers;

public class MachineController : Controller
{
  private readonly ILogger<MachineController> _logger;
  private readonly IConfiguration _configuration;
  public MachineController(ILogger<MachineController> logger, IConfiguration configuration)
  {
    _logger = logger;
    _configuration = configuration;
  }
  

}
