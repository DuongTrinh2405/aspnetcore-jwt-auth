using Lab1.Models;

namespace Lab1.Services.Interfaces
{
    public interface IDealOperations
    {
        Task<IEnumerable<Deal>> GetAllAsync();
        Task<Deal?> GetByIdAsync(int id);
        Task<IEnumerable<Deal>> GetByCustomerIdAsync(int customerId);
        Task<Deal> CreateAsync(Deal deal);
        Task<bool> UpdateAsync(int id, Deal deal);
        Task<bool> DeleteAsync(int id);
    }
}
