using Lab1.Models;
using Microsoft.EntityFrameworkCore;

namespace Lab1.Services
{
    public class CustomerService
    {
        private readonly Context _context;

        public CustomerService(Context context)
        {
            _context = context;
        }

        // GET ALL
        public async Task<List<Customer>> GetAllAsync()
        {
            return await _context.Customers
                .Include(c => c.Employee)
                .ToListAsync();
        }

        // GET BY ID
        public async Task<Customer?> GetByIdAsync(int id)
        {
            return await _context.Customers
                .Include(c => c.Employee)
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        // CREATE
        public async Task<Customer> CreateAsync(Customer customer)
        {
            customer.CreatedDate = DateTime.UtcNow;

            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();

            return customer;
        }

        // UPDATE
        public async Task<bool> UpdateAsync(int id, Customer updated)
        {
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null) return false;

            customer.Name = updated.Name;
            customer.Phone = updated.Phone;
            customer.Email = updated.Email;
            customer.Address = updated.Address;
            customer.Status = updated.Status;
            customer.EmployeeId = updated.EmployeeId;
            customer.LastContactDate = updated.LastContactDate;

            await _context.SaveChangesAsync();
            return true;
        }

        // DELETE
        public async Task<bool> DeleteAsync(int id)
        {
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null) return false;

            _context.Customers.Remove(customer);
            await _context.SaveChangesAsync();

            return true;
        }

        // 🔥 CRM: Update pipeline
        public async Task<bool> UpdateStatusAsync(int id, string status)
        {
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null) return false;

            customer.Status = status;

            await _context.SaveChangesAsync();
            return true;
        }
    }
}