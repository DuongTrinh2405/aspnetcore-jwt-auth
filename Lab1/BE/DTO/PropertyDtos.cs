using System.ComponentModel.DataAnnotations;
using Lab1.Enums;

namespace Lab1.DTO
{
    public class CreatePropertyDto
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string Description { get; set; } = string.Empty;

        [Required]
        [Range(0, double.MaxValue)]
        public decimal Price { get; set; }

        [Required]
        [Range(0, double.MaxValue)]
        public decimal Area { get; set; }

        [Required]
        [MaxLength(300)]
        public string Address { get; set; } = string.Empty;

        [Required]
        public PropertyType Type { get; set; }

        [Required]
        public PropertyStatus Status { get; set; }

        public bool IsSold { get; set; }

        // ✅ THÊM ẢNH
        public string? ImageUrl { get; set; }

        // (có thể bỏ nếu không dùng phase này)
        public int? CustomerId { get; set; }
    }

    public class UpdatePropertyDto
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string Description { get; set; } = string.Empty;

        [Required]
        [Range(0, double.MaxValue)]
        public decimal Price { get; set; }

        [Required]
        [Range(0, double.MaxValue)]
        public decimal Area { get; set; }

        [Required]
        [MaxLength(300)]
        public string Address { get; set; } = string.Empty;

        public PropertyType Type { get; set; }

        public PropertyStatus Status { get; set; }

        public bool IsSold { get; set; }

        // ✅ THÊM ẢNH
        public string? ImageUrl { get; set; }

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

        public PropertyType Type { get; set; }

        public PropertyStatus Status { get; set; }

        public bool IsSold { get; set; }

        public int? EmployeeId { get; set; }

        public int? CustomerId { get; set; }

        public DateTime CreatedDate { get; set; }

        public DateTime? UpdatedDate { get; set; }

        // ✅ TRẢ ẢNH RA FE
        public string? ImageUrl { get; set; }
    }
}