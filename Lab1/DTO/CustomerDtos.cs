using System.ComponentModel.DataAnnotations;
using Lab1.Enums;

namespace Lab1.DTO
{
    public class CreateCustomerDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        public string Phone { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string Address { get; set; } = string.Empty;

        // ❌ KHÔNG cho client set Status
        public DateTime? LastContactDate { get; set; }
    }

    public class UpdateCustomerDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        public string Phone { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string Address { get; set; } = string.Empty;

        // ✅ Cho update status → dùng enum
        public CustomerStatus Status { get; set; }

        public DateTime? LastContactDate { get; set; }
    }

    public class CustomerResponseDto
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Phone { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string Address { get; set; } = string.Empty;

        // ✅ dùng enum luôn
        public CustomerStatus Status { get; set; }

        public int? EmployeeId { get; set; }

        public DateTime CreatedDate { get; set; }

        public DateTime? LastContactDate { get; set; }
    }
}