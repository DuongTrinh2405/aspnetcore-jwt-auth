using System.ComponentModel.DataAnnotations;
using Lab1.Enums;

namespace Lab1.DTO
{
    public class CreateEmployeeDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Phone]
        public string? Phone { get; set; }

        [Required]
        public EmployeeRole Role { get; set; }

        [Required]
        public EmployeeStatus Status { get; set; }

        // ❌ XÓA UserId (KHÔNG cho client truyền)
    }

    public class UpdateEmployeeDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Phone]
        public string? Phone { get; set; }

        [Required]
        public EmployeeRole Role { get; set; }

        [Required]
        public EmployeeStatus Status { get; set; }

        // ❌ XÓA UserId
    }

    public class EmployeeResponseDto
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string? Phone { get; set; }

        // ✅ trả về string cho dễ đọc API
        public string Role { get; set; } = string.Empty;

        public string Status { get; set; } = string.Empty;

        public DateTime CreatedDate { get; set; }

        public string? UserId { get; set; }
    }
}