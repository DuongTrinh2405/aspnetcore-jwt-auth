using System.ComponentModel.DataAnnotations;

namespace Lab1.DTO
{
    public class RegisterUserDTO
    {
        [Required]
        public string UserName { get; set; } = string.Empty;

        [Required]
        [MinLength(6)]
        public string Password { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
    }
}