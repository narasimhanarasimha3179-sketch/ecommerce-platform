import { useState, useEffect } from "react";
import MainLayout from "../../layouts/MainLayout";
import { useAuth } from "../../context/AuthContext";
import {
  FaUser,
  FaMapMarkerAlt,
  FaPlus,
  FaTrashAlt,
  FaEnvelope,
  FaPhone,
} from "react-icons/fa";

export default function Profile() {
  const { userInfo } = useAuth();
  const storageKey = `user_addresses_${userInfo?._id || "guest"}`;

  const [addresses, setAddresses] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: userInfo?.name || "",
    phone: userInfo?.phone || "",
    city: "",
    state: "",
    pincode: "",
    fullAddress: "",
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(addresses));
  }, [addresses, storageKey]);

  const handleAddAddress = (e) => {
    e.preventDefault();
    if (!newAddress.fullName || !newAddress.phone || !newAddress.fullAddress) {
      alert("Please fill required address details.");
      return;
    }
    const item = { id: Date.now().toString(), ...newAddress };
    setAddresses([item, ...addresses]);
    setShowAddModal(false);
    setNewAddress({
      fullName: userInfo?.name || "",
      phone: userInfo?.phone || "",
      city: "",
      state: "",
      pincode: "",
      fullAddress: "",
    });
  };

  const handleDelete = (id) => {
    if (window.confirm("Remove this address?")) {
      setAddresses(addresses.filter((a) => a.id !== id));
    }
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        
        {/* Profile Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-black shadow-md">
            {(userInfo?.name || "U")[0].toUpperCase()}
          </div>
          <div className="text-center sm:text-left flex-1">
            <h1 className="text-xl font-extrabold text-gray-900">{userInfo?.name || "User Account"}</h1>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-2 text-xs text-gray-500 font-medium">
              <span className="flex items-center gap-1.5">
                <FaEnvelope className="text-gray-400" /> {userInfo?.email || "No email"}
              </span>
              {userInfo?.phone && (
                <span className="flex items-center gap-1.5">
                  <FaPhone className="text-gray-400" /> {userInfo?.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Saved Addresses Section */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <FaMapMarkerAlt className="text-blue-600" /> Saved Delivery Addresses
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Manage your shipping destinations for faster checkout
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-sm"
            >
              <FaPlus className="text-[10px]" /> Add Address
            </button>
          </div>

          {addresses.length === 0 ? (
            <div className="p-8 text-center bg-gray-50 rounded-xl text-gray-400 text-xs">
              No saved addresses found. Click &quot;Add Address&quot; to save one.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className="p-5 border border-gray-200 rounded-xl bg-white flex flex-col justify-between hover:border-gray-300 transition"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-gray-900 text-sm">{addr.fullName}</span>
                      <button
                        onClick={() => handleDelete(addr.id)}
                        className="text-gray-400 hover:text-red-600 transition text-xs"
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 font-medium mb-2">{addr.phone}</p>
                    <p className="text-xs text-gray-700 leading-relaxed">{addr.fullAddress}</p>
                    <p className="text-xs text-gray-500 mt-1 font-semibold">
                      {addr.city ? `${addr.city}, ` : ""}{addr.state ? `${addr.state} - ` : ""}{addr.pincode}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Address Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-gray-900">Add New Address</h3>
              <form onSubmit={handleAddAddress} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-600 font-bold mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={newAddress.fullName}
                      onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                      className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 font-bold mb-1">Phone *</label>
                    <input
                      type="tel"
                      required
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                      className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-gray-600 font-bold mb-1">City *</label>
                    <input
                      type="text"
                      required
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 font-bold mb-1">State *</label>
                    <input
                      type="text"
                      required
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 font-bold mb-1">Pincode *</label>
                    <input
                      type="text"
                      required
                      value={newAddress.pincode}
                      onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                      className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-600 font-bold mb-1">Full Street Address *</label>
                  <textarea
                    rows={2}
                    required
                    value={newAddress.fullAddress}
                    onChange={(e) => setNewAddress({ ...newAddress, fullAddress: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 font-bold rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition shadow-sm"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </MainLayout>
  );
}