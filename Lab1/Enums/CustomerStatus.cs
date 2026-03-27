namespace Lab1.Enums
{
    public enum CustomerStatus
    {
        New = 0,           // Khách mới
        Contacted = 1,     // Đã liên hệ
        Interested = 2,    // Có quan tâm
        Negotiating = 3,   // Đang thương lượng
        Converted = 4,     // Đã chuyển đổi (thành deal / mua hàng)
        Lost = 5           // Mất khách
    }
}