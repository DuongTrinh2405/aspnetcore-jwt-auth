using Lab1.DTO;
using Lab1.Models;
using Lab1.Services.Interfaces;
using Lab1.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Lab1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PropertiesController : ControllerBase
    {
        private readonly IPropertyOperations _service;

        public PropertiesController(IPropertyOperations service)
        {
            _service = service;
        }

        // ✅ GET ALL
        [HttpGet]
        public async Task<IActionResult> GetAll(
            int page = 1,
            int pageSize = 10,
            PropertyType? type = null,
            PropertyStatus? status = null,
            decimal? minPrice = null,
            decimal? maxPrice = null)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var role = User.FindFirst(ClaimTypes.Role)?.Value;

            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(role))
                return Unauthorized(new { success = false, message = "Invalid token" });

            var (data, total) = await _service.GetAllAsync(
                userId,
                role,
                page,
                pageSize,
                type,
                status,
                minPrice,
                maxPrice
            );

            return Ok(new
            {
                success = true,
                total,
                page,
                pageSize,
                data = data.Select(MapToResponseDto)
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

            var property = await _service.GetByIdAsync(id, userId, role);

            if (property is null)
                return NotFound(new { success = false });

            return Ok(new
            {
                success = true,
                data = MapToResponseDto(property)
            });
        }

        // ✅ SEARCH
        [HttpGet("search")]
        public async Task<IActionResult> Search(string query, int page = 1, int pageSize = 10)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var role = User.FindFirst(ClaimTypes.Role)?.Value;

            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(role))
                return Unauthorized(new { success = false, message = "Invalid token" });

            var data = await _service.SearchAsync(query, userId, role);

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

        // ✅ CREATE
        [HttpPost]
        public async Task<IActionResult> Create(CreatePropertyDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { success = false });

            var property = new Property
            {
                Title = dto.Title,
                Description = dto.Description,
                Price = dto.Price,
                Area = dto.Area,
                Address = dto.Address,
                Type = dto.Type,
                Status = dto.Status,
                IsSold = dto.IsSold,

                // ✅ FIX ẢNH
                ImageUrl = dto.ImageUrl
            };

            var result = await _service.CreateAsync(property, userId);

            return CreatedAtAction(nameof(Get), new { id = result.Id }, new
            {
                success = true,
                data = MapToResponseDto(result)
            });
        }

        // ✅ UPDATE
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UpdatePropertyDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { success = false });

            var property = new Property
            {
                Title = dto.Title,
                Description = dto.Description,
                Price = dto.Price,
                Area = dto.Area,
                Address = dto.Address,
                Type = dto.Type,
                Status = dto.Status,
                IsSold = dto.IsSold,

                // ✅ FIX ẢNH
                ImageUrl = dto.ImageUrl
            };

            try
            {
                var updated = await _service.UpdateAsync(id, property, userId);

                if (!updated)
                    return NotFound(new { success = false });

                return Ok(new { success = true });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
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
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
        }

        // ✅ MAP DTO (ĐÃ FIX IMAGE)
        private static PropertyResponseDto MapToResponseDto(Property property)
        {
            return new PropertyResponseDto
            {
                Id = property.Id,
                Title = property.Title,
                Description = property.Description,
                Price = property.Price,
                Area = property.Area,
                Address = property.Address,
                Type = property.Type,
                Status = property.Status,
                IsSold = property.IsSold,
                EmployeeId = property.EmployeeId,
                CustomerId = property.CustomerId,
                CreatedDate = property.CreatedDate,
                UpdatedDate = property.UpdatedDate,

                // ✅ FIX ẢNH
                ImageUrl = property.ImageUrl
            };
        }
    }
}