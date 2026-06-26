import type { JobPriority, JobStatus, ServiceCatalogItem, ServiceType, UserRole } from "./types";

export const USER_ROLES = [
  "customer",
  "customer_vip",
  "staff",
  "technician",
  "technician_vip",
  "admin"
] as const satisfies readonly UserRole[];

export const CUSTOMER_ROLES = ["customer", "customer_vip"] as const;
export const STAFF_ROLES = ["staff", "admin"] as const;
export const TECHNICIAN_ROLES = ["technician", "technician_vip"] as const;

export const JOB_STATUSES = [
  "pending",
  "accepted",
  "in_progress",
  "completed"
] as const satisfies readonly JobStatus[];

export const SERVICE_TYPES = [
  "camera_install",
  "camera_repair",
  "solar",
  "barrier",
  "time_attendance",
  "wifi_setup",
  "wifi_repair",
  "internet",
  "networking",
  "rack_cable",
  "smart_device",
  "guard_cabin",
  "low_voltage",
  "other"
] as const satisfies readonly ServiceType[];

export const JOB_PRIORITIES = [
  "low",
  "normal",
  "high",
  "urgent"
] as const satisfies readonly JobPriority[];

export const ROLE_HOME_PATH: Record<UserRole, string> = {
  customer: "/customer",
  customer_vip: "/customer",
  staff: "/dashboard/staff",
  technician: "/technician",
  technician_vip: "/technician",
  admin: "/admin"
};

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  camera_install: "Lắp đặt camera",
  camera_repair: "Sửa chữa camera",
  solar: "Điện năng lượng mặt trời",
  barrier: "Barie tự động/bãi xe",
  time_attendance: "Máy chấm công/kiểm soát ra vào",
  wifi_setup: "Cấu hình Wi-Fi",
  wifi_repair: "Sửa Wi-Fi",
  internet: "Sự cố internet",
  networking: "Hệ thống mạng/switch/router",
  rack_cable: "Tủ rack/thang máng cáp",
  smart_device: "Nhà thông minh/robot",
  guard_cabin: "Cabin bảo vệ/hạ tầng phụ trợ",
  low_voltage: "Điện nhẹ",
  other: "Dịch vụ khác"
};

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  pending: "Đang chờ tiếp nhận",
  received: "Đã tiếp nhận",
  scheduled: "Đã đặt lịch",
  on_the_way: "Đang di chuyển",
  inspecting: "Đang khảo sát",
  quoted: "Đã báo giá",
  accepted: "Đã tiếp nhận",
  in_progress: "Đang xử lý",
  completed: "Hoàn thành",
  warranty_followup: "Theo dõi bảo hành",
  cancelled: "Đã hủy"
};

export const JOB_PRIORITY_LABELS: Record<JobPriority, string> = {
  low: "Thấp",
  normal: "Tiêu chuẩn",
  high: "Cao",
  urgent: "Khẩn cấp"
};

export const CNL_CONTACT = {
  brandName: "Trung tâm dịch vụ Châu Ngọc Long",
  companyName: "CÔNG TY TNHH CHÂU NGỌC LONG",
  shortName: "CNL Service",
  hotline: "090 567 87 59",
  secondaryHotline: "0905 678 759",
  email: "sam@chaungoclong.vn",
  website: "https://chaungoclong.vn",
  websiteLabel: "chaungoclong.vn",
  facebook: "https://www.facebook.com/chaungoclongcamera",
  facebookLabel: "facebook.com/chaungoclongcamera",
  logoPath: "/brand/cnl-service-logo.png",
  address: "K113/44/2 Nguyễn Nhàn, phường Hòa Thọ Đông, quận Cẩm Lệ, Tp. Đà Nẵng, Da Nang, Vietnam, 550000"
} as const;

