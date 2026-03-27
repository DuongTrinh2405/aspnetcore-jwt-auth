using Lab1.Models;
using Microsoft.EntityFrameworkCore;

namespace Lab1.Services
{
    public class InteractionOperations
    {
        private readonly Context _context;

        public InteractionOperations(Context context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Interaction>> GetAllAsync()
        {
            return await _context.Interactions
                .Include(i => i.Customer)
                .Include(i => i.Property)
                .Include(i => i.Employee)
                .ToListAsync();
        }

        public async Task<Interaction?> GetByIdAsync(int id)
        {
            return await _context.Interactions
                .Include(i => i.Customer)
                .Include(i => i.Property)
                .Include(i => i.Employee)
                .FirstOrDefaultAsync(i => i.Id == id);
        }

        public async Task<IEnumerable<Interaction>> GetByCustomerIdAsync(int customerId)
        {
            return await _context.Interactions
                .Where(i => i.CustomerId == customerId)
                .Include(i => i.Property)
                .Include(i => i.Employee)
                .ToListAsync();
        }

        public async Task<IEnumerable<Interaction>> GetByPropertyIdAsync(int propertyId)
        {
            return await _context.Interactions
                .Where(i => i.PropertyId == propertyId)
                .Include(i => i.Customer)
                .Include(i => i.Employee)
                .ToListAsync();
        }

        public async Task<Interaction> CreateAsync(Interaction interaction)
        {
            _context.Interactions.Add(interaction);
            await _context.SaveChangesAsync();
            return interaction;
        }

        public async Task<bool> UpdateAsync(int id, Interaction interaction)
        {
            var existing = await _context.Interactions.FindAsync(id);
            if (existing == null) return false;

            existing.Type = interaction.Type;
            existing.Notes = interaction.Notes;
            existing.Date = interaction.Date;
            existing.EmployeeId = interaction.EmployeeId;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var interaction = await _context.Interactions.FindAsync(id);
            if (interaction == null) return false;

            _context.Interactions.Remove(interaction);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}