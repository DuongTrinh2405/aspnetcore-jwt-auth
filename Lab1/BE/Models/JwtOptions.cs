namespace Lab1.Models
{
    public class JwtOptions
    {
        public const string SectionName = "JWT";

        public string ValidIssuer { get; set; } = string.Empty;
        public string ValidAudience { get; set; } = string.Empty;
        public string SecretKey { get; set; } = string.Empty;

        public int ExpireMinutes { get; set; } = 60; // ✅ FIX QUAN TRỌNG
    }
}