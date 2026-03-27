using Lab1.Models;

namespace Lab1.Services.Interfaces
{
    public interface IAppointmentOperations
    {
        Task<IEnumerable<Appointment>> GetAllAsync(string? userId, string? role);

        Task<Appointment?> GetByIdAsync(int id, string? userId, string? role);

        Task<IEnumerable<Appointment>> GetByCustomerIdAsync(int customerId, string? userId, string? role);

        Task<IEnumerable<Appointment>> GetByPropertyIdAsync(int propertyId, string? userId, string? role);

        Task<Appointment> CreateAsync(Appointment appointment, string userId);

        Task<bool> UpdateAsync(int id, Appointment appointment, string userId);

        Task<bool> DeleteAsync(int id, string userId, string role);
    }
}