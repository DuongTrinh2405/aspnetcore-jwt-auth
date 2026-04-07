using Lab1.Models;
using Lab1.DTO;

namespace Lab1.Services.Interfaces
{
    public interface IAppointmentOperations
    {
        // =========================
        // GET ALL (PAGINATION)
        // =========================
        Task<PagedResult<Appointment>> GetAllAsync(
            string? userId,
            string? role,
            int page,
            int pageSize
        );

        // =========================
        // GET BY ID
        // =========================
        Task<Appointment?> GetByIdAsync(
            int id,
            string? userId,
            string? role
        );

        // =========================
        // CREATE
        // =========================
        Task<Appointment> CreateAsync(
            Appointment appointment,
            string userId
        );

        // =========================
        // UPDATE
        // =========================
        Task<bool> UpdateAsync(
            int id,
            Appointment appointment,
            string userId
        );

        // =========================
        // DELETE
        // =========================
        Task<bool> DeleteAsync(
            int id,
            string userId,
            string role
        );

        // =========================
        // SEARCH (PAGINATION)
        // =========================
        Task<PagedResult<Appointment>> SearchAsync(
            string keyword,   // 🔥 đổi tên cho rõ nghĩa
            string? userId,
            string? role,
            int page,
            int pageSize
        );

        // =========================
        // ADVANCED FILTER
        // =========================
        Task<PagedResult<Appointment>> FilterAsync(
            CreateAppointmentDTO dto,
            string? userId,
            string? role
        );
    }
}