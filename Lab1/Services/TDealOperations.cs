using Lab1.Models;
using Lab1.DTO;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

public class TDealOperations
{
    private readonly Context _context;
    private readonly IHttpContextAccessor _http;

    public TDealOperations(Context context, IHttpContextAccessor http)
    {
        _context = context;
        _http = http;
    }

    // 🔥 CREATE DEAL (AUTO CLOSED - theo đề)
    public async Task<Deal> CreateDealAsync(CreateDealDto dto)
    {
        // 🔥 1. Lấy user hiện tại
        if (_http.HttpContext == null)
            throw new Exception("HttpContext not available");

        var userId = _http.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userId))
            throw new Exception("User not authenticated");

        var employee = await _context.Employees
            .FirstOrDefaultAsync(e => e.UserId == userId);

        if (employee == null)
            throw new Exception("Employee not found");

        // 🔥 2. CUSTOMER CHECK
        var customer = await _context.Customers.FindAsync(dto.CustomerId);

        if (customer == null)
            throw new Exception("Customer not found");

        if (customer.EmployeeId != employee.Id)
            throw new Exception("Forbidden - not your customer");

        if (customer.Status == "Lost")
            throw new Exception("Customer not eligible");

        // 🔥 3. PROPERTY CHECK
        var property = await _context.Properties.FindAsync(dto.PropertyId);

        if (property == null)
            throw new Exception("Property not found");

        if (property.IsSold)
            throw new Exception("Property already sold");

        // 🔥 4. VALIDATE PRICE
        if (dto.Price <= 0)
            throw new Exception("Invalid price");

        // 🔥 5. CREATE DEAL
        var deal = new Deal
        {
            CustomerId = customer.Id,
            PropertyId = property.Id,
            EmployeeId = employee.Id,
            Price = dto.Price,
            Status = "Closed", // 🔥 theo đề
            CreatedAt = DateTime.UtcNow
        };

        _context.Deals.Add(deal);

        // 🔥 6. BUSINESS LOGIC (CORE)
        property.IsSold = true;
        customer.Status = "Deal";

        await _context.SaveChangesAsync();

        return deal;
    }

    // 🔥 GET DEALS (ROLE BASED)
    public async Task<List<Deal>> GetDealsAsync(string role, string userId)
    {
        if (role == "Admin")
        {
            return await _context.Deals
                .Include(d => d.Customer)
                .Include(d => d.Property)
                .Include(d => d.Employee)
                .ToListAsync();
        }

        // Staff
        var employee = await _context.Employees
            .FirstOrDefaultAsync(e => e.UserId == userId);

        if (employee == null)
            throw new Exception("Employee not found");

        return await _context.Deals
            .Where(d => d.EmployeeId == employee.Id)
            .Include(d => d.Customer)
            .Include(d => d.Property)
            .ToListAsync();
    }

    // 🔥 CLOSE DEAL
    public async Task<bool> CloseDealAsync(int id)
    {
        var deal = await _context.Deals.FindAsync(id);
        if (deal == null || deal.Status == "Closed") return false;

        deal.Status = "Closed";
        await _context.SaveChangesAsync();
        return true;
    }

    // 🔥 GET ALL DEALS (for admin or general)
    public async Task<List<Deal>> GetAllAsync()
    {
        return await _context.Deals
            .Include(d => d.Customer)
            .Include(d => d.Property)
            .Include(d => d.Employee)
            .ToListAsync();
    }
}