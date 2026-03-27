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

        [HttpPost]
        public async Task<IActionResult> CreateRole([FromBody] string roleName)
        {
            if (string.IsNullOrWhiteSpace(roleName))
                return BadRequest(new { success = false, message = "Role name is required" });

            bool roleExist = await roleManager.RoleExistsAsync(roleName);

            if (roleExist)
                return BadRequest(new { success = false, message = "Role already exists" });

            var result = await roleManager.CreateAsync(new IdentityRole { Name = roleName });

            if (!result.Succeeded)
                return BadRequest(new { success = false, errors = result.Errors });

            return Ok(new
            {
                success = true,
                message = $"Role {roleName} created"
            });
        }

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

        [HttpPut]
        public async Task<IActionResult> UpdateRole(string roleName, string newRoleName)
        {
            if (string.IsNullOrWhiteSpace(newRoleName))
                return BadRequest(new { success = false, message = "New role name required" });

            var role = await roleManager.FindByNameAsync(roleName);

            if (role == null)
                return NotFound(new { success = false, message = "Role not found" });

            var exists = await roleManager.RoleExistsAsync(newRoleName);
            if (exists)
                return BadRequest(new { success = false, message = "Role already exists" });

            role.Name = newRoleName;

            var result = await roleManager.UpdateAsync(role);

            if (!result.Succeeded)
                return BadRequest(new { success = false, errors = result.Errors });

            return Ok(new
            {
                success = true,
                message = $"Role updated to {newRoleName}"
            });
        }
    }
}