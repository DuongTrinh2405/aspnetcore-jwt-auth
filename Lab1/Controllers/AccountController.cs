using Lab1.DTO;
using Lab1.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Lab1.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class AccountController : ControllerBase
	{
		private readonly UserManager<ApplicationUser> userManager;
		private readonly IConfiguration config;
		public AccountController(UserManager<ApplicationUser> _userManager, IConfiguration config)
		{
		userManager = _userManager;
	    this.config = config;
		}
		[HttpPost("register")]
		public async Task<IActionResult> Registe(RegisterUserDTO userDTO)
		{
			if (userDTO == null) return BadRequest("Payload is required.");
			if (!ModelState.IsValid) return BadRequest(ModelState);

			if (await userManager.FindByNameAsync(userDTO.UserName) != null)
			{
				return Conflict("Username already exists.");
			}

			if (await userManager.FindByEmailAsync(userDTO.Email) != null)
			{
				return Conflict("Email already exists.");
			}

			var appUser = new ApplicationUser
			{
				UserName = userDTO.UserName,
				Email = userDTO.Email,
			};

			var result = await userManager.CreateAsync(appUser, userDTO.Password);
			if (!result.Succeeded)
			{
				return BadRequest(result.Errors);
			}

			await userManager.AddToRoleAsync(appUser, "Staff");
			return Ok("Account created successfully.");
		}

		[HttpPost("login")]
		public async Task<IActionResult> Login(LoginUserDTO userDTO)
		{
			if (userDTO == null) return BadRequest("Payload is required.");
			if (!ModelState.IsValid) return BadRequest(ModelState);

			var userFromDB = await userManager.FindByNameAsync(userDTO.UserName);
			if (userFromDB == null) return Unauthorized("Invalid username or password.");

			var isPasswordValid = await userManager.CheckPasswordAsync(userFromDB, userDTO.Password);
			if (!isPasswordValid) return Unauthorized("Invalid username or password.");

			var secretKey = config["JWT:SecretKey"];
			if (string.IsNullOrWhiteSpace(secretKey)) return StatusCode(500, "JWT secret key is not configured.");

			var myclaims = new List<Claim>
			{
				new Claim(ClaimTypes.Name, userFromDB.UserName ?? string.Empty),
				new Claim(ClaimTypes.NameIdentifier, userFromDB.Id),
				new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
			};

			var roles = await userManager.GetRolesAsync(userFromDB);
			foreach (var role in roles)
			{
				myclaims.Add(new Claim(ClaimTypes.Role, role));
			}

			var signKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
			var signingCredentials = new SigningCredentials(signKey, SecurityAlgorithms.HmacSha256);

			var issuer = config["JWT:ValidIssuer"] ?? config["JWT:ValidIss"];
			var audience = config["JWT:ValidAudience"] ?? config["JWT:ValidAud"];
			if (string.IsNullOrWhiteSpace(issuer) || string.IsNullOrWhiteSpace(audience))
			{
				return StatusCode(500, "JWT issuer/audience is not configured.");
			}

			var token = new JwtSecurityToken(
				issuer: issuer,
				audience: audience,
				expires: DateTime.UtcNow.AddHours(1),
				claims: myclaims,
				signingCredentials: signingCredentials);

			return Ok(new
			{
				token = new JwtSecurityTokenHandler().WriteToken(token),
				expired = token.ValidTo
			});
		}
	}
}
