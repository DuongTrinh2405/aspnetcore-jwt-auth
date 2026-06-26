import { createClient } from "@supabase/supabase-js";
import { USER_ROLES, type UserRole } from "@cnl/shared";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const manageableRoles = USER_ROLES.filter((role) => role !== "admin") as Exclude<UserRole, "admin">[];

const userPayloadSchema = z.object({
  email: z.string().email("Email khong hop le.").optional(),
  password: z.string().min(8, "Mat khau toi thieu 8 ky tu.").optional(),
  fullName: z.string().trim().min(2, "Nhap ten nguoi dung."),
  phone: z.string().trim().min(8).max(20).optional().or(z.literal("")),
  role: z.enum(manageableRoles),
  isActive: z.boolean().default(true)
});

const updateUserSchema = userPayloadSchema.extend({
  id: z.string().uuid()
});

const deleteUserSchema = z.object({
  id: z.string().uuid()
});

type ManagedUserRow = {
  id: string;
  email: string | null;
  role: UserRole;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

function getSupabaseServerClient() {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Thieu cau hinh server SUPABASE_SERVICE_ROLE_KEY.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

function getBearerToken(request: NextRequest): string {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  if (!token) {
    throw new Error("Unauthorized.");
  }
  return token;
}

async function requireAdmin(request: NextRequest): Promise<{ adminId: string; supabase: ReturnType<typeof getSupabaseServerClient> }> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser(getBearerToken(request));

  if (error || !data.user) {
    throw new Error("Unauthorized.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("id, role, is_active")
    .eq("id", data.user.id)
    .single();

  if (profileError || !profile || profile.role !== "admin" || profile.is_active === false) {
    throw new Error("Forbidden.");
  }

  return { adminId: data.user.id, supabase };
}

function jsonError(error: unknown) {
  const message = error instanceof Error ? error.message : "Không cập nhật được tài khoản.";
  const status = message === "Unauthorized." ? 401 : message === "Forbidden." ? 403 : 400;
  return NextResponse.json({ ok: false, error: message }, { status });
}

async function fetchManagedUser(supabase: ReturnType<typeof getSupabaseServerClient>, id: string): Promise<ManagedUserRow> {
  const { data, error } = await supabase
    .from("users")
    .select("id, email, role, full_name, phone, avatar_url, is_active, created_at, updated_at")
    .eq("id", id)
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Không tìm thấy tài khoản.");
  }

  return data as ManagedUserRow;
}

export async function POST(request: NextRequest) {
  try {
    const { supabase } = await requireAdmin(request);
    const payload = userPayloadSchema.extend({
      email: z.string().email("Email khong hop le."),
      password: z.string().min(8, "Mat khau toi thieu 8 ky tu.")
    }).parse(await request.json());

    const { data: created, error: createError } = await supabase.auth.admin.createUser({
      email: payload.email,
      password: payload.password,
      email_confirm: true,
      user_metadata: {
        full_name: payload.fullName,
        phone: payload.phone ?? "",
        role: payload.role
      }
    });

    if (createError || !created.user) {
      throw new Error(createError?.message ?? "Không tạo được tài khoản auth.");
    }

    const { error: updateError } = await supabase
      .from("users")
      .update({
        email: payload.email,
        full_name: payload.fullName,
        phone: payload.phone || null,
        role: payload.role,
        is_active: payload.isActive
      })
      .eq("id", created.user.id);

    if (updateError) {
      throw new Error(updateError.message);
    }

    return NextResponse.json({ ok: true, user: await fetchManagedUser(supabase, created.user.id) });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { supabase } = await requireAdmin(request);
    const payload = updateUserSchema.parse(await request.json());

    const { error } = await supabase
      .from("users")
      .update({
        email: payload.email || null,
        full_name: payload.fullName,
        phone: payload.phone || null,
        role: payload.role,
        is_active: payload.isActive
      })
      .eq("id", payload.id)
      .neq("role", "admin");

    if (error) {
      throw new Error(error.message);
    }

    if (payload.email || payload.password) {
      const { error: authError } = await supabase.auth.admin.updateUserById(payload.id, {
        email: payload.email,
        password: payload.password,
        user_metadata: {
          full_name: payload.fullName,
          phone: payload.phone ?? "",
          role: payload.role
        }
      });

      if (authError) {
        throw new Error(authError.message);
      }
    }

    return NextResponse.json({ ok: true, user: await fetchManagedUser(supabase, payload.id) });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { adminId, supabase } = await requireAdmin(request);
    const payload = deleteUserSchema.parse(await request.json());

    if (payload.id === adminId) {
      throw new Error("Không thể khóa tài khoản admin đang đăng nhập.");
    }

    const { error } = await supabase
      .from("users")
      .update({ is_active: false })
      .eq("id", payload.id)
      .neq("role", "admin");

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ ok: true, user: await fetchManagedUser(supabase, payload.id) });
  } catch (error) {
    return jsonError(error);
  }
}
