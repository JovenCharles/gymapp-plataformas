using GymBackend.Data;
using GymBackend.DTOs;
using GymBackend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;

namespace GymBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;

    public AuthController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        if (!IsValidRutFormat(request.Rut))
        {
            return BadRequest(new { message = "El RUT debe tener entre 8 y 9 dígitos, sin puntos ni guion." });
        }

        var rutExists = await _context.Users
            .AnyAsync(u => u.Rut == request.Rut);

        if (rutExists)
        {
            return BadRequest(new { message = "El RUT ya está registrado en el sistema." });
        }

        var emailExists = await _context.Users
            .AnyAsync(u => u.Email == request.Email);

        if (emailExists)
        {
            return BadRequest(new { message = "El correo ya está registrado en el sistema." });
        }

        var user = new User
        {
            Rut = request.Rut,
            Name = request.Name,
            Email = request.Email,
            PasswordHash = HashPassword(request.Password),
            UserType = request.UserType,
            Role = "Cliente"
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Usuario registrado correctamente.",
            user = new
            {
                user.Id,
                user.Rut,
                user.Name,
                user.Email,
                user.UserType,
                user.Role
            }
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        if (!IsValidRutFormat(request.Rut))
        {
            return BadRequest(new { message = "El RUT debe tener entre 8 y 9 dígitos, sin puntos ni guion." });
        }

        if (string.IsNullOrWhiteSpace(request.Email))
        {
            return BadRequest(new { message = "El correo es obligatorio." });
        }

        if (string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { message = "La contraseña es obligatoria." });
        }

        var normalizedEmail = request.Email.Trim().ToLower();
        var passwordHash = HashPassword(request.Password);

        var user = await _context.Users
            .FirstOrDefaultAsync(u =>
                u.Rut == request.Rut &&
                u.Email.ToLower() == normalizedEmail &&
                u.PasswordHash == passwordHash);

        if (user == null)
        {
            return Unauthorized(new { message = "Credenciales incorrectas." });
        }

        return Ok(new
        {
            message = "Login correcto.",
            user = new
            {
                user.Id,
                user.Rut,
                user.Name,
                user.Email,
                user.UserType,
                user.Role
            }
        });
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _context.Users
            .Select(user => new
            {
                user.Id,
                user.Rut,
                user.Name,
                user.Email,
                user.UserType,
                user.Role
            })
            .ToListAsync();

        return Ok(users);
    }

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