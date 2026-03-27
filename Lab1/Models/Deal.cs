using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Lab1.Models
{
    public class Deal
    {
        public int Id { get; set; }

        [Required]
        public string Title { get; set; } = string.Empty;

        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        [Required]
        public string Stage { get; set; } = "Prospect"; // Prospect / Proposal / Negotiation / Won / Lost

        [Required]
        public string Status { get; set; } = "Open"; // Open / Won / Lost / Cancelled

        [Required]
        public int CustomerId { get; set; }

        public int? PropertyId { get; set; }

        public int? EmployeeId { get; set; }

        public DateTime? ExpectedCloseDate { get; set; }

        public DateTime? ClosedDate { get; set; }

        public string? Notes { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedDate { get; set; }

        public Customer? Customer { get; set; }
        public Property? Property { get; set; }
        public Employee? Employee { get; set; }
    }
}
