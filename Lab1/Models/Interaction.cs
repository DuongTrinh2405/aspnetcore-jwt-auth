using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Lab1.Models
{
    public class Interaction
    {
        public int Id { get; set; }

        [Required]
        public int CustomerId { get; set; }

        [Required]
        public int PropertyId { get; set; }

        [Required]
        public string Type { get; set; } = "Interested"; // Interested / Viewing / Offer / Sold

        public string? Notes { get; set; }

        public DateTime Date { get; set; } = DateTime.UtcNow;

        // 🔥 Employee tạo interaction này
        public int? EmployeeId { get; set; }

        // Navigation properties
        public Customer? Customer { get; set; }
        public Property? Property { get; set; }
        public Employee? Employee { get; set; }
    }
}