using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Lab1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class RoleController : ControllerBase
    {
        private readonly RoleManager<IdentityRole> roleManager;

        public RoleController(RoleManager<IdentityRole> roleManager)
        {
            this.roleManager = roleManager;
        }

        // ==============================
        // DTO
        // ==============================
        public class CreateRoleDto
        {
            public string RoleName { get; set; } = string.Empty;
        }

        public class UpdateRoleDto
        {
            public string RoleName { get; set; } = string.Empty;
            public string NewRoleName { get; set; } = string.Empty;
        }

        // ==============================
        // CREATE ROLE
        // ==============================
        [HttpPost]
        public async Task<IActionResult> CreateRole([FromBody] CreateRoleDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.RoleName))
                return BadRequest(new { success = false, message = "Role name is required" });

            bool roleExist = await roleManager.RoleExistsAsync(dto.RoleName);

            if (roleExist)
                return BadRequest(new { success = false, message = "Role already exists" });

            var result = await roleManager.CreateAsync(new IdentityRole { Name = dto.RoleName });

            if (!result.Succeeded)
                return BadRequest(new { success = false, errors = result.Errors });

            return Ok(new
            {
                success = true,
                message = $"Role {dto.RoleName} created"
            });
        }

        // ==============================
        // GET ALL ROLES
        // ==============================
        [HttpGet]
        public IActionResult GetRoles()
        {
            var roles = roleManager.Roles
                .Select(r => new { r.Id, r.Name })
                .ToList();

            return Ok(new
            {
                success = true,
                data = roles
            });
        }

        // ==============================
        // DELETE ROLE
        // ==============================
        [HttpDelete("{roleName}")]
        public async Task<IActionResult> DeleteRole(string roleName)
        {
            var role = await roleManager.FindByNameAsync(roleName);

            if (role == null)
                return NotFound(new { success = false, message = "Role not found" });

            var result = await roleManager.DeleteAsync(role);

            if (!result.Succeeded)
                return BadRequest(new { success = false, errors = result.Errors });

            return Ok(new
            {
                success = true,
                message = $"Role {roleName} deleted"
            });
        }

        // ==============================
        // UPDATE ROLE (FIX QUAN TRỌNG)
        // ==============================
        [HttpPut]
        public async Task<IActionResult> UpdateRole([FromBody] UpdateRoleDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.NewRoleName))
                return BadRequest(new { success = false, message = "New role name required" });

            var role = await roleManager.FindByNameAsync(dto.RoleName);

            if (role == null)
                return NotFound(new { success = false, message = "Role not found" });

            var exists = await roleManager.RoleExistsAsync(dto.NewRoleName);
            if (exists)
                return BadRequest(new { success = false, message = "Role already exists" });

            role.Name = dto.NewRoleName;

            var result = await roleManager.UpdateAsync(role);

            if (!result.Succeeded)
                return BadRequest(new { success = false, errors = result.Errors });

            return Ok(new
            {
                success = true,
                message = $"Role updated to {dto.NewRoleName}"
            });
        }
    }
}