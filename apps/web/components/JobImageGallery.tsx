"use client";

import type { JobImage } from "@cnl/shared";
import { ChevronLeft, ChevronRight, ImageIcon, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";

function RemovedImageNotice({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-slate-50 p-3 text-center text-slate-400">
      <ImageIcon className={compact ? "h-5 w-5" : "h-10 w-10"} />
      {!compact ? <p className="mt-3 max-w-sm text-sm font-semibold text-slate-500">Ảnh đã được quản trị viên xóa để tiết kiệm dung lượng lưu trữ.</p> : null}
    </div>
  );
}

type JobImageGalleryProps = {
  images: JobImage[];
  maxVisible?: number;
  onResolveImages?: (images: JobImage[]) => Promise<JobImage[]>;
};

function isRemoved(image: JobImage): boolean {
  return Boolean(image.storage_deleted || image.storage_deleted_at || image.deleted_at);
}

export function JobImageGallery({ images, maxVisible = 4, onResolveImages }: JobImageGalleryProps) {
  const [resolvedImages, setResolvedImages] = useState<JobImage[]>(images);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [resolving, setResolving] = useState(false);
  const activeImage = activeIndex === null ? null : resolvedImages[activeIndex];
  const displayIndex = activeIndex ?? 0;
  const visibleImages = resolvedImages.slice(0, maxVisible);
  const hiddenCount = Math.max(0, images.length - visibleImages.length);

  function move(delta: number) {
    setActiveIndex((current) => {
      if (current === null) return current;
      return (current + delta + resolvedImages.length) % resolvedImages.length;
    });
  }

  useEffect(() => {
    setResolvedImages(images);
  }, [images]);

  function openImage(index: number) {
    setActiveIndex(index);
    if (!onResolveImages || resolvedImages.some((image) => image.signed_url || isRemoved(image))) {
      return;
    }

    setResolving(true);
    onResolveImages(resolvedImages)
      .then(setResolvedImages)
      .finally(() => setResolving(false));
  }

  useEffect(() => {
    if (activeIndex === null) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setActiveIndex(null);
      if (event.key === "ArrowLeft") move(-1);
      if (event.key === "ArrowRight") move(1);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, resolvedImages.length]);

  if (images.length === 0) {
    return null;
  }

  return (
    <>
      <div className="mt-4 grid grid-cols-4 gap-2 sm:flex sm:flex-wrap">
        {visibleImages.map((image, index) => (
          <button
            key={image.id}
            className="tap-target relative aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm transition duration-200 will-change-transform hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md active:scale-[0.98] sm:h-20 sm:w-20"
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              openImage(index);
            }}
            aria-label={`Mở ảnh ${index + 1}`}
          >
            {image.signed_url ? (
              <img alt={image.file_name ?? "Ảnh job"} className="h-full w-full object-cover" decoding="async" loading="lazy" src={image.signed_url} />
            ) : isRemoved(image) ? (
              <RemovedImageNotice compact />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-cyan-50/70 text-cyan-700">
                <ImageIcon className="h-5 w-5" />
                <span className="text-[10px] font-bold">Mo anh</span>
              </div>
            )}
            {index === visibleImages.length - 1 && hiddenCount > 0 ? (
              <span className="absolute inset-0 grid place-items-center bg-slate-950/55 text-sm font-bold text-white">+{hiddenCount}</span>
            ) : null}
          </button>
        ))}
      </div>

      {activeImage ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/75 p-3 backdrop-blur-sm motion-safe:animate-fade-in">
          <div className="w-full max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-2xl motion-safe:animate-slide-up">
            <div className="flex items-center justify-between border-b border-slate-200 p-4">
              <div>
                <p className="font-semibold text-slate-950">{activeImage.file_name ?? "Ảnh job"}</p>
                <p className="text-sm font-medium text-slate-500">{displayIndex + 1}/{resolvedImages.length}</p>
              </div>
              <button className="secondary-button px-3 py-2" type="button" onClick={(event) => { event.stopPropagation(); setActiveIndex(null); }} aria-label="Đóng ảnh">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="relative grid min-h-[58vh] place-items-center bg-slate-50 p-4">
              {activeImage.signed_url ? (
                <img alt={activeImage.file_name ?? "Ảnh job"} className="max-h-[72vh] max-w-full rounded-2xl object-contain" decoding="async" src={activeImage.signed_url} />
              ) : isRemoved(activeImage) ? (
                <RemovedImageNotice />
              ) : (
                <div className="grid place-items-center gap-3 text-sm font-semibold text-slate-500">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  {resolving ? "Đang tải ảnh bảo mật..." : "Đang chuẩn bị ảnh..."}
                </div>
              )}
              {resolvedImages.length > 1 ? (
                <>
                  <button className="absolute left-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white text-slate-700 shadow-lg transition hover:scale-105 active:scale-95" type="button" onClick={(event) => { event.stopPropagation(); move(-1); }} aria-label="Ảnh trước">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button className="absolute right-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white text-slate-700 shadow-lg transition hover:scale-105 active:scale-95" type="button" onClick={(event) => { event.stopPropagation(); move(1); }} aria-label="Ảnh tiếp theo">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
