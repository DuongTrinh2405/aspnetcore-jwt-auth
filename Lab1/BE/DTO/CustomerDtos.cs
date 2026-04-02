using System.ComponentModel.DataAnnotations;
using Lab1.Enums;

namespace Lab1.DTO
{
    public class CreateCustomerDto
    {
        [Required(ErrorMessage = "Name is required")]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Phone(ErrorMessage = "Invalid phone format")]
        [MaxLength(20)]
        public string? Phone { get; set; }

        [EmailAddress(ErrorMessage = "Invalid email format")]
        [MaxLength(100)]
        public string? Email { get; set; }

        [MaxLength(255)]
        public string? Address { get; set; }

        public DateTime? LastContactDate { get; set; }
    }

    public class UpdateCustomerDto
    {
        [Required(ErrorMessage = "Name is required")]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Phone(ErrorMessage = "Invalid phone format")]
        [MaxLength(20)]
        public string? Phone { get; set; }

        [EmailAddress(ErrorMessage = "Invalid email format")]
        [MaxLength(100)]
        public string? Email { get; set; }

        [MaxLength(255)]
        public string? Address { get; set; }

        [Required]
        [EnumDataType(typeof(CustomerStatus))]
        public CustomerStatus Status { get; set; }

        public DateTime? LastContactDate { get; set; }
    }

    public class CustomerResponseDto
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string? Phone { get; set; }

        public string? Email { get; set; }

        public string? Address { get; set; }

        public CustomerStatus Status { get; set; }

        public int? EmployeeId { get; set; }

        // 🔥 FIX QUAN TRỌNG
        public string? EmployeeName { get; set; }

        public DateTime CreatedDate { get; set; }

        public DateTime? LastContactDate { get; set; }
    }
}