import { useState, useEffect } from "react";

interface Player {
  pemainID: number;
  username: string;
  nama: string;
  posisi: string;
}

interface Jadual {
  jadualID: number;
  jenis: string;
  tarikh: string;
  masa: string;
  lokasi: string;
}

interface PlayerWithRating extends Player {
  rating: number;
}

export function KesebelasanUtama({ setCurrentPage, readOnly }: { setCurrentPage: (page: string) => void; readOnly?: boolean }) {
  const [formasi, setFormasi] = useState("1-2-1");
  const [players, setPlayers] = useState<Player[]>([]);
  const [playersWithRating, setPlayersWithRating] = useState<PlayerWithRating[]>([]);
  const [matches, setMatches] = useState<Jadual[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);

  const [lineup, setLineup] = useState({
    gk: { nama: "Pilih", no: "-" },
    fixo: { nama: "Pilih", no: "-" },
    ala1: { nama: "Pilih", no: "-" },
    ala2: { nama: "Pilih", no: "-" },
    pivot: { nama: "Pilih", no: "-" }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const authHeader = token ? "Bearer " + token : "";
        if (!readOnly) {
          const playersRes = await fetch("/api/pemain", {
            headers: { Authorization: authHeader },
          });
          if (playersRes.ok) {
            const playersData = await playersRes.json();
            setPlayers(playersData);
            
            const playersWithRatings: PlayerWithRating[] = [];
            
            for (const player of playersData) {
              try {
                const prestasiRes = await fetch(`/api/prestasi/pemain/${player.pemainID}`, {
                  headers: { Authorization: authHeader },
                });
                if (prestasiRes.ok) {
                  const prestasiData = await prestasiRes.json();
                  let totalRating = 0;
                  let count = 0;
                  prestasiData.forEach((p: any) => {
                    if (p.skor_perlawanan) {
                      totalRating += p.skor_perlawanan;
                      count++;
                    }
                  });
                  playersWithRatings.push({
                    ...player,
                    rating: count > 0 ? totalRating / count : 0
                  });
                } else {
                  playersWithRatings.push({ ...player, rating: 0 });
                }
              } catch {
                playersWithRatings.push({ ...player, rating: 0 });
              }
            }
            
            setPlayersWithRating(playersWithRatings);
          }
        }

        const matchesRes = await fetch("/api/jadual", {
            headers: { Authorization: authHeader },
        });
        if (matchesRes.ok) {
            const data: Jadual[] = await matchesRes.json();
            setMatches(data);
            if (data.length > 0) setSelectedMatchId(data[0].jadualID);
        }

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [readOnly]);

  useEffect(() => {
    const fetchLineup = async () => {
      try {
        const token = localStorage.getItem("token");
        const authHeader = token ? "Bearer " + token : "";
        const qp = selectedMatchId ? "?jadual_id=" + selectedMatchId : "";
        const lineupRes = await fetch("/api/lineup" + qp, {
          headers: { Authorization: authHeader },
        });
        if (!lineupRes.ok) return;
        const savedData = await lineupRes.json();
        setFormasi("1-2-1");
        if (!savedData || !savedData.pemain_positions) return;
        let positions;
        try {
          positions = typeof savedData.pemain_positions === "string"
            ? JSON.parse(savedData.pemain_positions)
            : savedData.pemain_positions;
        } catch {
          positions = null;
        }
        if (positions) setLineup(positions);
      } catch {}
    };
    fetchLineup();
  }, [selectedMatchId]);

  const selectedMatch = matches.find(m => m.jadualID === selectedMatchId);

  const handlePrint = () => {
    window.print();
  };

  const handlePlayerChange = (pos: string, playerName: string) => {
    setLineup(prev => ({
        ...prev,
        [pos]: { nama: playerName, no: "-" }
    }));
  };

  const handleTerimaCadangan = () => {
    if (readOnly) return;
    const keepers = playersWithRating
      .filter(p => (p.posisi || "").toUpperCase().trim() === "KEEPER")
      .sort((a, b) => b.rating - a.rating);

    const flexibles = playersWithRating
      .filter(p => (p.posisi || "").toUpperCase().trim() === "FLEXIBLE")
      .sort((a, b) => b.rating - a.rating);

    const chosen = new Set<string>();
    const pick = (list: PlayerWithRating[]) => {
      for (const p of list) {
        if (!chosen.has(p.nama)) {
          chosen.add(p.nama);
          return p.nama;
        }
      }
      return "Pilih";
    };

    setLineup({
      gk: { nama: pick(keepers), no: "-" },
      fixo: { nama: pick(flexibles), no: "-" },
      ala1: { nama: pick(flexibles), no: "-" },
      ala2: { nama: pick(flexibles), no: "-" },
      pivot: { nama: pick(flexibles), no: "-" }
    });
    
    alert("Cadangan kesebelasan telah diterima dan dipaparkan!");
  };

  const handleSave = async () => {
      if (readOnly) return;
      try {
          const token = localStorage.getItem("token");
          const authHeader = token ? "Bearer " + token : "";
          const response = await fetch("/api/lineup", {
              method: "POST",
              headers: { 
                  "Content-Type": "application/json",
                  Authorization: authHeader 
              },
              body: JSON.stringify({ formasi, pemain_positions: lineup, jadual_id: selectedMatchId })
          });
          
          if (response.ok) {
            alert("Kesebelasan utama berjaya disimpan!");
          } else {
            alert("Gagal menyimpan lineup.");
          }
      } catch (error) {
          console.error(error);
          alert("Gagal menyimpan.");
      }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border-4 border-gray-800 max-w-6xl mx-auto" id="print-area">
        <div className="bg-gray-800 text-white p-4 flex justify-between items-center rounded-t">
          <h1 className="uppercase">{readOnly ? "Line Up" : "Bina Kesebelasan Utama"}</h1>
          <button onClick={() => setCurrentPage(readOnly ? "player-dashboard" : "coach-dashboard")} className="bg-white text-gray-800 px-4 py-2 rounded hover:bg-gray-100 transition-colors">Kembali</button>
        </div>
        <div className="border-t-2 border-gray-800"></div>
        <div className="p-6 border-b-2 border-gray-800">
          <div className="space-y-4">
            <div>
                 <label className="block font-bold mb-2">Pilih Acara:</label>
                 <select 
                     className="w-full p-2 border-2 border-gray-800 rounded"
                     value={selectedMatchId || ""}
                     onChange={(e) => setSelectedMatchId(Number(e.target.value))}
                 >
                     {matches.map(m => (
                         <option key={m.jadualID} value={m.jadualID}>
                             {m.jenis} - {new Date(m.tarikh).toLocaleDateString()} {m.masa}
                         </option>
                     ))}
                     {matches.length === 0 && <option>Tiada acara direkodkan</option>}
                 </select>
            </div>
            {selectedMatch && (
                <div className="bg-gray-100 p-4 rounded border border-gray-400">
                    <div><strong>Perlawanan:</strong> {selectedMatch.jenis}</div>
                    <div><strong>Tarikh:</strong> {new Date(selectedMatch.tarikh).toLocaleDateString()} | <strong>Masa:</strong> {selectedMatch.masa}</div>
                </div>
            )}
            <div className="flex items-center gap-3">
              <span>Formasi:</span>
              <select 
                value={formasi} 
                onChange={(e) => setFormasi(e.target.value)} 
                className="px-4 py-2 bg-[#F5F5F5] border-2 border-gray-300 rounded focus:outline-none focus:border-gray-500"
                disabled
              >
                <option>1-2-1</option>
              </select>
            </div>
          </div>
        </div>
        <div className="p-6 border-b-2 border-gray-800">
          <h2 className="uppercase mb-6 text-center">Formasi {formasi} {readOnly ? "" : "(Klik untuk pilih pemain)"}</h2>
          <div className="flex flex-col items-center gap-6 bg-green-100 border-2 border-gray-800 rounded p-8">
            
            <div className="text-center">
                <select 
                    className="bg-gray-800 text-white px-6 py-3 rounded border-2 border-gray-600 appearance-none text-center cursor-pointer"
                    onChange={(e) => handlePlayerChange('gk', e.target.value)}
                    value={lineup.gk.nama}
                    disabled={Boolean(readOnly)}
                >
                    <option value="Pilih">[GK] Pilih Pemain</option>
                    {players.filter(p => p.posisi.toUpperCase() === 'KEEPER').map(p => <option key={p.pemainID} value={p.nama}>{p.nama}</option>)}
                    <option disabled>---</option>
                    {players.map(p => <option key={p.pemainID} value={p.nama}>{p.nama} - {p.posisi}</option>)}
                </select>
            </div>

            <div className="border-l-4 border-gray-800 h-8"></div>
            
            <div className="text-center">
                <select 
                    className="bg-gray-800 text-white px-6 py-3 rounded border-2 border-gray-600 appearance-none text-center cursor-pointer"
                    onChange={(e) => handlePlayerChange('fixo', e.target.value)}
                    value={lineup.fixo.nama}
                    disabled={Boolean(readOnly)}
                >
                    <option value="Pilih">[FIXO] Pilih Pemain</option>
                    {players.filter(p => p.posisi.toUpperCase() === 'FLEXIBLE').map(p => <option key={p.pemainID} value={p.nama}>{p.nama}</option>)}
                    <option disabled>---</option>
                    {players.map(p => <option key={p.pemainID} value={p.nama}>{p.nama} - {p.posisi}</option>)}
                </select>
            </div>

            <div className="flex gap-8"><div className="border-l-4 border-gray-800 h-8"></div><div className="border-l-4 border-gray-800 h-8"></div></div>
            
            <div className="flex gap-8">
                <select 
                    className="bg-gray-800 text-white px-6 py-3 rounded border-2 border-gray-600 appearance-none text-center cursor-pointer w-48"
                    onChange={(e) => handlePlayerChange('ala1', e.target.value)}
                    value={lineup.ala1.nama}
                    disabled={Boolean(readOnly)}
                >
                    <option value="Pilih">[ALA Kiri]</option>
                    {players.filter(p => p.posisi.toUpperCase() === 'FLEXIBLE').map(p => <option key={p.pemainID} value={p.nama}>{p.nama}</option>)}
                    <option disabled>---</option>
                    {players.map(p => <option key={p.pemainID} value={p.nama}>{p.nama} - {p.posisi}</option>)}
                </select>

                <select 
                    className="bg-gray-800 text-white px-6 py-3 rounded border-2 border-gray-600 appearance-none text-center cursor-pointer w-48"
                    onChange={(e) => handlePlayerChange('ala2', e.target.value)}
                    value={lineup.ala2.nama}
                    disabled={Boolean(readOnly)}
                >
                    <option value="Pilih">[ALA Kanan]</option>
                    {players.filter(p => p.posisi.toUpperCase() === 'FLEXIBLE').map(p => <option key={p.pemainID} value={p.nama}>{p.nama}</option>)}
                    <option disabled>---</option>
                    {players.map(p => <option key={p.pemainID} value={p.nama}>{p.nama} - {p.posisi}</option>)}
                </select>
            </div>

            <div className="flex gap-8"><div className="border-l-4 border-gray-800 h-8"></div><div className="border-l-4 border-gray-800 h-8"></div></div>
            
            <div className="text-center">
                 <select 
                    className="bg-gray-800 text-white px-6 py-3 rounded border-2 border-gray-600 appearance-none text-center cursor-pointer"
                    onChange={(e) => handlePlayerChange('pivot', e.target.value)}
                    value={lineup.pivot.nama}
                    disabled={Boolean(readOnly)}
                >
                    <option value="Pilih">[PIVOT] Pilih Pemain</option>
                    {players.filter(p => p.posisi.toUpperCase() === 'FLEXIBLE').map(p => <option key={p.pemainID} value={p.nama}>{p.nama}</option>)}
                    <option disabled>---</option>
                    {players.map(p => <option key={p.pemainID} value={p.nama}>{p.nama} - {p.posisi}</option>)}
                </select>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-3">
            {!readOnly && (
              <button className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors uppercase" onClick={handleTerimaCadangan}>Terima Cadangan</button>
            )}
            {!readOnly && (
              <button className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors uppercase" onClick={handleSave}>Simpan</button>
            )}
            <button className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors uppercase" onClick={handlePrint}>Cetak</button>
          </div>
        </div>
    </div>
  );
}
