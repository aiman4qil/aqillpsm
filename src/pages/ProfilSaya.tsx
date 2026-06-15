import { apiFetch } from "../utils/api";
import { useState, useEffect } from "react";

interface Profile {
  username?: string;
  nama: string;
  posisi: string;
  no_jersi: string;
  umur?: string;
  no_matrik?: string;
  no_telefon?: string;
  email?: string;
}

export function ProfilSaya({ setCurrentPage, playerProfile }: any) {
  const defaultProfile: Profile = {
    username: "",
    nama: "",
    posisi: "",
    no_jersi: "",
    umur: "",
    no_matrik: "",
    no_telefon: "",
    email: ""
  };

  const posisiToCode = (value: unknown) => {
    if (value === undefined || value === null) return "2";
    const normalized = String(value).trim().toUpperCase();
    if (normalized === "1" || normalized === "KEEPER" || normalized === "GK") return "1";
    if (normalized === "2" || normalized === "FLEXIBLE") return "2";
    return "2";
  };

  const initialProfile = playerProfile || defaultProfile;

  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  // Initialize formData with current profile values
  const [formData, setFormData] = useState<Profile>({
    ...initialProfile,
    posisi: posisiToCode(initialProfile.posisi)
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Fetch latest profile data
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await apiFetch("/api/pemain/profil", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          // Merge with existing profile
          setProfile(prev => ({ ...prev, ...data }));
          setFormData(prev => ({ ...prev, ...data, posisi: posisiToCode(data.posisi) }));
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const saveProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const payload = {
        nama: formData.nama,
        posisi: formData.posisi,
        no_jersi: formData.no_jersi,
        umur: formData.umur,
        no_matrik: formData.no_matrik,
        no_telefon: formData.no_telefon,
        email: formData.email
      };

      const res = await apiFetch("/api/pemain/profil", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (res.ok) {
        setMessage("Profil berjaya dikemas kini!");
        setProfile(prev => ({
          ...prev,
          ...formData,
          posisi: formData.posisi === "1" ? "KEEPER" : "FLEXIBLE"
        }));
        setIsEditing(false);
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(data.message || "Gagal mengemas kini profil.");
      }
    } catch (e) {
      console.error(e);
      setMessage("Ralat sistem.");
    }
  };

  const savePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage("Kata laluan baru tidak sepadan.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await apiFetch("/api/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        setMessage("Kata laluan berjaya ditukar!");
        setShowPasswordModal(false);
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(data.message || "Gagal menukar kata laluan.");
      }
    } catch (e) {
      console.error(e);
      setMessage("Ralat sistem.");
    }
  };

  return (
    <div>
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full border-4 border-gray-800">
            <h2 className="text-xl font-bold mb-4 uppercase">Tukar Kata Laluan</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Kata Laluan Semasa</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full p-2 border-2 border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Kata Laluan Baru</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full p-2 border-2 border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Sahkan Kata Laluan Baru</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full p-2 border-2 border-gray-300 rounded"
                />
              </div>
              {message && <div className="text-red-600 font-bold">{message}</div>}
              <div className="flex justify-end gap-2 mt-4">
                <button 
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Batal
                </button>
                <button 
                  onClick={savePassword}
                  className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg border-4 border-gray-800 max-w-4xl mx-auto">
        <div className="bg-gray-800 text-white p-4 flex justify-between items-center rounded-t">
          <h1 className="uppercase">Profil Saya</h1>
          <button onClick={() => setCurrentPage("player-dashboard")} className="bg-white text-gray-800 px-4 py-2 rounded hover:bg-gray-100 transition-colors">Kembali</button>
        </div>
        <div className="border-t-2 border-gray-800"></div>
        
        {message && !showPasswordModal && (
          <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 m-4" role="alert">
            <p>{message}</p>
          </div>
        )}

        <div className="p-6 border-b-2 border-gray-800">
          <div className="flex gap-3 mb-4">
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-gray-200 border-2 border-gray-800 rounded hover:bg-gray-300 transition-colors"
              >
                ✏️ EDIT
              </button>
            ) : (
              <button 
                onClick={saveProfile}
                className="px-4 py-2 bg-green-200 border-2 border-green-800 rounded hover:bg-green-300 transition-colors"
              >
                💾 SIMPAN
              </button>
            )}
            <button 
              onClick={() => setShowPasswordModal(true)}
              className="px-4 py-2 bg-gray-200 border-2 border-gray-800 rounded hover:bg-gray-300 transition-colors"
            >
              🔒 UBAH KATA LALUAN
            </button>
          </div>
        </div>
        <div className="p-6 border-b-2 border-gray-800">
          <h2 className="uppercase mb-4">👤 Maklumat Peribadi:</h2>
          <div className="space-y-2">
            <div>
              • Nama: {isEditing ? (
                <input 
                  type="text" 
                  name="nama" 
                  value={formData.nama} 
                  onChange={handleInputChange} 
                  className="border-b-2 border-gray-400 focus:border-gray-800 outline-none px-1"
                />
              ) : profile.nama}
            </div>
            <div>• No. Matrik: {profile.username}</div>
            <div>
              • No. Telefon: {isEditing ? (
                <input 
                  type="text" 
                  name="no_telefon" 
                  value={formData.no_telefon || ""} 
                  onChange={handleInputChange} 
                  className="border-b-2 border-gray-400 focus:border-gray-800 outline-none px-1"
                />
              ) : (profile.no_telefon || "-")}
            </div>
            <div>
              • Email: {isEditing ? (
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email || ""} 
                  onChange={handleInputChange} 
                  className="border-b-2 border-gray-400 focus:border-gray-800 outline-none px-1 w-64"
                />
              ) : (profile.email || "-")}
            </div>
            <div>
              • Umur: {isEditing ? (
                <input 
                  type="text" 
                  name="umur" 
                  value={formData.umur} 
                  onChange={handleInputChange} 
                  className="border-b-2 border-gray-400 focus:border-gray-800 outline-none px-1 w-16"
                />
              ) : profile.umur}
            </div>
          </div>
        </div>
        <div className="p-6 border-b-2 border-gray-800">
          <h2 className="uppercase mb-4">⚽ Maklumat Futsal:</h2>
          <div className="space-y-2">
            <div>
              • No. Jersi: {isEditing ? (
                <input 
                  type="text" 
                  name="no_jersi" 
                  value={formData.no_jersi} 
                  onChange={handleInputChange} 
                  className="border-b-2 border-gray-400 focus:border-gray-800 outline-none px-1 w-16"
                />
              ) : profile.no_jersi}
            </div>
            <div>
              • Posisi: {isEditing ? (
                <select 
                  name="posisi" 
                  value={formData.posisi} 
                  onChange={handleInputChange}
                  className="border-2 border-gray-400 rounded px-1"
                >
                  <option value="1">Keeper</option>
                  <option value="2">Flexible</option>
                </select>
              ) : profile.posisi}
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-3">
            {isEditing && (
              <>
                <button onClick={saveProfile} className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors uppercase">Simpan</button>
                <button onClick={() => { setIsEditing(false); setFormData({ ...profile, posisi: posisiToCode(profile.posisi) }); }} className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors uppercase">Batal</button>
              </>
            )}
            {!isEditing && (
               <button onClick={() => setCurrentPage("player-dashboard")} className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors uppercase">Kembali</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
