using Lab1.DTO;
using Lab1.Models;
using Lab1.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var data = await _service.GetAllAsync();
            return Ok(data.Select(MapToResponseDto));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var interaction = await _service.GetByIdAsync(id);

            if (interaction is null) return NotFound();

            return Ok(MapToResponseDto(interaction));
        }

        [HttpGet("customer/{customerId}")]
        public async Task<IActionResult> GetByCustomer(int customerId)
        {
            var interactions = await _service.GetByCustomerIdAsync(customerId);
            return Ok(interactions.Select(MapToResponseDto));
        }

        [HttpGet("property/{propertyId}")]
        public async Task<IActionResult> GetByProperty(int propertyId)
        {
            var interactions = await _service.GetByPropertyIdAsync(propertyId);
            return Ok(interactions.Select(MapToResponseDto));
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateInteractionDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var interaction = new Interaction
            {
                CustomerId = dto.CustomerId,
                PropertyId = dto.PropertyId,
                Type = dto.Type,
                Notes = dto.Notes,
                Date = dto.Date,
                EmployeeId = dto.EmployeeId
            };

            var result = await _service.CreateAsync(interaction);
            return Ok(MapToResponseDto(result));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UpdateInteractionDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var interaction = new Interaction
            {
                CustomerId = dto.CustomerId,
                PropertyId = dto.PropertyId,
                Type = dto.Type,
                Notes = dto.Notes,
                Date = dto.Date,
                EmployeeId = dto.EmployeeId
            };

            var updated = await _service.UpdateAsync(id, interaction);
            if (!updated) return NotFound();

            return Ok("Updated");
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _service.DeleteAsync(id);
            if (!deleted) return NotFound();

            return Ok("Deleted");
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