using Lab1.DTO;
using Lab1.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Lab1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class UserController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> userManager;

        public UserController(UserManager<ApplicationUser> userManager)
        {
            this.userManager = userManager;
        }

        [HttpPost]
        public async Task<IActionResult> CreateUser([FromBody] RegisterUserDTO userDTO)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = new ApplicationUser
            {
                UserName = userDTO.UserName,
                Email = userDTO.Email
            };

            var result = await userManager.CreateAsync(user, userDTO.Password);

            if (!result.Succeeded)
                return BadRequest(new { success = false, errors = result.Errors });

            // ✅ gán role mặc định
            await userManager.AddToRoleAsync(user, "User");

            return Ok(new
            {
                success = true,
                message = "User created"
            });
        }

        [HttpGet]
        public IActionResult GetUsers()
        {
            var users = userManager.Users
                .Select(u => new
                {
                    u.Id,
                    u.UserName,
                    u.Email
                })
                .ToList();

            return Ok(new
            {
                success = true,
                data = users
            });
        }

        [HttpDelete("{userName}")]
        public async Task<IActionResult> DeleteUser(string userName)
        {
            var user = await userManager.FindByNameAsync(userName);

            if (user == null)
                return NotFound(new { success = false, message = "User not found" });

            var result = await userManager.DeleteAsync(user);

            if (!result.Succeeded)
                return BadRequest(new { success = false, errors = result.Errors });

            return Ok(new
            {
                success = true,
                message = "User deleted"
            });
        }

        [HttpPut("{userName}")]
        public async Task<IActionResult> UpdateUser(string userName, [FromBody] RegisterUserDTO userDTO)
        {
            var user = await userManager.FindByNameAsync(userName);

            if (user == null)
                return NotFound(new { success = false, message = "User not found" });

            user.UserName = userDTO.UserName;
            user.Email = userDTO.Email;

            var result = await userManager.UpdateAsync(user);

            if (!result.Succeeded)
                return BadRequest(new { success = false, errors = result.Errors });

            // ✅ đổi password đúng cách
            var token = await userManager.GeneratePasswordResetTokenAsync(user);
            await userManager.ResetPasswordAsync(user, token, userDTO.Password);

            return Ok(new
            {
                success = true,
                message = "User updated"
            });
        }
    }
}