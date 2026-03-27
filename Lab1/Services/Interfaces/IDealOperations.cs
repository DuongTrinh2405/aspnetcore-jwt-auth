using Lab1.Models;
using Lab1.DTO;

namespace Lab1.Services.Interfaces
{
    public interface IDealOperations
    {
        Task<IEnumerable<Deal>> GetAllAsync(string userId, string role);

        Task<Deal?> GetByIdAsync(int id, string userId, string role);

        Task<IEnumerable<Deal>> GetByCustomerIdAsync(int customerId, string userId, string role);

        Task<Deal> CreateAsync(CreateDealDto dto, string userId);

        Task<bool> UpdateAsync(int id, UpdateDealDto dto, string userId, string role);

        Task<bool> DeleteAsync(int id, string userId, string role);
    }
}