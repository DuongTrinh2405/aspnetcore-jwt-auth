using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Lab1.Enums;

namespace Lab1.Models
{
    public class Property
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string Description { get; set; } = string.Empty;

        [Required]
        [Range(0, double.MaxValue)]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }

        [Required]
        [Range(0, double.MaxValue)]
        [Column(TypeName = "decimal(10,2)")]
        public decimal Area { get; set; }

        [Required]
        [MaxLength(300)]
        public string Address { get; set; } = string.Empty;

        // ✅ ẢNH (QUAN TRỌNG) - Nhiều ảnh
        public List<PropertyImage> Images { get; set; } = new();

        // ✅ ENUM
        [Required]
        public PropertyType Type { get; set; } = PropertyType.Apartment;

        [Required]
        public PropertyStatus Status { get; set; } = PropertyStatus.Available;

        // 🔥 Employee quản lý
        public int? EmployeeId { get; set; }
        public Employee? Employee { get; set; }

        // 🔥 Customer mua (nếu có)
        public int? CustomerId { get; set; }
        public Customer? Customer { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedDate { get; set; }
    }
}