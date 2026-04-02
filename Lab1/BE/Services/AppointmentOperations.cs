using Lab1.Models;
using Lab1.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Lab1.Enums;

namespace Lab1.Services
{
    public class AppointmentOperations : IAppointmentOperations
    {
        private readonly Context _context;

        public AppointmentOperations(Context context)
        {
            _context = context;
        }

        // =========================
        // GET ALL (PAGINATION)
        // =========================
        public async Task<IEnumerable<Appointment>> GetAllAsync(
            string? userId,
            string? role,
            int page,
            int pageSize)
        {
            IQueryable<Appointment> query = _context.Appointments
                .AsNoTracking()
                .Include(a => a.Customer)
                .Include(a => a.Property)
                .Include(a => a.Employee);

            if (role != "Admin")
            {
                if (string.IsNullOrEmpty(userId))
                    return new List<Appointment>();

                var employeeId = await _context.Employees
                    .Where(e => e.UserId == userId)
                    .Select(e => e.Id)
                    .FirstOrDefaultAsync();

                if (employeeId == 0)
                    return new List<Appointment>();

                query = query.Where(a => a.EmployeeId == employeeId);
            }

            return await query
                .OrderByDescending(a => a.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        // =========================
        // GET BY ID
        // =========================
        public async Task<Appointment?> GetByIdAsync(int id, string? userId, string? role)
        {
            IQueryable<Appointment> query = _context.Appointments
                .AsNoTracking()
                .Include(a => a.Customer)
                .Include(a => a.Property)
                .Include(a => a.Employee)
                .Where(a => a.Id == id);

            if (role != "Admin")
            {
                if (string.IsNullOrEmpty(userId))
                    return null;

                var employeeId = await _context.Employees
                    .Where(e => e.UserId == userId)
                    .Select(e => e.Id)
                    .FirstOrDefaultAsync();

                if (employeeId == 0)
                    return null;

                query = query.Where(a => a.EmployeeId == employeeId);
            }

            return await query.FirstOrDefaultAsync();
        }

        // =========================
        // GET BY CUSTOMER
        // =========================
        public async Task<IEnumerable<Appointment>> GetByCustomerIdAsync(
            int customerId,
            string? userId,
            string? role)
        {
            IQueryable<Appointment> query = _context.Appointments
                .AsNoTracking()
                .Where(a => a.CustomerId == customerId)
                .Include(a => a.Property)
                .Include(a => a.Employee);

            if (role != "Admin")
            {
                if (string.IsNullOrEmpty(userId))
                    return new List<Appointment>();

                var employeeId = await _context.Employees
                    .Where(e => e.UserId == userId)
                    .Select(e => e.Id)
                    .FirstOrDefaultAsync();

                if (employeeId == 0)
                    return new List<Appointment>();

                query = query.Where(a => a.EmployeeId == employeeId);
            }

            return await query.ToListAsync();
        }

        // =========================
        // GET BY PROPERTY (FIX CHUẨN)
        // =========================
        public async Task<IEnumerable<Appointment>> GetByPropertyIdAsync(
            int propertyId,
            string? userId,
            string? role)
        {
            IQueryable<Appointment> query = _context.Appointments
                .AsNoTracking()
                .Where(a => a.PropertyId == propertyId)
                .Include(a => a.Customer)
                .Include(a => a.Employee);

            if (role != "Admin")
            {
                if (string.IsNullOrEmpty(userId))
                    return new List<Appointment>();

                var employeeId = await _context.Employees
                    .Where(e => e.UserId == userId)
                    .Select(e => e.Id)
                    .FirstOrDefaultAsync();

                if (employeeId == 0)
                    return new List<Appointment>();

                query = query.Where(a => a.EmployeeId == employeeId);
            }

            return await query.ToListAsync();
        }

        // =========================
        // CREATE
        // =========================
        public async Task<Appointment> CreateAsync(Appointment appointment, string userId)
        {
            var employee = await _context.Employees
                .FirstOrDefaultAsync(e => e.UserId == userId);

            if (employee == null)
                throw new Exception("Employee not found");

            if (appointment.DateTime < DateTime.UtcNow)
                throw new Exception("Cannot schedule in the past");

            appointment.EmployeeId = employee.Id;
            appointment.CreatedDate = DateTime.UtcNow;

            var fromTime = appointment.DateTime.AddMinutes(-60);
            var toTime = appointment.DateTime.AddMinutes(60);

            var conflict = await _context.Appointments.AnyAsync(a =>
                a.EmployeeId == employee.Id &&
                a.Status != AppointmentStatus.Cancelled && // 🔥 thêm dòng này
                a.DateTime >= fromTime &&
                a.DateTime <= toTime
            );

            if (conflict)
                throw new InvalidOperationException("Scheduling conflict");

            _context.Appointments.Add(appointment);
            await _context.SaveChangesAsync();

            return appointment;
        }

        // =========================
        // UPDATE
        // =========================
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

            if (appointment.DateTime != default && appointment.DateTime != existing.DateTime)
            {
                if (appointment.DateTime < DateTime.UtcNow)
                    throw new Exception("Cannot schedule in the past");

                var fromTime = appointment.DateTime.AddMinutes(-60);
                var toTime = appointment.DateTime.AddMinutes(60);

                var conflict = await _context.Appointments.AnyAsync(a =>
                    a.EmployeeId == employee.Id &&
                    a.Id != id &&
                    a.DateTime >= fromTime &&
                    a.DateTime <= toTime
                );

                if (conflict)
                    throw new InvalidOperationException("Scheduling conflict");

                existing.DateTime = appointment.DateTime;
            }

            existing.Status = appointment.Status;
            existing.Notes = appointment.Notes;

            await _context.SaveChangesAsync();
            return true;
        }

        // =========================
        // DELETE
        // =========================
        public async Task<bool> DeleteAsync(int id, string userId, string role)
        {
            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment == null) return false;

            if (role != "Admin")
            {
                var employeeId = await _context.Employees
                    .Where(e => e.UserId == userId)
                    .Select(e => e.Id)
                    .FirstOrDefaultAsync();

                if (employeeId == 0 || appointment.EmployeeId != employeeId)
                    throw new Exception("Unauthorized");
            }

            _context.Appointments.Remove(appointment);
            await _context.SaveChangesAsync();
            return true;
        }

