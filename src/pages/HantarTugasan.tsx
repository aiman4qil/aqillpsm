import { useState, useEffect } from "react";

interface Tugasan {
  tugasanID: number;
  tajuk: string;
  keterangan: string;
  tarikh_tamat: string;
  status: string;
}

export function HantarTugasan({ setCurrentPage }: any) {
  const [tugasanList, setTugasanList] = useState<Tugasan[]>([]);
  const [selectedTugasanId, setSelectedTugasanId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const fetchTugasan = async () => {
      try {
        const token = localStorage.getItem("token");
        const authHeader = token ? "Bearer " + token : "";
        const response = await fetch("/api/tugasan", {
          headers: { Authorization: authHeader },
        });
        if (response.ok) {
          const data = await response.json();
          setTugasanList(data.filter((t: Tugasan) => t.status === "Aktif"));
        } else {
          console.error("Gagal memuatkan data tugasan");
        }
      } catch (error) {
        console.error("Ralat memuatkan data tugasan:", error);
      }
    };
    fetchTugasan();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleHantarTugasan = async () => {
    if (!selectedTugasanId) {
      alert("Sila pilih tugasan terlebih dahulu.");
      return;
    }
    if (!selectedFile) {
      alert("Sila pilih fail bukti.");
      return;
    }

    const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });

    try {
      const buktiBase64 = await toBase64(selectedFile);
      const token = localStorage.getItem("token");
      const authHeader = token ? "Bearer " + token : "";
      const url = "/api/tugasan/" + selectedTugasanId + "/hantar";
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify({
          tugasanID: selectedTugasanId,
          catatan: notes,
          buktiBase64,
          fileName: selectedFile.name
        }),
      });

      if (response.ok) {
        alert("Tugasan berjaya dihantar!");
        setSelectedTugasanId(null);
        setSelectedFile(null);
        setNotes("");
        setCurrentPage("player-dashboard");
      } else {
        alert("Gagal menghantar tugasan.");
      }
    } catch (error) {
      console.error("Ralat menghantar tugasan:", error);
      alert("Ralat menghantar tugasan.");
    }
  };

  const selectedTugasan = tugasanList.find(t => t.tugasanID === selectedTugasanId);

  return (
    <div className="bg-white rounded-lg shadow-lg border-4 border-gray-800 max-w-4xl mx-auto">
      <div className="bg-gray-800 text-white p-4 flex justify-between items-center rounded-t">
        <h1 className="uppercase">Hantar Tugasan Latihan</h1>
        <button
          onClick={() => setCurrentPage("player-dashboard")}
          className="bg-white text-gray-800 px-4 py-2 rounded hover:bg-gray-100 transition-colors"
        >
          Kembali
        </button>
      </div>
      <div className="border-t-2 border-gray-800"></div>

      <div className="p-6 border-b-2 border-gray-800">
        <div className="space-y-2">
          <div>
            <label className="block mb-2 font-medium">Pilih Tugasan:</label>
            <select
              value={selectedTugasanId ?? ""}
              onChange={(e) => setSelectedTugasanId(Number(e.target.value))}
              className="w-full p-3 border-2 border-gray-800 rounded"
            >
              <option value="">-- Sila Pilih Tugasan --</option>
              {tugasanList.map((tugasan) => (
                <option key={tugasan.tugasanID} value={tugasan.tugasanID}>
                  {tugasan.tajuk} (Tamat:{" "}
                  {new Date(tugasan.tarikh_tamat).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>
          {selectedTugasan && (
            <div className="mt-4 p-4 bg-gray-100 border-2 border-gray-800 rounded">
              <div>
                <strong>Tajuk:</strong> {selectedTugasan.tajuk}
              </div>
              <div>
                <strong>Keterangan:</strong> {selectedTugasan.keterangan}
              </div>
              <div>
                <strong>Tarikh Tamat:</strong>{" "}
                {new Date(selectedTugasan.tarikh_tamat).toLocaleDateString()}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 border-b-2 border-gray-800">
        <h2 className="uppercase mb-4">Muat Naik Bukti:</h2>
        <div className="flex items-center gap-3">
          <input
            type="file"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
            accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
          />
          <label
            htmlFor="file-upload"
            className="px-4 py-2 bg-gray-200 border-2 border-gray-800 rounded hover:bg-gray-300 transition-colors cursor-pointer"
          >
            Pilih Fail
          </label>
          <span className="text-gray-500">
            {selectedFile ? selectedFile.name : "tiada fail dipilih"}
          </span>
        </div>
      </div>

      <div className="p-6 border-b-2 border-gray-800">
        <h2 className="uppercase mb-4">Catatan Tambahan:</h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-4 py-3 bg-[#F5F5F5] border-2 border-gray-300 rounded focus:outline-none focus:border-gray-500 min-h-[100px]"
          placeholder="Masukkan catatan tambahan di sini..."
        />
      </div>

      <div className="p-6">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleHantarTugasan}
            className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors uppercase"
          >
            Hantar
          </button>
          <button
            onClick={() => setCurrentPage("player-dashboard")}
            className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors uppercase"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}
