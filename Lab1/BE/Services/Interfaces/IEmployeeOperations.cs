using Lab1.Models;
using Lab1.Enums;

namespace Lab1.Services.Interfaces
{
    public interface IEmployeeOperations
    {
        Task<List<Employee>> GetAllAsync();
        Task<Employee?> GetByIdAsync(int id);
        Task<Employee> CreateAsync(Employee employee);
        Task<bool> UpdateAsync(int id, Employee employee);
        Task<bool> DeleteAsync(int id);

        // ✅ SEARCH có phân quyền
        Task<IEnumerable<Employee>> SearchAsync(
    string? query,
    string? role,
    EmployeeStatus? status,
    DateTime? fromDate,
    DateTime? toDate,
    string? userId,
    string? currentRole
);
    }
}