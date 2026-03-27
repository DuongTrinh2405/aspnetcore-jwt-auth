using Lab1.DTO;
using Microsoft.AspNetCore.Mvc;
using Lab1.Models;
using Lab1.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace Lab1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
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

            return Ok(new
            {
                success = true,
                data = result.Select(MapToResponseDto)
            });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var employee = await _employeeService.GetByIdAsync(id);

            if (employee is null)
                return NotFound(new { success = false, message = "Employee not found" });

            return Ok(new
            {
                success = true,
                data = MapToResponseDto(employee)
            });
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateEmployeeDto employeeDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                // ✅ Lấy UserId từ JWT (KHÔNG lấy từ client)
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                var employee = new Employee
                {
                    Name = employeeDto.Name,
                    Email = employeeDto.Email,
                    Phone = employeeDto.Phone,
                    Role = employeeDto.Role,
                    Status = employeeDto.Status,
                    UserId = userId
                };

                var created = await _employeeService.CreateAsync(employee);

                return CreatedAtAction(nameof(GetById), new { id = created.Id }, new
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

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateEmployeeDto employeeDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var employee = new Employee
                {
                    Name = employeeDto.Name,
                    Email = employeeDto.Email,
                    Phone = employeeDto.Phone,
                    Role = employeeDto.Role,
                    Status = employeeDto.Status
                    // ❌ KHÔNG update UserId
                };

                var success = await _employeeService.UpdateAsync(id, employee);

                if (!success)
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

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var success = await _employeeService.DeleteAsync(id);

                if (!success)
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

        private static EmployeeResponseDto MapToResponseDto(Employee employee)
        {
            return new EmployeeResponseDto
            {
                Id = employee.Id,
                Name = employee.Name,
                Email = employee.Email,
                Phone = employee.Phone,
                Role = employee.Role.ToString(),     // ✅ enum → string
                Status = employee.Status.ToString(), // ✅ enum → string
                CreatedDate = employee.CreatedDate,
                UserId = employee.UserId
            };
        }
    }
}