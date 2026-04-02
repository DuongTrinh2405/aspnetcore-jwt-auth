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
        // GET ALL (ĐÃ FIX PAGINATION)
        // =========================
        [HttpGet]
        public async Task<IActionResult> GetAll(int page = 1, int pageSize = 10)
        {
            var (userId, role) = GetUser();

            var data = await _service.GetAllAsync(userId, role, page, pageSize);

            return Ok(new { success = true, data });
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
        // GET BY CUSTOMER
        // =========================
        [HttpGet("customer/{customerId}")]
        public async Task<IActionResult> GetByCustomer(int customerId)
        {
            var (userId, role) = GetUser();

            var data = await _service.GetByCustomerIdAsync(customerId, userId, role);

            return Ok(new { success = true, data });
        }

        // =========================
        // GET BY PROPERTY
        // =========================
        [HttpGet("property/{propertyId}")]
        public async Task<IActionResult> GetByProperty(int propertyId)
        {
            var (userId, role) = GetUser();

            var data = await _service.GetByPropertyIdAsync(propertyId, userId, role);

            return Ok(new { success = true, data });
        }

        // =========================
        // SEARCH (ĐÃ FIX PAGINATION + PERFORMANCE)
        // =========================
        [HttpGet("search")]
        public async Task<IActionResult> Search(string search, int page = 1, int pageSize = 10)
        {
            var (userId, role) = GetUser();

            var data = await _service.SearchAsync(search, userId, role, page, pageSize);

            return Ok(new { success = true, data });
        }

        // =========================
        // CREATE
        // =========================
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateAppointmentDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var (userId, _) = GetUser();

            var appointment = new Appointment
            {
                CustomerId = dto.CustomerId,
                PropertyId = dto.PropertyId,
                DateTime = dto.AppointmentDate,
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
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var (userId, _) = GetUser();

            var appointment = new Appointment
            {
                CustomerId = dto.CustomerId,
                PropertyId = dto.PropertyId,
                DateTime = dto.AppointmentDate,
                Notes = dto.Notes
            };

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
    }
}