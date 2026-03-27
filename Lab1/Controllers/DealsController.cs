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
    public class DealsController : ControllerBase
    {
        private readonly IDealOperations _service;

        public DealsController(IDealOperations service)
        {
            _service = service;
        }

        // ✅ GET ALL
        [HttpGet]
        public async Task<IActionResult> GetAll(int page = 1, int pageSize = 10)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var role = User.FindFirst(ClaimTypes.Role)?.Value;

            // 🔥 FIX
            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(role))
                return Unauthorized(new { success = false });

            var data = await _service.GetAllAsync(userId, role);

            var paged = data
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(MapToResponseDto);

            return Ok(new
            {
                success = true,
                data = paged
            });
        }

        // ✅ GET BY ID
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var role = User.FindFirst(ClaimTypes.Role)?.Value;

            // 🔥 FIX
            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(role))
                return Unauthorized(new { success = false });

            var deal = await _service.GetByIdAsync(id, userId, role);

            if (deal is null)
                return NotFound(new { success = false });

            return Ok(new
            {
                success = true,
                data = MapToResponseDto(deal)
            });
        }

        // ✅ GET BY CUSTOMER
        [HttpGet("customer/{customerId}")]
        public async Task<IActionResult> GetByCustomer(int customerId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var role = User.FindFirst(ClaimTypes.Role)?.Value;

            // 🔥 FIX
            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(role))
                return Unauthorized(new { success = false });

            var data = await _service.GetByCustomerIdAsync(customerId, userId, role);

            return Ok(new
            {
                success = true,
                data = data.Select(MapToResponseDto)
            });
        }

        // ✅ CREATE
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateDealDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            // 🔥 FIX
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { success = false });

            var created = await _service.CreateAsync(dto, userId);

            return Ok(new
            {
                success = true,
                data = MapToResponseDto(created)
            });
        }

        // ✅ UPDATE
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateDealDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var role = User.FindFirst(ClaimTypes.Role)?.Value;

            // 🔥 FIX
            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(role))
                return Unauthorized(new { success = false });

            var updated = await _service.UpdateAsync(id, dto, userId, role);

            if (!updated)
                return NotFound(new { success = false });

            return Ok(new { success = true });
        }

        // ✅ DELETE
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var role = User.FindFirst(ClaimTypes.Role)?.Value;

            // 🔥 FIX
            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(role))
                return Unauthorized(new { success = false });

            var deleted = await _service.DeleteAsync(id, userId, role);

            if (!deleted)
                return NotFound(new { success = false });

            return Ok(new { success = true });
        }

        // ✅ MAPPING
        private static DealResponseDto MapToResponseDto(Deal deal)
        {
            return new DealResponseDto
            {
                Id = deal.Id,
                Title = deal.Title,
                Amount = deal.Amount,
                Stage = deal.Stage.ToString(),
                Status = deal.Status.ToString(),
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