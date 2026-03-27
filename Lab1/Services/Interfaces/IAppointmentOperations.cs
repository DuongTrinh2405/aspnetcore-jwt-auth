using Lab1.Models;

namespace Lab1.Services.Interfaces
{
    public interface IAppointmentOperations
    {
        Task<IEnumerable<Appointment>> GetAllAsync();
        Task<Appointment?> GetByIdAsync(int id);
        Task<IEnumerable<Appointment>> GetByCustomerIdAsync(int customerId);
        Task<IEnumerable<Appointment>> GetByEmployeeIdAsync(int employeeId);
        Task<IEnumerable<Appointment>> GetByPropertyIdAsync(int propertyId);
        Task<Appointment> CreateAsync(Appointment appointment);
        Task<bool> UpdateAsync(int id, Appointment appointment);
        Task<bool> DeleteAsync(int id);
    }
}
