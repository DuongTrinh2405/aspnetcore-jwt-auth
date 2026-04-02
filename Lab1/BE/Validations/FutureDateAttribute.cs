using System;
using System.ComponentModel.DataAnnotations;

namespace Lab1.Validations
{
    public class FutureDateAttribute : ValidationAttribute
    {
        // Cho phép cấu hình: có tính cả thời điểm hiện tại hay không
        public bool AllowNow { get; set; } = false;

        protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
        {
            if (value == null)
            {
                return new ValidationResult($"{validationContext.DisplayName} is required.");
            }

            if (value is not DateTime dateValue)
            {
                return new ValidationResult($"{validationContext.DisplayName} must be a valid DateTime.");
            }

            // Dùng giờ local (phù hợp với app của bạn hiện tại)
            var now = DateTime.Now;

            if (AllowNow)
            {
                if (dateValue < now)
                {
                    return new ValidationResult($"{validationContext.DisplayName} must be now or in the future.");
                }
            }
            else
            {
                if (dateValue <= now)
                {
                    return new ValidationResult($"{validationContext.DisplayName} must be in the future.");
                }
            }

            return ValidationResult.Success;
        }
    }
}