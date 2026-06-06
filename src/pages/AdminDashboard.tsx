import { useEffect, useState } from "react";

interface AdminDashboardProps {
  setCurrentPage: (page: string) => void;
  handleLogout: () => void;
}

interface Stats {
  totalPemain: number;
  totalPerlawanan: number;
  totalLatihan: number;
}

interface Activity {
  id: string;
  tarikh: string;
  keterangan: string;
}

export function AdminDashboard({ setCurrentPage, handleLogout }: AdminDashboardProps) {
  const [stats, setStats] = useState<Stats>({ totalPemain: 0, totalPerlawanan: 0, totalLatihan: 0 });
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: token ? "Bearer " + token : "" };

        const [pemainRes, jadualRes, pengumumanRes] = await Promise.all([
          fetch("/api/pemain", { headers }),
          fetch("/api/jadual", { headers }),
          fetch("/api/pengumuman", { headers }),
        ]);

        // Process stats
        if (pemainRes.ok) {
          const pemainData = await pemainRes.json();
          setStats(prev => ({ ...prev, totalPemain: pemainData.length }));
        }
        if (jadualRes.ok) {
          const jadualData = await jadualRes.json();
          const totalPerlawanan = jadualData.filter((j: any) => {
            const kat = String(j?.kategori || "").toUpperCase();
            if (kat) return kat === "PERLAWANAN";
            return String(j?.jenis || "").toLowerCase().includes("perlaw");
          }).length;
          const totalLatihan = jadualData.filter((j: any) => {
            const kat = String(j?.kategori || "").toUpperCase();
            if (kat) return kat === "LATIHAN";
            return String(j?.jenis || "").toLowerCase().includes("latih");
          }).length;
          setStats(prev => ({ ...prev, totalPerlawanan, totalLatihan }));
          
          // Process recent activities from jadual
          const jadualActivities: Activity[] = jadualData.map((j: any) => ({
            id: "jadual-" + j.jadualID,
            tarikh: j.tarikh,
            keterangan: String(j.jenis) + ": " + String(j.keterangan)
          }));
          
          // Process recent activities from pengumuman
          if (pengumumanRes.ok) {
            const pengumumanData = await pengumumanRes.json();
            const pengumumanActivities: Activity[] = pengumumanData.map((p: any) => ({
              id: "pengumuman-" + p.pengumumanID,
              tarikh: p.tarikh_dibuat,
              keterangan: "Pengumuman: " + String(p.tajuk)
            }));
            
            // Combine, sort, and slice activities
            const allActivities = [...jadualActivities, ...pengumumanActivities]
              .sort((a, b) => new Date(b.tarikh).getTime() - new Date(a.tarikh).getTime())
              .slice(0, 3);
            setActivities(allActivities);
          }
        }
      } catch (error) {
        console.error("Ralat mendapatkan data papan pemuka admin:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-lg border-4 border-gray-800 max-w-6xl mx-auto">
      <div className="bg-[#60a5fa] text-black p-4 flex justify-start items-center rounded-t">
        <h1 className="uppercase">Selamat Datang, Admin</h1>
      </div>

      <div className="border-t-2 border-gray-800" />

      <div className="p-6 border-b-2 border-gray-800">
        <h2 className="uppercase mb-4">Statistik Ringkas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-100 border-2 border-gray-800 rounded p-6 text-center">
            <div className="mb-2">Jumlah Pemain:</div>
            <div className="text-3xl">{stats.totalPemain}</div>
          </div>
          <div className="bg-gray-100 border-2 border-gray-800 rounded p-6 text-center">
            <div className="mb-2">Perlawanan:</div>
            <div className="text-3xl">{stats.totalPerlawanan}</div>
          </div>
          <div className="bg-gray-100 border-2 border-gray-800 rounded p-6 text-center">
            <div className="mb-2">Latihan:</div>
            <div className="text-3xl">{stats.totalLatihan}</div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <h2 className="uppercase mb-4">Aktiviti Terkini</h2>
        <div className="space-y-3">
          {activities.length > 0 ? (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-2">
                <span className="text-xl">•</span>
                <span>
                  {new Date(activity.tarikh).toLocaleDateString("ms-MY", { day: "2-digit", month: "numeric", year: "numeric" })}
                  {": "}
                  {activity.keterangan}
                </span>
              </div>
            ))
          ) : (
            <p>Tiada aktiviti terkini.</p>
          )}
        </div>
      </div>
    </div>
  );
}
