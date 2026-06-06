import { useState, useEffect } from "react";

export function KehadiranLatihan(props) {
  const [pemainList, setPemainList] = useState([]);
  const [jadualEvents, setJadualEvents] = useState([]);
  const [selectedJadualId, setSelectedJadualId] = useState(null);
  const [kehadiranRecords, setKehadiranRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(function() {
    async function fetchInitialData() {
      try {
        const token = localStorage.getItem("token");
        const authHeader = token ? "Bearer " + token : "";
        if (!token) {
          setLoadError("Token tiada atau tamat. Sila log masuk semula.");
          setLoading(false);
          return;
        }
        const promises = [
          fetch("/api/pemain", { headers: { Authorization: authHeader } }),
          fetch("/api/jadual?kategori=LATIHAN", { headers: { Authorization: authHeader } })
        ];

        const results = await Promise.all(promises);
        const pemainRes = results[0];
        const jadualRes = results[1];

        if (pemainRes.ok) {
          const pemainData = await pemainRes.json();
          const mappedPemain = pemainData.map(function(p) {
            return {
              pemainID: p.pemain_id || p.pemainID,
              nama: p.nama,
              username: p.username,
              posisi: p.posisi
            };
          });
          setPemainList(mappedPemain);
        } else {
          let msg = "Gagal memuatkan senarai pemain.";
          try {
            const errJson = await pemainRes.json();
            if (errJson && errJson.message) msg = String(errJson.message);
          } catch {}
          setLoadError(msg);
        }
        if (jadualRes.ok) {
          const jadualData = await jadualRes.json();
          const mappedJadual = jadualData.map(function(j) {
            return {
              jadualID: j.jadual_id || j.jadualID,
              tarikh: j.tarikh,
              masa: j.masa,
              lokasi: j.lokasi,
              jenis: j.jenis_aktiviti || j.jenis,
              kategori: j.kategori,
              keterangan: (j.jenis_aktiviti || j.jenis || j.keterangan || 'Aktiviti') + ' di ' + (j.lokasi || 'lokasi')
            };
          });
          const latihanOnly = mappedJadual.filter(function(e) {
            const kat = String(e.kategori || "").toUpperCase();
            if (kat) return kat === "LATIHAN";
            return String(e.jenis || "").toLowerCase().includes("latih");
          });
          setJadualEvents(latihanOnly);
          setSelectedJadualId((latihanOnly[0] && latihanOnly[0].jadualID) || null);
          if (!latihanOnly.length) {
            setLoadError("Tiada jadual latihan dijumpai. Sila tambah jadual latihan dahulu di modul Training Schedule.");
          }
        } else {
          let msg = "Gagal memuatkan jadual latihan.";
          try {
            const errJson = await jadualRes.json();
            if (errJson && errJson.message) msg = String(errJson.message);
          } catch {}
          setLoadError(msg);
          setJadualEvents([]);
          setSelectedJadualId(null);
        }
      } catch (error) {
        console.error("Ralat memuatkan data awal:", error);
        setLoadError("Ralat rangkaian. Pastikan backend berjalan dan cuba refresh.");
      } finally {
        setLoading(false);
      }
    }
    fetchInitialData();
  }, []);

  useEffect(function() {
    if (!selectedJadualId || pemainList.length === 0) return;

    async function fetchKehadiranData() {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/kehadiran/jadual/" + selectedJadualId, {
          headers: { Authorization: "Bearer " + token },
        });

        let records;
        if (response.ok) {
          const existingKehadiran = await response.json();
          records = pemainList.map(function(pemain) {
            const existing = existingKehadiran.find(function(k) { return k.pemainID === pemain.pemainID; });
            return {
              pemainID: pemain.pemainID,
              jadualID: selectedJadualId,
              status: existing ? existing.status : "Hadir",
              catatan: existing ? existing.sebab || "" : "",
            };
          });
        } else {
          records = pemainList.map(function(pemain) {
            return {
              pemainID: pemain.pemainID,
              jadualID: selectedJadualId,
              status: "Hadir",
              catatan: "",
            };
          });
        }
        setKehadiranRecords(records);
      } catch (error) {
        console.error("Ralat memuatkan data kehadiran:", error);
      }
    }

    fetchKehadiranData();
  }, [selectedJadualId, pemainList]);

  function updateKehadiranStatus(pemainID, status) {
    setKehadiranRecords(function(prev) {
      return prev.map(function(record) {
        return record.pemainID === pemainID ? { ...record, status: status } : record;
      });
    });
  }

  function updateKehadiranCatatan(pemainID, catatan) {
    setKehadiranRecords(function(prev) {
      return prev.map(function(record) {
        return record.pemainID === pemainID ? { ...record, catatan: catatan } : record;
      });
    });
  }

  async function handleSimpanKehadiran() {
    if (!selectedJadualId) {
      alert("Sila pilih satu acara.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/kehadiran/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ records: kehadiranRecords }),
      });

      if (response.ok) {
        alert("Kehadiran berjaya disimpan!");
      } else {
        const errorData = await response.json();
        alert("Gagal menyimpan kehadiran: " + errorData.message);
      }
    } catch (error) {
      console.error("Ralat menyimpan kehadiran:", error);
      alert("Gagal menyimpan kehadiran.");
    }
  }

  function handleReset() {
    if (!selectedJadualId) return;
    const resetRecords = pemainList.map(function(pemain) {
      return {
        pemainID: pemain.pemainID,
        jadualID: selectedJadualId,
        status: "Hadir",
        catatan: "",
      };
    });
    setKehadiranRecords(resetRecords);
  }

  function handleCetak() {
    window.print();
  }

  const selectedEvent = jadualEvents.find(function(e) { return e.jadualID === selectedJadualId; });
  const setCurrentPage = props.setCurrentPage;
  const role = props.role;
  const backTarget = role === "Jurulatih" ? "coach-dashboard" : role === "Pemain" ? "player-dashboard" : "dashboard";

  return (
    <div className="bg-white rounded-lg shadow-lg border-4 border-gray-800 max-w-6xl mx-auto">
        <div className="bg-gray-800 text-white p-4 flex justify-between items-center rounded-t">
          <h1 className="uppercase">Kehadiran Latihan</h1>
          <button
            onClick={function() { setCurrentPage(backTarget); }}
            className="bg-white text-gray-800 px-4 py-2 rounded hover:bg-gray-100 transition-colors"
          >
            Kembali
          </button>
        </div>

        <div className="border-t-2 border-gray-800"></div>

        <div className="p-6 border-b-2 border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">Pilih Acara:</label>
              <select
                value={selectedJadualId || ''}
                onChange={function(e) { setSelectedJadualId(e.target.value ? Number(e.target.value) : null); }}
                className="w-full p-2 border-2 border-gray-800 rounded"
              >
                {loading && (
                  <option value="" disabled>
                    Memuatkan...
                  </option>
                )}
                {!loading && !jadualEvents.length && (
                  <option value="" disabled>
                    Tiada latihan dijumpai
                  </option>
                )}
                {jadualEvents.map(function(event) {
                  return (
                    <option key={event.jadualID} value={event.jadualID}>
                      {new Date(event.tarikh).toLocaleDateString()} - {event.keterangan} ({event.jenis})
                    </option>
                  );
                })}
              </select>
              {!!loadError && (
                <div className="mt-2 text-sm text-red-700">
                  {loadError}
                </div>
              )}
            </div>
            {selectedEvent && (
              <div>
                <label className="block mb-2">Tarikh:</label>
                <input type="text" readOnly value={new Date(selectedEvent.tarikh).toLocaleDateString()} className="w-full p-2 bg-gray-200 border-2 border-gray-800 rounded" />
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-b-2 border-gray-800 overflow-x-auto">
          <table className="w-full border-2 border-gray-800">
            <thead>
              <tr className="bg-gray-200 border-b-2 border-gray-800">
                <th className="border-r-2 border-gray-800 p-3 text-left">No.</th>
                <th className="border-r-2 border-gray-800 p-3 text-left">Nama Pemain</th>
                <th className="border-r-2 border-gray-800 p-3 text-center">Status</th>
                <th className="border-gray-800 p-3 text-left">Catatan</th>
              </tr>
            </thead>
            <tbody>
              {kehadiranRecords.map(function(record, index) {
                const pemain = pemainList.find(function(p) { return p.pemainID === record.pemainID; });
                return (
                  <tr key={record.pemainID} className="border-b-2 border-gray-800">
                    <td className="border-r-2 border-gray-800 p-3">{index + 1}{". "}</td>
                    <td className="border-r-2 border-gray-800 p-3">{pemain?.nama || 'N/A'}</td>
                    <td className="border-r-2 border-gray-800 p-3">
                      <div className="flex justify-center gap-4">
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name={"status-" + record.pemainID}
                            value="Hadir"
                            checked={record.status === "Hadir"}
                            onChange={function() { updateKehadiranStatus(record.pemainID, "Hadir"); }}
                            className="w-4 h-4"
                          />
                          <span>Hadir</span>
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name={"status-" + record.pemainID}
                            value="Tidak Hadir"
                            checked={record.status === "Tidak Hadir"}
                            onChange={function() { updateKehadiranStatus(record.pemainID, "Tidak Hadir"); }}
                            className="w-4 h-4"
                          />
                          <span>Tidak</span>
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name={"status-" + record.pemainID}
                            value="Cuti"
                            checked={record.status === "Cuti"}
                            onChange={function() { updateKehadiranStatus(record.pemainID, "Cuti"); }}
                            className="w-4 h-4"
                          />
                          <span>Cuti</span>
                        </label>
                      </div>
                    </td>
                    <td className="border-gray-800 p-3">
                      <input
                        type="text"
                        value={record.catatan}
                        onChange={function(e) { updateKehadiranCatatan(record.pemainID, e.target.value); }}
                        className="w-full px-2 py-1 bg-[#F5F5F5] border border-gray-300 rounded focus:outline-none focus:border-gray-500"
                        placeholder="Sebab..."
                        disabled={record.status === "Hadir"}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-b-2 border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-100 border-2 border-gray-800 rounded p-4 text-center">
              <div className="mb-1">Hadir:</div>
              <div className="text-2xl">{kehadiranRecords.filter(function(r) { return r.status === "Hadir"; }).length}</div>
            </div>
            <div className="bg-gray-100 border-2 border-gray-800 rounded p-4 text-center">
              <div className="mb-1">Tidak Hadir:</div>
              <div className="text-2xl">{kehadiranRecords.filter(function(r) { return r.status === "Tidak Hadir"; }).length}</div>
            </div>
            <div className="bg-gray-100 border-2 border-gray-800 rounded p-4 text-center">
              <div className="mb-1">Cuti:</div>
              <div className="text-2xl">{kehadiranRecords.filter(function(r) { return r.status === "Cuti"; }).length}</div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={handleSimpanKehadiran}
              className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors uppercase"
            >
              Simpan Kehadiran
            </button>
            <button 
              onClick={handleReset}
              className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors uppercase"
            >
              Reset
            </button>
            <button 
              onClick={handleCetak}
              className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors uppercase"
            >
              Cetak
            </button>
          </div>
        </div>
    </div>
  );
}
