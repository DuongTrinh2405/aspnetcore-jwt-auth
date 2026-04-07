using Lab1.DTO;
using Lab1.Models;
using Lab1.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;

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

    // 🔥 lấy userId + role
    private (string? userId, string role) GetUser()
    {
        var userId = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
                  ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        var role = User.IsInRole("Admin") ? "Admin" : "Staff";

        return (userId, role);
    }

    // =========================
    // GET ALL (🔥 FIX PAGINATION)
    // =========================
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] CustomerQueryDto query)
    {
        var (userId, role) = GetUser();

        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { success = false, message = "Unauthorized" });

        // ✅ FIX: nhận page + pageSize chuẩn từ service
        var (data, total, page, pageSize) = await _service.GetAllAsync(query, userId, role);

        // ✅ FIX: thêm totalPages
        var totalPages = (int)Math.Ceiling((double)total / pageSize);

        return Ok(new
        {
            success = true,
            data = data.Select(MapToResponseDto),
            total,
            page,
            pageSize,
            totalPages
        });
    }

    // =========================
    // GET BY ID
    // =========================
    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        var (userId, role) = GetUser();

        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { success = false, message = "Unauthorized" });

        var customer = await _service.GetByIdAsync(id, userId, role);

        if (customer is null)
            return NotFound(new { success = false, message = "Customer not found" });

        return Ok(new
        {
            success = true,
            data = MapToResponseDto(customer)
        });
    }

    // =========================
    // CREATE
    // =========================
    [HttpPost]
    public async Task<IActionResult> Create(CreateCustomerDto dto)
    {
        var (userId, role) = GetUser();

        if (role == "Admin")
            return StatusCode(403, new
            {
                success = false,
                message = "Admin cannot create customer"
            });

        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { success = false, message = "Unauthorized" });

        if (!ModelState.IsValid)
            return BadRequest(new { success = false, errors = ModelState });

        var result = await _service.CreateAsync(dto, userId);

        return Ok(new
        {
            success = true,
            data = MapToResponseDto(result)
        });
    }

    // =========================
    // UPDATE
    // =========================
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateCustomerDto dto)
    {
        var (userId, role) = GetUser();

        if (role == "Admin")
            return StatusCode(403, new
            {
                success = false,
                message = "Admin cannot update customer"
            });

        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { success = false, message = "Unauthorized" });

        if (!ModelState.IsValid)
            return BadRequest(new { success = false, errors = ModelState });

        var updated = await _service.UpdateAsync(id, dto, userId, role);

        if (!updated)
            return NotFound(new
            {
                success = false,
                message = "Customer not found or no permission"
            });

        return Ok(new { success = true });
    }

    // =========================
    // DELETE
    // =========================
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var (userId, role) = GetUser();

        if (role == "Admin")
            return StatusCode(403, new
            {
                success = false,
                message = "Admin cannot delete customer"
            });

        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { success = false, message = "Unauthorized" });

        var deleted = await _service.DeleteAsync(id, userId, role);

        if (!deleted)
            return NotFound(new
            {
                success = false,
                message = "Customer not found or no permission"
            });

        return Ok(new { success = true });
    }

    // =========================
    // MAP DTO
    // =========================
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
            EmployeeName = customer.Employee?.Name,
            CreatedDate = customer.CreatedDate,
            LastContactDate = customer.LastContactDate
        };
    }
}