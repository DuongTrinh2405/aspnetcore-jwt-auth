using System.ComponentModel.DataAnnotations;

namespace Lab1.Enums
{
    public enum PropertyStatus
    {
        [Display(Name = "Available")]
        Available = 0,

        [Display(Name = "Reserved")]
        Reserved = 1,

        [Display(Name = "Sold")]
        Sold = 2,

        [Display(Name = "Rented")]
        Rented = 3,

        [Display(Name = "Under Negotiation")]
        UnderNegotiation = 4,

        [Display(Name = "Off Market")]
        OffMarket = 5
    }
}