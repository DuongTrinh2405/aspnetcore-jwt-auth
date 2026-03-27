using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Lab1.Models;

namespace Lab1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class DashboardController : ControllerBase
    {
        private readonly Context _context;

        public DashboardController(Context context)
        {
            _context = context;
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var totalCustomers = await _context.Customers.CountAsync();
            var totalEmployees = await _context.Employees.CountAsync();
            var totalProperties = await _context.Properties.CountAsync();
            var totalDeals = await _context.Deals.CountAsync();
            var closedDeals = await _context.Deals.CountAsync(d => d.Status == "Closed");

            return Ok(new
            {
                TotalCustomers = totalCustomers,
                TotalEmployees = totalEmployees,
                TotalProperties = totalProperties,
                TotalDeals = totalDeals,
                ClosedDeals = closedDeals
            });
        }

        [HttpGet("recent-deals")]
        public async Task<IActionResult> GetRecentDeals(int count = 5)
        {
            var deals = await _context.Deals
                .Include(d => d.Customer)
                .Include(d => d.Property)
                .Include(d => d.Employee)
                .OrderByDescending(d => d.CreatedAt)
                .Take(count)
                .ToListAsync();

            return Ok(deals);
        }
    }
}