using Lab1.DTO;
using Lab1.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lab1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class UserController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> userManager;
        private readonly Context _context;

        public UserController(UserManager<ApplicationUser> userManager, Context context)
        {
            this.userManager = userManager;
            _context = context;
        }

      

        // ✅ GET USERS
        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            var users = await userManager.Users
                .Select(u => new
                {
                    u.Id,
                    u.UserName,
                    u.Email
                })
                .ToListAsync();

            return Ok(new
            {
                success = true,
                data = users
            });
        }

        // ✅ DELETE USER
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

        // ✅ UPDATE USER
        [HttpPut("{userName}")]
        public async Task<IActionResult> UpdateUser(string userName, [FromBody] RegisterUserDTO userDTO)
        {
            if (userDTO == null)
                return BadRequest("Payload is null");

            var user = await userManager.FindByNameAsync(userName);

            if (user == null)
                return NotFound(new { success = false, message = "User not found" });

            user.UserName = userDTO.UserName;
            user.Email = userDTO.Email;

            var result = await userManager.UpdateAsync(user);

            if (!result.Succeeded)
                return BadRequest(new { success = false, errors = result.Errors });

            // ✅ reset password đúng + check lỗi
            var token = await userManager.GeneratePasswordResetTokenAsync(user);
            var resetResult = await userManager.ResetPasswordAsync(user, token, userDTO.Password);

            if (!resetResult.Succeeded)
                return BadRequest(new { success = false, errors = resetResult.Errors });

            return Ok(new
            {
                success = true,
                message = "User updated"
            });
        }
    }
}