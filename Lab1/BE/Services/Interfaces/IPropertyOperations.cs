using Lab1.Models;
using Lab1.Enums;
using Lab1.DTO; // 🔥 BẮT BUỘC PHẢI CÓ

namespace Lab1.Services.Interfaces
{
    public interface IPropertyOperations
    {
        // ==============================
        // GET ALL (DTO)
        // ==============================
        Task<(IEnumerable<PropertyResponseDto> Data, int TotalCount)> GetAllAsync(
            string? userId,
            string? role,
            int page,
            int pageSize,
            string? search,
            PropertyType? type,
            PropertyStatus? status,
            decimal? minPrice,
            decimal? maxPrice,
            string? sortBy,
            string? sortOrder
        );

        // ==============================
        // GET BY ID (DTO)
        // ==============================
        Task<PropertyResponseDto?> GetByIdAsync(
            int id,
            string? userId,
            string? role
        );

        // ==============================
        // CREATE
        // ==============================
        Task<Property> CreateAsync(Property property, string userId);

        // ==============================
        // UPDATE
        // ==============================
        Task<bool> UpdateAsync(int id, Property property, string userId);

        // ==============================
        // DELETE
        // ==============================
        Task<bool> DeleteAsync(int id, string userId, string role);

        // ==============================
        // SEARCH (DTO)
        // ==============================
        Task<IEnumerable<PropertyResponseDto>> SearchAsync(
            string query,
            string? userId,
            string? role
        );
    }
}