using System.ComponentModel.DataAnnotations;

namespace Lab1.DTO
{
    public class CreateAppointmentDTO
    {
        [Range(1, int.MaxValue)]
        public int CustomerId { get; set; }

        [Range(1, int.MaxValue)]
        public int PropertyId { get; set; }

        [Required]
        public DateTime AppointmentDate { get; set; }

        [StringLength(500)]
        public string? Notes { get; set; }
    }
}