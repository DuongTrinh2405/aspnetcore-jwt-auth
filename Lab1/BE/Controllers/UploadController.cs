using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.IO;

namespace Lab1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UploadController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;

        public UploadController(IWebHostEnvironment env)
        {
            _env = env;
        }

        [HttpPost]
        public async Task<IActionResult> Upload([FromForm] List<IFormFile> files)
        {
            if (files == null || files.Count == 0)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Không có file nào được upload"
                });
            }

            var urls = new List<string>();

            foreach (var file in files)
            {
                // ❌ Bỏ file rỗng
                if (file.Length == 0)
                    continue;

                // ❌ Giới hạn size (2MB)
                if (file.Length > 2 * 1024 * 1024)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = $"File {file.FileName} quá lớn (max 2MB)"
                    });
                }

                // ✅ Check định dạng + MIME
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
                var allowedTypes = new[] { "image/jpeg", "image/png", "image/webp" };

                var ext = Path.GetExtension(file.FileName).ToLower();

                if (!allowedExtensions.Contains(ext) || !allowedTypes.Contains(file.ContentType))
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = $"File {file.FileName} không đúng định dạng (chỉ jpg, jpeg, png, webp)"
                    });
                }

                // ✅ Tạo tên file random (tránh trùng + bảo mật)
                var fileName = Guid.NewGuid().ToString() + ext;

                // ✅ Tạo folder uploads nếu chưa có
                var folder = Path.Combine(_env.WebRootPath, "uploads");

                if (!Directory.Exists(folder))
                    Directory.CreateDirectory(folder);

                var path = Path.Combine(folder, fileName);

                // ✅ Lưu file
                using (var stream = new FileStream(path, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // ✅ Tạo FULL URL cho FE dùng luôn
                var baseUrl = $"{Request.Scheme}://{Request.Host}";
                var url = $"{baseUrl}/uploads/{fileName}";

                urls.Add(url);
            }

            return Ok(new
            {
                success = true,
                urls
            });
        }
    }
}