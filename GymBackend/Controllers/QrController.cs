using GymBackend.Data;
using GymBackend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace GymBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class QrController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;

    public QrController(AppDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    [HttpGet("my-code")]
    public async Task<IActionResult> GetMyCode()
    {
        var userId = CurrentUserId();
        var user = await _context.Users.FindAsync(userId);

        if (user is null)
        {
            return Unauthorized(new { message = "La sesión no corresponde a un usuario válido." });
        }

        var signingKey = _configuration["Jwt:Key"]
            ?? throw new InvalidOperationException("Jwt:Key no está configurada.");

        var today = DateTime.Now.Date;
        var token = QrTokenService.GenerateToken(user.Rut, signingKey, today);

        return Ok(new
        {
            rut = user.Rut,
            name = user.Name,
            date = today.ToString("yyyy-MM-dd"),
            token,
            validFrom = today,
            validUntil = today.AddDays(1).AddMinutes(-1),
        });
    }

    private int CurrentUserId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier);

        return int.TryParse(value, out var userId)
            ? userId
            : throw new UnauthorizedAccessException("La sesión no contiene un usuario válido.");
    }
}
