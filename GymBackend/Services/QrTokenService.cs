using System.Security.Cryptography;
using System.Text;

namespace GymBackend.Services;

public static class QrTokenService
{
    private const string DateFormat = "yyyyMMdd";

    public static string GenerateToken(string rut, string signingKey, DateTime date)
    {
        var payload = $"{rut}|{date.ToString(DateFormat)}";
        var payloadBase64 = Convert.ToBase64String(Encoding.UTF8.GetBytes(payload));
        var signature = ComputeSignature(payload, signingKey);

        return $"{payloadBase64}.{signature}";
    }

    public static bool TryValidateToken(string? token, string signingKey, DateTime today, out string rut, out string error)
    {
        rut = string.Empty;
        error = string.Empty;

        if (string.IsNullOrWhiteSpace(token))
        {
            error = "Código QR inválido.";
            return false;
        }

        var parts = token.Split('.');

        if (parts.Length != 2)
        {
            error = "Código QR inválido.";
            return false;
        }

        string payload;

        try
        {
            payload = Encoding.UTF8.GetString(Convert.FromBase64String(parts[0]));
        }
        catch (FormatException)
        {
            error = "Código QR inválido.";
            return false;
        }

        var expectedSignature = ComputeSignature(payload, signingKey);

        if (!CryptographicOperations.FixedTimeEquals(
                Encoding.UTF8.GetBytes(expectedSignature),
                Encoding.UTF8.GetBytes(parts[1])))
        {
            error = "Código QR inválido.";
            return false;
        }

        var payloadParts = payload.Split('|');

        if (payloadParts.Length != 2)
        {
            error = "Código QR inválido.";
            return false;
        }

        if (payloadParts[1] != today.ToString(DateFormat))
        {
            error = "El código QR no corresponde al día de hoy.";
            return false;
        }

        rut = payloadParts[0];
        return true;
    }

    private static string ComputeSignature(string payload, string signingKey)
    {
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(signingKey));
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(payload));

        return Convert.ToHexString(hash);
    }
}
