using Lab1.Models;
using Lab1.DTO;

namespace Lab1.Services.Interfaces
{
    public interface IDealOperations
    {
        Task<IEnumerable<Deal>> GetAllAsync(string userId, string role);

        Task<Deal?> GetByIdAsync(int id, string userId, string role);

        Task<IEnumerable<Deal>> GetByCustomerIdAsync(int customerId, string userId, string role);

        // ✅ CREATE
        Task<Deal> CreateAsync(CreateDealDto dto, string userId, string role);

        // ✅ UPDATE
        Task<bool> UpdateAsync(int id, UpdateDealDto dto, string userId, string role);

        // ✅ DELETE
        Task<bool> DeleteAsync(int id, string userId, string role);

        // 🔥 FIX QUAN TRỌNG: thêm pagination
        Task<IEnumerable<Deal>> SearchAsync(
            string? query,
            string? stage,
            string? status,
            int? employeeId,
            decimal? minAmount,
            decimal? maxAmount,
            string? sortBy,
            string? sortOrder,
            int page,          // ✅ thêm
            int pageSize,      // ✅ thêm
            string userId,
            string role
        );
    }
}