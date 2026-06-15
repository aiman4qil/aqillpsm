import { apiFetch } from "../utils/api";
import { useState, useEffect } from "react";

interface Prestasi {
  prestasiID: number;
  tarikh: string;
  gol: number;
  assist: number;
  kad_kuning: number;
  kad_merah: number;
  skor_perlawanan: number;
}

export function PrestasiSaya({ setCurrentPage }: any) {
  const [prestasiData, setPrestasiData] = useState<Prestasi[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const fetchPrestasi = async () => {
      try {
        setLoading(true);
        setErrorMessage("");
        const token = localStorage.getItem("token");
        const authHeader = token ? "Bearer " + token : "";
        const response = await apiFetch("/api/prestasi/pemain/saya", {
          headers: { Authorization: authHeader },
        });
        if (response.ok) {
          setPrestasiData(await response.json());
        } else {
          const text = await response.text();
          let msg = "Gagal memuatkan data prestasi.";
          try {
            const parsed = text ? JSON.parse(text) : null;
            if (parsed?.message) msg = String(parsed.message);
          } catch {}
          setPrestasiData([]);
          setErrorMessage(msg);
        }
      } catch (error) {
        console.error("Ralat memuatkan data prestasi:", error);
        setPrestasiData([]);
        setErrorMessage("Ralat rangkaian. Sila cuba lagi.");
      } finally {
        setLoading(false);
      }
    };
    fetchPrestasi();
  }, []);

  const totalPerlawanan = prestasiData.length;
  const totalGol = prestasiData.reduce((sum, p) => sum + p.gol, 0);
  const totalAssist = prestasiData.reduce((sum, p) => sum + p.assist, 0);
  const totalKadKuning = prestasiData.reduce((sum, p) => sum + p.kad_kuning, 0);
  const totalKadMerah = prestasiData.reduce((sum, p) => sum + p.kad_merah, 0);
  const purataSkor = totalPerlawanan > 0 ? (prestasiData.reduce((sum, p) => sum + parseFloat(p.skor_perlawanan.toString()), 0) / totalPerlawanan) : 0;

  return (
    <div className="bg-white rounded-lg shadow-lg border-4 border-gray-800 max-w-6xl mx-auto">
        <div className="bg-gray-800 text-white p-4 flex justify-between items-center rounded-t">
          <h1 className="uppercase">Prestasi Saya</h1>
          <button onClick={() => setCurrentPage("player-dashboard")} className="bg-white text-gray-800 px-4 py-2 rounded hover:bg-gray-100 transition-colors">Kembali</button>
        </div>
        <div className="border-t-2 border-gray-800"></div>
        {loading ? (
          <div className="p-10 text-center text-gray-600 animate-pulse">Memuatkan rekod prestasi...</div>
        ) : errorMessage ? (
          <div className="p-6 border-b-2 border-gray-800">
            <div className="bg-red-50 border-2 border-red-200 rounded p-4 text-red-700">
              {errorMessage}
            </div>
          </div>
        ) : (
          <>
            <div className="p-6 border-b-2 border-gray-800">
              <h2 className="uppercase mb-4">⭐ Skor Keseluruhan: {purataSkor.toFixed(1)}{"/10"}</h2>
              <div className="flex gap-1 mb-2">
                {[...Array(Math.round(purataSkor))].map((_, i) => (<span key={i} className="text-2xl">⭐</span>))}
                {[...Array(10 - Math.round(purataSkor))].map((_, i) => (<span key={i} className="text-2xl">☆</span>))}
              </div>
            </div>
            <div className="p-6 border-b-2 border-gray-800">
              <h2 className="uppercase mb-4">📈 Statistik Terkini:</h2>
              <div className="space-y-2">
                <div>• Perlawanan: {totalPerlawanan}</div>
                <div>• Gol: {totalGol} 🥅 ({totalPerlawanan > 0 ? (totalGol/totalPerlawanan).toFixed(1) : 0}{"/game"})</div>
                <div>• Assist: {totalAssist} 🎯 ({totalPerlawanan > 0 ? (totalAssist/totalPerlawanan).toFixed(1) : 0}{"/game"})</div>
                <div>• Kad Kuning: {totalKadKuning} ⚠️</div>
                <div>• Kad Merah: {totalKadMerah} ✅</div>
              </div>
            </div>

            <div className="p-6 border-b-2 border-gray-800 overflow-x-auto">
              <h2 className="uppercase mb-4">Rekod Perlawanan</h2>
              <table className="w-full border-2 border-gray-800">
                <thead>
                  <tr className="bg-gray-200 border-b-2 border-gray-800">
                    <th className="p-3 text-left">Tarikh</th>
                    <th className="p-3 text-left">Gol</th>
                    <th className="p-3 text-left">Assist</th>
                    <th className="p-3 text-left">Kad Kuning</th>
                    <th className="p-3 text-left">Kad Merah</th>
                    <th className="p-3 text-left">Skor</th>
                  </tr>
                </thead>
                <tbody>
                  {prestasiData.length === 0 ? (
                    <tr className="border-b-2 border-gray-800">
                      <td className="p-3" colSpan={6}>Tiada rekod prestasi direkodkan lagi.</td>
                    </tr>
                  ) : prestasiData.map((p) => (
                    <tr key={p.prestasiID} className="border-b-2 border-gray-800">
                      <td className="p-3">{new Date(p.tarikh).toLocaleDateString()}</td>
                      <td className="p-3">{p.gol}</td>
                      <td className="p-3">{p.assist}</td>
                      <td className="p-3">{p.kad_kuning}</td>
                      <td className="p-3">{p.kad_merah}</td>
                      <td className="p-3">{p.skor_perlawanan}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-6">
              <div className="flex flex-wrap gap-3">
                <button className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors">🖨️ CETAK</button>
              </div>
            </div>
          </>
        )}
    </div>
  );
}
