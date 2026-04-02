using System.ComponentModel.DataAnnotations;
using Lab1.Enums;

namespace Lab1.Models
{
    public class Employee
    {
        public int Id { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Phone]
        public string? Phone { get; set; }

        // ✅ Dùng enum thay vì string
        [Required]
        public EmployeeRole Role { get; set; }

        [Required]
        public EmployeeStatus Status { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        // 🔥 chỉ backend set, không cho client đụng
        public string? UserId { get; set; }
    }
}