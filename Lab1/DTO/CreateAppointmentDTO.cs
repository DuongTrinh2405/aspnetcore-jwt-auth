using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Lab1.DTO
{
    public class CreateAppointmentDTO
{
    [Required]
    public int CustomerId { get; set; }

    [Required]
    public int PropertyId { get; set; }

    [Required]
    public int EmployeeId { get; set; }

    [Required]
    public DateTime DateTime { get; set; }   // 🔥 đổi sang DateTime

    public string Status { get; set; } = "Scheduled";

    public string? Notes { get; set; }
}
}