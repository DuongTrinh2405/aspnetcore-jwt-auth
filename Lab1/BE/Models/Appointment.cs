using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using Lab1.Enums;

namespace Lab1.Models
{
    public class Appointment
    {
        public int Id { get; set; }

        [Required]
        public int CustomerId { get; set; }

        [Required]
        public int PropertyId { get; set; }

        [Required]
        public int EmployeeId { get; set; }

        [Required]
        [JsonPropertyName("dateTime")]
        public DateTime DateTime { get; set; }

        [Required]
        public AppointmentStatus Status { get; set; } = AppointmentStatus.Scheduled;

        public string? Notes { get; set; }

        public DateTime CreatedDate { get; set; }

        // Navigation properties
        public Customer? Customer { get; set; }
        public Property? Property { get; set; }
        public Employee? Employee { get; set; }
    }
}