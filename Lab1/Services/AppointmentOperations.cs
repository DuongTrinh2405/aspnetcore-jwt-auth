using Lab1.Models;
using Lab1.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Lab1.Services
{
    public class AppointmentOperations : IAppointmentOperations
    {
        private readonly Context _context;

        public AppointmentOperations(Context context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Appointment>> GetAllAsync(string? userId, string? role)
        {
            if (role == "Admin")
            {
                return await _context.Appointments
                    .AsNoTracking()
                    .Include(a => a.Customer)
                    .Include(a => a.Property)
                    .Include(a => a.Employee)
                    .ToListAsync();
            }

            if (string.IsNullOrEmpty(userId))
                return new List<Appointment>();

            var employee = await _context.Employees
                .FirstOrDefaultAsync(e => e.UserId == userId);

            if (employee == null)
                return new List<Appointment>();

            return await _context.Appointments
                .AsNoTracking()
                .Where(a => a.EmployeeId == employee.Id)
                .Include(a => a.Customer)
                .Include(a => a.Property)
                .Include(a => a.Employee)
                .ToListAsync();
        }

        public async Task<Appointment?> GetByIdAsync(int id, string? userId, string? role)
        {
            var query = _context.Appointments
                .AsNoTracking()
                .Include(a => a.Customer)
                .Include(a => a.Property)
                .Include(a => a.Employee)
                .Where(a => a.Id == id)
                .AsQueryable();

            if (role != "Admin")
            {
                if (string.IsNullOrEmpty(userId))
                    return null;

                var employee = await _context.Employees
                    .FirstOrDefaultAsync(e => e.UserId == userId);

                if (employee == null)
                    return null;

                query = query.Where(a => a.EmployeeId == employee.Id);
            }

            return await query.FirstOrDefaultAsync();
        }

        public async Task<IEnumerable<Appointment>> GetByCustomerIdAsync(int customerId, string? userId, string? role)
        {
            var query = _context.Appointments
                .AsNoTracking()
                .Where(a => a.CustomerId == customerId)
                .Include(a => a.Property)
                .Include(a => a.Employee)
                .AsQueryable();

            if (role != "Admin")
            {
                if (string.IsNullOrEmpty(userId))
                    return new List<Appointment>();

                var employee = await _context.Employees
                    .FirstOrDefaultAsync(e => e.UserId == userId);

                if (employee == null)
                    return new List<Appointment>();

                query = query.Where(a => a.EmployeeId == employee.Id);
            }

            return await query.ToListAsync();
        }

        public async Task<IEnumerable<Appointment>> GetByPropertyIdAsync(int propertyId, string? userId, string? role)
        {
            var query = _context.Appointments
                .AsNoTracking()
                .Where(a => a.PropertyId == propertyId)
                .Include(a => a.Customer)
                .Include(a => a.Employee)
                .AsQueryable();

            if (role != "Admin")
            {
                if (string.IsNullOrEmpty(userId))
                    return new List<Appointment>();

                var employee = await _context.Employees
                    .FirstOrDefaultAsync(e => e.UserId == userId);

                if (employee == null)
                    return new List<Appointment>();

                query = query.Where(a => a.EmployeeId == employee.Id);
            }

            return await query.ToListAsync();
        }

        // 🔥 CREATE (FIX VALIDATION + CONFLICT)
        public async Task<Appointment> CreateAsync(Appointment appointment, string userId)
        {
            var employee = await _context.Employees
                .FirstOrDefaultAsync(e => e.UserId == userId);

            if (employee == null)
                throw new Exception("Employee not found");

            // ❗ Không cho tạo lịch quá khứ
            if (appointment.DateTime < DateTime.UtcNow)
                throw new Exception("Cannot schedule in the past");

            appointment.EmployeeId = employee.Id;
            appointment.CreatedDate = DateTime.UtcNow;

            var conflict = await _context.Appointments
                .AnyAsync(a =>
                    a.EmployeeId == employee.Id &&
                    Math.Abs((a.DateTime - appointment.DateTime).TotalMinutes) < 60);

            if (conflict)
                throw new InvalidOperationException("Scheduling conflict");

            _context.Appointments.Add(appointment);
            await _context.SaveChangesAsync();

            return appointment;
        }

        // 🔥 UPDATE (FIX LOGIC)
        public async Task<bool> UpdateAsync(int id, Appointment appointment, string userId)
        {
            var existing = await _context.Appointments.FindAsync(id);
            if (existing == null) return false;

            var employee = await _context.Employees
                .FirstOrDefaultAsync(e => e.UserId == userId);

            if (employee == null)
                throw new Exception("Employee not found");

            if (existing.EmployeeId != employee.Id)
                throw new Exception("Unauthorized");

            // ❗ Check nếu đổi giờ thì phải check conflict
            if (appointment.DateTime != default && appointment.DateTime != existing.DateTime)
            {
                if (appointment.DateTime < DateTime.UtcNow)
                    throw new Exception("Cannot schedule in the past");

                var conflict = await _context.Appointments
                    .AnyAsync(a =>
                        a.EmployeeId == employee.Id &&
                        a.Id != id &&
                        Math.Abs((a.DateTime - appointment.DateTime).TotalMinutes) < 60);

                if (conflict)
                    throw new InvalidOperationException("Scheduling conflict");

                existing.DateTime = appointment.DateTime;
            }

            existing.Status = appointment.Status;
            existing.Notes = appointment.Notes;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id, string userId, string role)
        {
            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment == null) return false;

            if (role != "Admin")
            {
                var employee = await _context.Employees
                    .FirstOrDefaultAsync(e => e.UserId == userId);

                if (employee == null || appointment.EmployeeId != employee.Id)
                    throw new Exception("Unauthorized");
            }

            _context.Appointments.Remove(appointment);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}