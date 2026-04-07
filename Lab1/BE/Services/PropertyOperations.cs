using Lab1.Models;
using Lab1.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Lab1.Enums;
using Lab1.DTO;

namespace Lab1.Services
{
    public class PropertyOperations : IPropertyOperations
    {
        private readonly Context _context;

        public PropertyOperations(Context context)
        {
            _context = context;
        }

        private async Task<Employee?> GetEmployeeAsync(string userId)
        {
            return await _context.Employees
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.UserId == userId);
        }

        // ==============================
        // GET ALL
        // ==============================
        public async Task<(IEnumerable<PropertyResponseDto> Data, int TotalCount)> GetAllAsync(
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
        )
        {
            var query = _context.Properties
                .AsNoTracking()
                .Include(p => p.Employee)
                .Include(p => p.Images)
                .AsQueryable();

            if (role != "Admin")
            {
                if (string.IsNullOrEmpty(userId))
                    return (new List<PropertyResponseDto>(), 0);

                var employee = await GetEmployeeAsync(userId);
                if (employee == null)
                    return (new List<PropertyResponseDto>(), 0);

                query = query.Where(p => p.EmployeeId == employee.Id);
            }

            if (!string.IsNullOrEmpty(search))
            {
                var keyword = search.ToLower();

                query = query.Where(p =>
                    p.Title.ToLower().Contains(keyword) ||
                    p.Description.ToLower().Contains(keyword) ||
                    p.Address.ToLower().Contains(keyword)
                );
            }

            if (type.HasValue)
                query = query.Where(p => p.Type == type.Value);

            if (status.HasValue)
                query = query.Where(p => p.Status == status.Value);

            if (minPrice.HasValue)
                query = query.Where(p => p.Price >= minPrice.Value);

            if (maxPrice.HasValue)
                query = query.Where(p => p.Price <= maxPrice.Value);

            if (!string.IsNullOrEmpty(sortBy))
            {
                var sortByLower = sortBy.ToLower();
                var sortOrderLower = sortOrder?.ToLower() ?? "asc";

                switch (sortByLower)
                {
                    case "price":
                        query = sortOrderLower == "desc"
                            ? query.OrderByDescending(p => p.Price)
                            : query.OrderBy(p => p.Price);
                        break;

                    case "area":
                        query = sortOrderLower == "desc"
                            ? query.OrderByDescending(p => p.Area)
                            : query.OrderBy(p => p.Area);
                        break;

                    case "createddate":
                        query = sortOrderLower == "desc"
                            ? query.OrderByDescending(p => p.CreatedDate)
                            : query.OrderBy(p => p.CreatedDate);
                        break;

                    default:
                        query = query.OrderByDescending(p => p.CreatedDate);
                        break;
                }
            }
            else
            {
                query = query.OrderByDescending(p => p.CreatedDate);
            }

            var totalCount = await query.CountAsync();

            var data = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(p => new PropertyResponseDto
                {
                    Id = p.Id,
                    Title = p.Title,
                    Description = p.Description,
                    Price = p.Price,
                    Area = p.Area,
                    Address = p.Address,
                    Type = p.Type,
                    Status = p.Status,
                    EmployeeId = p.EmployeeId,
                    EmployeeName = p.Employee != null ? p.Employee.Name : null,
                    CustomerId = p.CustomerId,
                    CreatedDate = p.CreatedDate,
                    UpdatedDate = p.UpdatedDate,
                    ImageUrls = p.Images.Select(i => i.ImageUrl).ToList()
                })
                .ToListAsync();

            return (data, totalCount);
        }

        // ==============================
        // GET BY ID
        // ==============================
        public async Task<PropertyResponseDto?> GetByIdAsync(int id, string? userId, string? role)
        {
            var query = _context.Properties
                .AsNoTracking()
                .Include(p => p.Employee)
                .Include(p => p.Images)
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

            return await query.Select(p => new PropertyResponseDto
            {
                Id = p.Id,
                Title = p.Title,
                Description = p.Description,
                Price = p.Price,
                Area = p.Area,
                Address = p.Address,
                Type = p.Type,
                Status = p.Status,
                EmployeeId = p.EmployeeId,
                EmployeeName = p.Employee != null ? p.Employee.Name : null,
                CustomerId = p.CustomerId,
                CreatedDate = p.CreatedDate,
                UpdatedDate = p.UpdatedDate,
                ImageUrls = p.Images.Select(i => i.ImageUrl).ToList()
            }).FirstOrDefaultAsync();
        }

        // ==============================
        // CREATE (🔥 FIX TRIỆT ĐỂ)
        // ==============================
        public async Task<Property> CreateAsync(Property property, string userId)
        {
            var employee = await GetEmployeeAsync(userId);

            if (employee == null)
                throw new UnauthorizedAccessException("Employee not found");

            property.EmployeeId = employee.Id;
            property.CreatedDate = DateTime.UtcNow;

            // 🔥 TÁCH IMAGE RA TRƯỚC
            var imagesInput = property.Images?.ToList();

            // 🔥 CHẶN EF AUTO INSERT
            property.Images = null;

            _context.Properties.Add(property);
            await _context.SaveChangesAsync();

            // 🔥 INSERT IMAGE SAU
            if (imagesInput != null && imagesInput.Any())
            {
                var images = imagesInput.Select(i => new PropertyImage
                {
                    PropertyId = property.Id,
                    ImageUrl = i.ImageUrl
                }).ToList();

                _context.PropertyImages.AddRange(images);
                await _context.SaveChangesAsync();
            }

            var createdProperty = await _context.Properties
                .Include(p => p.Images)
                .FirstOrDefaultAsync(p => p.Id == property.Id);

            return createdProperty ?? property;
        }

        // ==============================
        // UPDATE
        // ==============================
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
            existing.UpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            var oldImages = await _context.PropertyImages
                .Where(i => i.PropertyId == id)
                .ToListAsync();

            _context.PropertyImages.RemoveRange(oldImages);

            if (property.Images != null && property.Images.Any())
            {
                var newImages = property.Images.Select(i => new PropertyImage
                {
                    PropertyId = id,
                    ImageUrl = i.ImageUrl
                }).ToList();

                _context.PropertyImages.AddRange(newImages);
            }

            await _context.SaveChangesAsync();
            return true;
        }

        // ==============================
        // DELETE
        // ==============================
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

        // ==============================
        // SEARCH
        // ==============================
        public async Task<IEnumerable<PropertyResponseDto>> SearchAsync(string query, string? userId, string? role)
        {
            var (data, _) = await GetAllAsync(
                userId,
                role,
                1,
                int.MaxValue,
                query,
                null,
                null,
                null,
                null,
                null,
                null
            );

            return data;
        }
    }
}