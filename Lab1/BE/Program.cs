using Lab1.Models;
using Lab1.Services;
using Lab1.Services.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using System.Security.Claims;

namespace Lab1
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // ===================== SERVICES =====================

            builder.Services.AddControllers();

            builder.Services.AddDbContext<Context>(options =>
                options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))
            );

            // DI
            builder.Services.AddScoped<IEmployeeOperations, EmployeeOperations>();
            builder.Services.AddScoped<ICustomerOperations, CustomerOperations>();
            builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();
            builder.Services.AddScoped<IPropertyOperations, PropertyOperations>();
            builder.Services.AddScoped<IInteractionOperations, InteractionOperations>();
            builder.Services.AddScoped<IAppointmentOperations, AppointmentOperations>();
            builder.Services.AddScoped<IDealOperations, DealOperations>();

            // ===================== CORS (FIX) =====================
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("MyPolicy", policy =>
                    policy.WithOrigins("http://localhost:5173") // 🔥 FE của bạn
                          .AllowAnyHeader()
                          .AllowAnyMethod());
            });

            // ===================== IDENTITY =====================
            builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
            {
                options.Password.RequireDigit = false;
                options.Password.RequireUppercase = false;
                options.Password.RequireNonAlphanumeric = false;
                options.Password.RequireLowercase = false;
                options.Password.RequiredLength = 6;
            })
            .AddEntityFrameworkStores<Context>()
            .AddDefaultTokenProviders();

            builder.Services.AddAuthorization();

            // ===================== JWT =====================
            builder.Services.Configure<JwtOptions>(
                builder.Configuration.GetSection(JwtOptions.SectionName));

            var jwtOptions = builder.Configuration
                .GetSection(JwtOptions.SectionName)
                .Get<JwtOptions>() ?? new JwtOptions();

            jwtOptions.SecretKey =
                Environment.GetEnvironmentVariable("JWT__SecretKey") ?? jwtOptions.SecretKey;

            if (string.IsNullOrWhiteSpace(jwtOptions.SecretKey))
                throw new Exception("JWT SecretKey missing");

            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.RequireHttpsMetadata = false;
                options.SaveToken = true;

                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = false,
                    ValidIssuer = jwtOptions.ValidIssuer,

                    ValidateAudience = false,
                    ValidAudience = jwtOptions.ValidAudience,

                    ValidateLifetime = true,

                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(jwtOptions.SecretKey)),

                    // 🔥 FIX QUAN TRỌNG NHẤT
                    NameClaimType = ClaimTypes.NameIdentifier,
                    RoleClaimType = ClaimTypes.Role
                };
            });

            // ===================== SWAGGER =====================
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen(swagger =>
            {
                swagger.SwaggerDoc("v1", new OpenApiInfo
                {
                    Title = "CRM API",
                    Version = "v1"
                });

                swagger.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    Type = SecuritySchemeType.ApiKey,
                    In = ParameterLocation.Header,
                    Description = "Bearer {token}"
                });

                swagger.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        new string[] {}
                    }
                });
            });

            // ===================== BUILD =====================
            var app = builder.Build();

            // ===================== SEED ADMIN =====================
            using (var scope = app.Services.CreateScope())
            {
                var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
                var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();

                string[] roles = { "Admin", "Employee" };

                foreach (var role in roles)
                {
                    if (!await roleManager.RoleExistsAsync(role))
                    {
                        await roleManager.CreateAsync(new IdentityRole(role));
                    }
                }

                var admin = await userManager.FindByNameAsync("admin");

                if (admin == null)
                {
                    var user = new ApplicationUser
                    {
                        UserName = "admin",
                        Email = "admin@gmail.com"
                    };

                    var result = await userManager.CreateAsync(user, "123456");

                    if (!result.Succeeded)
                    {
                        throw new Exception(string.Join(", ", result.Errors.Select(e => e.Description)));
                    }

                    await userManager.AddToRoleAsync(user, "Admin");
                }
            }

            // ===================== MIDDLEWARE =====================

            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseCors("MyPolicy");

            app.UseStaticFiles();
            app.UseAuthentication();
            app.UseAuthorization();

            app.MapControllers();

            await app.RunAsync();
        }
    }
}