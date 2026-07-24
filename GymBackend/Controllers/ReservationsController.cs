using GymBackend.Data;
using GymBackend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace GymBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReservationsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ReservationsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetReservations()
    {
        var reservations = await _context.Reservations
            .OrderByDescending(reservation => reservation.CreatedAt)
            .ToListAsync();

        return Ok(reservations);
    }

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetReservationsByUser(int userId)
    {
        if (!User.IsInRole("Admin") && CurrentUserId() != userId)
        {
            return Forbid();
        }

        var reservations = await _context.Reservations
            .Where(reservation => reservation.UserId == userId)
            .OrderByDescending(reservation => reservation.CreatedAt)
            .ToListAsync();

        return Ok(reservations);
    }

    [HttpPost]
    public async Task<IActionResult> CreateReservation(CreateReservationRequest request)
    {
        var userId = CurrentUserId();
        var day = request.Day.Trim();
        var startTime = request.StartTime.Trim();
        var endTime = request.EndTime.Trim();
        var zone = request.Zone.Trim();

        var schedule = await _context.ScheduleSlots.FirstOrDefaultAsync(slot =>
            slot.Day == day &&
            slot.StartTime == startTime &&
            slot.EndTime == endTime &&
            slot.Zone == zone &&
            slot.Enabled);

        if (schedule is null)
        {
            return BadRequest(new { message = "El bloque seleccionado no está disponible." });
        }

        var user = await _context.Users.FindAsync(userId);

        if (user is null)
        {
            return Unauthorized(new { message = "La sesión no corresponde a un usuario válido." });
        }

        var reservedCount = await _context.Reservations.CountAsync(reservation =>
            reservation.Day == day &&
            reservation.StartTime == startTime &&
            reservation.EndTime == endTime &&
            reservation.Zone == zone &&
            reservation.Status == "Reservado");

        if (reservedCount >= schedule.Capacity)
        {
            return BadRequest(new { message = "No quedan cupos disponibles para este bloque." });
        }

        var alreadyReserved = await _context.Reservations.AnyAsync(reservation =>
            reservation.UserId == userId &&
            reservation.Day == day &&
            reservation.StartTime == startTime &&
            reservation.EndTime == endTime &&
            reservation.Zone == zone &&
            reservation.Status == "Reservado");

        if (alreadyReserved)
        {
            return BadRequest(new { message = "Ya tienes una reserva para este bloque." });
        }

        var reservation = new Reservation
        {
            UserId = user.Id,
            UserName = user.Name,
            Day = day,
            StartTime = startTime,
            EndTime = endTime,
            Zone = zone,
            Capacity = schedule.Capacity,
            Status = "Reservado",
            CreatedAt = DateTime.UtcNow,
        };

        _context.Reservations.Add(reservation);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Reserva creada correctamente.",
            reservation,
        });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> CancelReservation(int id)
    {
        var reservation = await _context.Reservations.FindAsync(id);

        if (reservation is null)
        {
            return NotFound(new { message = "Reserva no encontrada." });
        }

        if (!User.IsInRole("Admin") && reservation.UserId != CurrentUserId())
        {
            return Forbid();
        }

        reservation.Status = "Cancelado";
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Reserva cancelada correctamente.",
            reservation,
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

public class CreateReservationRequest
{
    public string Day { get; set; } = string.Empty;

    public string StartTime { get; set; } = string.Empty;

    public string EndTime { get; set; } = string.Empty;

    public string Zone { get; set; } = "Sala de Pesas";
}
