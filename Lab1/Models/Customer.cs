using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Lab1.Models
{
    public class Customer
    {
        public int Id { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty;

        public string Phone { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string Address { get; set; } = string.Empty;

        // 🔥 CRM CORE
        public string Status { get; set; } = "New";
        // New / Contacted / Qualified / Deal / Lost

        // 🔥 Gắn với Employee (Sales)
        public int? EmployeeId { get; set; }

        public Employee? Employee { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public DateTime? LastContactDate { get; set; }
    }
}