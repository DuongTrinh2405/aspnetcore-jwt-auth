using Microsoft.EntityFrameworkCore;
using Lab1.Models;
using Lab1.Services.Interfaces;
using Lab1.Enums;

namespace Lab1.Services
{
    public class EmployeeOperations : IEmployeeOperations
    {
        private readonly Context _context;

        public EmployeeOperations(Context context)
        {
            _context = context;
        }

        // =========================
        // GET ALL
        // =========================
        public async Task<List<Employee>> GetAllAsync()
        {
            return await _context.Employees
                .AsNoTracking()
                .ToListAsync();
        }

        // =========================
        // GET BY ID
        // =========================
        public async Task<Employee?> GetByIdAsync(int id)
        {
            return await _context.Employees
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.Id == id);
        }

        // =========================
        // CREATE
        // =========================
        public async Task<Employee> CreateAsync(Employee employee)
        {
            var email = employee.Email.Trim().ToLower();

            var exists = await _context.Employees
                .AnyAsync(e => e.Email.ToLower() == email);

            if (exists)
                throw new InvalidOperationException("Email already exists");

            // 🔥 normalize phone (fix search số)
            employee.Phone = employee.Phone?
                .Replace(" ", "")
                .Replace("-", "");

            employee.Email = email;
            employee.CreatedDate = DateTime.UtcNow;

            _context.Employees.Add(employee);
            await _context.SaveChangesAsync();

            return employee;
        }

        // =========================
        // UPDATE
        // =========================
        public async Task<bool> UpdateAsync(int id, Employee updatedEmployee)
        {
            var employee = await _context.Employees.FindAsync(id);
            if (employee is null) return false;

            var email = updatedEmployee.Email.Trim().ToLower();

            var exists = await _context.Employees
                .AnyAsync(e => e.Email.ToLower() == email && e.Id != id);

            if (exists)
                throw new InvalidOperationException("Email already exists");

            employee.Name = updatedEmployee.Name;
            employee.Email = email;

            // 🔥 normalize phone
            employee.Phone = updatedEmployee.Phone?
                .Replace(" ", "")
                .Replace("-", "");

            employee.Role = updatedEmployee.Role;
            employee.Status = updatedEmployee.Status;

            await _context.SaveChangesAsync();
            return true;
        }

        // =========================
        // DELETE
        // =========================
        public async Task<bool> DeleteAsync(int id)
        {
            var employee = await _context.Employees.FindAsync(id);
            if (employee is null) return false;

            var hasCustomers = await _context.Customers.AnyAsync(c => c.EmployeeId == id);
            var hasDeals = await _context.Deals.AnyAsync(d => d.EmployeeId == id);
            var hasAppointments = await _context.Appointments.AnyAsync(a => a.EmployeeId == id);

            if (hasCustomers || hasDeals || hasAppointments)
                throw new InvalidOperationException("Cannot delete employee with related data");

            _context.Employees.Remove(employee);
            await _context.SaveChangesAsync();

            return true;
        }

        // =========================
        // SEARCH (FIX SỐ)
        // =========================
        public async Task<IEnumerable<Employee>> SearchAsync(
    string? query,
    string? role,
    EmployeeStatus? status,
    DateTime? fromDate,
    DateTime? toDate,
    string? userId,
    string? currentRole
)
{
    IQueryable<Employee> q = _context.Employees.AsNoTracking();

    // 🔐 PHÂN QUYỀN
    if (!string.Equals(currentRole, "Admin", StringComparison.OrdinalIgnoreCase))
    {
        if (string.IsNullOrEmpty(userId))
            return new List<Employee>();

        q = q.Where(e => e.UserId == userId);
    }

    // 🔍 SEARCH
    if (!string.IsNullOrWhiteSpace(query))
    {
        var keyword = query.Trim().ToLower();

        var phoneKeyword = keyword
            .Replace(" ", "")
            .Replace("-", "");

        q = q.Where(e =>
            (e.Name ?? "").ToLower().Contains(keyword) ||
            (e.Email ?? "").ToLower().Contains(keyword) ||
            (e.Phone ?? "").Contains(phoneKeyword)
        );
    }

    // 🎭 ROLE FILTER
    if (!string.IsNullOrEmpty(role))
    {
        var enumRole = role.Equals("Admin", StringComparison.OrdinalIgnoreCase)
            ? EmployeeRole.Admin
            : EmployeeRole.Staff;

        q = q.Where(e => e.Role == enumRole);
    }

    // 📊 STATUS FILTER
    if (status.HasValue)
    {
        q = q.Where(e => e.Status == status.Value);
    }

    // 📅 DATE RANGE
    if (fromDate.HasValue)
    {
        q = q.Where(e => e.CreatedDate >= fromDate.Value);
    }

    if (toDate.HasValue)
    {
        q = q.Where(e => e.CreatedDate <= toDate.Value);
    }

    return await q.ToListAsync();
}
    }
}