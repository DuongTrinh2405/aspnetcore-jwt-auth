using Lab1.Models;

namespace Lab1.Services.Interfaces
{
    public interface ICustomerOperations
    {
        Task<IEnumerable<Customer>> GetAllAsync();
        Task<Customer?> GetByIdAsync(int id);
        Task<Customer> CreateAsync(Customer customer);
        Task<bool> UpdateAsync(int id, Customer customer);
        Task<bool> DeleteAsync(int id);
    }
}