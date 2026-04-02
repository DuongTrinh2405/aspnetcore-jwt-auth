import { useEffect, useState } from "react";
import { getUser } from "../services/authService";

function Profile() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [form, setForm] = useState({
    userName: "",
    email: "",
  });

  // ✅ load user khi vào page
  useEffect(() => {
    const currentUser = getUser();

    if (currentUser) {
      setUser(currentUser);
      setForm({
        userName: currentUser.userName || "",
        email: currentUser.email || "",
      });
    }
  }, []);

  if (!user) {
    return <div className="p-6">Not logged in</div>;
  }

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = () => {
    const updatedUser = {
      ...user,
      userName: form.userName,
      email: form.email,
    };

    // ✅ lưu lại
    localStorage.setItem("user", JSON.stringify(updatedUser));

    setUser(updatedUser);
    setIsEditing(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>

      <div className="bg-white p-6 rounded-xl shadow-md max-w-lg">
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold">
            {user.userName?.charAt(0).toUpperCase()}
          </div>

          <div>
            <div className="font-semibold text-lg">{user.userName}</div>
            <div className="text-gray-500 text-sm">{user.role}</div>
          </div>
        </div>

        {/* Username */}
        <div className="mb-4">
          <label className="text-gray-500 text-sm">Username</label>
          {isEditing ? (
            <input
              name="userName"
              value={form.userName}
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded-lg"
            />
          ) : (
            <div className="font-medium">{user.userName}</div>
          )}
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="text-gray-500 text-sm">Email</label>
          {isEditing ? (
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded-lg"
            />
          ) : (
            <div className="font-medium">{user.email}</div>
          )}
        </div>

        {/* Role */}
        <div className="mb-6">
          <label className="text-gray-500 text-sm">Role</label>
          <div className="font-medium">{user.role}</div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white rounded-lg"
              >
                Save
              </button>

              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded-lg"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;