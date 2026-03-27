using Lab1.Models;

namespace Lab1.Services.Interfaces
{
    public interface IJwtTokenService
    {
        string GenerateToken(ApplicationUser user, IEnumerable<string>? roles = null);
    }
}