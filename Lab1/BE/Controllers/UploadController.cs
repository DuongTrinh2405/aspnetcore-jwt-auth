using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.IO;

namespace Lab1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin,Employee")] // 🔐 CHỈ NHÂN VIÊN / ADMIN
    public class UploadController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;

        public UploadController(IWebHostEnvironment env)
        {
            _env = env;
        }

        [HttpPost]
        public async Task<IActionResult> Upload(IFormFile file)
        {
            // ❌ Check null
            if (file == null || file.Length == 0)
                return BadRequest(new { success = false, message = "File không hợp lệ" });

            // ❌ Giới hạn size (2MB)
            if (file.Length > 2 * 1024 * 1024)
                return BadRequest(new { success = false, message = "File quá lớn (max 2MB)" });

            // ❌ Check định dạng
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png" };
            var ext = Path.GetExtension(file.FileName).ToLower();

            if (!allowedExtensions.Contains(ext))
                return BadRequest(new { success = false, message = "Chỉ cho phép jpg, jpeg, png" });

            // ✅ Tạo tên file an toàn
            var fileName = Guid.NewGuid() + ext;

            // ✅ Đường dẫn chuẩn
            var folder = Path.Combine(_env.WebRootPath, "uploads");

            if (!Directory.Exists(folder))
                Directory.CreateDirectory(folder);

            var path = Path.Combine(folder, fileName);

            // ✅ Lưu file
            using (var stream = new FileStream(path, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // ✅ Trả URL đầy đủ
            var url = $"{Request.Scheme}://{Request.Host}/uploads/{fileName}";

            return Ok(new
            {
                success = true,
                url
            });
        }
    }
}