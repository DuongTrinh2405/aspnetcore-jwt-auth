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
    public class PropertiesController : ControllerBase
    {
        private readonly IPropertyOperations _service;

        public PropertiesController(IPropertyOperations service)
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
            var property = await _service.GetByIdAsync(id);

            if (property is null) return NotFound();

            return Ok(MapToResponseDto(property));
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreatePropertyDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

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
                EmployeeId = dto.EmployeeId,
                CustomerId = dto.CustomerId
            };

            var result = await _service.CreateAsync(property);
            return Ok(MapToResponseDto(result));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UpdatePropertyDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

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
                EmployeeId = dto.EmployeeId,
                CustomerId = dto.CustomerId
            };

            var updated = await _service.UpdateAsync(id, property);
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
                UpdatedDate = property.UpdatedDate
            };
        }
    }
}