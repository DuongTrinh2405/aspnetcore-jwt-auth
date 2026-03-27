using Lab1.DTO;
using Lab1.Models;
using Lab1.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class CustomersController : ControllerBase
{
    private readonly ICustomerOperations _service;

    public CustomersController(ICustomerOperations service)
    {
        _service = service;
    }

    private (string? userId, string? role) GetUser()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var role = User.FindFirst(ClaimTypes.Role)?.Value;
        return (userId, role);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(int page = 1, int pageSize = 10)
    {
        var (userId, role) = GetUser();

        var data = await _service.GetAllAsync(userId!, role!);

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

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        var (userId, role) = GetUser();

        var customer = await _service.GetByIdAsync(id, userId!, role!);

        if (customer is null)
            return NotFound(new { success = false });

        return Ok(new
        {
            success = true,
            data = MapToResponseDto(customer)
        });
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateCustomerDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var (userId, _) = GetUser();

        // 🔥 FIX: gọi đúng service
        var result = await _service.CreateAsync(dto, userId!);

        return Ok(new
        {
            success = true,
            data = MapToResponseDto(result)
        });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateCustomerDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var (userId, role) = GetUser();

        // 🔥 FIX: gọi đúng service
        var updated = await _service.UpdateAsync(id, dto, userId!, role!);

        if (!updated)
            return NotFound(new { success = false });

        return Ok(new { success = true });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var (userId, role) = GetUser();

        var deleted = await _service.DeleteAsync(id, userId!, role!);

        if (!deleted)
            return NotFound(new { success = false });

        return Ok(new { success = true });
    }

    private static CustomerResponseDto MapToResponseDto(Customer customer)
    {
        return new CustomerResponseDto
        {
            Id = customer.Id,
            Name = customer.Name,
            Phone = customer.Phone,
            Email = customer.Email,
            Address = customer.Address,
            Status = customer.Status, // enum OK
            EmployeeId = customer.EmployeeId,
            CreatedDate = customer.CreatedDate,
            LastContactDate = customer.LastContactDate
        };
    }
}