using Lab1.Models;
using Lab1.Enums;

namespace Lab1.Services.Interfaces
{
    public interface IPropertyOperations
    {
        // ✅ Paging + Filter
        Task<(IEnumerable<Property> Data, int TotalCount)> GetAllAsync(
            string? userId,
            string? role,
            int page,
            int pageSize,
            PropertyType? type,
            PropertyStatus? status,
            decimal? minPrice,
            decimal? maxPrice
        );

        Task<Property?> GetByIdAsync(int id, string? userId, string? role);

        Task<Property> CreateAsync(Property property, string userId);

        Task<bool> UpdateAsync(int id, Property property, string userId);

        Task<bool> DeleteAsync(int id, string userId, string role);
    }
}