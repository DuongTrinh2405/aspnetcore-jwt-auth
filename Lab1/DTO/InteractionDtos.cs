using System.ComponentModel.DataAnnotations;
using Lab1.Enums;

namespace Lab1.DTO
{
    public class CreateInteractionDto
    {
        [Required]
        public int CustomerId { get; set; }

        [Required]
        public int PropertyId { get; set; }

        // ✅ dùng enum thay vì string
        [Required]
        public InteractionType Type { get; set; }

        public string? Notes { get; set; }

        public DateTime Date { get; set; } = DateTime.UtcNow;
    }

    public class UpdateInteractionDto
    {
        // ❌ KHÔNG cho sửa CustomerId + PropertyId
        // → bỏ luôn 2 field này

        [Required]
        public InteractionType Type { get; set; }

        public string? Notes { get; set; }

        public DateTime Date { get; set; } = DateTime.UtcNow;
    }

    public class InteractionResponseDto
    {
        public int Id { get; set; }

        public int CustomerId { get; set; }

        public int PropertyId { get; set; }

        // ✅ trả enum (hoặc string nếu config JSON)
        public InteractionType Type { get; set; }

        public string? Notes { get; set; }

        public DateTime Date { get; set; }

        public int? EmployeeId { get; set; }
    }
}