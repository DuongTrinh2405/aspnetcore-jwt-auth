using Lab1.Models;
using Lab1.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Lab1.Enums;

namespace Lab1.Services
{
    public class PropertyOperations : IPropertyOperations
    {
        private readonly Context _context;

        public PropertyOperations(Context context)
        {
            _context = context;
        }

        // 🔥 HELPER: tránh lặp code
        private async Task<Employee?> GetEmployeeAsync(string userId)
        {
            return await _context.Employees
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.UserId == userId);
        }

        // ✅ GET ALL (giữ nguyên logic, tối ưu nhẹ)
       public async Task<(IEnumerable<Property> Data, int TotalCount)> GetAllAsync(
    string? userId,
    string? role,
    int page,
    int pageSize,
    PropertyType? type,
    PropertyStatus? status,
    decimal? minPrice,
    decimal? maxPrice)
{
    var query = _context.Properties
        .AsNoTracking()
        .Include(p => p.Employee)
        .AsQueryable();

    // 🔒 ROLE FILTER (giữ logic cũ)
    if (role != "Admin")
    {
        if (string.IsNullOrEmpty(userId))
            return (new List<Property>(), 0);

        var employee = await GetEmployeeAsync(userId);
        if (employee == null)
            return (new List<Property>(), 0);

        query = query.Where(p => p.EmployeeId == employee.Id);
    }

    // 🔎 FILTER (mới thêm)
            if (type.HasValue)
                query = query.Where(p => p.Type == type.Value);

            if (status.HasValue)
                query = query.Where(p => p.Status == status.Value);

            if (minPrice.HasValue)
                query = query.Where(p => p.Price >= minPrice.Value);

            if (maxPrice.HasValue)
                query = query.Where(p => p.Price <= maxPrice.Value);

            // 📊 TOTAL COUNT
            var totalCount = await query.CountAsync();

            // 📄 PAGING
            var data = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (data, totalCount);
        }

        // ✅ GET BY ID
        public async Task<Property?> GetByIdAsync(int id, string? userId, string? role)
        {
            var query = _context.Properties
                .AsNoTracking()
                .Include(p => p.Employee)
                .Where(p => p.Id == id);

            if (role != "Admin")
            {
                if (string.IsNullOrEmpty(userId))
                    return null;

                var employee = await GetEmployeeAsync(userId);
                if (employee == null)
                    return null;

                query = query.Where(p => p.EmployeeId == employee.Id);
            }

            return await query.FirstOrDefaultAsync();
        }

        // ✅ CREATE
        public async Task<Property> CreateAsync(Property property, string userId)
        {
            var employee = await GetEmployeeAsync(userId);

            if (employee == null)
                throw new UnauthorizedAccessException("Employee not found");

            property.EmployeeId = employee.Id;
            property.CreatedDate = DateTime.UtcNow;

            _context.Properties.Add(property);
            await _context.SaveChangesAsync();

            return property;
        }

        // ✅ UPDATE
        public async Task<bool> UpdateAsync(int id, Property property, string userId)
        {
            var existing = await _context.Properties.FindAsync(id);
            if (existing == null) return false;

            var employee = await GetEmployeeAsync(userId);

            if (employee == null)
                throw new UnauthorizedAccessException();

            if (existing.EmployeeId != employee.Id)
                throw new UnauthorizedAccessException();

            existing.Title = property.Title;
            existing.Description = property.Description;
            existing.Price = property.Price;
            existing.Area = property.Area;
            existing.Address = property.Address;
            existing.Type = property.Type;
            existing.Status = property.Status;
            existing.IsSold = property.IsSold;
            existing.UpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        // ✅ DELETE
        public async Task<bool> DeleteAsync(int id, string userId, string role)
        {
            var property = await _context.Properties.FindAsync(id);
            if (property == null) return false;

            if (role != "Admin")
            {
                var employee = await GetEmployeeAsync(userId);

                if (employee == null || property.EmployeeId != employee.Id)
                    throw new UnauthorizedAccessException();
            }

            _context.Properties.Remove(property);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}