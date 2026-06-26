import Link from "next/link";

export default function AdminDashboardBridgePage() {
  return (
    <main className="grid min-h-screen place-items-center px-5">
      <section className="premium-card max-w-xl p-8 text-center">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">Admin console</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">Quản lý dùng app admin riêng</h1>
        <p className="mt-3 text-slate-500">
          Admin dashboard đang chạy trong `apps/admin` để tách quyền quản trị khỏi web khách hàng/kỹ thuật viên.
        </p>
        <Link className="premium-button mt-6" href="http://localhost:3001/dashboard">
          Mở admin dashboard
        </Link>
      </section>
    </main>
  );
}
