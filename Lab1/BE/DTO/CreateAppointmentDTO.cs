using System.ComponentModel.DataAnnotations;
using Lab1.Enums;

namespace Lab1.DTO
{
    // =========================
    // PAGED RESULT
    // =========================
    public class PagedResult<T>
    {
        public IEnumerable<T> Data { get; set; } = new List<T>();
        public int Total { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
    }

    // =========================
    // BASE PAGINATION DTO (REUSE)
    // =========================
    public class PaginationDTO
    {
        private int _page = 1;
        public int Page
        {
            get => _page;
            set => _page = value < 1 ? 1 : value;
        }

        private int _pageSize = 10;
        public int PageSize
        {
            get => _pageSize;
            set => _pageSize = value < 1 ? 10 : (value > 100 ? 100 : value);
        }
    }

    // =========================
    // APPOINTMENT MAIN DTO
    // (ALL-IN-ONE: CREATE + UPDATE + FILTER)
    // =========================
    public class CreateAppointmentDTO : PaginationDTO
    {
        // =========================
        // CREATE / UPDATE
        // =========================

        [Range(1, int.MaxValue, ErrorMessage = "CustomerId must be greater than 0")]
        public int? CustomerId { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "PropertyId must be greater than 0")]
        public int? PropertyId { get; set; }

        public DateTime? DateTime { get; set; }

        public AppointmentStatus? Status { get; set; }

        [StringLength(500, ErrorMessage = "Notes cannot exceed 500 characters")]
        public string? Notes { get; set; }

        // =========================
        // SEARCH
        // =========================

        [StringLength(255, ErrorMessage = "Keyword cannot exceed 255 characters")]
        public string? Keyword { get; set; }

        // =========================
        // FILTER
        // =========================

        public AppointmentStatus? FilterStatus { get; set; }

        // 🔥 NEW: FILTER BY DATE RANGE
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }

        // 🔥 NEW: FILTER BY FK
        public int? FilterCustomerId { get; set; }
        public int? FilterPropertyId { get; set; }

        // =========================
        // SORT
        // =========================

        [RegularExpression("^(datetime|created)?$", ErrorMessage = "SortBy must be 'datetime' or 'created'")]
        public string? SortBy { get; set; } // datetime | created

        [RegularExpression("^(asc|desc)?$", ErrorMessage = "SortOrder must be 'asc' or 'desc'")]
        public string? SortOrder { get; set; } // asc | desc
    }
}