using Lab1.DTO;
using Lab1.Models;
using Lab1.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Globalization;

namespace Lab1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AppointmentsController : ControllerBase
    {
        private readonly IAppointmentOperations _service;

        public AppointmentsController(IAppointmentOperations service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var data = await _service.GetAllAsync();
            return Ok(data);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var appointment = await _service.GetByIdAsync(id);

            if (appointment is null) return NotFound();

            return Ok(appointment);
        }

        [HttpGet("customer/{customerId}")]
        public async Task<IActionResult> GetByCustomer(int customerId)
        {
            var appointments = await _service.GetByCustomerIdAsync(customerId);
            return Ok(appointments);
        }

        [HttpGet("employee/{employeeId}")]
        public async Task<IActionResult> GetByEmployee(int employeeId)
        {
            var appointments = await _service.GetByEmployeeIdAsync(employeeId);
            return Ok(appointments);
        }

        [HttpGet("property/{propertyId}")]
        public async Task<IActionResult> GetByProperty(int propertyId)
        {
            var appointments = await _service.GetByPropertyIdAsync(propertyId);
            return Ok(appointments);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateAppointmentDTO dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            try
            {
                // Parse DateTime from string
                if (!DateTime.TryParse(dto.DateTimeString, CultureInfo.InvariantCulture, DateTimeStyles.RoundtripKind, out DateTime parsedDateTime))
                {
                    return BadRequest("Invalid dateTime format. Use ISO 8601 UTC format like '2024-12-25T10:00:00Z'");
                }

                var appointment = new Appointment
                {
                    CustomerId = dto.CustomerId,
                    PropertyId = dto.PropertyId,
                    EmployeeId = dto.EmployeeId,
                    DateTime = parsedDateTime,
                    Status = dto.Status,
                    Notes = dto.Notes
                };

                var result = await _service.CreateAsync(appointment);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] CreateAppointmentDTO dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            try
            {
                // Parse DateTime from string
                if (!DateTime.TryParse(dto.DateTimeString, CultureInfo.InvariantCulture, DateTimeStyles.RoundtripKind, out DateTime parsedDateTime))
                {
                    return BadRequest($"Invalid dateTime format: '{dto.DateTimeString}'. Use ISO 8601 UTC format like '2024-12-25T10:00:00Z'");
                }

                // Validate DateTime is reasonable
                if (parsedDateTime < new DateTime(2000, 1, 1) || parsedDateTime > new DateTime(2100, 1, 1))
                {
                    return BadRequest($"DateTime out of range: {parsedDateTime}. Must be between 2000 and 2100");
                }

                // Debug: Check DateTime value
                if (parsedDateTime == DateTime.MinValue)
                {
                    return BadRequest($"Parsed DateTime is MinValue. Input: '{dto.DateTimeString}'");
                }

                var appointment = new Appointment
                {
                    CustomerId = dto.CustomerId,
                    PropertyId = dto.PropertyId,
                    EmployeeId = dto.EmployeeId,
                    DateTime = parsedDateTime,
                    Status = dto.Status,
                    Notes = dto.Notes
                };

                // Debug: Log the DateTime value
                Console.WriteLine($"Update - Parsed DateTime: {parsedDateTime}, Ticks: {parsedDateTime.Ticks}");

                var updated = await _service.UpdateAsync(id, appointment);
                if (!updated) return NotFound();

                return Ok("Updated");
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _service.DeleteAsync(id);
            if (!deleted) return NotFound();

            return Ok("Deleted");
        }
    }
}