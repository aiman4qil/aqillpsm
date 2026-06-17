import { useEffect, useState } from "react";
import { LoginPage } from "./pages/LoginPage";
import { AdminDashboard } from "./pages/AdminDashboard";
import { CoachDashboard } from "./pages/CoachDashboard";
import { PlayerDashboard } from "./pages/PlayerDashboard";
import { MaklumatPemain } from "./pages/MaklumatPemain";
import { StatistikPerlawanan } from "./pages/StatistikPerlawanan";
import { KehadiranLatihan } from "./pages/KehadiranLatihan";
import { JadualAktiviti } from "./pages/JadualAktiviti";
import { Pengumuman } from "./pages/Pengumuman";
import { AnalisisPrestasi } from "./pages/AnalisisPrestasi";
import { PenilaianPemain } from "./pages/PenilaianPemain";
import { KesebelasanUtama } from "./pages/KesebelasanUtama";
import { PengurusanLatihan } from "./pages/PengurusanLatihan";
import { StatistikPemainCoach } from "./pages/StatistikPemainCoach";
import { ProfilSaya } from "./pages/ProfilSaya";
import { JadualSaya } from "./pages/JadualSaya";
import { PrestasiSaya } from "./pages/PrestasiSaya";
import { PengumumanPemain } from "./pages/PengumumanPemain";
import { HantarTugasan } from "./pages/HantarTugasan";
import { DaftarPage } from "./pages/DaftarPage";

