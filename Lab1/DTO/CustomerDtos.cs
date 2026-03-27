using System.ComponentModel.DataAnnotations;

namespace Lab1.DTO
{
    public class CreateCustomerDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Status { get; set; } = "New";
        public int? EmployeeId { get; set; }
        public DateTime? LastContactDate { get; set; }
    }

    public class UpdateCustomerDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Status { get; set; } = "New";
        public int? EmployeeId { get; set; }
        public DateTime? LastContactDate { get; set; }
    }

    public class CustomerResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int? EmployeeId { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime? LastContactDate { get; set; }
    }
}
