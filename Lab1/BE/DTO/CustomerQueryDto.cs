using Lab1.Enums;

namespace Lab1.DTO
{
    public class CustomerQueryDto
    {
        public string? Keyword { get; set; }

        public CustomerStatus? Status { get; set; }

        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }

        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}