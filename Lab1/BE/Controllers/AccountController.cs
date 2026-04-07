using Lab1.DTO;
using Lab1.Models;
using Lab1.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lab1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> userManager;
        private readonly IJwtTokenService jwtTokenService;
        private readonly ILogger<AccountController> logger;

        public AccountController(
            UserManager<ApplicationUser> userManager,
            IJwtTokenService jwtTokenService,
            ILogger<AccountController> logger)
        {
            this.userManager = userManager;
            this.jwtTokenService = jwtTokenService;
            this.logger = logger;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginUserDTO userDTO)
        {
            if (userDTO == null)
                return BadRequest("Payload is null");

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var input = userDTO.UserName?.Trim();
            var password = userDTO.Password?.Trim();

            if (string.IsNullOrWhiteSpace(input) || string.IsNullOrWhiteSpace(password))
            {
                return Unauthorized(new
                {
                    success = false,
                    message = "Invalid username or password"
                });
            }

            try
            {
                var inputLower = input.ToLower();

                var user = await userManager.Users
                    .FirstOrDefaultAsync(u =>
                        (u.UserName != null && u.UserName.ToLower() == inputLower) ||
                        (u.Email != null && u.Email.ToLower() == inputLower)
                    );

                if (user == null)
                {
                    return Unauthorized(new
                    {
                        success = false,
                        message = "Invalid username or password"
                    });
                }

                var valid = await userManager.CheckPasswordAsync(user, password);

                if (!valid)
                {
                    return Unauthorized(new
                    {
                        success = false,
                        message = "Invalid username or password"
                    });
                }

                // ✅ GET ROLE
                var roles = await userManager.GetRolesAsync(user);

                // ✅ GENERATE TOKEN
                var token = jwtTokenService.GenerateToken(user, roles);

                return Ok(new
                {
                    success = true,
                    token,

                    user = new
                    {
                        id = user.Id,
                        userName = user.UserName, // 🔥 FIX QUAN TRỌNG
                        email = user.Email,
                        role = roles.FirstOrDefault()
                    }
                });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Login error");

                return StatusCode(500, new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }
    }
}