using Lab1.Models;

namespace Lab1.Services.Interfaces
{
    public interface IInteractionOperations
    {
        Task<IEnumerable<Interaction>> GetAllAsync(
            string userId,
            string role,
            int page,
            int pageSize
        );

        Task<Interaction?> GetByIdAsync(
            int id,
            string userId,
            string role
        );

        Task<IEnumerable<Interaction>> GetByCustomerIdAsync(
            int customerId,
            string userId,
            string role,
            int page,
            int pageSize
        );

        Task<IEnumerable<Interaction>> GetByPropertyIdAsync(
            int propertyId,
            string userId,
            string role,
            int page,
            int pageSize
        );

        Task<Interaction> CreateAsync(
            Interaction interaction,
            string userId
        );

        Task<bool> UpdateAsync(
            int id,
            Interaction interaction,
            string userId
        );

        Task<bool> DeleteAsync(
            int id,
            string userId,
            string role
        );
    }
}