export default function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Pentadbir");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authPage, setAuthPage] = useState<"login" | "signup">("login");
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [me, setMe] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]);
  const [matchResult, setMatchResult] = useState("");
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [selectedPlayerForRating, setSelectedPlayerForRating] = useState("Ali bin Abu");
  const [ratings, setRatings] = useState({
    teknikal: 8,
    fizikal: 9,
    taktikal: 6,
    mental: 10,
  });
  const [ratingComment, setRatingComment] = useState("Pemain menunjukkan peningkatan dalam...");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (window.innerWidth < 768) setIsSidebarCollapsed(true);
  }, []);
  
  // Attendance state
  const [attendanceRecords, setAttendanceRecords] = useState([
    { id: 1, nama: 'Ali', status: 'hadir', catatan: '' },
    { id: 2, nama: 'Ahmad', status: 'tidak', catatan: 'Sakit' },
    { id: 3, nama: 'Abu', status: 'hadir', catatan: '' },
    { id: 4, nama: 'Bakar', status: 'cuti', catatan: 'Keluarga' },
  ]);

  // Schedule state
  const [currentMonth, setCurrentMonth] = useState('Mei 2025');
  const [scheduleEvents, setScheduleEvents] = useState([
    { id: 1, hari: 'Mon', tarikh: '15/5', aktiviti: 'Latihan Taktikal', masa: '5:00 PM', lokasi: 'Stadium UTHM' },
    { id: 2, hari: 'Wed', tarikh: '17/5', aktiviti: 'Latihan Kecergasan', masa: '6:00 PM', lokasi: 'Stadium UTHM' },
    { id: 3, hari: 'Sat', tarikh: '20/5', aktiviti: 'Perlawanan vs UTM FC', masa: '4:00 PM', lokasi: 'Stadium UTM' },
    { id: 4, hari: 'Mon', tarikh: '22/5', aktiviti: 'Latihan Teknikal', masa: '5:00 PM', lokasi: 'Stadium UTHM' },
  ]);
  
  // Announcement state
  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      tajuk: 'MESYUARAT PASUKAN',
      pengirim: 'Admin',
      tarikh: '14/5/2025 10:00 AM',
      kandungan: 'Semua pemain diwajibkan hadir mesyuarat pasukan pada 16/5/2025 jam 8:00 malam di Bilik Mesyuarat Kelab.'
    },
    {
      id: 2,
      tajuk: 'PERLAWANAN VS UTM FC',
      pengirim: 'Jurulatih',
      tarikh: '13/5/2025 3:00 PM',
      kandungan: 'Perlawanan liga menentang UTM FC pada 20/5/2025 jam 4:00 petang. Sila hadir 1 jam awal.'
    }
  ]);

  // Form states
  const [newEventForm, setNewEventForm] = useState({
    jenis: 'Latihan',
    tajuk: '',
    tarikh: '',
    masa: '',
    lokasi: '',
    objektif: '',
    penerangan: ''
  });

  const [newAnnouncementForm, setNewAnnouncementForm] = useState({
    kepada: 'Semua Pemain',
    tajuk: '',
    kandungan: '',
    hantar: 'Admin'
  });

  // Lineup state
  const [formasi, setFormasi] = useState('2-2');
  const [lineup, setLineup] = useState({
    gk: { nama: 'AHMAD', no: 1 },
    fixo: { nama: 'ALI', no: 4 },
    ala1: { nama: 'CHONG', no: 7 },
    ala2: { nama: 'KUMAR', no: 8 },
    pivot: { nama: 'DAMAR', no: 9 }
  });

  const [availablePlayers] = useState([
    { posisi: 'GK', nama: 'ZAINAL', no: 12, rating: 8.5 },
    { posisi: 'FIXO', nama: 'BAKAR', no: 5, rating: 8.7 },
    { posisi: 'ALA', nama: 'FARIS', no: 10, rating: 8.3 },
    { posisi: 'PIVOT', nama: 'HAZIQ', no: 11, rating: 8.4 },
  ]);

  // Player profile state
  const [playerProfile] = useState({
    nama: 'ALI BIN ABU',
    matrik: 'DI230001',
    telefon: '012-3456789',
    email: 'ali@uthm.edu.my',
    tarikhLahir: '15/3/2003',
    noJersi: '4',
    posisi: 'Fixo',
    kaki: 'Kanan',
    tinggi: '175',
    berat: '68',
    tarikhSertai: '1/1/2024'
  });

  const players = [
    { id: 1, nama: "Ali bin Ahmad", matrik: "DI230001", posisi: "Fixo" },
    { id: 2, nama: "Ahmad Zaki", matrik: "DI230002", posisi: "GK" },
    { id: 3, nama: "Abu Bakar", matrik: "DI230003", posisi: "Ala" },
  ];

  const matchPlayers = [
    { id: 1, nama: "Ali", gol: 1, asst: 0, kuning: 0, merah: 0 },
    { id: 2, nama: "Ahmad", gol: 0, asst: 1, kuning: 1, merah: 0 },
    { id: 3, nama: "Abu", gol: 2, asst: 0, kuning: 0, merah: 0 },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const envBase = (import.meta as any).env?.VITE_API_BASE as string | undefined;
      const isDev = Boolean((import.meta as any).env?.DEV);
      const resolvedEnvBase = envBase ? String(envBase).replace(/\/+$/, "") : "";
      const hostname = window.location.hostname;
      const backendHostBase = `${window.location.protocol}//${hostname}:3002`;

      const loginCandidates = [
        ...(resolvedEnvBase ? [resolvedEnvBase + "/api/login"] : []),
        "/api/login",
        backendHostBase + "/api/login",
      ];

      const requestBody = JSON.stringify({ username, password, role: role === "Admin" ? "Pentadbir" : role });
      let response: Response | null = null;
      let lastError: unknown = null;

      for (const url of loginCandidates) {
        try {
          const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: requestBody,
          });
          if (res.status === 404 || res.status === 502 || res.status === 503 || res.status === 504) {
            continue;
          }
          response = res;
          break;
        } catch (err) {
          lastError = err;
        }
      }

      if (!response) {
        throw lastError || new Error("Login request failed");
      }

      let data: any = null;
      let rawText = "";
      try {
        rawText = await response.text();
        data = rawText ? JSON.parse(rawText) : null;
      } catch {
        data = null;
      }

      if (response.ok) {
        if (!data?.token) {
          alert("Log masuk gagal. Respons server tidak sah.");
          return;
        }
        localStorage.setItem("token", data.token);
        const normalizedRole = data.role === "Admin" ? "Pentadbir" : data.role;
        setRole(normalizedRole);
        if (data?.username || data?.userId || data?.profile) {
          const nextMe = {
            userId: data?.userId,
            username: data?.username,
            role: normalizedRole,
            profile: data?.profile || null,
          };
          setMe(nextMe);
          localStorage.setItem("me", JSON.stringify(nextMe));
        } else {
          try {
            const token = data.token;
            const hostname = window.location.hostname;
            const backendHostBase = `${window.location.protocol}//${hostname}:3002`;
            const candidates = ["/api/me", backendHostBase + "/api/me"];
            let meRes: Response | null = null;
            for (const url of candidates) {
              try {
                const r = await fetch(url, { headers: { Authorization: "Bearer " + token } });
                if (!r.ok) continue;
                meRes = r;
                break;
              } catch {}
            }
            if (meRes) {
              const meJson = await meRes.json();
              setMe(meJson);
              localStorage.setItem("me", JSON.stringify(meJson));
            }
          } catch {}
        }
        if (normalizedRole === "Jurulatih") {
          setCurrentPage("coach-dashboard");
        } else if (normalizedRole === "Pemain") {
          setCurrentPage("player-dashboard");
        } else {
          setCurrentPage("dashboard");
        }
        setIsLoggedIn(true);
      } else {
        const serverMessage = data?.message
          ? String(data.message)
          : (response.status >= 500
              ? `Backend tak jalan / bermasalah. Sila hidupkan server: node server/index.js (http://${window.location.hostname}:3002)`
              : "Log masuk gagal.");
        alert(`Ralat: ${serverMessage}`);
      }
    } catch (error) {
      console.error("Ralat log masuk:", error);
      alert(`Log masuk gagal. Pastikan sistem dibuka di ${window.location.origin} dan server backend berjalan di http://${window.location.hostname}:3002.`);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername("");
    setPassword("");
    setAuthPage("login");
    setCurrentPage("dashboard");
    setMe(null);
  };

  const togglePlayerSelection = (id: number) => {
    setSelectedPlayers((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  if (!isLoggedIn) {
    if (authPage === "signup") {
      return <DaftarPage onShowLogin={() => setAuthPage("login")} />;
    }
    return (
      <LoginPage
        username={username}
        setUsername={setUsername}
        password={password}
        setPassword={setPassword}
        role={role}
        setRole={setRole}
        handleSubmit={handleSubmit}
        onShowSignup={() => setAuthPage("signup")}
      />
    );
  }

  // Routing untuk semua halaman
  const pageProps = { setCurrentPage, handleLogout, role };

  const navItems =
    role === "Jurulatih"
      ? [
          { id: "coach-dashboard", label: "Home" },
          { id: "jadual-aktiviti", label: "Match Schedule" },
          { id: "pengurusan-latihan", label: "Training Schedule" },
          { id: "kehadiran-latihan", label: "Attendance" },
          { id: "kesebelasan-utama", label: "Line Up" },
          { id: "statistik-perlawanan", label: "Match Statistics" },
          { id: "statistik-pemain-coach", label: "Player Statistics" },
          { id: "analisis-prestasi", label: "Performance Analysis" },
          { id: "penilaian-pemain", label: "Player Evaluation" }
        ]
      : role === "Pemain"
        ? [
            { id: "player-dashboard", label: "Home" },
            { id: "profil-saya", label: "Profile" },
            { id: "jadual-saya", label: "Match Schedule" },
            { id: "prestasi-saya", label: "Performance" },
            { id: "pengumuman-pemain", label: "Announcements" },
            { id: "kesebelasan-utama", label: "Line Up" },
            { id: "hantar-tugasan", label: "Submit Task" }
          ]
        : [
            { id: "dashboard", label: "Home" },
            { id: "maklumat-pemain", label: "Players" },
            { id: "jadual-aktiviti", label: "Match Schedule" },
            { id: "pengumuman", label: "Announcements" },
            { id: "kehadiran-latihan", label: "Attendance" },
            { id: "statistik-perlawanan", label: "Statistics" },
            { id: "laporan", label: "Reports" }
          ];

  const Icon = ({ id }: { id: string }) => {
    const commonStyle: React.CSSProperties = { width: 18, height: 18, color: "#ffffff", opacity: 0.95, flex: "0 0 auto" };
    if (id === "dashboard" || id === "coach-dashboard" || id === "player-dashboard") {
      return (
        <svg style={commonStyle} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 10.5L12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      );
    }
    if (id.includes("jadual")) {
      return (
        <svg style={commonStyle} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M7 3v3M17 3v3M4 8h16M6 5h12a2 2 0 0 1 2 2v14H4V7a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    }
    if (id === "pengurusan-latihan") {
      return (
        <svg style={commonStyle} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M6 9v6M18 9v6M4 10h2v4H4a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1Zm16 0h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2v-4ZM8 9h8v6H8V9Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      );
    }
    if (id === "kehadiran-latihan") {
      return (
        <svg style={commonStyle} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    }
    if (id === "maklumat-pemain") {
      return (
        <svg style={commonStyle} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" strokeWidth="2" />
          <path d="M22 21v-2a3 3 0 0 0-2-2.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M17 3a4 4 0 0 1 0 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    }
    if (id.includes("pengumuman")) {
      return (
        <svg style={commonStyle} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M3 11v2a2 2 0 0 0 2 2h2l5 4V7L7 11H5a2 2 0 0 0-2 0Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <path d="M16 9a4 4 0 0 1 0 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M19 7a7 7 0 0 1 0 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    }
    if (id.includes("statistik")) {
      return (
        <svg style={commonStyle} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 19V5M4 19h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M8 17V9M12 17V7M16 17v-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    }
    if (id === "analisis-prestasi") {
      return (
        <svg style={commonStyle} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M10 6h10M10 12h10M10 18h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M4 7h2M4 13h2M4 19h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    }
    if (id === "penilaian-pemain") {
      return (
        <svg style={commonStyle} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 4h16v16H4V4Z" stroke="currentColor" strokeWidth="2" />
          <path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    }
    if (id === "kesebelasan-utama") {
      return (
        <svg style={commonStyle} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 4h16v16H4V4Z" stroke="currentColor" strokeWidth="2" />
          <path d="M12 4v16M4 12h16" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    }
    if (id === "profil-saya") {
      return (
        <svg style={commonStyle} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    }
    if (id === "prestasi-saya") {
      return (
        <svg style={commonStyle} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="m12 3 3 6 6 .9-4.5 4.4 1.1 6.2L12 17.8 6.4 20.5l1.1-6.2L3 9.9 9 9l3-6Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      );
    }
    if (id === "hantar-tugasan") {
      return (
        <svg style={commonStyle} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 19V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="m5 12 7-7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    }
    return (
      <svg style={commonStyle} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  };

  const resolveActive = (id: string) => {
    if (id === "dashboard") return currentPage === "dashboard";
    return currentPage === id;
  };

  const renderPage = () => {
    if (currentPage === "kesebelasan-utama" && role !== "Jurulatih" && role !== "Pemain") {
      return (
        <div style={{ background: "#fff", border: "2px solid #111827", borderRadius: 12, padding: 18, maxWidth: 720 }}>
          <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 8 }}>Akses Ditolak</div>
          <div style={{ color: "#374151", marginBottom: 14 }}>Modul Bina Kesebelasan Utama hanya untuk Jurulatih.</div>
          <button
            type="button"
            onClick={() => setCurrentPage(role === "Pemain" ? "player-dashboard" : "dashboard")}
            style={{ padding: "10px 14px", borderRadius: 10, border: "none", background: "#111827", color: "#fff", fontWeight: 800, cursor: "pointer" }}
          >
            Kembali
          </button>
        </div>
      );
    }
    if (currentPage === "laporan" && role !== "Pentadbir") {
      return (
        <div style={{ background: "#fff", border: "2px solid #111827", borderRadius: 12, padding: 18, maxWidth: 720 }}>
          <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 8 }}>Akses Ditolak</div>
          <div style={{ color: "#374151", marginBottom: 14 }}>Modul Reports hanya untuk Pentadbir.</div>
          <button
            type="button"
            onClick={() => setCurrentPage(role === "Jurulatih" ? "coach-dashboard" : "player-dashboard")}
            style={{ padding: "10px 14px", borderRadius: 10, border: "none", background: "#111827", color: "#fff", fontWeight: 800, cursor: "pointer" }}
          >
            Kembali
          </button>
        </div>
      );
    }
    switch (currentPage) {
      case "dashboard":
        return <AdminDashboard {...pageProps} />;

      case "maklumat-pemain":
        return <MaklumatPemain {...pageProps} />;
      
      case "statistik-perlawanan":
        return <StatistikPerlawanan {...pageProps} />;
      
      case "kehadiran-latihan":
        return <KehadiranLatihan {...pageProps} />;
      
      case "jadual-aktiviti":
        return <JadualAktiviti {...pageProps} role={role} />;
      
      case "pengumuman":
        return <Pengumuman {...pageProps} />;
      
      case "analisis-prestasi":
        return <AnalisisPrestasi {...pageProps} />;
      
      case "penilaian-pemain":
        return <PenilaianPemain {...pageProps} selectedPlayerForRating={selectedPlayerForRating} setSelectedPlayerForRating={setSelectedPlayerForRating} ratings={ratings} setRatings={setRatings} ratingComment={ratingComment} setRatingComment={setRatingComment} />;
      
      case "kesebelasan-utama":
        return <KesebelasanUtama {...pageProps} readOnly={role === "Pemain"} />;

      case "laporan":
        return (
          <div style={{ background: "#fff", border: "2px solid #111827", borderRadius: 12, padding: 18, maxWidth: 980 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
              <div style={{ fontSize: 18, fontWeight: 900 }}>Report Center (Pentadbir)</div>
              <button
                type="button"
                onClick={() => setCurrentPage("dashboard")}
                style={{ padding: "10px 14px", borderRadius: 10, border: "none", background: "#111827", color: "#fff", fontWeight: 800, cursor: "pointer" }}
              >
                Kembali
              </button>
            </div>

            <div style={{ color: "#374151", marginBottom: 16 }}>
              Jana laporan dalam format CSV (boleh terus buka dalam Excel).
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
              <button
                type="button"
                onClick={async () => {
                  const token = localStorage.getItem("token") || "";
                  const headers: any = token ? { Authorization: "Bearer " + token } : {};
                  const res = await fetch("/api/pemain", { headers });
                  const data = res.ok ? await res.json() : [];
                  const headersRow = ["pemainID", "username", "nama", "posisi"];
                  const rows = Array.isArray(data) ? data.map((r: any) => headersRow.map(h => String(r?.[h] ?? ""))) : [];
                  const csv = [headersRow.join(","), ...rows.map((r: string[]) => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))].join("\n");
                  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "report_pemain.csv";
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
                style={{ padding: "12px 14px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#f9fafb", cursor: "pointer", fontWeight: 800, textAlign: "left" }}
              >
                Export Pemain (CSV)
              </button>

              <button
                type="button"
                onClick={async () => {
                  const token = localStorage.getItem("token") || "";
                  const headers: any = token ? { Authorization: "Bearer " + token } : {};
                  const res = await fetch("/api/jadual", { headers });
                  const data = res.ok ? await res.json() : [];
                  const headersRow = ["jadualID", "jenis", "tarikh", "masa", "lokasi", "keterangan"];
                  const rows = Array.isArray(data) ? data.map((r: any) => headersRow.map(h => String(r?.[h] ?? ""))) : [];
                  const csv = [headersRow.join(","), ...rows.map((r: string[]) => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))].join("\n");
                  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "report_jadual.csv";
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
                style={{ padding: "12px 14px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#f9fafb", cursor: "pointer", fontWeight: 800, textAlign: "left" }}
              >
                Export Jadual (CSV)
              </button>

              <button
                type="button"
                onClick={async () => {
                  const token = localStorage.getItem("token") || "";
                  const headers: any = token ? { Authorization: "Bearer " + token } : {};
                  const res = await fetch("/api/pengumuman", { headers });
                  const data = res.ok ? await res.json() : [];
                  const headersRow = ["pengumumanID", "tajuk", "kandungan", "tarikh_dibuat"];
                  const rows = Array.isArray(data) ? data.map((r: any) => headersRow.map(h => String(r?.[h] ?? ""))) : [];
                  const csv = [headersRow.join(","), ...rows.map((r: string[]) => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))].join("\n");
                  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "report_pengumuman.csv";
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
                style={{ padding: "12px 14px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#f9fafb", cursor: "pointer", fontWeight: 800, textAlign: "left" }}
              >
                Export Pengumuman (CSV)
              </button>

              <button
                type="button"
                onClick={async () => {
                  const token = localStorage.getItem("token") || "";
                  const headers: any = token ? { Authorization: "Bearer " + token } : {};
                  const res = await fetch("/api/kehadiran", { headers });
                  const data = res.ok ? await res.json() : [];
                  const headersRow = ["jadual_id", "tarikh", "pemainID", "status", "catatan"];
                  const rows = Array.isArray(data) ? data.map((r: any) => headersRow.map(h => String(r?.[h] ?? ""))) : [];
                  const csv = [headersRow.join(","), ...rows.map((r: string[]) => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))].join("\n");
                  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "report_kehadiran.csv";
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
                style={{ padding: "12px 14px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#f9fafb", cursor: "pointer", fontWeight: 800, textAlign: "left" }}
              >
                Export Kehadiran (CSV)
              </button>

              <button
                type="button"
                onClick={async () => {
                  const token = localStorage.getItem("token") || "";
                  const headers: any = token ? { Authorization: "Bearer " + token } : {};
                  const res = await fetch("/api/lineup", { headers });
                  const data = res.ok ? await res.json() : {};
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8;" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "report_lineup.json";
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
                style={{ padding: "12px 14px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#f9fafb", cursor: "pointer", fontWeight: 800, textAlign: "left" }}
              >
                Export Line Up (JSON)
              </button>
            </div>
          </div>
        );
      
      case "pengurusan-latihan":
        return <PengurusanLatihan {...pageProps} />;
      
      case "statistik-pemain-coach":
        return <StatistikPemainCoach {...pageProps} />;
      
      case "profil-saya":
        return <ProfilSaya {...pageProps} playerProfile={me?.profile} />;
      
      case "jadual-saya":
        return <JadualSaya {...pageProps} />;
      
      case "prestasi-saya":
        return <PrestasiSaya {...pageProps} />;
      
      case "pengumuman-pemain":
        return <PengumumanPemain {...pageProps} />;
      
      case "hantar-tugasan":
        return <HantarTugasan {...pageProps} />;

      case "tambah-pemain":
        return (
          <DaftarPage
            isAdminAdd={true}
            onBack={() => setCurrentPage("maklumat-pemain")}
          />
        );

      case "tambah-jurulatih":
        return (
          <DaftarPage
            isAdminAdd={true}
            createRole="Jurulatih"
            onBack={() => setCurrentPage("maklumat-pemain")}
          />
        );
      
      case "coach-dashboard":
        return <CoachDashboard {...pageProps} />;
      
      case "player-dashboard":
        return <PlayerDashboard {...pageProps} />;
      
      default:
        return <AdminDashboard {...pageProps} />;
    }
  };

  const pageTitleMap: Record<string, string> = navItems.reduce((acc, item) => {
    acc[item.id] = item.label;
    return acc;
  }, {} as Record<string, string>);
  const headerTitle = currentPage === "pengurusan-latihan" ? "Training Schedule Management" : (pageTitleMap[currentPage] || "Dashboard");

  const sidebarGradient =
    role === "Jurulatih"
      ? "linear-gradient(180deg, #0b4a78 0%, #083a63 50%, #062c4b 100%)"
      : role === "Pentadbir"
        ? "linear-gradient(180deg, #111827 0%, #0f172a 55%, #0b1220 100%)"
        : "linear-gradient(180deg, #0b4a78 0%, #083a63 50%, #062c4b 100%)";
  const brandColor = role === "Pentadbir" ? "#111827" : "#0b4a78";

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "linear-gradient(135deg, #eaf2fb 0%, #d6e8ff 100%)" }}>
      <aside
        style={{
          width: isSidebarCollapsed ? 80 : 288,
          color: "#ffffff",
          display: "flex",
          flexDirection: "column",
          background: sidebarGradient,
          boxShadow: "0 16px 30px rgba(0,0,0,.18)"
        }}
      >
        <div style={{ padding: isSidebarCollapsed ? "24px 12px 18px" : "24px 20px 18px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: isSidebarCollapsed ? "center" : "flex-start", gap: isSidebarCollapsed ? 0 : 14 }}>
            <div style={{ width: 56, height: 56, borderRadius: 999, background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg style={{ width: 30, height: 30, color: "#0b4a78" }} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M20 21v-1a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
            {!isSidebarCollapsed && (
              <div style={{ lineHeight: 1.15 }}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.8, opacity: 0.92 }}>
                  {role === "Pentadbir" ? "SELAMAT DATANG" : "WELCOME"}
                </div>
                <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: 0.6 }}>
                  {role === "Pemain" ? (me?.profile?.nama || me?.username || role.toUpperCase()) : role.toUpperCase()}
                </div>
                {role === "Pemain" && (me?.profile?.no_matrik || me?.profile?.no_jersi || me?.profile?.posisi !== undefined) && (
                  <div style={{ marginTop: 6, fontSize: 12, opacity: 0.92 }}>
                    {(me?.profile?.no_matrik ? `Matrik: ${me.profile.no_matrik}` : "")}
                    {(me?.profile?.no_jersi ? `${me?.profile?.no_matrik ? " • " : ""}Jersi: ${me.profile.no_jersi}` : "")}
                    {(me?.profile?.posisi !== undefined && me?.profile?.posisi !== null
                      ? `${(me?.profile?.no_matrik || me?.profile?.no_jersi) ? " • " : ""}Posisi: ${String(me.profile.posisi)}`
                      : "")}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <nav style={{ flex: 1, overflowY: "auto", padding: isSidebarCollapsed ? "0 10px" : "0 14px" }}>
          {navItems.map((item) => {
            const active = resolveActive(item.id);
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: isSidebarCollapsed ? "center" : "flex-start",
                  gap: isSidebarCollapsed ? 0 : 12,
                  padding: isSidebarCollapsed ? "12px 0" : "12px 14px",
                  marginBottom: 8,
                  borderRadius: 10,
                  border: "none",
                  background: active ? "#1e67a5" : "transparent",
                  color: "#ffffff",
                  cursor: "pointer"
                }}
              >
                <Icon id={item.id} />
                {!isSidebarCollapsed && <span style={{ fontSize: 13, fontWeight: 700 }}>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div style={{ padding: isSidebarCollapsed ? "14px 10px 18px" : "14px 14px 18px" }}>
          <button
            onClick={function() { localStorage.removeItem("token"); localStorage.removeItem("me"); handleLogout(); }}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: isSidebarCollapsed ? 0 : 8,
              padding: isSidebarCollapsed ? "12px 0" : "12px 14px",
              borderRadius: 10,
              border: "none",
              background: "#dc2626",
              color: "#ffffff",
              fontWeight: 800,
              cursor: "pointer"
            }}
          >
            <svg style={{ width: 16, height: 16, color: "#ffffff" }} viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M10 17l5-5-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M15 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M21 3h-6a2 2 0 0 0-2 2v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M13 15v4a2 2 0 0 0 2 2h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            {!isSidebarCollapsed && <span style={{ fontSize: 14 }}>Logout</span>}
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, minWidth: 0, overflow: "auto" }}>
        <div style={{ position: "sticky", top: 0, zIndex: 10, background: "rgba(255,255,255,0.92)", borderBottom: "1px solid #e5e7eb" }}>
          <div style={{ padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, minWidth: 0 }}>
              <button
                type="button"
                onClick={() => setIsSidebarCollapsed(v => !v)}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  border: "none",
                  background: brandColor,
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer"
                }}
                aria-label="Toggle menu"
              >
                <svg style={{ width: 20, height: 20, color: "#ffffff" }} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                <svg style={{ width: 24, height: 24, color: brandColor }} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6 10h12M6 14h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M4 6h16v12H4V6Z" stroke="currentColor" strokeWidth="2" />
                </svg>
                <h1 style={{ fontSize: 22, fontWeight: 900, color: brandColor, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {headerTitle}
                </h1>
              </div>
            </div>

            {currentPage === "pengurusan-latihan" && (
              <button
                type="button"
                onClick={() => setCurrentPage("jadual-aktiviti")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "none",
                  background: "#16a34a",
                  color: "#ffffff",
                  fontWeight: 800,
                  cursor: "pointer"
                }}
              >
                <span style={{ fontSize: 18, lineHeight: 1 }}>+</span>
                <span style={{ fontSize: 14 }}>Add Training</span>
              </button>
            )}
          </div>
        </div>

        <div style={{ padding: "24px" }}>
          {renderPage()}
        </div>
      </main>
    </div>
  );
}
