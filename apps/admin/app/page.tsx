import Link from "next/link";

export default function AdminIndexPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-6">
      <p className="text-sm font-semibold uppercase tracking-wide text-[#2563EB]">CNL Admin</p>
      <h1 className="mt-3 text-4xl font-black text-slate-950">Web admin cho quản lý</h1>
      <p className="mt-4 max-w-2xl text-slate-600">
        Bảng điều hành riêng cho đội quản lý: theo dõi job, khách hàng, nhân viên và báo cáo vận hành.
      </p>
      <div className="mt-8">
        <Link className="premium-button" href="/login">
          Đăng nhập admin
        </Link>
      </div>
    </main>
  );
}
