using Lab1.Models;
using Lab1.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Lab1.Services
{
    public class InteractionOperations : IInteractionOperations
    {
        private readonly Context _context;

        public InteractionOperations(Context context)
        {
            _context = context;
        }

        private async Task<Employee?> GetEmployeeAsync(string? userId)
        {
            if (string.IsNullOrEmpty(userId))
                return null;

            return await _context.Employees
                .FirstOrDefaultAsync(e => e.UserId == userId);
        }

        // ✅ GET ALL
        public async Task<IEnumerable<Interaction>> GetAllAsync(string userId, string role, int page, int pageSize)
        {
            IQueryable<Interaction> query = _context.Interactions
                .AsNoTracking()
                .Include(i => i.Customer)
                .Include(i => i.Property)
                .Include(i => i.Employee);

            if (role != "Admin")
            {
                var employee = await GetEmployeeAsync(userId);
                if (employee == null)
                    return new List<Interaction>();

                query = query.Where(i => i.EmployeeId == employee.Id);
            }

            return await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        // ✅ GET BY ID
        public async Task<Interaction?> GetByIdAsync(int id, string userId, string role)
        {
            IQueryable<Interaction> query = _context.Interactions
                .AsNoTracking()
                .Include(i => i.Customer)
                .Include(i => i.Property)
                .Include(i => i.Employee)
                .Where(i => i.Id == id);

            if (role != "Admin")
            {
                var employee = await GetEmployeeAsync(userId);
                if (employee == null)
                    return null;

                query = query.Where(i => i.EmployeeId == employee.Id);
            }

            return await query.FirstOrDefaultAsync();
        }

        // ✅ GET BY CUSTOMER
        public async Task<IEnumerable<Interaction>> GetByCustomerIdAsync(int customerId, string userId, string role, int page, int pageSize)
        {
            IQueryable<Interaction> query = _context.Interactions
                .AsNoTracking()
                .Where(i => i.CustomerId == customerId)
                .Include(i => i.Property)
                .Include(i => i.Employee);

            if (role != "Admin")
            {
                var employee = await GetEmployeeAsync(userId);
                if (employee == null)
                    return new List<Interaction>();

                query = query.Where(i => i.EmployeeId == employee.Id);
            }

            return await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        // ✅ GET BY PROPERTY
        public async Task<IEnumerable<Interaction>> GetByPropertyIdAsync(int propertyId, string userId, string role, int page, int pageSize)
        {
            IQueryable<Interaction> query = _context.Interactions
                .AsNoTracking()
                .Where(i => i.PropertyId == propertyId)
                .Include(i => i.Customer)
                .Include(i => i.Employee);

            if (role != "Admin")
            {
                var employee = await GetEmployeeAsync(userId);
                if (employee == null)
                    return new List<Interaction>();

                query = query.Where(i => i.EmployeeId == employee.Id);
            }

            return await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        // ✅ CREATE
        public async Task<Interaction> CreateAsync(Interaction interaction, string userId)
        {
            var employee = await GetEmployeeAsync(userId);

            if (employee == null)
                throw new KeyNotFoundException("Employee not found");

            interaction.EmployeeId = employee.Id;

            _context.Interactions.Add(interaction);
            await _context.SaveChangesAsync();

            return interaction;
        }

        // ✅ UPDATE
        public async Task<bool> UpdateAsync(int id, Interaction interaction, string userId)
        {
            var existing = await _context.Interactions.FindAsync(id);
            if (existing == null) return false;

            var employee = await GetEmployeeAsync(userId);

            if (employee == null)
                throw new KeyNotFoundException("Employee not found");

            if (existing.EmployeeId != employee.Id)
                throw new UnauthorizedAccessException("Unauthorized");

            existing.Type = interaction.Type;
            existing.Notes = interaction.Notes;
            existing.Date = interaction.Date;

            await _context.SaveChangesAsync();
            return true;
        }

        // ✅ DELETE
        public async Task<bool> DeleteAsync(int id, string userId, string role)
        {
            var interaction = await _context.Interactions.FindAsync(id);
            if (interaction == null) return false;

            if (role != "Admin")
            {
                var employee = await GetEmployeeAsync(userId);

                if (employee == null || interaction.EmployeeId != employee.Id)
                    throw new UnauthorizedAccessException("Unauthorized");
            }

            _context.Interactions.Remove(interaction);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}