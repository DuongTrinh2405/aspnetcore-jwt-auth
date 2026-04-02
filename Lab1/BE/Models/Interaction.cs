using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Lab1.Enums;

namespace Lab1.Models
{
    public class Interaction
    {
        public int Id { get; set; }

        [Required]
        public int CustomerId { get; set; }

        [Required]
        public int PropertyId { get; set; }

        // ✅ Dùng enum thay vì string
        [Required]
        public InteractionType Type { get; set; } = InteractionType.Call;

        public string? Notes { get; set; }

        public DateTime Date { get; set; } = DateTime.UtcNow;

        // 🔥 Employee tạo interaction này
        public int? EmployeeId { get; set; }

        // Navigation properties
        [ForeignKey(nameof(CustomerId))]
        public Customer? Customer { get; set; }

        [ForeignKey(nameof(PropertyId))]
        public Property? Property { get; set; }

        [ForeignKey(nameof(EmployeeId))]
        public Employee? Employee { get; set; }
    }
}