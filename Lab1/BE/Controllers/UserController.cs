using Lab1.DTO;
using Lab1.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Lab1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> userManager;
        private readonly Context _context;

        public UserController(UserManager<ApplicationUser> userManager, Context context)
        {
            this.userManager = userManager;
            _context = context;
        }

        // ==============================
        // 🔥 ADMIN: GET ALL USERS
        // ==============================
        [HttpGet]
        [Authorize(Roles = "Admin")]
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

        // ==============================
        // 🔥 ADMIN: DELETE USER
        // ==============================
        [HttpDelete("{userName}")]
        [Authorize(Roles = "Admin")]
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

        // ==============================
        // 🔥 ADMIN: UPDATE USER
        // ==============================
        [HttpPut("{userName}")]
        [Authorize(Roles = "Admin")]
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

            return Ok(new
            {
                success = true,
                message = "User updated (admin)"
            });
        }

        // ==============================
        // 👤 USER: GET MY PROFILE
        // ==============================
        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetMe()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (userId == null)
                return Unauthorized();

            var user = await userManager.FindByIdAsync(userId);

            if (user == null)
                return NotFound();

            var roles = await userManager.GetRolesAsync(user);

            return Ok(new
            {
                user.Id,
                userName = user.UserName,
                email = user.Email,
                role = roles.FirstOrDefault()
            });
        }

        // ==============================
        // 👤 USER: UPDATE MY PROFILE
        // ==============================
        [HttpPut("me")]
        [Authorize]
        public async Task<IActionResult> UpdateMe([FromBody] UpdateProfileDTO dto)
        {
            if (dto == null)
                return BadRequest("Payload is null");

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (userId == null)
                return Unauthorized();

            var user = await userManager.FindByIdAsync(userId);

            if (user == null)
                return NotFound();

            user.UserName = dto.UserName;
            user.Email = dto.Email;

            var result = await userManager.UpdateAsync(user);

            if (!result.Succeeded)
                return BadRequest(new { success = false, errors = result.Errors });

            return Ok(new
            {
                success = true,
                message = "Profile updated"
            });
        }
    }
}