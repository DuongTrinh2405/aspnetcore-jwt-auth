"use client";

import { getCurrentUserProfile, isAdminRole } from "@cnl/shared";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { isSupabaseConfigured, supabase } from "../../lib/supabase";

const showDemoAccount = process.env.NODE_ENV !== "production";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    if (!isSupabaseConfigured) {
      setMessage("Chưa cấu hình Supabase cho admin.");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });
      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }

      const profile = await getCurrentUserProfile(supabase);
      if (!profile || !isAdminRole(profile.role)) {
        setMessage("Tài khoản này không có quyền admin.");
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch {
      setMessage("Không kết nối được Supabase.");
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-5 py-10">
      <form className="premium-card w-full max-w-md p-8" onSubmit={handleLogin}>
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#2563EB] text-white shadow-xl shadow-blue-500/20">
          <ShieldCheck className="h-7 w-7" />
        </div>
        <p className="mt-6 text-sm font-bold uppercase tracking-[0.18em] text-[#2563EB]">Operations admin</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">Đăng nhập quản lý</h1>
        <p className="mt-2 text-slate-500">Trung tâm điều phối, báo cáo và quản trị vận hành kỹ thuật.</p>

        <label className="mt-7 block text-sm font-bold text-slate-700">
          Email
          <input
            autoComplete="email"
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-cyan-500/10"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label className="mt-4 block text-sm font-bold text-slate-700">
          Mật khẩu
          <input
            autoComplete="current-password"
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-cyan-500/10"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        {message ? <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{message}</p> : null}
        <button className="premium-button mt-6 w-full" disabled={loading} type="submit">
          {loading ? "Đang đăng nhập..." : "Vào admin"}
          <ArrowRight className="h-5 w-5" />
        </button>

        {showDemoAccount ? (
          <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-bold text-slate-900">Tài khoản test local</p>
            <p className="mt-1">admin@example.com / Test@123456</p>
          </div>
        ) : null}
      </form>
    </main>
  );
}