        // =========================
        // SEARCH (PAGINATION)
        // =========================
public async Task<IEnumerable<Appointment>> SearchAsync(
    string search,
    string? userId,
    string? role,
    int page,
    int pageSize)
{
    var keyword = search?.Trim() ?? "";
    var likePattern = $"%{keyword}%";

    IQueryable<Appointment> query = _context.Appointments
        .AsNoTracking()
        .Include(a => a.Customer)
        .Include(a => a.Property)
        .Include(a => a.Employee);

    // =========================
    // PHÂN QUYỀN
    // =========================
    if (role != "Admin")
    {
        var employeeId = await _context.Employees
            .Where(e => e.UserId == userId)
            .Select(e => e.Id)
            .FirstOrDefaultAsync();

        if (employeeId == 0)
            return new List<Appointment>();

        query = query.Where(a => a.EmployeeId == employeeId);
    }

    // =========================
    // SEARCH (FIX CHUẨN)
    // =========================
    if (!string.IsNullOrWhiteSpace(keyword))
    {
        // Parse Date
        DateTime parsedDate;
        var isDate = DateTime.TryParse(keyword, out parsedDate);

        // Parse ID (int)
        int parsedInt;
        var isInt = int.TryParse(keyword, out parsedInt);

        // Parse Status (enum)
        AppointmentStatus? status = null;
        if (Enum.TryParse<AppointmentStatus>(keyword, true, out var parsedStatus))
        {
            status = parsedStatus;
        }

        // Parse number (decimal cho price/area)
        decimal parsedDecimal;
        var isDecimal = decimal.TryParse(keyword, out parsedDecimal);

        query = query.Where(a =>
            // Customer
            (a.Customer != null && EF.Functions.Like(a.Customer.Name, likePattern)) ||

            // Property
            (a.Property != null && (
                EF.Functions.Like(a.Property.Title, likePattern) ||
                EF.Functions.Like(a.Property.Address, likePattern)
            )) ||

            // Status (FIX)
            (status != null && a.Status == status) ||

            // Date (FIX chuẩn EF)
            (isDate && a.DateTime >= parsedDate.Date && a.DateTime < parsedDate.Date.AddDays(1)) ||

            // ID (FIX)
            (isInt && a.Id == parsedInt) ||

            // Price / Area (giữ lại nhưng chuẩn hơn)
            (isDecimal && a.Property != null && (
                a.Property.Price == parsedDecimal ||
                a.Property.Area == parsedDecimal
            ))
        );
    }

    // =========================
    // PAGINATION
    // =========================
    return await query
        .OrderByDescending(a => a.Id)
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .ToListAsync();
}
    }
}