using GymBackend.Data;
using GymBackend.Models;
using GymBackend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using System.Security.Claims;

namespace GymBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AttendanceController : ControllerBase
{
    private static readonly TimeSpan ScheduleTolerance = TimeSpan.FromMinutes(15);

    private static readonly string[] SpanishWeekdays =
    {
        "Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado",
    };

    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;

    public AttendanceController(AppDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    [HttpPost("entry")]
    public async Task<IActionResult> RegisterEntry(AttendanceActionRequest request)
    {
        var now = DateTime.Now;

        if (!TryResolveUserFromToken(request.Token, now, out var user, out var errorMessage))
        {
            return BadRequest(new { message = errorMessage });
        }

        if (!user!.Enabled)
        {
            return BadRequest(new { message = "El usuario no está habilitado." });
        }

        var todayKey = now.Date.ToString("yyyy-MM-dd");

        var attendance = await _context.Attendances.FirstOrDefaultAsync(candidate =>
            candidate.UserId == user.Id && candidate.Date == todayKey);

        if (attendance is not null && attendance.CheckedIn)
        {
            return BadRequest(new { message = "Usuario ya registra una entrada en el día." });
        }

        Reservation? matchedReservation;

        if (attendance is null)
        {
            var todayName = SpanishWeekdays[(int)now.DayOfWeek];

            var todaysReservations = await _context.Reservations
                .Where(reservation =>
                    reservation.UserId == user.Id &&
                    reservation.Day == todayName &&
                    reservation.Status == "Reservado")
                .ToListAsync();

            matchedReservation = todaysReservations.FirstOrDefault(reservation => IsWithinSchedule(reservation, now));
        }
        else
        {
            matchedReservation = attendance.ReservationId.HasValue
                ? await _context.Reservations.FindAsync(attendance.ReservationId.Value)
                : null;

            if (matchedReservation is not null && !IsWithinSchedule(matchedReservation, now))
            {
                matchedReservation = null;
            }
        }

        if (matchedReservation is null)
        {
            return BadRequest(new { message = "El usuario no se encuentra registrado en el horario de ingreso." });
        }

        var adminRut = CurrentAdminRut();

        if (attendance is null)
        {
            attendance = new Attendance
            {
                UserId = user.Id,
                Rut = user.Rut,
                UserName = user.Name,
                Date = todayKey,
                EntryTime = now.ToUniversalTime(),
                EntryAdminRut = adminRut,
                CheckedIn = true,
                ReservationId = matchedReservation.Id,
            };

            _context.Attendances.Add(attendance);
            matchedReservation.Status = "Asistió";
        }
        else
        {
            attendance.CheckedIn = true;
        }

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Entrada registrada correctamente.",
            attendance,
        });
    }

    [HttpPost("exit")]
    public async Task<IActionResult> RegisterExit(AttendanceActionRequest request)
    {
        var now = DateTime.Now;

        if (!TryResolveUserFromToken(request.Token, now, out var user, out var errorMessage))
        {
            return BadRequest(new { message = errorMessage });
        }

        if (!user!.Enabled)
        {
            return BadRequest(new { message = "El usuario no está habilitado." });
        }

        var todayKey = now.Date.ToString("yyyy-MM-dd");

        var attendance = await _context.Attendances.FirstOrDefaultAsync(candidate =>
            candidate.UserId == user.Id && candidate.Date == todayKey);

        if (attendance is null || !attendance.CheckedIn)
        {
            return BadRequest(new { message = "Usuario no registra una entrada en el día." });
        }

        attendance.ExitTime = now.ToUniversalTime();
        attendance.ExitAdminRut = CurrentAdminRut();
        attendance.CheckedIn = false;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Salida registrada correctamente.",
            attendance,
        });
    }

    private bool TryResolveUserFromToken(string? token, DateTime now, out User? user, out string errorMessage)
    {
        user = null;

        var signingKey = _configuration["Jwt:Key"]
            ?? throw new InvalidOperationException("Jwt:Key no está configurada.");

        if (!QrTokenService.TryValidateToken(token, signingKey, now.Date, out var rut, out errorMessage))
        {
            return false;
        }

        user = _context.Users.FirstOrDefault(candidate => candidate.Rut == rut);

        if (user is null)
        {
            errorMessage = "Código QR inválido.";
            return false;
        }

        return true;
    }

    private static bool IsWithinSchedule(Reservation reservation, DateTime now)
    {
        if (!TimeSpan.TryParseExact(reservation.StartTime, "hh\\:mm", CultureInfo.InvariantCulture, out var start) ||
            !TimeSpan.TryParseExact(reservation.EndTime, "hh\\:mm", CultureInfo.InvariantCulture, out var end))
        {
            return false;
        }

        var windowStart = start - ScheduleTolerance;
        var windowEnd = end + ScheduleTolerance;
        var currentTime = now.TimeOfDay;

        return currentTime >= windowStart && currentTime <= windowEnd;
    }

    private string CurrentAdminRut()
    {
        return User.FindFirstValue("rut") ?? string.Empty;
    }
}

public class AttendanceActionRequest
{
    public string Token { get; set; } = string.Empty;
}
