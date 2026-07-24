using GymBackend.Data;
using GymBackend.DTOs;
using GymBackend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;

namespace GymBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthController(AppDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    [HttpPost("register")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        var rut = request.Rut.Trim();
        var name = request.Name.Trim();
        var email = request.Email.Trim().ToLowerInvariant();
        var userType = request.UserType.Trim();

        if (!IsValidRutFormat(rut))
        {
            return BadRequest(new { message = "El RUT debe tener entre 8 y 9 dígitos, sin puntos ni guion." });
        }

        if (string.IsNullOrWhiteSpace(name) || string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { message = "Todos los campos son obligatorios." });
        }

        if (userType.Equals("Administrador", StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new { message = "Los administradores deben crearse por un proceso controlado." });
        }

        if (await _context.Users.AnyAsync(user => user.Rut == rut))
        {
            return BadRequest(new { message = "El RUT ya está registrado en el sistema." });
        }

        if (await _context.Users.AnyAsync(user => user.Email.ToLower() == email))
        {
            return BadRequest(new { message = "El correo ya está registrado en el sistema." });
        }

        var user = new User
        {
            Rut = rut,
            Name = name,
            Email = email,
            Username = string.Empty,
            PasswordHash = HashPassword(request.Password),
            UserType = userType,
            Role = "Cliente",
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Usuario registrado correctamente.",
            user = ToUserResponse(user),
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var rut = request.Rut.Trim();

        if (!IsValidRutFormat(rut))
        {
            return BadRequest(new { message = "El RUT debe tener entre 8 y 9 dígitos, sin puntos ni guion." });
        }

        if (string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { message = "La contraseña es obligatoria." });
        }

        var passwordHash = HashPassword(request.Password);
        var user = await _context.Users.FirstOrDefaultAsync(candidate =>
            candidate.Rut == rut && candidate.PasswordHash == passwordHash);

        if (user is null || user.Role == "Admin")
        {
            return Unauthorized(new { message = "Credenciales de usuario incorrectas." });
        }

        return Ok(CreateAuthResponse(user, "Login correcto."));
    }

    [HttpPost("admin-login")]
    public async Task<IActionResult> AdminLogin(AdminLoginRequest request)
    {
        var username = request.Username.Trim().ToLowerInvariant();

        if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { message = "El usuario y la contraseña son obligatorios." });
        }

        var passwordHash = HashPassword(request.Password);
        var admin = await _context.Users.FirstOrDefaultAsync(candidate =>
            candidate.Username.ToLower() == username &&
            candidate.PasswordHash == passwordHash &&
            candidate.Role == "Admin");

        if (admin is null)
        {
            return Unauthorized(new { message = "Credenciales de administrador incorrectas." });
        }

        return Ok(CreateAuthResponse(admin, "Login de administrador correcto."));
    }

    [HttpGet("users")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetUsers()
    {
        var users = (await _context.Users
            .OrderBy(user => user.Name)
            .ToListAsync())
            .Select(ToUserResponse);

        return Ok(users);
    }

    private object CreateAuthResponse(User user, string message)
    {
        var key = _configuration["Jwt:Key"]
            ?? throw new InvalidOperationException("Jwt:Key no está configurada.");

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Name),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim("rut", user.Rut),
            new Claim("email", user.Email),
        };

        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
            SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: credentials);

        return new
        {
            message,
            token = new JwtSecurityTokenHandler().WriteToken(token),
            user = ToUserResponse(user),
        };
    }

    private static object ToUserResponse(User user) => new
    {
        user.Id,
        user.Rut,
        user.Name,
        user.Email,
        user.Username,
        user.UserType,
        user.Role,
    };

    private static bool IsValidRutFormat(string rut)
    {
        return Regex.IsMatch(rut, @"^\d{8,9}$");
    }

    private static string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var bytes = Encoding.UTF8.GetBytes(password);
        var hash = sha256.ComputeHash(bytes);

        return Convert.ToBase64String(hash);
    }
}
