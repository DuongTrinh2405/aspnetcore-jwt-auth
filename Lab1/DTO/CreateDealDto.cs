using System.ComponentModel.DataAnnotations;

namespace Lab1.DTO
{
    public class CreateDealDto
    {
        [Required]
        public int CustomerId { get; set; }

        [Required]
        public int PropertyId { get; set; }

        [Required]
        public decimal Price { get; set; }
    }
}