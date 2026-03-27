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

        // ✅ GET ALL
        public async Task<IEnumerable<Customer>> GetAllAsync(string userId, string role)
        {
            if (role == "Admin")
            {
                return await _context.Customers
                    .AsNoTracking()
                    .Include(c => c.Employee)
                    .ToListAsync();
            }

            if (string.IsNullOrEmpty(userId))
                return new List<Customer>();

            var employee = await _context.Employees
                .FirstOrDefaultAsync(e => e.UserId == userId);

            if (employee == null)
                return new List<Customer>();

            return await _context.Customers
                .Where(c => c.EmployeeId == employee.Id)
                .AsNoTracking()
                .ToListAsync();
        }

        // ✅ GET BY ID
        public async Task<Customer?> GetByIdAsync(int id, string userId, string role)
        {
            var customer = await _context.Customers
                .Include(c => c.Employee)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (customer == null)
                return null;

            // 🔥 FIX null-safe
            if (role != "Admin" && customer.Employee?.UserId != userId)
                return null;

            return customer;
        }

        // ✅ CREATE
        public async Task<Customer> CreateAsync(CreateCustomerDto dto, string userId)
        {
            var employee = await _context.Employees
                .FirstOrDefaultAsync(e => e.UserId == userId);

            if (employee == null)
                throw new Exception("Employee not found");

            var customer = new Customer
            {
                Name = dto.Name,
                Phone = dto.Phone,
                Email = dto.Email,
                Address = dto.Address,

                // 🔥 FIX: set từ server
                Status = CustomerStatus.New,

                LastContactDate = dto.LastContactDate,
                EmployeeId = employee.Id,
                CreatedDate = DateTime.UtcNow
            };

            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();

            return customer;
        }

        // ✅ UPDATE
        public async Task<bool> UpdateAsync(int id, UpdateCustomerDto dto, string userId, string role)
        {
            var customer = await _context.Customers
                .Include(c => c.Employee)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (customer == null)
                return false;

            if (role != "Admin" && customer.Employee?.UserId != userId)
                return false;

            customer.Name = dto.Name;
            customer.Phone = dto.Phone;
            customer.Email = dto.Email;
            customer.Address = dto.Address;

            // 🔥 FIX: enum trực tiếp
            customer.Status = dto.Status;

            customer.LastContactDate = dto.LastContactDate;

            await _context.SaveChangesAsync();
            return true;
        }

        // ✅ DELETE
        public async Task<bool> DeleteAsync(int id, string userId, string role)
        {
            var customer = await _context.Customers
                .Include(c => c.Employee)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (customer == null)
                return false;

            if (role != "Admin" && customer.Employee?.UserId != userId)
                return false;

            _context.Customers.Remove(customer);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}