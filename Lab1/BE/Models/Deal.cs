using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Lab1.Enums;

namespace Lab1.Models
{
    public class Deal
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(255)]
        public string Title { get; set; } = string.Empty;

        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        [Required]
        public DealStage Stage { get; set; } = DealStage.Prospect;

        [Required]
        public DealStatus Status { get; set; } = DealStatus.Open;

        [Required]
        public int CustomerId { get; set; }

        public int? PropertyId { get; set; }

        public int? EmployeeId { get; set; }

        public DateTime? ExpectedCloseDate { get; set; }

        public DateTime? ClosedDate { get; set; }

        public string? Notes { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedDate { get; set; }

        // Navigation
        public Customer? Customer { get; set; }
        public Property? Property { get; set; }
        public Employee? Employee { get; set; }
    }
}