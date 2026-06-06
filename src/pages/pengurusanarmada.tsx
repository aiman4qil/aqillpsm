import { useState } from "react";
import { LoginPage } from "./LoginPage";
import { AdminDashboard } from "./AdminDashboard";
import { CoachDashboard } from "./CoachDashboard";
import { PlayerDashboard } from "./PlayerDashboard";
import { MaklumatPemain } from "./MaklumatPemain";
import { StatistikPerlawanan } from "./StatistikPerlawanan";
import { KehadiranLatihan } from "./KehadiranLatihan";
import { JadualAktiviti } from "./JadualAktiviti";
import { Pengumuman } from "./Pengumuman";
import { AnalisisPrestasi } from "./AnalisisPrestasi";
import { PenilaianPemain } from "./PenilaianPemain";
import { KesebelasanUtama } from "./KesebelasanUtama";
import { PengurusanLatihan } from "./PengurusanLatihan";
import { StatistikPemainCoach } from "./StatistikPemainCoach";
import { ProfilSaya } from "./ProfilSaya";
import { JadualSaya } from "./JadualSaya";
import { PrestasiSaya } from "./PrestasiSaya";
import { PengumumanPemain } from "./PengumumanPemain";
import { HantarTugasan } from "./HantarTugasan";
import { DaftarPage } from "./DaftarPage";

export default function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Pentadbir");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authPage, setAuthPage] = useState<"login" | "signup">("login");
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
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

  // Training sessions state
  const [trainingSessions] = useState([
    { id: 1, tarikh: '15/5', masa: '5:00 PM', jenis: 'LATIHAN TAKTIKAL', lokasi: 'Stadium UTHM', hadir: 12, total: 15, status: 'SELESAI' },
    { id: 2, tarikh: '17/5', masa: '6:00 PM', jenis: 'LATIHAN KECERGASAN', lokasi: 'Stadium UTHM', hadir: 15, total: 15, status: 'SELESAI' },
    { id: 3, tarikh: '22/5', masa: '5:00 PM', jenis: 'LATIHAN TEKNIKAL', lokasi: 'Stadium UTHM', hadir: 10, total: 15, status: 'SELESAI' },
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

  switch (currentPage) {
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
      if (role !== "Jurulatih" && role !== "Pemain") {
        return (
          <div className="bg-white rounded-lg shadow-lg border-4 border-gray-800 max-w-2xl mx-auto p-6">
            <div className="text-xl font-bold mb-2 uppercase">Akses Ditolak</div>
            <div className="text-gray-700 mb-4">Modul Bina Kesebelasan Utama hanya untuk Jurulatih.</div>
            <button
              onClick={() => setCurrentPage(role === "Pemain" ? "player-dashboard" : "dashboard")}
              className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors uppercase"
            >
              Kembali
            </button>
          </div>
        );
      }
      return <KesebelasanUtama {...pageProps} readOnly={role === "Pemain"} />;
    
    case "pengurusan-latihan":
      return <PengurusanLatihan {...pageProps} trainingSessions={trainingSessions} />;
    
    case "statistik-pemain-coach":
      return <StatistikPemainCoach {...pageProps} />;
    
    case "profil-saya":
      return <ProfilSaya {...pageProps} playerProfile={playerProfile} />;
    
    case "jadual-saya":
      return <JadualSaya {...pageProps} />;
    
    case "prestasi-saya":
      return <PrestasiSaya {...pageProps} />;
    
    case "pengumuman-pemain":
      return <PengumumanPemain {...pageProps} />;
    
    case "hantar-tugasan":
      return <HantarTugasan {...pageProps} />;
    
    case "coach-dashboard":
      return <CoachDashboard {...pageProps} />;
    
    case "player-dashboard":
      return <PlayerDashboard {...pageProps} />;
    
    default:
      return <AdminDashboard {...pageProps} />;
  }
}
