using Lab1.Models;

namespace Lab1.Services.Interfaces
{
    public interface IEmployeeOperations
    {
        Task<List<Employee>> GetAllAsync();
        Task<Employee?> GetByIdAsync(int id);
        Task<Employee> CreateAsync(Employee employee);
        Task<bool> UpdateAsync(int id, Employee employee);
        Task<bool> DeleteAsync(int id);
    }
}