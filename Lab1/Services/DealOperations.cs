using Lab1.Models;
using Lab1.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Lab1.Services
{
    public class DealOperations : IDealOperations
    {
        private readonly Context _context;

        public DealOperations(Context context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Deal>> GetAllAsync()
        {
            return await _context.Deals
                .AsNoTracking()
                .Include(d => d.Customer)
                .Include(d => d.Property)
                .Include(d => d.Employee)
                .ToListAsync();
        }

        public async Task<Deal?> GetByIdAsync(int id)
        {
            return await _context.Deals
                .AsNoTracking()
                .Include(d => d.Customer)
                .Include(d => d.Property)
                .Include(d => d.Employee)
                .FirstOrDefaultAsync(d => d.Id == id);
        }

        public async Task<IEnumerable<Deal>> GetByCustomerIdAsync(int customerId)
        {
            return await _context.Deals
                .AsNoTracking()
                .Where(d => d.CustomerId == customerId)
                .Include(d => d.Property)
                .Include(d => d.Employee)
                .ToListAsync();
        }

        public async Task<Deal> CreateAsync(Deal deal)
        {
            deal.CreatedDate = DateTime.UtcNow;
            _context.Deals.Add(deal);
            await _context.SaveChangesAsync();
            return deal;
        }

        public async Task<bool> UpdateAsync(int id, Deal deal)
        {
            var existing = await _context.Deals.FindAsync(id);
            if (existing == null) return false;

            existing.Title = deal.Title;
            existing.Amount = deal.Amount;
            existing.Stage = deal.Stage;
            existing.Status = deal.Status;
            existing.CustomerId = deal.CustomerId;
            existing.PropertyId = deal.PropertyId;
            existing.EmployeeId = deal.EmployeeId;
            existing.ExpectedCloseDate = deal.ExpectedCloseDate;
            existing.ClosedDate = deal.ClosedDate;
            existing.Notes = deal.Notes;
            existing.UpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var deal = await _context.Deals.FindAsync(id);
            if (deal == null) return false;

            _context.Deals.Remove(deal);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
