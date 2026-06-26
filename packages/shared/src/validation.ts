import { ALLOWED_UPLOAD_MIME_TYPES, JOB_PRIORITIES, MAX_JOB_IMAGE_COUNT, MAX_UPLOAD_SIZE_BYTES, SERVICE_CATALOG, SERVICE_TYPES } from "./constants";
import type { CreateJobInput, CreateServiceRequestInput } from "./types";

export type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; errors: Record<string, string> };

export function validateCreateJobInput(input: Partial<CreateJobInput>): ValidationResult<CreateJobInput> {
  const errors: Record<string, string> = {};

  if (!input.service_type || !SERVICE_TYPES.includes(input.service_type)) {
    errors.service_type = "Chon loai dich vu hop le.";
  }

  if (!input.title || input.title.trim().length < 3) {
    errors.title = "Tieu de can it nhat 3 ky tu.";
  }

  if (!input.description || input.description.trim().length < 10) {
    errors.description = "Mo ta can it nhat 10 ky tu.";
  }

  if (!input.address || input.address.trim().length < 5) {
    errors.address = "Nhap dia chi ro rang.";
  }

  const mapsUrl = input.google_maps_url?.trim();
  if (mapsUrl && !isValidGoogleMapsUrl(mapsUrl)) {
    errors.google_maps_url = "Dan link Google Maps hop le.";
  }

  if (!input.phone || !isValidVietnamPhone(input.phone)) {
    errors.phone = "Nhap so dien thoai Viet Nam hop le.";
  }

  if (!input.priority || !JOB_PRIORITIES.includes(input.priority)) {
    errors.priority = "Chon muc uu tien hop le.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      service_type: input.service_type!,
      title: input.title!.trim(),
      description: input.description!.trim(),
      address: input.address!.trim(),
      google_maps_url: mapsUrl || null,
      phone: input.phone!.trim(),
      priority: input.priority!
    }
  };
}

export function validateServiceRequestInput(
  input: Partial<CreateServiceRequestInput>
): ValidationResult<CreateServiceRequestInput> {
  const base = validateCreateJobInput(input);
  const errors: Record<string, string> = base.ok ? {} : { ...base.errors };

  if (!input.service_category_slug || !SERVICE_CATALOG.some((service) => service.slug === input.service_category_slug)) {
    errors.service_category_slug = "Chon nhom dich vu hop le.";
  }

  if (!input.issue_type || input.issue_type.trim().length < 2) {
    errors.issue_type = "Chon loai yeu cau hoac su co.";
  }

  if (input.desired_schedule_at && Number.isNaN(new Date(input.desired_schedule_at).getTime())) {
    errors.desired_schedule_at = "Chon thoi gian mong muon hop le.";
  }

  if (input.customer_submitted_at && Number.isNaN(new Date(input.customer_submitted_at).getTime())) {
    errors.customer_submitted_at = "Thoi gian gui yeu cau khong hop le.";
  }

  const imageErrors = validateUploadFiles(input.image_files ?? []);
  if (imageErrors) {
    errors.image_files = imageErrors;
  }

  if (Object.keys(errors).length > 0 || !base.ok) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      ...base.data,
      service_category_slug: input.service_category_slug!,
      issue_type: input.issue_type!.trim(),
      desired_schedule_at: input.desired_schedule_at || null,
      customer_submitted_at: input.customer_submitted_at || null,
      image_files: input.image_files ?? []
    }
  };
}

export function isValidVietnamPhone(value: string): boolean {
  return /^(?:\+84|84|0)(?:3|5|7|8|9)\d{8}$/.test(value.trim().replace(/\s+/g, ""));
}

export function validateUploadFiles(files: readonly File[]): string | null {
  if (files.length > MAX_JOB_IMAGE_COUNT) {
    return `Toi da ${MAX_JOB_IMAGE_COUNT} anh cho moi yeu cau.`;
  }

  for (const file of files) {
    if (!ALLOWED_UPLOAD_MIME_TYPES.includes(file.type as (typeof ALLOWED_UPLOAD_MIME_TYPES)[number])) {
      return "Chi chap nhan anh jpg, png hoac webp.";
    }

    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      return "Moi anh toi da 10MB.";
    }
  }

  return null;
}

function isValidGoogleMapsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return ["google.com", "www.google.com", "maps.google.com", "goo.gl", "maps.app.goo.gl"].some((host) =>
      url.hostname === host || url.hostname.endsWith(`.${host}`)
    );
  } catch {
    return false;
  }
}
