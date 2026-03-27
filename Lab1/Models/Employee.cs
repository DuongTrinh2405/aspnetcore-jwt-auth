using System.ComponentModel.DataAnnotations;

public class Employee
{
    public int Id { get; set; }

    [Required]
    public string? Name { get; set; }

    public string? Email { get; set; }

    public string? Phone { get; set; }

    public string? Role { get; set; } // Admin / Staff

    public string? Status { get; set; } // Active / Inactive

    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

    // 🔥 Quan trọng cho phase sau
    public string? UserId { get; set; } // link với AspNetUsers
}