import { useState } from "react";
import MainLayout from "../../layouts/MainLayout";

function ChangePassword() {

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    console.log({
      oldPassword,
      newPassword,
    });

    alert("Password Changed Successfully");
  };

  return (
    <MainLayout>

      <div className="max-w-2xl mx-auto py-10">

        <div className="bg-white rounded-xl shadow-lg p-8">

          <h1 className="text-3xl font-bold mb-8">
            Change Password
          </h1>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            <div>

              <label className="block mb-2">
                Current Password
              </label>

              <input
                type="password"
                value={oldPassword}
                onChange={(e)=>setOldPassword(e.target.value)}
                className="w-full border rounded-lg px-4 py-3"
              />

            </div>

            <div>

              <label className="block mb-2">
                New Password
              </label>

              <input
                type="password"
                value={newPassword}
                onChange={(e)=>setNewPassword(e.target.value)}
                className="w-full border rounded-lg px-4 py-3"
              />

            </div>

            <div>

              <label className="block mb-2">
                Confirm Password
              </label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(e)=>setConfirmPassword(e.target.value)}
                className="w-full border rounded-lg px-4 py-3"
              />

            </div>

            <button
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
            >
              Change Password
            </button>

          </form>

        </div>

      </div>

    </MainLayout>
  );
}

export default ChangePassword;