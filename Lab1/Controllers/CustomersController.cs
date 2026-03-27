using Lab1.DTO;
using Lab1.Models;
using Lab1.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var data = await _service.GetAllAsync();
        return Ok(data.Select(MapToResponseDto));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        var customer = await _service.GetByIdAsync(id);

        if (customer is null) return NotFound(); // ✅ FIX

        return Ok(MapToResponseDto(customer));
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateCustomerDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var customer = new Customer
        {
            Name = dto.Name,
            Phone = dto.Phone,
            Email = dto.Email,
            Address = dto.Address,
            Status = dto.Status,
            EmployeeId = dto.EmployeeId,
            LastContactDate = dto.LastContactDate
        };

        var result = await _service.CreateAsync(customer);
        return Ok(MapToResponseDto(result));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateCustomerDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var customer = new Customer
        {
            Name = dto.Name,
            Phone = dto.Phone,
            Email = dto.Email,
            Address = dto.Address,
            Status = dto.Status,
            EmployeeId = dto.EmployeeId,
            LastContactDate = dto.LastContactDate
        };

        var updated = await _service.UpdateAsync(id, customer);
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

    private static CustomerResponseDto MapToResponseDto(Customer customer)
    {
        return new CustomerResponseDto
        {
            Id = customer.Id,
            Name = customer.Name,
            Phone = customer.Phone,
            Email = customer.Email,
            Address = customer.Address,
            Status = customer.Status,
            EmployeeId = customer.EmployeeId,
            CreatedDate = customer.CreatedDate,
            LastContactDate = customer.LastContactDate
        };
    }
}