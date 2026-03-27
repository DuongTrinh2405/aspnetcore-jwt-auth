using Lab1.Models;
using Lab1.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace Lab1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InteractionsController : ControllerBase
    {
        private readonly InteractionOperations _service;

        public InteractionsController(InteractionOperations service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var data = await _service.GetAllAsync();
            return Ok(data);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var interaction = await _service.GetByIdAsync(id);

            if (interaction is null) return NotFound();

            return Ok(interaction);
        }

        [HttpGet("customer/{customerId}")]
        public async Task<IActionResult> GetByCustomer(int customerId)
        {
            var interactions = await _service.GetByCustomerIdAsync(customerId);
            return Ok(interactions);
        }

        [HttpGet("property/{propertyId}")]
        public async Task<IActionResult> GetByProperty(int propertyId)
        {
            var interactions = await _service.GetByPropertyIdAsync(propertyId);
            return Ok(interactions);
        }

        [HttpPost]
        public async Task<IActionResult> Create(Interaction interaction)
        {
            var result = await _service.CreateAsync(interaction);
            return Ok(result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Interaction interaction)
        {
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
    }
}