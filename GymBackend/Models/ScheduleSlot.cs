namespace GymBackend.Models;

public class ScheduleSlot
{
    public int Id { get; set; }

    public string Day { get; set; } = string.Empty;

    public string StartTime { get; set; } = string.Empty;

    public string EndTime { get; set; } = string.Empty;

    public string Zone { get; set; } = "Sala de Pesas";

    public int Capacity { get; set; } = 20;

    public bool Enabled { get; set; } = true;
}
