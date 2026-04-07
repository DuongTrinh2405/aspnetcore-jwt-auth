using Lab1.Models;
using Lab1.DTO;

namespace Lab1.Services.Interfaces
{
    public interface ICustomerOperations
    {
        // ✅ FIX: thêm Page + PageSize
        Task<(IEnumerable<Customer> Data, int Total, int Page, int PageSize)> GetAllAsync(
            CustomerQueryDto query,
            string userId,
            string role
        );

        Task<Customer?> GetByIdAsync(int id, string userId, string role);

        Task<Customer> CreateAsync(CreateCustomerDto dto, string userId);

        Task<bool> UpdateAsync(int id, UpdateCustomerDto dto, string userId, string role);

        Task<bool> DeleteAsync(int id, string userId, string role);
    }
}