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

        // ==============================
        // GET ALL
        // ==============================
        [HttpGet]
        public async Task<IActionResult> GetAll(
            int page = 1,
            int pageSize = 10,
            string? search = null,
            PropertyType? type = null,
            PropertyStatus? status = null,
            decimal? minPrice = null,
            decimal? maxPrice = null,
            string? sortBy = null,
            string? sortOrder = null
        )
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var role = User.FindFirst(ClaimTypes.Role)?.Value;

            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(role))
                return Unauthorized(new { success = false });

            var (data, total) = await _service.GetAllAsync(
                userId,
                role,
                page,
                pageSize,
                search,
                type,
                status,
                minPrice,
                maxPrice,
                sortBy,
                sortOrder
            );

            return Ok(new
            {
                success = true,
                total,
                page,
                pageSize,
                data // 🔥 KHÔNG MAP NỮA
            });
        }

        // ==============================
        // GET BY ID
        // ==============================
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
                data = property // 🔥 DTO luôn
            });
        }

        // ==============================
        // SEARCH
        // ==============================
        [HttpGet("search")]
        public async Task<IActionResult> Search(string query, int page = 1, int pageSize = 10)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var role = User.FindFirst(ClaimTypes.Role)?.Value;

            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(role))
                return Unauthorized(new { success = false });

            var data = await _service.SearchAsync(query, userId, role);

            var total = data.Count();

            var paged = data
                .Skip((page - 1) * pageSize)
                .Take(pageSize);

            return Ok(new
            {
                success = true,
                total,
                page,
                pageSize,
                data = paged // 🔥 KHÔNG MAP
            });
        }

        // ==============================
        // CREATE
        // ==============================
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
                Images = dto.ImageUrls?.Select(url => new PropertyImage
                {
                    ImageUrl = url
                }).ToList() ?? new List<PropertyImage>()
            };

            var result = await _service.CreateAsync(property, userId);

            // 🔥 Return full property data as DTO
            return CreatedAtAction(nameof(Get), new { id = result.Id }, new
            {
                success = true,
                data = new
                {
                    id = result.Id,
                    title = result.Title,
                    description = result.Description,
                    price = result.Price,
                    area = result.Area,
                    address = result.Address,
                    type = result.Type,
                    status = result.Status,
                    imageUrls = result.Images?.Select(i => i.ImageUrl).ToList() ?? new List<string>(),
                    createdDate = result.CreatedDate
                }
            });
        }

        // ==============================
        // UPDATE
        // ==============================
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
                Images = dto.ImageUrls?.Select(url => new PropertyImage
                {
                    ImageUrl = url
                }).ToList() ?? new List<PropertyImage>()
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

        // ==============================
        // DELETE
        // ==============================
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
    }
}