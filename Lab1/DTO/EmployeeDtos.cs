using System.ComponentModel.DataAnnotations;

namespace Lab1.DTO
{
    public class CreateEmployeeDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Role { get; set; }
        public string? Status { get; set; }
        public string? UserId { get; set; }
    }

    public class UpdateEmployeeDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Role { get; set; }
        public string? Status { get; set; }
        public string? UserId { get; set; }
    }

    public class EmployeeResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Role { get; set; }
        public string? Status { get; set; }
        public DateTime CreatedDate { get; set; }
        public string? UserId { get; set; }
    }
}
