using Lab1.Models;
using Lab1.Services.Interfaces;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Options;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Lab1.Services
{
    public class JwtTokenService : IJwtTokenService
    {
        private readonly JwtOptions _jwtOptions;

        public JwtTokenService(IOptions<JwtOptions> jwtOptions)
        {
            _jwtOptions = jwtOptions.Value ?? new JwtOptions();
        }

        public string GenerateToken(ApplicationUser user, IEnumerable<string>? roles = null)
        {
            var now = DateTime.UtcNow;

            // 🔐 SecretKey xử lý chuẩn (dev vs production)
#if DEBUG
            var secretKey = string.IsNullOrWhiteSpace(_jwtOptions.SecretKey)
                ? "DEV_SECRET_KEY_123456789_ABC"
                : _jwtOptions.SecretKey;
#else
            if (string.IsNullOrWhiteSpace(_jwtOptions.SecretKey))
                throw new Exception("JWT SecretKey is missing!");
            var secretKey = _jwtOptions.SecretKey;
#endif

            var issuer = string.IsNullOrWhiteSpace(_jwtOptions.ValidIssuer)
                ? "default_issuer"
                : _jwtOptions.ValidIssuer;

            var audience = string.IsNullOrWhiteSpace(_jwtOptions.ValidAudience)
                ? "default_audience"
                : _jwtOptions.ValidAudience;

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.UserName ?? ""),
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Email, user.Email ?? ""),
                new Claim(JwtRegisteredClaimNames.Sub, user.Id), // ✅ chuẩn JWT
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            // ✅ handle null roles
            foreach (var role in roles ?? Enumerable.Empty<string>())
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var expireMinutes = _jwtOptions.ExpireMinutes > 0 ? _jwtOptions.ExpireMinutes : 60;

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                notBefore: now,
                expires: now.AddMinutes(expireMinutes),
                claims: claims,
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}