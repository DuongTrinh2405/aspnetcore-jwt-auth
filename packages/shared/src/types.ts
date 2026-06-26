export type UserRole =
  | "customer"
  | "customer_vip"
  | "staff"
  | "technician"
  | "technician_vip"
  | "admin";

export type ServiceType =
  | "camera_install"
  | "camera_repair"
  | "solar"
  | "barrier"
  | "time_attendance"
  | "wifi_setup"
  | "wifi_repair"
  | "internet"
  | "networking"
  | "rack_cable"
  | "smart_device"
  | "guard_cabin"
  | "low_voltage"
  | "other";

export type JobPriority = "low" | "normal" | "high" | "urgent";

export type JobStatus =
  | "pending"
  | "received"
  | "scheduled"
  | "on_the_way"
  | "inspecting"
  | "quoted"
  | "accepted"
  | "in_progress"
  | "completed"
  | "warranty_followup"
  | "cancelled";

export type PaymentStatus = "unpaid" | "paid";

export type NotificationType =
  | "job_created"
  | "job_accepted"
  | "job_status_changed"
  | "rating_received"
  | "system";

export type CurrentUserProfile = {
  id: string;
  email: string | null;
  role: UserRole;
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;
  isActive: boolean;
};

export type CustomerDashboardStats = {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
};

export type Job = {
  id: string;
  customer_id: string;
  assigned_technician_id: string | null;
  service_type: ServiceType;
  title: string;
  description: string;
  address: string;
  google_maps_url: string | null;
  tracking_code?: string | null;
  service_category_slug?: string | null;
  issue_type?: string | null;
  desired_schedule_at?: string | null;
  customer_submitted_at?: string | null;
  preliminary_quote?: number | null;
  payment_status?: PaymentStatus | null;
  payment_paid_at?: string | null;
  payment_marked_by?: string | null;
  is_paid?: boolean | null;
  paid_at?: string | null;
  paid_by?: string | null;
  scheduled_at?: string | null;
  accepted_at?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  cancelled_at?: string | null;
  phone: string;
  priority: JobPriority;
  status: JobStatus;
  is_vip: boolean;
  created_at: string;
  updated_at: string;
};

export type JobImage = {
  id: string;
  job_id: string;
  uploaded_by: string;
  storage_bucket: string;
  storage_path: string;
  public_url: string | null;
  file_name: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  original_file_name?: string | null;
  original_size_bytes?: number | null;
  compressed_size_bytes?: number | null;
  width?: number | null;
  height?: number | null;
  expires_at?: string | null;
  deleted_at?: string | null;
  deleted_by?: string | null;
  storage_deleted_at?: string | null;
  storage_deleted?: boolean | null;
  delete_reason?: string | null;
  is_protected?: boolean | null;
  protected_until?: string | null;
  created_at: string;
  updated_at: string;
  signed_url?: string | null;
};

export type ServiceCatalogItem = {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  serviceType: ServiceType;
  options: string[];
  productGroups: string[];
  warrantyEligible: boolean;
};

export type TrackingResult = {
  job: Job;
  statusHistory: JobStatusHistory[];
};

export type JobStatusHistory = {
  id: string;
  job_id: string;
  old_status: JobStatus | null;
  new_status: JobStatus;
  changed_by: string | null;
  note: string | null;
  created_at: string;
};

export type JobPaymentEvent = {
  id: string;
  job_id: string;
  old_payment_status: PaymentStatus | null;
  new_payment_status: PaymentStatus;
  changed_by: string | null;
  note: string | null;
  created_at: string;
};

export type WarrantyRecord = {
  id: string;
  job_id: string;
  customer_id: string;
  service_category_slug: string | null;
  warranty_code: string;
  title: string;
  starts_at: string;
  ends_at: string;
  status: "active" | "expired" | "void";
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateServiceRequestInput = CreateJobInput & {
  service_category_slug: string;
  issue_type: string;
  desired_schedule_at?: string | null;
  customer_submitted_at?: string | null;
  image_files?: File[];
};

export type AppNotification = {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateJobInput = {
  service_type: ServiceType;
  title: string;
  description: string;
  address: string;
  google_maps_url?: string | null;
  phone: string;
  priority: JobPriority;
};
