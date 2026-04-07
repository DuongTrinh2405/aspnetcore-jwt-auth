using Lab1.Models;
using Lab1.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Lab1.DTO;

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
        // ROLE FILTER
        // =========================
        private async Task<IQueryable<Appointment>> ApplyRoleFilter(
            IQueryable<Appointment> query,
            string? userId,
            string? role)
        {
            if (role == "Admin") return query;

            if (string.IsNullOrEmpty(userId))
                return query.Where(a => false);

            var employeeId = await _context.Employees
                .Where(e => e.UserId == userId)
                .Select(e => e.Id)
                .FirstOrDefaultAsync();

            if (employeeId == 0)
                return query.Where(a => false);

            return query.Where(a => a.EmployeeId == employeeId);
        }

        // =========================
        // GET ALL
        // =========================
        public async Task<PagedResult<Appointment>> GetAllAsync(
            string? userId,
            string? role,
            int page,
            int pageSize)
        {
            var dto = new CreateAppointmentDTO
            {
                Page = page,
                PageSize = pageSize
            };

            return await FilterAsync(dto, userId, role);
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

            query = await ApplyRoleFilter(query, userId, role);

            return await query.FirstOrDefaultAsync();
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

            if (appointment.DateTime.ToUniversalTime() < DateTime.UtcNow)
                throw new Exception("Cannot schedule in the past");

            appointment.EmployeeId = employee.Id;
            appointment.CreatedDate = DateTime.UtcNow;

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

            if (employee == null || existing.EmployeeId != employee.Id)
                throw new Exception("Unauthorized");

            if (appointment.DateTime != default)
                existing.DateTime = appointment.DateTime;

            if (appointment.Notes != null)
                existing.Notes = appointment.Notes;

            // ✅ FIX STATUS
            if (Enum.IsDefined(typeof(Enums.AppointmentStatus), appointment.Status))
                existing.Status = appointment.Status;

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
        // FILTER
        // =========================
        public async Task<PagedResult<Appointment>> FilterAsync(
            CreateAppointmentDTO dto,
            string? userId,
            string? role)
        {
            // ✅ FIX TYPE Ở ĐÂY
            IQueryable<Appointment> query = _context.Appointments
                .AsNoTracking()
                .Include(a => a.Customer)
                .Include(a => a.Property)
                .Include(a => a.Employee);

            query = await ApplyRoleFilter(query, userId, role);

            // =========================
            // SEARCH (FIX NULL + LIKE)
            // =========================
            if (!string.IsNullOrWhiteSpace(dto.Keyword))
            {
                var keyword = dto.Keyword;

                query = query.Where(a =>
                    (a.Customer != null && EF.Functions.Like(a.Customer.Name, $"%{keyword}%")) ||
                    (a.Property != null && EF.Functions.Like(a.Property.Title, $"%{keyword}%")) ||
                    (a.Employee != null && EF.Functions.Like(a.Employee.Name, $"%{keyword}%"))
                );
            }

            // FILTER STATUS
            if (dto.FilterStatus.HasValue)
                query = query.Where(a => a.Status == dto.FilterStatus);

            // FILTER DATE
            if (dto.FromDate.HasValue)
                query = query.Where(a => a.DateTime >= dto.FromDate);

            if (dto.ToDate.HasValue)
                query = query.Where(a => a.DateTime <= dto.ToDate);

            // FILTER FK
            if (dto.FilterCustomerId.HasValue)
                query = query.Where(a => a.CustomerId == dto.FilterCustomerId);

            if (dto.FilterPropertyId.HasValue)
                query = query.Where(a => a.PropertyId == dto.FilterPropertyId);

            // SORT
            var sortBy = dto.SortBy?.ToLower() ?? "datetime";
            var sortOrder = dto.SortOrder?.ToLower() ?? "desc";

            query = (sortBy, sortOrder) switch
            {
                ("created", "asc") => query.OrderBy(a => a.CreatedDate),
                ("created", "desc") => query.OrderByDescending(a => a.CreatedDate),
                ("datetime", "asc") => query.OrderBy(a => a.DateTime),
                _ => query.OrderByDescending(a => a.DateTime)
            };

            var total = await query.CountAsync();

            var data = await query
                .Skip((dto.Page - 1) * dto.PageSize)
                .Take(dto.PageSize)
                .ToListAsync();

            return new PagedResult<Appointment>
            {
                Data = data,
                Total = total,
                Page = dto.Page,
                PageSize = dto.PageSize
            };
        }

        // REMOVE SEARCH
        public Task<PagedResult<Appointment>> SearchAsync(
            string keyword,
            string? userId,
            string? role,
            int page,
            int pageSize)
        {
            throw new NotImplementedException("Use FilterAsync instead");
        }
    }
}