using Lab1.DTO;
using Microsoft.AspNetCore.Mvc;
using Lab1.Models;
using Lab1.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;

namespace Lab1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class EmployeesController : ControllerBase
    {
        private readonly IEmployeeOperations _employeeService;

        public EmployeesController(IEmployeeOperations employeeService)
        {
            _employeeService = employeeService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _employeeService.GetAllAsync();
            return Ok(result.Select(MapToResponseDto));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var employee = await _employeeService.GetByIdAsync(id);

            if (employee is null)
                return NotFound("Employee not found");

            return Ok(MapToResponseDto(employee));
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateEmployeeDto employeeDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var employee = new Employee
            {
                Name = employeeDto.Name,
                Email = employeeDto.Email,
                Phone = employeeDto.Phone,
                Role = employeeDto.Role,
                Status = employeeDto.Status,
                UserId = employeeDto.UserId
            };

            var created = await _employeeService.CreateAsync(employee);

            return CreatedAtAction(nameof(GetById), new { id = created.Id }, MapToResponseDto(created));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateEmployeeDto employeeDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var employee = new Employee
            {
                Name = employeeDto.Name,
                Email = employeeDto.Email,
                Phone = employeeDto.Phone,
                Role = employeeDto.Role,
                Status = employeeDto.Status,
                UserId = employeeDto.UserId
            };

            var success = await _employeeService.UpdateAsync(id, employee);

            if (!success)
                return NotFound("Employee not found");

            return Ok("Updated successfully");
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _employeeService.DeleteAsync(id);

            if (!success)
                return NotFound("Employee not found");

            return Ok("Deleted successfully");
        }

        private static EmployeeResponseDto MapToResponseDto(Employee employee)
        {
            return new EmployeeResponseDto
            {
                Id = employee.Id,
                Name = employee.Name ?? string.Empty,
                Email = employee.Email,
                Phone = employee.Phone,
                Role = employee.Role,
                Status = employee.Status,
                CreatedDate = employee.CreatedDate,
                UserId = employee.UserId
            };
        }
    }
}