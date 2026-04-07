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

        // ✅ GET ALL (GIỮ NGUYÊN - vẫn paging FE)
        [HttpGet]
        public async Task<IActionResult> GetAll(int page = 1, int pageSize = 10)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var role = User.FindFirst(ClaimTypes.Role)?.Value;

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

        // 🔥 SEARCH (FIX PAGINATION ĐÚNG)
        [HttpGet("search")]
        public async Task<IActionResult> Search(
            string? query,
            string? stage,
            string? status,
            int? employeeId,
            decimal? minAmount,
            decimal? maxAmount,
            string? sortBy,
            string? sortOrder,
            int page = 1,
            int pageSize = 10)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var role = User.FindFirst(ClaimTypes.Role)?.Value;

            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(role))
                return Unauthorized(new { success = false });

            var data = await _service.SearchAsync(
                query, stage, status, employeeId,
                minAmount, maxAmount, sortBy, sortOrder,
                page, pageSize, // ✅ truyền xuống service
                userId, role
            );

            // ❌ XOÁ paging ở controller
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
            var role = User.FindFirst(ClaimTypes.Role)?.Value;

            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(role))
                return Unauthorized(new { success = false });

            try
            {
                var created = await _service.CreateAsync(dto, userId, role);

                return Ok(new
                {
                    success = true,
                    data = MapToResponseDto(created)
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }

        // ✅ UPDATE
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateDealDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var role = User.FindFirst(ClaimTypes.Role)?.Value;

            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(role))
                return Unauthorized(new { success = false });

            try
            {
                var updated = await _service.UpdateAsync(id, dto, userId, role);

                if (!updated)
                    return NotFound(new { success = false });

                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }

        // ✅ DELETE
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var role = User.FindFirst(ClaimTypes.Role)?.Value;

            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(role))
                return Unauthorized(new { success = false });

            try
            {
                var deleted = await _service.DeleteAsync(id, userId, role);

                if (!deleted)
                    return NotFound(new { success = false });

                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }

        // ✅ MAPPING
        private static DealResponseDto MapToResponseDto(Deal deal)
        {
            return new DealResponseDto
            {
                Id = deal.Id,
                Title = deal.Title,
                Amount = deal.Amount,
                Stage = (int)deal.Stage,
                Status = (int)deal.Status,
                CustomerId = deal.CustomerId,
                CustomerName = deal.Customer?.Name,
                PropertyId = deal.PropertyId,
                PropertyTitle = deal.Property?.Title,
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