using System.ComponentModel.DataAnnotations;

namespace Lab1.DTO
{
    public class CreateDealDto
    {
        [Required]
        public string Title { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        [Required]
        public string Stage { get; set; } = "Prospect";
        [Required]
        public string Status { get; set; } = "Open";
        [Required]
        public int CustomerId { get; set; }
        public int? PropertyId { get; set; }
        public int? EmployeeId { get; set; }
        public DateTime? ExpectedCloseDate { get; set; }
        public DateTime? ClosedDate { get; set; }
        public string? Notes { get; set; }
    }

    public class UpdateDealDto
    {
        [Required]
        public string Title { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        [Required]
        public string Stage { get; set; } = "Prospect";
        [Required]
        public string Status { get; set; } = "Open";
        [Required]
        public int CustomerId { get; set; }
        public int? PropertyId { get; set; }
        public int? EmployeeId { get; set; }
        public DateTime? ExpectedCloseDate { get; set; }
        public DateTime? ClosedDate { get; set; }
        public string? Notes { get; set; }
    }

    public class DealResponseDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public decimal Amount { get; set; }
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
