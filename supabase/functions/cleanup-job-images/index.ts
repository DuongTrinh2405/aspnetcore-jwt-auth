// Deprecated.
// Automatic image cleanup is intentionally disabled.
// Use the admin app manual cleanup API instead: apps/admin/app/api/image-cleanup/route.ts

Deno.serve(() => {
  return Response.json(
    {
      ok: false,
      error: "Automatic cleanup is disabled. Use the admin manual cleanup tool."
    },
    { status: 410 }
  );
});
