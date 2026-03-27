using Lab1.DTO;
using Lab1.Models;
using Lab1.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Lab1.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class AccountController : ControllerBase
	{
		private readonly UserManager<ApplicationUser> userManager;
		private readonly IJwtTokenService jwtTokenService;
		private readonly ILogger<AccountController> logger;
		public AccountController(UserManager<ApplicationUser> _userManager, IJwtTokenService jwtTokenService, ILogger<AccountController> logger)
		{
			userManager = _userManager;
			this.jwtTokenService = jwtTokenService;
			this.logger = logger;
		}
		[HttpPost("register")]
		public async Task< IActionResult> Registe(RegisterUserDTO userDTO)
		{
			if(ModelState.IsValid)
			{
				ApplicationUser AppUser = new ApplicationUser()
				{
					UserName = userDTO.UserName,
					Email = userDTO.Email
				};
			 IdentityResult Result=	await userManager.CreateAsync(AppUser,userDTO.Password);
				if (Result.Succeeded)
				{
					//this when you make to add registered user as an admin
					await userManager.AddToRoleAsync(AppUser, "Admin");
					return Ok("Account Created");
				}
				var errors = Result.Errors.Select(e => new { code = e.Code, message = e.Description });
				return BuildErrorResponse(StatusCodes.Status400BadRequest, "REGISTER_FAILED", "Register failed.", errors);
			}

			var modelErrors = ModelState
				.Where(kvp => kvp.Value?.Errors.Count > 0)
				.ToDictionary(
					kvp => kvp.Key,
					kvp => kvp.Value!.Errors.Select(e => e.ErrorMessage).ToArray());

			return BuildErrorResponse(StatusCodes.Status400BadRequest, "VALIDATION_ERROR", "Invalid request payload.", modelErrors);
		}

		[HttpPost("login")]
		public async Task< IActionResult> Login(LoginUserDTO userDTO)
		{
			if(ModelState.IsValid)
			{
				ApplicationUser? UserFromDB= await userManager.FindByNameAsync(userDTO.UserName);
				if (UserFromDB != null)
				{
					bool found= await userManager.CheckPasswordAsync(UserFromDB,userDTO.Password);
					if (found)
					{
						try
						{
							var roles = await userManager.GetRolesAsync(UserFromDB);
							var token = jwtTokenService.GenerateToken(UserFromDB, roles);
							return Ok(new
							{
								token,
								expired = DateTime.UtcNow.AddHours(1)
							});
						}
						catch (InvalidOperationException ex)
						{
							logger.LogError(ex, "JWT configuration is invalid while logging in user {UserName}.", userDTO.UserName);
							return BuildErrorResponse(StatusCodes.Status500InternalServerError, "JWT_CONFIG_MISSING", ex.Message);
						}
						catch (Exception ex)
						{
							logger.LogError(ex, "Unexpected error while generating token for user {UserName}.", userDTO.UserName);
							return BuildErrorResponse(StatusCodes.Status500InternalServerError, "AUTH_INTERNAL_ERROR", "Unable to process login request.");
						}
					}
				}
				return BuildErrorResponse(StatusCodes.Status401Unauthorized, "INVALID_CREDENTIALS", "Invalid username or password.");
			}

			var modelErrors = ModelState
				.Where(kvp => kvp.Value?.Errors.Count > 0)
				.ToDictionary(
					kvp => kvp.Key,
					kvp => kvp.Value!.Errors.Select(e => e.ErrorMessage).ToArray());

			return BuildErrorResponse(StatusCodes.Status400BadRequest, "VALIDATION_ERROR", "Invalid request payload.", modelErrors);
		}

		private IActionResult BuildErrorResponse(int statusCode, string code, string message, object? details = null)
		{
			return StatusCode(statusCode, new
			{
				success = false,
				error = new
				{
					code,
					message,
					details
				}
			});
		}

	}
}
