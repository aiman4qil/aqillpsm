import { apiFetch } from "../utils/api";
import { useEffect, useState } from "react";

interface Player {
  username: string;
  nama: string;
  posisi: string;
  isActive?: number;
}

interface MaklumatPemainProps {
  setCurrentPage: (page: string) => void;
}

export function MaklumatPemain({ setCurrentPage }: MaklumatPemainProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [showInactive, setShowInactive] = useState(false);

  const fetchPlayers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await apiFetch("/api/pemain" + (showInactive ? "?include_inactive=1" : ""), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setPlayers(data);
      } else {
        console.error("Gagal mendapatkan data pemain");
      }
    } catch (error) {
      console.error("Ralat mendapatkan data pemain:", error);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, [showInactive]);

  const togglePlayerSelection = (username: string) => {
    setSelectedPlayers((prev) =>
      prev.includes(username)
        ? prev.filter((p) => p !== username)
        : [...prev, username]
    );
  };

  const handleDeactivate = async () => {
    if (selectedPlayers.length === 0) {
      alert("Sila pilih pemain.");
      return;
    }

    if (!confirm("Nyahaktifkan pemain yang dipilih?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      for (const username of selectedPlayers) {
        const response = await apiFetch(`/api/pemain/${username}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          console.error(`Gagal nyahaktif pemain ${username}`);
        }
      }
      
      // Refresh list
      const response = await apiFetch("/api/pemain" + (showInactive ? "?include_inactive=1" : ""), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setPlayers(data);
        setSelectedPlayers([]);
        alert("Pemain berjaya dinyahaktifkan.");
      }
    } catch (error) {
      console.error("Ralat nyahaktif pemain:", error);
      alert("Ralat semasa nyahaktif pemain.");
    }
  };

  const handleActivate = async () => {
    if (selectedPlayers.length === 0) {
      alert("Sila pilih pemain.");
      return;
    }

    if (!confirm("Aktifkan semula pemain yang dipilih?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      for (const username of selectedPlayers) {
        const response = await apiFetch(`/api/pemain/${username}/active`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ is_active: 1 }),
        });

        if (!response.ok) {
          console.error(`Gagal aktifkan pemain ${username}`);
        }
      }

      const response = await apiFetch("/api/pemain" + (showInactive ? "?include_inactive=1" : ""), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setPlayers(data);
        setSelectedPlayers([]);
        alert("Pemain berjaya diaktifkan.");
      }
    } catch (error) {
      console.error("Ralat aktifkan pemain:", error);
      alert("Ralat semasa aktifkan pemain.");
    }
  };

  const filteredPlayers = players.filter(
    (player) =>
      player.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg shadow-lg border-4 border-gray-800 max-w-6xl mx-auto">
        <div className="bg-gray-800 text-white p-4 flex justify-between items-center rounded-t">
          <h1 className="uppercase">Pengurusan Maklumat Pemain</h1>
          <button
            onClick={() => setCurrentPage("dashboard")}
            className="bg-white text-gray-800 px-4 py-2 rounded hover:bg-gray-100 transition-colors"
          >
            Kembali
          </button>
        </div>

        <div className="border-t-2 border-gray-800"></div>

        <div className="p-6 border-b-2 border-gray-800">
          <div className="flex gap-3">
            <div className="flex-1">
              <label htmlFor="search" className="block mb-2">
                Cari Nama/Matrik:
              </label>
              <input
                id="search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 bg-[#F5F5F5] border-2 border-gray-300 rounded focus:outline-none focus:border-gray-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => { setSelectedPlayers([]); setShowInactive(v => !v); }}
                className="px-4 py-2 bg-gray-200 border-2 border-gray-800 rounded hover:bg-gray-300 transition-colors uppercase"
              >
                {showInactive ? "Lihat Aktif" : "Lihat Semua"}
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 border-b-2 border-gray-800 overflow-x-auto">
          <table className="w-full border-2 border-gray-800">
            <thead>
              <tr className="bg-gray-200 border-b-2 border-gray-800">
                <th className="border-r-2 border-gray-800 p-3 text-left">No.</th>
                <th className="border-r-2 border-gray-800 p-3 text-left">Nama</th>
                <th className="border-r-2 border-gray-800 p-3 text-left">No. Matrik</th>
                <th className="border-r-2 border-gray-800 p-3 text-left">Posisi</th>
                <th className="border-r-2 border-gray-800 p-3 text-left">Status</th>
                <th className="border-gray-800 p-3 text-center">Tindak</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlayers.map((player, index) => (
                <tr key={player.username} className="border-b-2 border-gray-800">
                  <td className="border-r-2 border-gray-800 p-3">{index + 1}{". "}</td>
                  <td className="border-r-2 border-gray-800 p-3">{player.nama}</td>
                  <td className="border-r-2 border-gray-800 p-3">{player.username}</td>
                  <td className="border-r-2 border-gray-800 p-3">{player.posisi}</td>
                  <td className="border-r-2 border-gray-800 p-3">{player.isActive === 0 ? "Tidak Aktif" : "Aktif"}</td>
                  <td className="border-gray-800 p-3 text-center">
                    <input
                      type="checkbox"
                      checked={selectedPlayers.includes(player.username)}
                      onChange={() => togglePlayerSelection(player.username)}
                      className="w-5 h-5 cursor-pointer"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6">
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => setCurrentPage("tambah-pemain")}
              className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors uppercase"
            >
              Tambah Pemain
            </button>
            <button
              onClick={() => setCurrentPage("tambah-jurulatih")}
              className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors uppercase"
            >
              Tambah Jurulatih
            </button>
            <button
              onClick={fetchPlayers}
              className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors uppercase"
            >
              Kemas Kini
            </button>
            <button 
              onClick={handleDeactivate}
              className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors uppercase"
            >
              Nyahaktif
            </button>
            <button 
              onClick={handleActivate}
              className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors uppercase"
            >
              Aktifkan
            </button>
            <button
              onClick={() => window.print()}
              className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors uppercase"
            >
              Cetak
            </button>
          </div>
        </div>
    </div>
  );
}
