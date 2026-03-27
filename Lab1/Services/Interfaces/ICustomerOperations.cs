using Lab1.Models;
using Lab1.DTO;

namespace Lab1.Services.Interfaces
{
    public interface ICustomerOperations
    {
        Task<IEnumerable<Customer>> GetAllAsync(string userId, string role);

        Task<Customer?> GetByIdAsync(int id, string userId, string role);

        Task<Customer> CreateAsync(CreateCustomerDto dto, string userId);

        Task<bool> UpdateAsync(int id, UpdateCustomerDto dto, string userId, string role);

        Task<bool> DeleteAsync(int id, string userId, string role);
    }
}