using Lab1.DTO;
using Lab1.Models;
using Lab1.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Lab1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AppointmentsController : ControllerBase
    {
        private readonly IAppointmentOperations _service;

        public AppointmentsController(IAppointmentOperations service)
        {
            _service = service;
        }

        private (string? userId, string? role) GetUser()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var role = User.FindFirst(ClaimTypes.Role)?.Value;
            return (userId, role);
        }

        // =========================
        // GET ALL (PAGINATION ONLY)
        // =========================
        [HttpGet]
        public async Task<IActionResult> GetAll(int page = 1, int pageSize = 10)
        {
            var (userId, role) = GetUser();

            var result = await _service.GetAllAsync(userId, role, page, pageSize);

            return Ok(new
            {
                success = true,
                data = result.Data,
                total = result.Total,
                page = result.Page,
                pageSize = result.PageSize
            });
        }

        // =========================
        // GET BY ID
        // =========================
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var (userId, role) = GetUser();

            var appointment = await _service.GetByIdAsync(id, userId, role);

            if (appointment is null)
                return NotFound(new { success = false });

            return Ok(new { success = true, data = appointment });
        }

        // =========================
        // CREATE
        // =========================
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateAppointmentDTO dto)
        {
            if (dto.CustomerId == null || dto.CustomerId <= 0 ||
                dto.PropertyId == null || dto.PropertyId <= 0 ||
                dto.DateTime == null)
            {
                return BadRequest(new { success = false, message = "Missing or invalid fields" });
            }

            var (userId, _) = GetUser();

            var appointment = new Appointment
            {
                CustomerId = dto.CustomerId.Value,
                PropertyId = dto.PropertyId.Value,
                DateTime = dto.DateTime.Value,
                Status = dto.Status ?? Enums.AppointmentStatus.Scheduled,
                Notes = dto.Notes
            };

            var result = await _service.CreateAsync(appointment, userId!);

            return Ok(new { success = true, data = result });
        }

        // =========================
        // UPDATE
        // =========================
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] CreateAppointmentDTO dto)
        {
            var (userId, _) = GetUser();

            var appointment = new Appointment();

            if (dto.CustomerId.HasValue && dto.CustomerId > 0)
                appointment.CustomerId = dto.CustomerId.Value;

            if (dto.PropertyId.HasValue && dto.PropertyId > 0)
                appointment.PropertyId = dto.PropertyId.Value;

            if (dto.DateTime.HasValue)
                appointment.DateTime = dto.DateTime.Value;

            if (dto.Status.HasValue)
                appointment.Status = dto.Status.Value;

            if (dto.Notes != null)
                appointment.Notes = dto.Notes;

            var updated = await _service.UpdateAsync(id, appointment, userId!);

            if (!updated)
                return NotFound(new { success = false });

            return Ok(new { success = true });
        }

        // =========================
        // DELETE
        // =========================
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var (userId, role) = GetUser();

            var deleted = await _service.DeleteAsync(id, userId!, role!);

            if (!deleted)
                return NotFound(new { success = false });

            return Ok(new { success = true });
        }

        // =========================
        // FILTER (🔥 MAIN API - ALL IN ONE)
        // =========================
        [HttpPost("filter")]
        public async Task<IActionResult> Filter([FromBody] CreateAppointmentDTO dto)
        {
            var (userId, role) = GetUser();

            var result = await _service.FilterAsync(dto, userId, role);

            return Ok(new
            {
                success = true,
                data = result.Data,
                total = result.Total,
                page = result.Page,
                pageSize = result.PageSize
            });
        }
    }
}