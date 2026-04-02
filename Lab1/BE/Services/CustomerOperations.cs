using Lab1.Models;
using Lab1.Services.Interfaces;
using Lab1.DTO;
using Lab1.Enums;
using Microsoft.EntityFrameworkCore;

namespace Lab1.Services
{
    public class CustomerOperations : ICustomerOperations
    {
        private readonly Context _context;

        public CustomerOperations(Context context)
        {
            _context = context;
        }

        // ✅ GET ALL + SEARCH + FILTER + PAGINATION
        public async Task<(IEnumerable<Customer> Data, int Total)> GetAllAsync(
            CustomerQueryDto query,
            string userId,
            string role)
        {
            // 🔥 FIX: include Employee để lấy tên nhân viên
            IQueryable<Customer> q = _context.Customers
                .Include(c => c.Employee);

            // 🔐 PHÂN QUYỀN
            if (role != "Admin")
            {
                var employeeId = await _context.Employees
                    .Where(e => e.UserId == userId)
                    .Select(e => e.Id)
                    .FirstOrDefaultAsync();

                if (employeeId == 0)
                    return (new List<Customer>(), 0);

                q = q.Where(c => c.EmployeeId == employeeId);
            }

            // 🔍 SEARCH
            if (!string.IsNullOrWhiteSpace(query.Keyword))
            {
                var keyword = $"%{query.Keyword.Trim()}%";

                q = q.Where(c =>
                    EF.Functions.Like(c.Name ?? "", keyword) ||
                    EF.Functions.Like(c.Email ?? "", keyword) ||
                    EF.Functions.Like(c.Phone ?? "", keyword) ||
                    EF.Functions.Like(c.Address ?? "", keyword)
                );
            }

            // 🔍 FILTER STATUS
            if (query.Status.HasValue)
            {
                q = q.Where(c => c.Status == query.Status.Value);
            }

            // 🔍 FILTER DATE
            if (query.FromDate.HasValue)
            {
                q = q.Where(c => c.CreatedDate >= query.FromDate.Value);
            }

            if (query.ToDate.HasValue)
            {
                q = q.Where(c => c.CreatedDate <= query.ToDate.Value);
            }

            // 📊 TOTAL
            var total = await q.CountAsync();

            // 📄 PAGINATION
            var page = query.Page <= 0 ? 1 : query.Page;
            var pageSize = query.PageSize <= 0 ? 10 : query.PageSize;

            var data = await q
                .AsNoTracking()
                .OrderByDescending(c => c.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (data, total);
        }

        public async Task<Customer?> GetByIdAsync(int id, string userId, string role)
        {
            var customer = await _context.Customers
                .Include(c => c.Employee)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (customer == null)
                return null;

            if (role != "Admin" && customer.Employee?.UserId != userId)
                return null;

            return customer;
        }

        public async Task<Customer> CreateAsync(CreateCustomerDto dto, string userId)
        {
            var employee = await _context.Employees
                .FirstOrDefaultAsync(e => e.UserId == userId);

            if (employee == null)
                throw new Exception("Employee not found");

            var customer = new Customer
            {
                Name = dto.Name,
                Phone = dto.Phone ?? "",
                Email = dto.Email ?? "",
                Address = dto.Address ?? "",
                Status = CustomerStatus.New,
                LastContactDate = dto.LastContactDate,
                EmployeeId = employee.Id, // 🔥 auto assign cho staff
                CreatedDate = DateTime.UtcNow
            };

            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();

            return customer;
        }

        public async Task<bool> UpdateAsync(int id, UpdateCustomerDto dto, string userId, string role)
        {
            var customer = await _context.Customers
                .Include(c => c.Employee)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (customer == null)
                return false;

            // 🔐 chỉ owner mới sửa được
            if (role != "Admin" && customer.Employee?.UserId != userId)
                return false;

            customer.Name = dto.Name;
            customer.Phone = dto.Phone ?? "";
            customer.Email = dto.Email ?? "";
            customer.Address = dto.Address ?? "";
            customer.Status = dto.Status;
            customer.LastContactDate = dto.LastContactDate;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id, string userId, string role)
        {
            var customer = await _context.Customers
                .Include(c => c.Employee)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (customer == null)
                return false;

            // 🔐 chỉ owner mới xoá được
            if (role != "Admin" && customer.Employee?.UserId != userId)
                return false;

            _context.Customers.Remove(customer);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}