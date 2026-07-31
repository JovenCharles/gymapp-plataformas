namespace GymBackend.Models;

public class Attendance
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public string Rut { get; set; } = string.Empty;

    public string UserName { get; set; } = string.Empty;

    public string Date { get; set; } = string.Empty;

    public DateTime? EntryTime { get; set; }

    public string? EntryAdminRut { get; set; }

    public DateTime? ExitTime { get; set; }

    public string? ExitAdminRut { get; set; }

    public int? ReservationId { get; set; }

    public bool CheckedIn { get; set; }
}
