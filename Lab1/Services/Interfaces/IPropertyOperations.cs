using Lab1.Models;

namespace Lab1.Services.Interfaces
{
    public interface IPropertyOperations
    {
        Task<IEnumerable<Property>> GetAllAsync();
        Task<Property?> GetByIdAsync(int id);
        Task<Property> CreateAsync(Property property);
        Task<bool> UpdateAsync(int id, Property property);
        Task<bool> DeleteAsync(int id);
    }
}
