using Lab1.Models;
using Lab1.Services;
using Lab1.Services.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

namespace Lab1
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // ===================== ADD SERVICES =====================

            builder.Services.AddControllers();

            // DbContext
            builder.Services.AddDbContext<Context>(options =>
            {
                options.UseSqlServer(
                    builder.Configuration.GetConnectionString("DefaultConnection"));
            });

            // Dependency Injection (Service)
            builder.Services.AddScoped<IEmployeeOperations, EmployeeOperations>();
            builder.Services.AddScoped<ICustomerOperations, CustomerOperations>();
            builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();
            builder.Services.AddScoped<IPropertyOperations, PropertyOperations>();
            builder.Services.AddScoped<IInteractionOperations, InteractionOperations>();
            builder.Services.AddScoped<IAppointmentOperations, AppointmentOperations>();
            builder.Services.AddScoped<IDealOperations, DealOperations>();


            // CORS
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("MyPolicy", policy =>
                {
                    policy.AllowAnyHeader()
                          .AllowAnyMethod()
                          .AllowAnyOrigin();
                });
            });

            // Identity
            builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
            {
                options.Password.RequireDigit = false;
                options.Password.RequireUppercase = false;
                options.Password.RequireNonAlphanumeric = false;
                options.Password.RequiredLength = 6;
            })
            .AddEntityFrameworkStores<Context>()
            .AddDefaultTokenProviders();

            // Authorization Policy
            builder.Services.AddAuthorization(options =>
            {
                options.AddPolicy("RequireAdminRole",
                    policy => policy.RequireRole("Admin"));
            });

            // JWT Authentication
            builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection(JwtOptions.SectionName));

            var jwtOptions = builder.Configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>() ?? new JwtOptions();
            jwtOptions.SecretKey = Environment.GetEnvironmentVariable("JWT__SecretKey") ?? jwtOptions.SecretKey;

            if (string.IsNullOrWhiteSpace(jwtOptions.SecretKey))
                throw new InvalidOperationException("JWT:SecretKey is not configured. Set it in environment variable JWT__SecretKey.");
            if (string.IsNullOrWhiteSpace(jwtOptions.ValidIssuer))
                throw new InvalidOperationException("JWT:ValidIssuer is not configured.");
            if (string.IsNullOrWhiteSpace(jwtOptions.ValidAudience))
                throw new InvalidOperationException("JWT:ValidAudience is not configured.");

            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.SaveToken = true;
                options.RequireHttpsMetadata = false;

                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = jwtOptions.ValidIssuer,

                    ValidateAudience = true,
                    ValidAudience = jwtOptions.ValidAudience,

                    ValidateLifetime = true,

                    ValidateIssuerSigningKey = true,

                    IssuerSigningKey = new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(
                            jwtOptions.SecretKey))
                };
            });

            // Swagger + JWT
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen(swagger =>
            {
                swagger.SwaggerDoc("v1", new OpenApiInfo
                {
                    Version = "v1",
                    Title = "CRM API",
                    Description = "ASP.NET Core CRM System"
                });

                swagger.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    Type = SecuritySchemeType.ApiKey,
                    Scheme = "Bearer",
                    BearerFormat = "JWT",
                    In = ParameterLocation.Header,
                    Description = "Enter: Bearer {your token}"
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

            // ===================== BUILD APP =====================

            var app = builder.Build();

            // ===================== MIDDLEWARE =====================

            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseStaticFiles();

            app.UseCors("MyPolicy");

            app.UseAuthentication();
            app.UseAuthorization();

            app.MapControllers();

            app.Run();
        }
    }
}