using Lab1.Enums;
using Lab1.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Security.Claims;

namespace Lab1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ReportsController : ControllerBase
    {
        private readonly Context _context;

        public ReportsController(Context context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetReport(int? employeeId = null)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var isAdmin = User.IsInRole("Admin");

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "User không hợp lệ" });
            }

            var currentEmployeeId = 0;
            if (!isAdmin)
            {
                currentEmployeeId = await _context.Employees
                    .Where(e => e.UserId == userId)
                    .Select(e => e.Id)
                    .FirstOrDefaultAsync();

                if (currentEmployeeId == 0)
                {
                    return Unauthorized(new { message = "Employee không hợp lệ" });
                }

                employeeId = currentEmployeeId;
            }

            if (employeeId.HasValue)
            {
                var employeeExists = await _context.Employees
                    .AnyAsync(e => e.Id == employeeId.Value);

                if (!employeeExists)
                {
                    return NotFound(new { message = "Employee not found" });
                }
            }

            var dealQuery = _context.Deals.AsQueryable();
            var customerQuery = _context.Customers.AsQueryable();
            var propertyQuery = _context.Properties.AsQueryable();

            if (employeeId.HasValue)
            {
                dealQuery = dealQuery.Where(d => d.EmployeeId == employeeId.Value);
                customerQuery = customerQuery.Where(c => c.EmployeeId == employeeId.Value);
                propertyQuery = propertyQuery.Where(p => p.EmployeeId == employeeId.Value);
            }

            var customersCount = await customerQuery.CountAsync();
            var dealsCount = await dealQuery.CountAsync();
            var propertiesCount = await propertyQuery.CountAsync();

            var totalRevenue = await dealQuery.SumAsync(d => (decimal?)d.Amount) ?? 0m;
            var totalWonRevenue = await dealQuery
                .Where(d => d.Status == DealStatus.Won)
                .SumAsync(d => (decimal?)d.Amount) ?? 0m;

            var statusSummary = await dealQuery
                .GroupBy(d => d.Status)
                .Select(g => new
                {
                    status = g.Key.ToString(),
                    count = g.Count()
                })
                .ToListAsync();

            var currentMonthStart = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
            var reportStart = currentMonthStart.AddMonths(-5);

            var rawMonthlyReport = await dealQuery
                .Where(d => d.CreatedDate >= reportStart)
                .GroupBy(d => new { d.CreatedDate.Year, d.CreatedDate.Month })
                .Select(g => new
                {
                    g.Key.Year,
                    g.Key.Month,
                    deals = g.Count(),
                    revenue = g.Sum(d => d.Amount),
                    wonDeals = g.Count(d => d.Status == DealStatus.Won)
                })
                .ToListAsync();

            var monthlyReport = Enumerable.Range(0, 6)
                .Select(offset =>
                {
                    var month = reportStart.AddMonths(offset);
                    var row = rawMonthlyReport.FirstOrDefault(
                        x => x.Year == month.Year && x.Month == month.Month);

                    return new
                    {
                        month = month.ToString("MMM yyyy"),
                        deals = row?.deals ?? 0,
                        revenue = row?.revenue ?? 0m,
                        wonDeals = row?.wonDeals ?? 0
                    };
                })
                .ToList();

            var recentDeals = await dealQuery
                .Include(d => d.Customer)
                .OrderByDescending(d => d.CreatedDate)
                .Take(5)
                .Select(d => new
                {
                    id = d.Id,
                    customerName = d.Customer != null ? d.Customer.Name : "N/A",
                    amount = d.Amount,
                    status = d.Status.ToString(),
                    createdDate = d.CreatedDate,
                })
                .ToListAsync();

            var employeeName = "All employees";
            if (employeeId.HasValue)
            {
                var employee = await _context.Employees
                    .Where(e => e.Id == employeeId.Value)
                    .Select(e => new { e.Id, e.Name })
                    .FirstOrDefaultAsync();

                if (employee != null)
                {
                    employeeName = employee.Name;
                }
            }

            return Ok(new
            {
                data = new
                {
                    employeeId = employeeId,
                    employeeName,
                    customers = customersCount,
                    deals = dealsCount,
                    properties = propertiesCount,
                    totalRevenue,
                    totalWonRevenue,
                    statusSummary,
                    monthlyReport,
                    recentDeals
                }
            });
        }
    }
}
