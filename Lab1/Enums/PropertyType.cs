using System.ComponentModel.DataAnnotations;

namespace Lab1.Enums
{
    public enum PropertyType
    {
        [Display(Name = "Apartment")]
        Apartment = 0,

        [Display(Name = "House")]
        House = 1,

        [Display(Name = "Villa")]
        Villa = 2,

        [Display(Name = "Townhouse")]
        Townhouse = 3,

        [Display(Name = "Office")]
        Office = 4,

        [Display(Name = "Land")]
        Land = 5,

        [Display(Name = "Warehouse")]
        Warehouse = 6,

        [Display(Name = "Commercial")]
        Commercial = 7
    }
}