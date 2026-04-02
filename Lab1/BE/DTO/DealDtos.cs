using System.ComponentModel.DataAnnotations;
using Lab1.Enums;

namespace Lab1.DTO
{
    public class CreateDealDto
    {
        [Required]
        [MaxLength(255)]
        public string Title { get; set; } = string.Empty;

        [Range(0, double.MaxValue)]
        public decimal Amount { get; set; }

        [Required]
        public DealStage Stage { get; set; } = DealStage.Prospect;

        [Required]
        public DealStatus Status { get; set; } = DealStatus.Open;

        [Required]
        [Range(1, int.MaxValue)]
        public int CustomerId { get; set; }

        public int? PropertyId { get; set; }

        public DateTime? ExpectedCloseDate { get; set; }

        public DateTime? ClosedDate { get; set; }

        [MaxLength(1000)]
        public string? Notes { get; set; }
    }

    public class UpdateDealDto
    {
        [Required]
        [MaxLength(255)]
        public string Title { get; set; } = string.Empty;

        [Range(0, double.MaxValue)]
        public decimal Amount { get; set; }

        [Required]
        public DealStage Stage { get; set; }

        [Required]
        public DealStatus Status { get; set; }

        [Required]
        [Range(1, int.MaxValue)]
        public int CustomerId { get; set; }

        public int? PropertyId { get; set; }

        public DateTime? ExpectedCloseDate { get; set; }

        public DateTime? ClosedDate { get; set; }

        [MaxLength(1000)]
        public string? Notes { get; set; }
    }

    public class DealResponseDto
    {
        public int Id { get; set; }

        public string Title { get; set; } = string.Empty;

        public decimal Amount { get; set; }

        // 👉 giữ string để frontend dễ dùng
        public string Stage { get; set; } = string.Empty;

        public string Status { get; set; } = string.Empty;

        public int CustomerId { get; set; }

        public int? PropertyId { get; set; }

        public int? EmployeeId { get; set; }

        public DateTime? ExpectedCloseDate { get; set; }

        public DateTime? ClosedDate { get; set; }

        public string? Notes { get; set; }

        public DateTime CreatedDate { get; set; }

        public DateTime? UpdatedDate { get; set; }
    }
}