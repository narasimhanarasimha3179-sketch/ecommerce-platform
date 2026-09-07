import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import MainLayout from "../../layouts/MainLayout";

function EditProfile() {
  const { user } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Backend API will be connected later
    console.log({
      name,
      email,
    });

    alert("Profile Updated Successfully");
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto py-10">

        <div className="bg-white shadow rounded-lg p-8">

          <h1 className="text-3xl font-bold mb-8">
            Edit Profile
          </h1>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            <div>
              <label className="block mb-2">
                Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(e)=>setName(e.target.value)}
                className="w-full border rounded px-4 py-3"
              />
            </div>

            <div>
              <label className="block mb-2">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
                className="w-full border rounded px-4 py-3"
              />
            </div>

            <button
              className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
            >
              Save Changes
            </button>

          </form>

        </div>

      </div>
    </MainLayout>
  );
}

export default EditProfile;