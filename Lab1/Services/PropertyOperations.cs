using Lab1.Models;
using Lab1.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Lab1.Services
{
    public class PropertyOperations : IPropertyOperations
    {
        private readonly Context _context;

        public PropertyOperations(Context context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Property>> GetAllAsync()
        {
            return await _context.Properties
                .AsNoTracking()
                .Include(p => p.Employee)
                .Include(p => p.Customer)
                .ToListAsync();
        }

        public async Task<Property?> GetByIdAsync(int id)
        {
            return await _context.Properties
                .AsNoTracking()
                .Include(p => p.Employee)
                .Include(p => p.Customer)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<Property> CreateAsync(Property property)
        {
            _context.Properties.Add(property);
            await _context.SaveChangesAsync();
            return property;
        }

        public async Task<bool> UpdateAsync(int id, Property property)
        {
            var existing = await _context.Properties.FindAsync(id);
            if (existing == null) return false;

            existing.Title = property.Title;
            existing.Description = property.Description;
            existing.Price = property.Price;
            existing.Area = property.Area;
            existing.Address = property.Address;
            existing.Type = property.Type;
            existing.Status = property.Status;
            existing.IsSold = property.IsSold;
            existing.EmployeeId = property.EmployeeId;
            existing.CustomerId = property.CustomerId;
            existing.UpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var property = await _context.Properties.FindAsync(id);
            if (property == null) return false;

            _context.Properties.Remove(property);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
