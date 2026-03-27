using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Lab1.Models
{
    public class Property
    {
        public int Id { get; set; }

        [Required]
        public string Title { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal Area { get; set; } // Diện tích (m²)

        [Required]
        public string Address { get; set; } = string.Empty;

        public string Type { get; set; } = "Apartment"; // Apartment / House / Land / Commercial

        public string Status { get; set; } = "Available"; // Available / Sold / Pending

        public bool IsSold { get; set; } = false;

        // 🔥 Liên kết với Employee (người quản lý property)
        public int? EmployeeId { get; set; }
        public Employee? Employee { get; set; }

        // 🔥 Liên kết với Customer (khách hàng quan tâm/đã mua)
        public int? CustomerId { get; set; }
        public Customer? Customer { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedDate { get; set; }
    }
}