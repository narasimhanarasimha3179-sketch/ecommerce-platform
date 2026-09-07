import { useEffect, useState } from "react";
import api from "../../api/axios";

function Users() {
  const [users, setUsers] = useState([]);
  const loadUsers = async () => {
    try { const { data } = await api.get("/api/users"); setUsers(data); }
    catch (error) { console.error(error); }
  };
  useEffect(() => { loadUsers(); }, []);

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try { await api.delete(`/api/users/${id}`); loadUsers(); }
    catch (error) { alert(error.response?.data?.message || "Unable to delete user"); }
  };

  return <div className="max-w-7xl mx-auto py-10 px-6"><h1 className="text-4xl font-bold mb-8">User Management</h1><div className="overflow-x-auto bg-white rounded-xl shadow"><table className="w-full"><thead className="bg-gray-100"><tr><th className="p-4 text-left">Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Action</th></tr></thead><tbody>{users.map((user)=><tr key={user._id} className="border-b"><td className="p-4">{user.name}</td><td>{user.email}</td><td>{user.phone}</td><td>{user.role}</td><td><button onClick={()=>deleteUser(user._id)} className="bg-red-500 text-white px-4 py-2 rounded">Delete</button></td></tr>)}</tbody></table>{users.length===0&&<div className="text-center py-10 text-gray-500">No users found.</div>}</div></div>;
}
export default Users;
