using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Lab1.Enums;
using Lab1.Models;

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly Context _context;

    public DashboardController(Context context)
    {
        _context = context;
    }

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetDashboard()
    {
        // ======================
        // USER INFO
        // ======================
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var isAdmin = User.IsInRole("Admin");

        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(new { message = "User không hợp lệ" });
        }

        int employeeId = 0;
        if (!isAdmin)
        {
            employeeId = await _context.Employees
                .Where(e => e.UserId == userId)
                .Select(e => e.Id)
                .FirstOrDefaultAsync();
        }

        // ======================
        // CUSTOMERS
        // ======================
        var customersQuery = _context.Customers.AsQueryable();

        if (!isAdmin)
        {
            customersQuery = customersQuery
                .Where(c => c.EmployeeId == employeeId);
        }

        var customersCount = await customersQuery.CountAsync();

        // ======================
        // DEALS
        // ======================
        var dealsQuery = _context.Deals.AsQueryable();

        if (!isAdmin)
        {
            dealsQuery = dealsQuery
                .Where(d => d.EmployeeId == employeeId);
        }

        var dealsCount = await dealsQuery.CountAsync();
        var totalRevenue = await dealsQuery.SumAsync(d => (decimal?)d.Amount) ?? 0m;
        var totalWonRevenue = await dealsQuery
            .Where(d => d.Status == DealStatus.Won)
            .SumAsync(d => (decimal?)d.Amount) ?? 0m;

        var statusSummary = await dealsQuery
            .GroupBy(d => d.Status)
            .Select(g => new
            {
                status = g.Key.ToString(),
                count = g.Count()
            })
            .ToListAsync();

        var currentMonthStart = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
        var reportStart = currentMonthStart.AddMonths(-5);

        var monthlyDeals = await dealsQuery
            .Where(d => d.CreatedDate >= reportStart)
            .GroupBy(d => new { d.CreatedDate.Year, d.CreatedDate.Month })
            .Select(g => new
            {
                g.Key.Year,
                g.Key.Month,
                dealCount = g.Count(),
                revenue = g.Sum(d => d.Amount),
                wonCount = g.Count(d => d.Status == DealStatus.Won)
            })
            .ToListAsync();

        var monthlyReport = Enumerable.Range(0, 6)
            .Select(offset =>
            {
                var month = reportStart.AddMonths(offset);
                var match = monthlyDeals.FirstOrDefault(m => m.Year == month.Year && m.Month == month.Month);

                return new
                {
                    month = month.ToString("MMM yyyy"),
                    deals = match?.dealCount ?? 0,
                    revenue = match?.revenue ?? 0m,
                    wonDeals = match?.wonCount ?? 0
                };
            })
            .ToList();

        // ======================
        // PROPERTIES (ai cũng thấy)
        // ======================
        var propertiesCount = await _context.Properties.CountAsync();

        // ======================
        // RECENT DEALS
        // ======================
        var recentDealsQuery = _context.Deals
            .Include(d => d.Customer)
            .AsQueryable();

        if (!isAdmin)
        {
            recentDealsQuery = recentDealsQuery
                .Where(d => d.EmployeeId == employeeId);
        }

        var recentDeals = await recentDealsQuery
            .OrderByDescending(d => d.CreatedDate) // ✅ FIX CHÍNH Ở ĐÂY
            .Take(5)
            .Select(d => new
            {
                id = d.Id,
                customerName = d.Customer != null ? d.Customer.Name : "N/A",
                amount = d.Amount,
                status = d.Status.ToString()
            })
            .ToListAsync();

        // ======================
        // RESPONSE
        // ======================
        return Ok(new
        {
            data = new
            {
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