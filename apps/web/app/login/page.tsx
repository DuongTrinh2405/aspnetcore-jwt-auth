"use client";

import { getCurrentUserProfile, ROLE_HOME_PATH, type CurrentUserProfile } from "@cnl/shared";
import { ArrowRight, Cable, Camera, CheckCircle2, LogIn, ShieldCheck, UserPlus, Wifi } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AppSpinner } from "../../components/ui/AppSpinner";
import { isSupabaseConfigured, supabase } from "../../lib/supabase";

const showDemoAccounts = process.env.NODE_ENV !== "production";

function getAdminUrl() {
  return process.env.NEXT_PUBLIC_ADMIN_URL ?? "http://localhost:3001/dashboard";
}

function redirectToWorkspace(profile: CurrentUserProfile) {
  if (profile.role === "admin") {
    window.location.href = getAdminUrl();
    return;
  }

  window.location.href = ROLE_HOME_PATH[profile.role] ?? "/customer";
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setMode(params.get("mode") === "register" ? "register" : "login");
  }, []);

  const isRegister = mode === "register";
  const title = isRegister ? "Đăng ký tài khoản" : "Đăng nhập";
  const description = isRegister
    ? "Tạo tài khoản khách hàng để theo dõi yêu cầu, lịch sử và bảo hành trong một không gian riêng."
    : "Đăng nhập để vào đúng không gian làm việc của khách hàng hoặc kỹ thuật viên.";

  const helperSteps = useMemo(
    () => [
      isRegister ? "Tạo tài khoản khách hàng" : "Xác thực tài khoản",
      "Kiểm tra vai trò",
      "Chuyển vào workspace phù hợp"
    ],
    [isRegister]
  );

  function updateMode(nextMode: "login" | "register") {
    setMode(nextMode);
    setMessage("");
    router.replace(`/login${nextMode === "register" ? "?mode=register" : ""}`, { scroll: false });
  }

  async function handleLogin() {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });
    if (error) {
      setMessage("Email hoặc mật khẩu chưa đúng. Vui lòng kiểm tra lại.");
      setLoading(false);
      return;
    }

    const profile = await getCurrentUserProfile(supabase);
    if (!profile) {
      setMessage("Không tìm thấy hồ sơ người dùng. Vui lòng liên hệ quản trị để kiểm tra tài khoản.");
      setLoading(false);
      return;
    }

    redirectToWorkspace(profile);
  }

  async function handleRegister() {
    const trimmedEmail = email.trim();
    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        data: {
          role: "customer",
          full_name: fullName.trim() || trimmedEmail.split("@")[0],
          phone: phone.trim()
        }
      }
    });

    if (error) {
      setMessage("Không tạo được tài khoản. Vui lòng kiểm tra email, mật khẩu hoặc thử lại sau.");
      setLoading(false);
      return;
    }

    if (!data.session) {
      setMessage("Tài khoản đã được tạo. Nếu Supabase yêu cầu xác nhận email, hãy xác nhận trước khi đăng nhập.");
      setLoading(false);
      setMode("login");
      router.replace("/login", { scroll: false });
      return;
    }

    const profile = await getCurrentUserProfile(supabase);
    if (!profile) {
      setMessage("Tài khoản đã tạo nhưng hồ sơ chưa sẵn sàng. Hãy thử đăng nhập lại sau vài giây.");
      setLoading(false);
      return;
    }

    redirectToWorkspace(profile);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setMessage("");

    if (!isSupabaseConfigured) {
      setMessage("Chưa cấu hình Supabase. Hãy tạo apps/web/.env.local rồi restart dev server.");
      setLoading(false);
      return;
    }

    try {
      if (isRegister) {
        await handleRegister();
      } else {
        await handleLogin();
      }
    } catch {
      setMessage("Không kết nối được Supabase. Kiểm tra URL, anon key và restart dev server.");
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-[#F6F9FC] lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-gradient-to-br from-[#2563EB] via-[#1D9BF0] to-[#06B6D4] p-10 text-white lg:block">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(6,182,212,0.30),transparent_42%),linear-gradient(45deg,rgba(255,255,255,0.14),transparent_38%)]" />
        <div className="relative z-10 flex h-full flex-col justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-xl font-black text-[#2563EB] shadow-xl">C</div>
            <div>
              <p className="font-semibold">CNL Service</p>
              <p className="text-sm text-cyan-100">Trung tâm dịch vụ vận hành</p>
            </div>
          </Link>

          <div className="max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur">
              <ShieldCheck className="h-4 w-4" />
              Camera, Wi‑Fi, mạng và điện nhẹ
            </div>
            <h1 className="text-5xl font-semibold leading-tight tracking-tight">Vào đúng không gian dịch vụ của bạn.</h1>
            <p className="mt-5 text-lg leading-8 text-blue-50">
              Khách hàng theo dõi yêu cầu của mình. Kỹ thuật viên nhận việc và cập nhật tiến độ. Quản trị vào trung tâm điều phối riêng.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Camera, label: "Camera" },
              { icon: Wifi, label: "Wi‑Fi" },
              { icon: Cable, label: "Internet" }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <Icon className="h-6 w-6 text-cyan-200" />
                  <p className="mt-3 font-semibold">{item.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center px-5 py-10">
        <form className="premium-card w-full max-w-md p-6 sm:p-8" onSubmit={handleSubmit}>
          <div className="mb-6 grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
            <button
              className={`min-h-11 rounded-xl text-sm font-semibold transition ${!isRegister ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-950"}`}
              type="button"
              onClick={() => updateMode("login")}
            >
              <LogIn className="mr-2 inline h-4 w-4" />
              Đăng nhập
            </button>
            <button
              className={`min-h-11 rounded-xl text-sm font-semibold transition ${isRegister ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-950"}`}
              type="button"
              onClick={() => updateMode("register")}
            >
              <UserPlus className="mr-2 inline h-4 w-4" />
              Đăng ký
            </button>
          </div>

          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2563EB]">
            {isRegister ? "Tạo tài khoản khách hàng" : "Vào workspace"}
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>

          {isRegister ? (
            <>
              <label className="mt-7 block text-sm font-semibold text-slate-700">
                Họ tên
                <input className="premium-input mt-2" value={fullName} onChange={(event) => setFullName(event.target.value)} autoComplete="name" placeholder="Nguyễn Văn A" />
              </label>
              <label className="mt-4 block text-sm font-semibold text-slate-700">
                Số điện thoại
                <input className="premium-input mt-2" value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel" placeholder="090..." />
              </label>
            </>
          ) : null}

          <label className={`${isRegister ? "mt-4" : "mt-7"} block text-sm font-semibold text-slate-700`}>
            Email
            <input className="premium-input mt-2" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" placeholder="you@example.com" />
          </label>
          <label className="mt-4 block text-sm font-semibold text-slate-700">
            Mật khẩu
            <input className="premium-input mt-2" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={isRegister ? "new-password" : "current-password"} placeholder="Tối thiểu 6 ký tự" />
          </label>

          <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">Sau bước này</p>
            <div className="mt-3 space-y-2">
              {helperSteps.map((step) => (
                <p key={step} className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <CheckCircle2 className="h-4 w-4 text-cyan-600" />
                  {step}
                </p>
              ))}
            </div>
          </div>

          {message ? <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold leading-6 text-rose-700">{message}</p> : null}

          <button className="premium-button mt-6 w-full" disabled={loading || !email || !password} type="submit">
            {loading ? <AppSpinner size="md" tone="subtle" /> : null}
            {loading ? "Đang xử lý..." : isRegister ? "Tạo tài khoản" : "Vào workspace"}
            {loading ? null : <ArrowRight className="h-5 w-5" />}
          </button>

          {showDemoAccounts ? (
            <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">Tài khoản test local</p>
              <p className="mt-1">customer.normal@example.com / Test@123456</p>
              <p>customer.vip@example.com / Test@123456</p>
              <p>tech.normal@example.com / Test@123456</p>
              <p>tech.vip@example.com / Test@123456</p>
            </div>
          ) : null}
        </form>
      </section>
    </main>
  );
}
