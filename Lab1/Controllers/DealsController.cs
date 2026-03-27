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
    public class DealsController : ControllerBase
    {
        private readonly IDealOperations _service;

        public DealsController(IDealOperations service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var deals = await _service.GetAllAsync();
            return Ok(deals.Select(MapToResponseDto));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var deal = await _service.GetByIdAsync(id);
            if (deal is null) return NotFound();
            return Ok(MapToResponseDto(deal));
        }

        [HttpGet("customer/{customerId}")]
        public async Task<IActionResult> GetByCustomer(int customerId)
        {
            var deals = await _service.GetByCustomerIdAsync(customerId);
            return Ok(deals.Select(MapToResponseDto));
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateDealDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var deal = new Deal
            {
                Title = dto.Title,
                Amount = dto.Amount,
                Stage = dto.Stage,
                Status = dto.Status,
                CustomerId = dto.CustomerId,
                PropertyId = dto.PropertyId,
                EmployeeId = dto.EmployeeId,
                ExpectedCloseDate = dto.ExpectedCloseDate,
                ClosedDate = dto.ClosedDate,
                Notes = dto.Notes
            };

            var created = await _service.CreateAsync(deal);
            return CreatedAtAction(nameof(Get), new { id = created.Id }, MapToResponseDto(created));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateDealDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var deal = new Deal
            {
                Title = dto.Title,
                Amount = dto.Amount,
                Stage = dto.Stage,
                Status = dto.Status,
                CustomerId = dto.CustomerId,
                PropertyId = dto.PropertyId,
                EmployeeId = dto.EmployeeId,
                ExpectedCloseDate = dto.ExpectedCloseDate,
                ClosedDate = dto.ClosedDate,
                Notes = dto.Notes
            };

            var updated = await _service.UpdateAsync(id, deal);
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

        private static DealResponseDto MapToResponseDto(Deal deal)
        {
            return new DealResponseDto
            {
                Id = deal.Id,
                Title = deal.Title,
                Amount = deal.Amount,
                Stage = deal.Stage,
                Status = deal.Status,
                CustomerId = deal.CustomerId,
                PropertyId = deal.PropertyId,
                EmployeeId = deal.EmployeeId,
                ExpectedCloseDate = deal.ExpectedCloseDate,
                ClosedDate = deal.ClosedDate,
                Notes = deal.Notes,
                CreatedDate = deal.CreatedDate,
                UpdatedDate = deal.UpdatedDate
            };
        }
    }
}
