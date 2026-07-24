using GymBackend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GymBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SchedulesController : ControllerBase
{
    private readonly AppDbContext _context;

    public SchedulesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetSchedules()
    {
        var schedules = await _context.ScheduleSlots
            .Where(slot => slot.Enabled)
            .OrderBy(slot => slot.Id)
            .ToListAsync();

        var activeReservations = await _context.Reservations
            .Where(reservation => reservation.Status == "Reservado")
            .ToListAsync();

        var result = schedules.Select(schedule => new
        {
            schedule.Id,
            schedule.Day,
            schedule.StartTime,
            schedule.EndTime,
            schedule.Zone,
            schedule.Capacity,
            ReservedCount = activeReservations.Count(reservation =>
                reservation.Day == schedule.Day &&
                reservation.StartTime == schedule.StartTime &&
                reservation.EndTime == schedule.EndTime &&
                reservation.Zone == schedule.Zone),
        });

        return Ok(result);
    }
}
