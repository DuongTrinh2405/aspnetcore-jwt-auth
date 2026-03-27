using Microsoft.EntityFrameworkCore;
using Lab1.Models;
using Lab1.Services.Interfaces;

namespace Lab1.Services
{
    public class EmployeeOperations : IEmployeeOperations
    {
        private readonly Context _context;

        public EmployeeOperations(Context context)
        {
            _context = context;
        }

        public async Task<List<Employee>> GetAllAsync()
        {
            return await _context.Employees
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<Employee?> GetByIdAsync(int id)
        {
            return await _context.Employees
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.Id == id);
        }

        // ✅ CREATE
        public async Task<Employee> CreateAsync(Employee employee)
        {
            // normalize email
            var email = employee.Email.Trim().ToLower();

            var exists = await _context.Employees
                .AnyAsync(e => e.Email.ToLower() == email);

            if (exists)
                throw new InvalidOperationException("Email already exists");

            employee.Email = email;
            employee.CreatedDate = DateTime.UtcNow;

            _context.Employees.Add(employee);
            await _context.SaveChangesAsync();

            return employee;
        }

        // ✅ UPDATE
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
            employee.Phone = updatedEmployee.Phone;
            employee.Role = updatedEmployee.Role;
            employee.Status = updatedEmployee.Status;

            await _context.SaveChangesAsync();
            return true;
        }

        // ✅ DELETE
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
    }
}