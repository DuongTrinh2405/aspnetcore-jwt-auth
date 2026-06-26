import type { Job } from "./types";

export function getGoogleMapsSearchUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

export function getGoogleMapsEmbedUrl(address: string): string {
  return `https://www.google.com/maps?q=${encodeURIComponent(address)}&t=k&output=embed`;
}

export function getJobMapUrl(job: Pick<Job, "address" | "google_maps_url">): string {
  return job.google_maps_url || getGoogleMapsSearchUrl(job.address);
}

export function getGoogleMapsDirectionsUrl(job: Pick<Job, "address" | "google_maps_url">): string {
  return job.google_maps_url || `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(job.address)}`;
}
