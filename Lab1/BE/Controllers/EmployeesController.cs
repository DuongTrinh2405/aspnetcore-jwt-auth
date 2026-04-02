using Lab1.DTO;
using Microsoft.AspNetCore.Mvc;
using Lab1.Models;
using Lab1.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;
using Lab1.Enums;
using Microsoft.EntityFrameworkCore;

namespace Lab1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class EmployeesController : ControllerBase
    {
        private readonly IEmployeeOperations _employeeService;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly Context _context; // ✅ THÊM

        public EmployeesController(
            IEmployeeOperations employeeService,
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager,
            Context context) // ✅ THÊM
        {
            _employeeService = employeeService;
            _userManager = userManager;
            _roleManager = roleManager;
            _context = context; // ✅ THÊM
        }

        // =========================
        // GET ALL
        // =========================
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _employeeService.GetAllAsync();

            var data = new List<EmployeeResponseDto>();

            foreach (var emp in result)
            {
                data.Add(await MapToResponseDto(emp));
            }

            return Ok(new
            {
                success = true,
                data
            });
        }

        // =========================
        // GET BY ID
        // =========================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var employee = await _employeeService.GetByIdAsync(id);

            if (employee is null)
                return NotFound(new { success = false, message = "Employee not found" });

            return Ok(new
            {
                success = true,
                data = await MapToResponseDto(employee)
            });
        }

        // =========================
        // SEARCH
        // =========================
        [HttpGet("search")]
        public async Task<IActionResult> Search(
            string? query,
            string? role,
            EmployeeStatus? status,
            DateTime? fromDate,
            DateTime? toDate
        )
        {
            var userId = User.FindFirst("sub")?.Value
                      ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var currentRole = User.IsInRole("Admin") ? "Admin" : "Staff";

            var result = await _employeeService.SearchAsync(
                query,
                role,
                status,
                fromDate,
                toDate,
                userId,
                currentRole
            );

            var list = new List<EmployeeResponseDto>();

            foreach (var emp in result)
            {
                list.Add(await MapToResponseDto(emp));
            }

            return Ok(new
            {
                success = true,
                data = list
            });
        }

        // =========================
        // CREATE (FIXED)
        // =========================
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateEmployeeDto dto)
        {
            Console.WriteLine($"[CREATE] ROLE FROM FE: {dto.Role}");

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // 🔥 CHECK EMAIL USER
                var existingUser = await _userManager.FindByEmailAsync(dto.Email);
                if (existingUser != null)
                    return BadRequest(new { success = false, message = "Email already exists" });

                // 🔥 CHECK EMAIL EMPLOYEE
                var existsEmployee = await _context.Employees
                    .AnyAsync(e => e.Email == dto.Email);

                if (existsEmployee)
                    return BadRequest(new { success = false, message = "Employee email already exists" });

                // ======================
                // CREATE USER
                // ======================
                var user = new ApplicationUser
                {
                    UserName = dto.Email,
                    Email = dto.Email
                };

                var createUserResult = await _userManager.CreateAsync(user, dto.Password);

                if (!createUserResult.Succeeded)
                {
                    await transaction.RollbackAsync();
                    return BadRequest(new
                    {
                        success = false,
                        errors = createUserResult.Errors
                    });
                }

                // ======================
                // ROLE
                // ======================
                var roleName = dto.Role == EmployeeRole.Admin ? "Admin" : "Staff";

                if (!await _roleManager.RoleExistsAsync(roleName))
                {
                    await _roleManager.CreateAsync(new IdentityRole(roleName));
                }

                await _userManager.AddToRoleAsync(user, roleName);

                // ======================
                // CREATE EMPLOYEE
                // ======================
                var employee = new Employee
                {
                    Name = dto.Name,
                    Email = dto.Email,
                    Phone = dto.Phone,
                    Role = dto.Role,
                    Status = dto.Status,
                    UserId = user.Id
                };

                var created = await _employeeService.CreateAsync(employee);

                await transaction.CommitAsync();

                return Ok(new
                {
                    success = true,
                    data = await MapToResponseDto(created)
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();

                return BadRequest(new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }

        // =========================
        // UPDATE
        // =========================
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateEmployeeDto dto)
        {
            Console.WriteLine($"[UPDATE] ROLE FROM FE: {dto.Role}");

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var existing = await _employeeService.GetByIdAsync(id);
                if (existing == null)
                    return NotFound(new { success = false, message = "Employee not found" });

                if (string.IsNullOrEmpty(existing.UserId))
                    return BadRequest(new { success = false, message = "UserId is null" });

                var user = await _userManager.FindByIdAsync(existing.UserId);

                if (user != null)
                {
                    user.Email = dto.Email;
                    user.UserName = dto.Email;

                    var updateUserResult = await _userManager.UpdateAsync(user);

                    if (!updateUserResult.Succeeded)
                    {
                        return BadRequest(new
                        {
                            success = false,
                            errors = updateUserResult.Errors
                        });
                    }

                    var token = await _userManager.GeneratePasswordResetTokenAsync(user);

                    var resetPassResult = await _userManager.ResetPasswordAsync(
                        user,
                        token,
                        dto.Password
                    );

                    if (!resetPassResult.Succeeded)
                    {
                        return BadRequest(new
                        {
                            success = false,
                            errors = resetPassResult.Errors
                        });
                    }

                    var currentRoles = await _userManager.GetRolesAsync(user);
                    await _userManager.RemoveFromRolesAsync(user, currentRoles);

                    var newRole = dto.Role == EmployeeRole.Admin ? "Admin" : "Staff";

                    if (!await _roleManager.RoleExistsAsync(newRole))
                    {
                        await _roleManager.CreateAsync(new IdentityRole(newRole));
                    }

                    await _userManager.AddToRoleAsync(user, newRole);
                }

                var employee = new Employee
                {
                    Name = dto.Name,
                    Email = dto.Email,
                    Phone = dto.Phone,
                    Role = dto.Role,
                    Status = dto.Status
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

        // =========================
        // DELETE
        // =========================
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

        // =========================
        // MAP DTO
        // =========================
        private async Task<EmployeeResponseDto> MapToResponseDto(Employee employee)
        {
            if (string.IsNullOrEmpty(employee.UserId))
            {
                return new EmployeeResponseDto
                {
                    Id = employee.Id,
                    Name = employee.Name,
                    Email = employee.Email,
                    Phone = employee.Phone,
                    Role = "Staff",
                    Status = employee.Status.ToString(),
                    CreatedDate = employee.CreatedDate,
                    UserId = ""
                };
            }

            var user = await _userManager.FindByIdAsync(employee.UserId);

            var roles = user != null
                ? await _userManager.GetRolesAsync(user)
                : new List<string>();

            return new EmployeeResponseDto
            {
                Id = employee.Id,
                Name = employee.Name,
                Email = employee.Email,
                Phone = employee.Phone,
                Role = employee.Role == EmployeeRole.Admin ? "Admin" : "Staff",
                Status = employee.Status.ToString(),
                CreatedDate = employee.CreatedDate,
                UserId = employee.UserId
            };
        }
    }
}