export const SERVICE_CATALOG = [
  {
    slug: "camera-an-ninh",
    title: "Camera an ninh",
    shortTitle: "Camera",
    description: "Lắp mới, sửa mất hình, cấu hình xem từ xa, thay đầu ghi/camera và bảo trì định kỳ.",
    serviceType: "camera_install",
    options: ["Lắp mới", "Sửa lỗi mất hình", "Cấu hình xem từ xa", "Thay đầu ghi/camera", "Bảo trì định kỳ", "Khác"],
    productGroups: ["Camera IP", "Đầu ghi", "Ổ cứng lưu trữ", "Nguồn và phụ kiện"],
    warrantyEligible: true
  },
  {
    slug: "dien-nang-luong-mat-troi",
    title: "Điện năng lượng mặt trời",
    shortTitle: "Solar",
    description: "Khảo sát lắp đặt, bảo trì inverter, vệ sinh tấm pin, kiểm tra sản lượng và xử lý lỗi hệ thống.",
    serviceType: "solar",
    options: ["Khảo sát lắp đặt", "Bảo trì inverter", "Vệ sinh tấm pin", "Kiểm tra sản lượng", "Xử lý lỗi hệ thống", "Khác"],
    productGroups: ["Inverter", "Tấm pin", "Tủ điện", "Giám sát sản lượng"],
    warrantyEligible: true
  },
  {
    slug: "barie-tu-dong-bai-xe",
    title: "Barie tự động/bãi xe",
    shortTitle: "Barie",
    description: "Lắp đặt và sửa barie cho bãi xe, tòa nhà, khu công nghiệp, tích hợp hệ thống giữ xe.",
    serviceType: "barrier",
    options: ["Lắp đặt barie", "Sửa barie không nâng/hạ", "Bảo trì motor", "Tích hợp hệ thống giữ xe", "Kiểm tra cảm biến", "Khác"],
    productGroups: ["Barie tự động", "Motor", "Cảm biến", "Thiết bị giữ xe"],
    warrantyEligible: true
  },
  {
    slug: "may-cham-cong-kiem-soat-ra-vao",
    title: "Máy chấm công/kiểm soát ra vào",
    shortTitle: "Chấm công",
    description: "Lắp đặt máy chấm công, kết nối phần mềm, xử lý lỗi nhận diện và xuất dữ liệu.",
    serviceType: "time_attendance",
    options: ["Lắp đặt máy chấm công", "Kết nối phần mềm", "Lỗi nhận diện vân tay/khuôn mặt", "Xuất dữ liệu chấm công", "Bảo trì thiết bị", "Khác"],
    productGroups: ["Máy chấm công", "Đầu đọc kiểm soát", "Khóa cửa", "Phần mềm chấm công"],
    warrantyEligible: true
  },
  {
    slug: "he-thong-mang-wifi-switch-router",
    title: "Hệ thống mạng/WiFi/switch/router",
    shortTitle: "Mạng/Wi-Fi",
    description: "Thiết kế mạng văn phòng, xử lý mạng yếu, cấu hình switch/router và mạng vòng ring.",
    serviceType: "networking",
    options: ["Thiết kế mạng văn phòng", "Xử lý mạng yếu/chập chờn", "Cấu hình switch/router", "Kéo dây mạng", "Mạng vòng ring cho resort/khu công nghiệp", "Khác"],
    productGroups: ["Switch H3C", "Router", "Access point", "Cáp mạng"],
    warrantyEligible: true
  },
  {
    slug: "tu-rack-thang-mang-cap",
    title: "Tủ rack/thang máng cáp",
    shortTitle: "Rack/Cáp",
    description: "Tư vấn kích thước, đặt sản xuất theo yêu cầu, lắp đặt tủ rack và đi dây trong tủ.",
    serviceType: "rack_cable",
    options: ["Tư vấn kích thước", "Đặt sản xuất theo yêu cầu", "Lắp đặt tủ rack", "Đi dây trong tủ", "Bảo trì hệ thống rack", "Khác"],
    productGroups: ["Tủ rack treo tường", "Tủ rack đứng", "Tủ rack ngoài trời", "Thang máng cáp"],
    warrantyEligible: true
  },
  {
    slug: "nha-thong-minh-thiet-bi-thong-minh-robot",
    title: "Nhà thông minh/thiết bị thông minh/robot",
    shortTitle: "Smart/Robot",
    description: "Lắp đặt thiết bị thông minh, robot/robotics, cấu hình app điều khiển và xử lý lỗi kết nối.",
    serviceType: "smart_device",
    options: ["Lắp đặt thiết bị thông minh", "Robot hút bụi/robotics", "Cấu hình app điều khiển", "Xử lý lỗi kết nối", "Khác"],
    productGroups: ["Thiết bị thông minh", "Robot", "Gateway", "Cảm biến"],
    warrantyEligible: true
  },
  {
    slug: "cabin-bao-ve-ha-tang-phu-tro",
    title: "Cabin bảo vệ/hạ tầng phụ trợ",
    shortTitle: "Cabin",
    description: "Tư vấn mẫu, khảo sát vị trí, lắp đặt và bảo trì cabin/hạ tầng phụ trợ.",
    serviceType: "guard_cabin",
    options: ["Tư vấn mẫu", "Khảo sát vị trí", "Lắp đặt", "Bảo trì", "Khác"],
    productGroups: ["Cabin bảo vệ", "Hạ tầng phụ trợ", "Vật tư lắp đặt"],
    warrantyEligible: true
  },
  {
    slug: "mang-doanh-nghiep-resort-khu-cong-nghiep",
    title: "Hệ thống mạng doanh nghiệp/resort/khu công nghiệp",
    shortTitle: "Mạng DN",
    description: "Khảo sát, thiết kế, triển khai và bảo trì mạng lõi, mạng vòng ring, switch/router cho quy mô lớn.",
    serviceType: "networking",
    options: ["Khảo sát hiện trạng", "Thiết kế mạng vòng ring", "Cấu hình switch/router", "Bảo trì mạng lõi", "Tối ưu hạ tầng resort/khu công nghiệp", "Khác"],
    productGroups: ["Switch lõi", "Router", "Access point outdoor", "Tủ mạng"],
    warrantyEligible: true
  },
  {
    slug: "khac",
    title: "Dịch vụ khác",
    shortTitle: "Khác",
    description: "Tiếp nhận các yêu cầu ngoài danh mục, khảo sát hiện trạng và tư vấn phương án phù hợp.",
    serviceType: "other",
    options: ["Tư vấn yêu cầu khác", "Khảo sát hiện trạng", "Báo lỗi khác", "Khác"],
    productGroups: ["Yêu cầu ngoài danh mục"],
    warrantyEligible: false
  }
] as const satisfies readonly ServiceCatalogItem[];

export const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;
export const MAX_JOB_IMAGE_COUNT = 5;
export const ALLOWED_UPLOAD_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const MIN_JOB_IMAGE_DELETE_AGE_DAYS = 7;
export const JOB_IMAGE_CLEANUP_AGE_OPTIONS = [7, 15, 30, 60] as const;
