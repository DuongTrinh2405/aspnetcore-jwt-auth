using Lab1.Models;
using Microsoft.EntityFrameworkCore;

namespace Lab1.Services
{
    public class AppointmentOperations
    {
        private readonly Context _context;

        public AppointmentOperations(Context context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Appointment>> GetAllAsync()
        {
            return await _context.Appointments
                .Include(a => a.Customer)
                .Include(a => a.Property)
                .Include(a => a.Employee)
                .ToListAsync();
        }

        public async Task<Appointment?> GetByIdAsync(int id)
        {
            return await _context.Appointments
                .Include(a => a.Customer)
                .Include(a => a.Property)
                .Include(a => a.Employee)
                .FirstOrDefaultAsync(a => a.Id == id);
        }

        public async Task<IEnumerable<Appointment>> GetByCustomerIdAsync(int customerId)
        {
            return await _context.Appointments
                .Where(a => a.CustomerId == customerId)
                .Include(a => a.Property)
                .Include(a => a.Employee)
                .ToListAsync();
        }

        public async Task<IEnumerable<Appointment>> GetByEmployeeIdAsync(int employeeId)
        {
            return await _context.Appointments
                .Where(a => a.EmployeeId == employeeId)
                .Include(a => a.Customer)
                .Include(a => a.Property)
                .ToListAsync();
        }

        public async Task<IEnumerable<Appointment>> GetByPropertyIdAsync(int propertyId)
        {
            return await _context.Appointments
                .Where(a => a.PropertyId == propertyId)
                .Include(a => a.Customer)
                .Include(a => a.Employee)
                .ToListAsync();
        }

        public async Task<Appointment> CreateAsync(Appointment appointment)
        {
            appointment.CreatedDate = DateTime.UtcNow;

            // Business rule: Check for scheduling conflicts
            var startTime = appointment.DateTime.AddHours(-1);
            var endTime = appointment.DateTime.AddHours(1);

            var conflict = await _context.Appointments
                .AnyAsync(a =>
                    a.EmployeeId == appointment.EmployeeId &&
                    a.DateTime >= startTime &&
                    a.DateTime <= endTime);

            if (conflict)
            {
                throw new InvalidOperationException("Employee has a scheduling conflict within 1 hour");
            }

            _context.Appointments.Add(appointment);
            await _context.SaveChangesAsync();
            return appointment;
        }

        public async Task<bool> UpdateAsync(int id, Appointment appointment)
        {
            var existing = await _context.Appointments.FindAsync(id);
            if (existing == null) return false;

            // Validate DateTime
            if (appointment.DateTime == DateTime.MinValue || appointment.DateTime == DateTime.MaxValue)
            {
                throw new InvalidOperationException($"Invalid DateTime: {appointment.DateTime}");
            }

            // existing.DateTime = appointment.DateTime; // Skip DateTime update for now
            existing.Status = appointment.Status;
            existing.Notes = appointment.Notes;
            // existing.EmployeeId = appointment.EmployeeId; // Skip for now

            // Debug: Check existing DateTime
            Console.WriteLine($"Existing DateTime: {existing.DateTime}, Ticks: {existing.DateTime.Ticks}");

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment == null) return false;

            _context.Appointments.Remove(appointment);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}