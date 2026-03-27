using Lab1.Models;

namespace Lab1.Services.Interfaces
{
    public interface IInteractionOperations
    {
        Task<IEnumerable<Interaction>> GetAllAsync();
        Task<Interaction?> GetByIdAsync(int id);
        Task<IEnumerable<Interaction>> GetByCustomerIdAsync(int customerId);
        Task<IEnumerable<Interaction>> GetByPropertyIdAsync(int propertyId);
        Task<Interaction> CreateAsync(Interaction interaction);
        Task<bool> UpdateAsync(int id, Interaction interaction);
        Task<bool> DeleteAsync(int id);
    }
}
