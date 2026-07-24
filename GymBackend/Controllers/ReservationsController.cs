using GymBackend.Data;
using GymBackend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GymBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReservationsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ReservationsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetReservations()
    {
        var reservations = await _context.Reservations
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return Ok(reservations);
    }

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetReservationsByUser(int userId)
    {
        var reservations = await _context.Reservations
            .Where(r => r.UserId == userId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return Ok(reservations);
    }

    [HttpPost]
    public async Task<IActionResult> CreateReservation(CreateReservationRequest request)
    {
        var user = await _context.Users.FindAsync(request.UserId);

        if (user == null)
        {
            return NotFound(new { message = "Usuario no encontrado." });
        }

        var capacity = request.Capacity <= 0 ? 20 : request.Capacity;

        var reservedCount = await _context.Reservations
            .CountAsync(r =>
                r.Day == request.Day &&
                r.StartTime == request.StartTime &&
                r.EndTime == request.EndTime &&
                r.Zone == request.Zone &&
                r.Status == "Reservado");

        if (reservedCount >= capacity)
        {
            return BadRequest(new { message = "No quedan cupos disponibles para este bloque." });
        }

        var alreadyReserved = await _context.Reservations
            .AnyAsync(r =>
                r.UserId == request.UserId &&
                r.Day == request.Day &&
                r.StartTime == request.StartTime &&
                r.EndTime == request.EndTime &&
                r.Status == "Reservado");

        if (alreadyReserved)
        {
            return BadRequest(new { message = "Ya tienes una reserva para este bloque." });
        }

        var reservation = new Reservation
        {
            UserId = user.Id,
            UserName = user.Name,
            Day = request.Day.Trim(),
            StartTime = request.StartTime.Trim(),
            EndTime = request.EndTime.Trim(),
            Zone = string.IsNullOrWhiteSpace(request.Zone) ? "Sala de Pesas" : request.Zone.Trim(),
            Capacity = capacity,
            Status = "Reservado",
            CreatedAt = DateTime.UtcNow
        };

        _context.Reservations.Add(reservation);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Reserva creada correctamente.",
            reservation
        });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> CancelReservation(int id)
    {
        var reservation = await _context.Reservations.FindAsync(id);

        if (reservation == null)
        {
            return NotFound(new { message = "Reserva no encontrada." });
        }

        reservation.Status = "Cancelado";
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Reserva cancelada correctamente.",
            reservation
        });
    }
}

public class CreateReservationRequest
{
    public int UserId { get; set; }

    public string Day { get; set; } = string.Empty;

    public string StartTime { get; set; } = string.Empty;

    public string EndTime { get; set; } = string.Empty;

    public string Zone { get; set; } = "Sala de Pesas";

    public int Capacity { get; set; } = 20;
}