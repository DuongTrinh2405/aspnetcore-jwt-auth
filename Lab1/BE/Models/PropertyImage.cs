using System.ComponentModel.DataAnnotations;

namespace Lab1.Models
{
    public class PropertyImage
    {
        public int Id { get; set; }

        public int PropertyId { get; set; }
        public Property Property { get; set; }

        [Required]
        public string ImageUrl { get; set; } = string.Empty;
    }
}
