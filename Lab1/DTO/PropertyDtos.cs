using System.ComponentModel.DataAnnotations;

namespace Lab1.DTO
{
    public class CreatePropertyDto
    {
        [Required]
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        [Required]
        public decimal Price { get; set; }
        [Required]
        public decimal Area { get; set; }
        [Required]
        public string Address { get; set; } = string.Empty;
        public string Type { get; set; } = "Apartment";
        public string Status { get; set; } = "Available";
        public bool IsSold { get; set; }
        public int? EmployeeId { get; set; }
        public int? CustomerId { get; set; }
    }

    public class UpdatePropertyDto
    {
        [Required]
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        [Required]
        public decimal Price { get; set; }
        [Required]
        public decimal Area { get; set; }
        [Required]
        public string Address { get; set; } = string.Empty;
        public string Type { get; set; } = "Apartment";
        public string Status { get; set; } = "Available";
        public bool IsSold { get; set; }
        public int? EmployeeId { get; set; }
        public int? CustomerId { get; set; }
    }

    public class PropertyResponseDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public decimal Area { get; set; }
        public string Address { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public bool IsSold { get; set; }
        public int? EmployeeId { get; set; }
        public int? CustomerId { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
    }
}
