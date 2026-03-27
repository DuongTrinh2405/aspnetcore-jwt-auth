using Microsoft.AspNetCore.Mvc;
using Lab1.Models;
using Lab1.DTO;
using Microsoft.AspNetCore.Authorization;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class DealsController : ControllerBase
{
    private readonly TDealOperations _service;

    public DealsController(TDealOperations service)
    {
        _service = service;
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateDealDto dto)
    {
        var result = await _service.CreateDealAsync(dto);
        return Ok(result);
    }

    [HttpPost("{id}/close")]
    public async Task<IActionResult> Close(int id)
    {
        var success = await _service.CloseDealAsync(id);
        if (!success) return NotFound();

        return Ok("Deal closed successfully");
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        return Ok(await _service.GetAllAsync());
    }
}