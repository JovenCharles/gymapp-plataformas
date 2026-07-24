namespace GymBackend.Models;

public class User
{
    public int Id { get; set; }

    public string Rut { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Username { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public string UserType { get; set; } = "Estudiante";

    public string Role { get; set; } = "Cliente";
}
