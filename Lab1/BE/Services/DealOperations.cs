using Lab1.DTO;
using Lab1.Models;
using Lab1.Services.Interfaces;
using Lab1.Enums;
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

        // ✅ GET ALL
        public async Task<IEnumerable<Deal>> GetAllAsync(string userId, string role)
        {
            if (role == "Admin")
            {
                return await _context.Deals
                    .AsNoTracking()
                    .Include(d => d.Customer)
                    .Include(d => d.Property)
                    .Include(d => d.Employee)
                    .ToListAsync();
            }

            var employee = await _context.Employees
                .FirstOrDefaultAsync(e => e.UserId == userId);

            if (employee == null)
                return new List<Deal>();

            return await _context.Deals
                .AsNoTracking()
                .Where(d => d.EmployeeId == employee.Id)
                .Include(d => d.Customer)
                .Include(d => d.Property)
                .Include(d => d.Employee)
                .ToListAsync();
        }

        // ✅ GET BY ID
        public async Task<Deal?> GetByIdAsync(int id, string userId, string role)
        {
            var deal = await _context.Deals
                .Include(d => d.Customer)
                .Include(d => d.Property)
                .Include(d => d.Employee)
                .FirstOrDefaultAsync(d => d.Id == id);

            if (deal == null) return null;

            if (role != "Admin")
            {
                var employee = await _context.Employees
                    .FirstOrDefaultAsync(e => e.UserId == userId);

                if (employee == null || deal.EmployeeId != employee.Id)
                    return null;
            }

            return deal;
        }

        // ✅ GET BY CUSTOMER
        public async Task<IEnumerable<Deal>> GetByCustomerIdAsync(int customerId, string userId, string role)
        {
            var query = _context.Deals
                .Where(d => d.CustomerId == customerId)
                .Include(d => d.Property)
                .Include(d => d.Employee)
                .AsQueryable();

            if (role != "Admin")
            {
                var employee = await _context.Employees
                    .FirstOrDefaultAsync(e => e.UserId == userId);

                if (employee == null)
                    return new List<Deal>();

                query = query.Where(d => d.EmployeeId == employee.Id);
            }

            return await query.ToListAsync();
        }

        // ✅ CREATE
        public async Task<Deal> CreateAsync(CreateDealDto dto, string userId, string role)
        {
            if (role == "Admin")
                throw new Exception("Admin cannot create deals");

            var employee = await _context.Employees
                .FirstOrDefaultAsync(e => e.UserId == userId);

            if (employee == null)
                throw new Exception("Employee not found");

            var deal = new Deal
            {
                Title = dto.Title,
                Amount = dto.Amount,
                Stage = dto.Stage,
                Status = dto.Status,
                CustomerId = dto.CustomerId,
                PropertyId = dto.PropertyId,
                ExpectedCloseDate = dto.ExpectedCloseDate,
                ClosedDate = null,
                Notes = dto.Notes,
                EmployeeId = employee.Id,
                CreatedDate = DateTime.UtcNow
            };

            if (deal.Stage == DealStage.Won)
                deal.Status = DealStatus.Won;

            if (deal.Status == DealStatus.Won)
                deal.ClosedDate = DateTime.UtcNow;

            _context.Deals.Add(deal);
            await _context.SaveChangesAsync();

            var createdDeal = await _context.Deals
                .Include(d => d.Customer)
                .Include(d => d.Property)
                .Include(d => d.Employee)
                .FirstOrDefaultAsync(d => d.Id == deal.Id);

            return createdDeal!;
        }

        // ✅ UPDATE
        public async Task<bool> UpdateAsync(int id, UpdateDealDto dto, string userId, string role)
        {
            var existing = await _context.Deals.FindAsync(id);
            if (existing == null) return false;

            if (role == "Admin")
                throw new Exception("Admin cannot modify deals");

            var employee = await _context.Employees
                .FirstOrDefaultAsync(e => e.UserId == userId);

            if (employee == null)
                throw new Exception("Employee not found");

            if (existing.EmployeeId != employee.Id)
                throw new Exception("Unauthorized");

            existing.Title = dto.Title;
            existing.Amount = dto.Amount;
            existing.Stage = dto.Stage;
            existing.Status = dto.Status;
            existing.CustomerId = dto.CustomerId;
            existing.PropertyId = dto.PropertyId;
            existing.ExpectedCloseDate = dto.ExpectedCloseDate;
            existing.Notes = dto.Notes;
            existing.UpdatedDate = DateTime.UtcNow;

            if (existing.Stage == DealStage.Won)
                existing.Status = DealStatus.Won;

            if (existing.Status == DealStatus.Won && existing.ClosedDate == null)
                existing.ClosedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        // ✅ DELETE
        public async Task<bool> DeleteAsync(int id, string userId, string role)
        {
            var deal = await _context.Deals.FindAsync(id);
            if (deal == null) return false;

            if (role == "Admin")
                throw new Exception("Admin cannot delete deals");

            var employee = await _context.Employees
                .FirstOrDefaultAsync(e => e.UserId == userId);

            if (employee == null || deal.EmployeeId != employee.Id)
                throw new Exception("Unauthorized");

            _context.Deals.Remove(deal);
            await _context.SaveChangesAsync();
            return true;
        }

        // 🔥 SEARCH (FIX PAGINATION CHUẨN)
        public async Task<IEnumerable<Deal>> SearchAsync(
            string? query,
            string? stage,
            string? status,
            int? employeeId,
            decimal? minAmount,
            decimal? maxAmount,
            string? sortBy,
            string? sortOrder,
            int page,
            int pageSize,
            string userId,
            string role)
        {
            page = page <= 0 ? 1 : page;
            pageSize = pageSize <= 0 ? 10 : pageSize;

            var deals = _context.Deals.AsQueryable();

            if (role != "Admin")
            {
                var employee = await _context.Employees
                    .FirstOrDefaultAsync(e => e.UserId == userId);

                if (employee == null)
                    return new List<Deal>();

                deals = deals.Where(d => d.EmployeeId == employee.Id);
            }

            if (!string.IsNullOrEmpty(query))
            {
                deals = deals.Where(d =>
                    d.Title.Contains(query) ||
                    (d.Notes != null && d.Notes.Contains(query)));
            }

            if (!string.IsNullOrEmpty(stage) &&
                Enum.TryParse<DealStage>(stage, true, out var stageEnum))
            {
                deals = deals.Where(d => d.Stage == stageEnum);
            }

            if (!string.IsNullOrEmpty(status) &&
                Enum.TryParse<DealStatus>(status, true, out var statusEnum))
            {
                deals = deals.Where(d => d.Status == statusEnum);
            }

            if (role == "Admin" && employeeId.HasValue)
            {
                deals = deals.Where(d => d.EmployeeId == employeeId);
            }

            if (minAmount.HasValue)
                deals = deals.Where(d => d.Amount >= minAmount);

            if (maxAmount.HasValue)
                deals = deals.Where(d => d.Amount <= maxAmount);

            if (sortBy == "amount")
            {
                deals = sortOrder == "desc"
                    ? deals.OrderByDescending(d => d.Amount)
                    : deals.OrderBy(d => d.Amount);
            }
            else
            {
                deals = deals.OrderByDescending(d => d.CreatedDate);
            }

            // ✅ PAGINATION ĐÚNG
            deals = deals
                .Skip((page - 1) * pageSize)
                .Take(pageSize);

            return await deals
                .Include(d => d.Customer)
                .Include(d => d.Property)
                .Include(d => d.Employee)
                .AsNoTracking()
                .ToListAsync();
        }
    }
}