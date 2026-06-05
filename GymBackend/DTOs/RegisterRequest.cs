namespace GymBackend.DTOs;

public class RegisterRequest
{
    public string Rut { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;

    public string UserType { get; set; } = "Estudiante";
}