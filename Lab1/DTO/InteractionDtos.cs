using System.ComponentModel.DataAnnotations;

namespace Lab1.DTO
{
    public class CreateInteractionDto
    {
        [Required]
        public int CustomerId { get; set; }
        [Required]
        public int PropertyId { get; set; }
        [Required]
        public string Type { get; set; } = "Interested";
        public string? Notes { get; set; }
        public DateTime Date { get; set; } = DateTime.UtcNow;
        public int? EmployeeId { get; set; }
    }

    public class UpdateInteractionDto
    {
        [Required]
        public int CustomerId { get; set; }
        [Required]
        public int PropertyId { get; set; }
        [Required]
        public string Type { get; set; } = "Interested";
        public string? Notes { get; set; }
        public DateTime Date { get; set; } = DateTime.UtcNow;
        public int? EmployeeId { get; set; }
    }

    public class InteractionResponseDto
    {
        public int Id { get; set; }
        public int CustomerId { get; set; }
        public int PropertyId { get; set; }
        public string Type { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public DateTime Date { get; set; }
        public int? EmployeeId { get; set; }
    }
}
