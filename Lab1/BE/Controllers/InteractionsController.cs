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
    public class InteractionsController : ControllerBase
    {
        private readonly IInteractionOperations _service;

        public InteractionsController(IInteractionOperations service)
        {
            _service = service;
        }

        // 🔥 helper lấy user info
        private (string userId, string role) GetUserInfo()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "";
            var role = User.FindFirst(ClaimTypes.Role)?.Value ?? "";
            return (userId, role);
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(int page = 1, int pageSize = 10)
        {
            var (userId, role) = GetUserInfo();

            var data = await _service.GetAllAsync(userId, role, page, pageSize);

            return Ok(new
            {
                success = true,
                data = data.Select(MapToResponseDto)
            });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var (userId, role) = GetUserInfo();

            var interaction = await _service.GetByIdAsync(id, userId, role);

            if (interaction is null)
                return NotFound(new { success = false });

            return Ok(new
            {
                success = true,
                data = MapToResponseDto(interaction)
            });
        }

        [HttpGet("customer/{customerId}")]
        public async Task<IActionResult> GetByCustomer(int customerId, int page = 1, int pageSize = 10)
        {
            var (userId, role) = GetUserInfo();

            var data = await _service.GetByCustomerIdAsync(customerId, userId, role, page, pageSize);

            return Ok(new
            {
                success = true,
                data = data.Select(MapToResponseDto)
            });
        }

        [HttpGet("property/{propertyId}")]
        public async Task<IActionResult> GetByProperty(int propertyId, int page = 1, int pageSize = 10)
        {
            var (userId, role) = GetUserInfo();

            var data = await _service.GetByPropertyIdAsync(propertyId, userId, role, page, pageSize);

            return Ok(new
            {
                success = true,
                data = data.Select(MapToResponseDto)
            });
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateInteractionDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var (userId, _) = GetUserInfo();

            var interaction = new Interaction
            {
                CustomerId = dto.CustomerId,
                PropertyId = dto.PropertyId,
                Type = dto.Type,
                Notes = dto.Notes,
                Date = dto.Date
            };

            var result = await _service.CreateAsync(interaction, userId);

            return Ok(new
            {
                success = true,
                data = MapToResponseDto(result)
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UpdateInteractionDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var (userId, _) = GetUserInfo();

            var interaction = new Interaction
            {
                Type = dto.Type,
                Notes = dto.Notes,
                Date = dto.Date
            };

            var updated = await _service.UpdateAsync(id, interaction, userId);

            if (!updated)
                return NotFound(new { success = false });

            return Ok(new { success = true });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var (userId, role) = GetUserInfo();

            var deleted = await _service.DeleteAsync(id, userId, role);

            if (!deleted)
                return NotFound(new { success = false });

            return Ok(new { success = true });
        }

        private static InteractionResponseDto MapToResponseDto(Interaction interaction)
        {
            return new InteractionResponseDto
            {
                Id = interaction.Id,
                CustomerId = interaction.CustomerId,
                PropertyId = interaction.PropertyId,
                Type = interaction.Type,
                Notes = interaction.Notes,
                Date = interaction.Date,
                EmployeeId = interaction.EmployeeId
            };
        }
    }
}