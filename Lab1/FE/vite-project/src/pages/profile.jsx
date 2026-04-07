import { useEffect, useState } from "react";
import api from "../services/api";

function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userRes = await api.get("/user/me");
        const userData = userRes.data?.data || userRes.data;

        let name = "";

        try {
          const empRes = await api.get("/employees/me");
          const empData = empRes.data?.data || empRes.data;
          name = empData.name || "";
        } catch (e) {
          console.warn("No employee profile");
        }

        setUser({
          ...userData,
          name,
        });
      } catch (err) {
        console.error("Fetch user error:", err);
      }
    };

    fetchUser();
  }, []);

  if (!user) {
    return <div className="app-page min-h-screen">Loading...</div>;
  }

  return (
    <div className="app-page min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>

      <div className="app-card p-6 max-w-lg">
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold">
            {(user.name || "?").charAt(0).toUpperCase()}
          </div>

          <div>
            <div className="font-semibold text-lg">
              {user.name || "Chưa có tên"}
            </div>
            <div className="text-gray-500 text-sm">{user.role}</div>
          </div>
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="text-gray-500 text-sm">Email</label>
          <div className="font-medium">{user.email}</div>
        </div>

        {/* Role */}
        <div className="mb-6">
          <label className="text-gray-500 text-sm">Role</label>
          <div className="font-medium">{user.role}</div>
        </div>
      </div>
    </div>
  );
}

export default Profile;