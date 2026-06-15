import { apiFetch } from "../utils/api";
import { useState, useEffect } from "react";

interface Announcement {
  pengumumanID: number;
  tajuk: string;
  kandungan: string;
  hantar?: string;
  tarikh?: string;
  tarikh_dibuat?: string;
  isRead: boolean;
  isArchived: boolean;
}

export function PengumumanPemain(props: { setCurrentPage: (page: string) => void }) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [filter, setFilter] = useState<"all" | "unread" | "archive">("all");

  function getStoredAnnouncementData(): Record<string, { isRead?: boolean; isArchived?: boolean }> {
    const token = localStorage.getItem("token");
    if (!token) return {};
    const userId = token.length % 1000;
    const stored = localStorage.getItem("pengumuman_data_" + userId);
    return stored ? JSON.parse(stored) : {};
  }

  function saveStoredAnnouncementData(data: Record<string, { isRead?: boolean; isArchived?: boolean }>) {
    const token = localStorage.getItem("token");
    if (!token) return;
    const userId = token.length % 1000;
    localStorage.setItem("pengumuman_data_" + userId, JSON.stringify(data));
  }

  async function fetchPengumuman() {
    try {
      const token = localStorage.getItem("token");
      const authHeader = token ? "Bearer " + token : "";
      const response = await apiFetch("/api/pengumuman", {
        headers: { Authorization: authHeader },
      });

      if (!response.ok) {
        console.error("Gagal memuatkan data pengumuman");
        return;
      }

      const data = await response.json();
      const storedData = getStoredAnnouncementData();
      const enrichedData: Announcement[] = (data || []).map(function (ann: any) {
        return {
          ...ann,
          isRead: Boolean(storedData[String(ann.pengumumanID)]?.isRead),
          isArchived: Boolean(storedData[String(ann.pengumumanID)]?.isArchived),
        };
      });
      setAnnouncements(enrichedData);
    } catch (error) {
      console.error("Ralat memuatkan data pengumuman:", error);
    }
  }

  useEffect(function () {
    fetchPengumuman();
  }, []);

  function handleRefresh() {
    fetchPengumuman();
  }

  function handleTandaBaca(id: number) {
    try {
      const storedData = getStoredAnnouncementData();
      storedData[String(id)] = { ...storedData[String(id)], isRead: true };
      saveStoredAnnouncementData(storedData);

      setAnnouncements(function (prev) {
        return prev.map(function (ann) {
          return ann.pengumumanID === id ? { ...ann, isRead: true } : ann;
        });
      });
    } catch (error) {
      console.error("Ralat menanda pengumuman sebagai telah dibaca:", error);
      alert("Ralat berlaku.");
    }
  }

  function handleTandaSemuaBaca() {
    try {
      const storedData = getStoredAnnouncementData();
      const unread = announcements.filter(function (ann) {
        return !ann.isRead && !ann.isArchived;
      });

      if (unread.length === 0) {
        alert("Tiada pengumuman yang belum dibaca.");
        return;
      }

      unread.forEach(function (ann) {
        storedData[String(ann.pengumumanID)] = { ...storedData[String(ann.pengumumanID)], isRead: true };
      });
      saveStoredAnnouncementData(storedData);

      setAnnouncements(function (prev) {
        return prev.map(function (ann) {
          return ann.isArchived ? ann : { ...ann, isRead: true };
        });
      });
    } catch (error) {
      console.error("Ralat menanda semua pengumuman sebagai telah dibaca:", error);
      alert("Ralat berlaku.");
    }
  }

  function handleArkibkan(id: number) {
    try {
      const storedData = getStoredAnnouncementData();
      storedData[String(id)] = { ...storedData[String(id)], isArchived: true };
      saveStoredAnnouncementData(storedData);

      setAnnouncements(function (prev) {
        return prev.map(function (ann) {
          return ann.pengumumanID === id ? { ...ann, isArchived: true } : ann;
        });
      });
    } catch (error) {
      console.error("Ralat mengarkibkan pengumuman:", error);
      alert("Ralat berlaku.");
    }
  }

  const filteredAnnouncements = announcements.filter(function (ann) {
    if (filter === "unread") return !ann.isRead && !ann.isArchived;
    if (filter === "archive") return ann.isArchived;
    return !ann.isArchived;
  });

  function getAnnouncementLabel(ann: Announcement, index: number) {
    if (!ann.isRead) return "BELUM BACA";
    if (index === 0) return "PENTING";
    if (index === 1) return "TERKINI";
    return "BIASA";
  }

  function getAnnouncementBg(ann: Announcement, index: number) {
    if (!ann.isRead) return "bg-red-50";
    if (index === 0) return "bg-red-50";
    if (index === 1) return "bg-blue-50";
    return "bg-gray-100";
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border-4 border-gray-800 max-w-6xl mx-auto">
      <div className="bg-gray-800 text-white p-4 flex justify-between items-center rounded-t">
        <h1 className="uppercase">Pengumuman</h1>
        <button
          onClick={function () { props.setCurrentPage("player-dashboard"); }}
          className="bg-white text-gray-800 px-4 py-2 rounded hover:bg-gray-100 transition-colors"
        >
          Kembali
        </button>
      </div>

      <div className="border-t-2 border-gray-800"></div>

      <div className="p-6 border-b-2 border-gray-800">
        <div className="flex gap-3">
          <button
            onClick={function () { setFilter("all"); }}
            className={"px-4 py-2 rounded transition-colors " + (filter === "all" ? "bg-gray-800 text-white" : "bg-gray-200 border-2 border-gray-800 hover:bg-gray-300")}
          >
            SEMUA
          </button>
          <button
            onClick={function () { setFilter("unread"); }}
            className={"px-4 py-2 rounded transition-colors " + (filter === "unread" ? "bg-gray-800 text-white" : "bg-gray-200 border-2 border-gray-800 hover:bg-gray-300")}
          >
            BELUM BACA
          </button>
          <button
            onClick={function () { setFilter("archive"); }}
            className={"px-4 py-2 rounded transition-colors " + (filter === "archive" ? "bg-gray-800 text-white" : "bg-gray-200 border-2 border-gray-800 hover:bg-gray-300")}
          >
            ARKIB
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-6">
          {filteredAnnouncements.map(function (ann, idx) {
            const dateValue = ann.tarikh || ann.tarikh_dibuat || "";
            return (
              <div key={ann.pengumumanID}>
                <div className="mb-2 uppercase">{getAnnouncementLabel(ann, idx)}</div>
                <div className={getAnnouncementBg(ann, idx) + " border-4 border-gray-800 rounded p-6"}>
                  <div className="mb-4">
                    <h3 className="uppercase mb-2">{ann.tajuk}</h3>
                    <div className="text-sm text-gray-600">
                      {ann.hantar ? "Pengirim: " + ann.hantar : "Pengirim: -"} |{" "}
                      {dateValue ? "Tarikh: " + new Date(dateValue).toLocaleDateString() : "Tarikh: -"}
                    </div>
                  </div>
                  <div className="mb-4 pb-4 border-b-2 border-gray-300">{ann.kandungan}</div>
                  <div className="flex gap-3">
                    {!ann.isRead && !ann.isArchived && (
                      <button
                        onClick={function () { handleTandaBaca(ann.pengumumanID); }}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                      >
                        Tanda Baca
                      </button>
                    )}
                    {!ann.isArchived && (
                      <button
                        onClick={function () { handleArkibkan(ann.pengumumanID); }}
                        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                      >
                        Arkibkan
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-6 pt-0">
        <div className="flex gap-3">
          <button
            onClick={handleTandaSemuaBaca}
            className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
          >
            Tanda Semua Baca
          </button>
          <button
            onClick={handleRefresh}
            className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
