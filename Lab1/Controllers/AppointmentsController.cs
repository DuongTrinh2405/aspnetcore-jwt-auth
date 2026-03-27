using Lab1.DTO;
using Lab1.Models;
using Lab1.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace Lab1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AppointmentsController : ControllerBase
    {
        private readonly AppointmentOperations _service;

        public AppointmentsController(AppointmentOperations service)
        {
            _service = service;
        }

        // GET: api/appointments
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var data = await _service.GetAllAsync();
            return Ok(data);
        }

        // GET: api/appointments/5
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var appointment = await _service.GetByIdAsync(id);

            if (appointment == null)
                return NotFound(new { message = "Appointment not found" });

            return Ok(appointment);
        }

        // GET: api/appointments/customer/2
        [HttpGet("customer/{customerId}")]
        public async Task<IActionResult> GetByCustomer(int customerId)
        {
            var data = await _service.GetByCustomerIdAsync(customerId);
            return Ok(data);
        }

        // GET: api/appointments/employee/3
        [HttpGet("employee/{employeeId}")]
        public async Task<IActionResult> GetByEmployee(int employeeId)
        {
            var data = await _service.GetByEmployeeIdAsync(employeeId);
            return Ok(data);
        }

        // GET: api/appointments/property/2
        [HttpGet("property/{propertyId}")]
        public async Task<IActionResult> GetByProperty(int propertyId)
        {
            var data = await _service.GetByPropertyIdAsync(propertyId);
            return Ok(data);
        }

        // POST: api/appointments
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateAppointmentDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var appointment = new Appointment
                {
                    CustomerId = dto.CustomerId,
                    PropertyId = dto.PropertyId,
                    EmployeeId = dto.EmployeeId,
                    DateTime = dto.DateTime,
                    Status = string.IsNullOrEmpty(dto.Status) ? "Scheduled" : dto.Status,
                    Notes = dto.Notes,
                    CreatedDate = DateTime.UtcNow   // 🔥 đảm bảo luôn có
                };

                var result = await _service.CreateAsync(appointment);

                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // PUT: api/appointments/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] CreateAppointmentDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var appointment = new Appointment
                {
                    CustomerId = dto.CustomerId,
                    PropertyId = dto.PropertyId,
                    EmployeeId = dto.EmployeeId,
                    DateTime = dto.DateTime,
                    Status = string.IsNullOrEmpty(dto.Status) ? "Scheduled" : dto.Status,
                    Notes = dto.Notes
                };

                var updated = await _service.UpdateAsync(id, appointment);

                if (!updated)
                    return NotFound(new { message = "Appointment not found" });

                return Ok(new { message = "Updated successfully" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // DELETE: api/appointments/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _service.DeleteAsync(id);

            if (!deleted)
                return NotFound(new { message = "Appointment not found" });

            return Ok(new { message = "Deleted successfully" });
        }
    }
}