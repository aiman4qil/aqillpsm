import { apiFetch } from "../utils/api";
import { useEffect, useState } from "react";

interface Profile {
  nama: string;
  username: string;
  posisi: string;
}

interface JadualEvent {
  jadualID: number;
  jenis: string;
  tarikh: string;
  masa: string;
  lokasi: string;
  keterangan: string;
}

interface Prestasi {
  gol: number;
  assist: number;
  kad_kuning: number;
  kad_merah: number;
  skor: number;
}

interface Notification {
  id: string;
  type: string;
  tajuk: string;
  mesej: string;
  tarikh_dibuat: string;
  sudah_dibaca: number;
}

interface PlayerDashboardProps {
  setCurrentPage: (page: string) => void;
  handleLogout: () => void;
}

export function PlayerDashboard(props: PlayerDashboardProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [jadualEvents, setJadualEvents] = useState<JadualEvent[]>([]);
  const [prestasi, setPrestasi] = useState<Prestasi | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  function getStoredNotificationData(): Notification[] {
    const token = localStorage.getItem("token");
    if (!token) return [];
    const userId = token.length % 1000;
    const stored = localStorage.getItem("notifications_" + userId);
    return stored ? JSON.parse(stored) : [];
  }

  function saveStoredNotificationData(data: Notification[]): void {
    const token = localStorage.getItem("token");
    if (!token) return;
    const userId = token.length % 1000;
    localStorage.setItem("notifications_" + userId, JSON.stringify(data));
  }

  function getStoredAnnouncementData(): any {
    const token = localStorage.getItem("token");
    if (!token) return {};
    const userId = token.length % 1000;
    const stored = localStorage.getItem("pengumuman_data_" + userId);
    return stored ? JSON.parse(stored) : {};
  }

  useEffect(function() {
    async function fetchData() {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: "Bearer " + token };

        const promises = [
          apiFetch("/api/pemain/profil", { headers: headers }),
          apiFetch("/api/jadual", { headers: headers }),
          apiFetch("/api/prestasi/pemain/saya", { headers: headers }),
          apiFetch("/api/pengumuman", { headers: headers }),
        ];

        const results = await Promise.all(promises);
        const profileRes = results[0];
        const jadualRes = results[1];
        const prestasiRes = results[2];
        const pengumumanRes = results[3];
        let jadualData: any[] = [];

        if (profileRes.ok) setProfile(await profileRes.json());
        if (jadualRes.ok) {
          jadualData = await jadualRes.json();
          const mappedEvents = jadualData.map(function(e: any) {
            return {
              jadualID: e.jadual_id,
              jenis: e.jenis_aktiviti,
              keterangan: e.jenis_aktiviti,
              tarikh: e.tarikh,
              masa: e.masa,
              lokasi: e.lokasi
            };
          });
          const upcomingEvents = mappedEvents
            .filter(function(e: JadualEvent) { return new Date(e.tarikh) >= new Date(); })
            .sort(function(a: JadualEvent, b: JadualEvent) { return new Date(a.tarikh).getTime() - new Date(b.tarikh).getTime(); })
            .slice(0, 3);
          setJadualEvents(upcomingEvents);
        }
        if (prestasiRes.ok) {
          const allPrestasi = await prestasiRes.json();
          if (allPrestasi.length > 0) {
            const total = allPrestasi.reduce(function(acc: any, curr: any) {
              return {
                gol: acc.gol + curr.gol,
                assist: acc.assist + curr.assist,
                kad_kuning: acc.kad_kuning + ((curr.kad_kuning === 'Kuning' || curr.kad === 'Kuning') ? 1 : 0),
                kad_merah: acc.kad_merah + ((curr.kad_merah === 'Merah' || curr.kad === 'Merah') ? 1 : 0),
                skor: acc.skor + (curr.skor_perlawanan || curr.skor || 0),
              };
            }, { gol: 0, assist: 0, kad_kuning: 0, kad_merah: 0, skor: 0 });
            
            setPrestasi({
              ...total,
              skor: total.skor / allPrestasi.length
            });
          }
        }

        if (pengumumanRes.ok) {
          const allPengumuman = await pengumumanRes.json();
          const storedAnnData = getStoredAnnouncementData();
          const storedNotifData = getStoredNotificationData();
          const existingNotifIds = new Set(storedNotifData.map(function(n: Notification) { return n.id; }));

          const newNotifications: Notification[] = [];

          allPengumuman.forEach(function(ann: any) {
            if (!storedAnnData[ann.pengumumanID]?.isRead && !existingNotifIds.has("ann_" + ann.pengumumanID)) {
              newNotifications.push({
                id: "ann_" + ann.pengumumanID,
                type: 'pengumuman',
                tajuk: ann.tajuk,
                mesej: ann.kandungan.substring(0, 100) + '...',
                tarikh_dibuat: ann.tarikh || ann.tarikh_dibuat,
                sudah_dibaca: 0
              });
            }
          });

          if (jadualData.length > 0) {
            jadualData.forEach(function(jad: any) {
              const eventDate = new Date(jad.tarikh);
              const now = new Date();
              const diffDays = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              
              if (diffDays > 0 && diffDays <= 3 && !existingNotifIds.has("jad_" + jad.jadual_id)) {
                newNotifications.push({
                  id: "jad_" + jad.jadual_id,
                  type: 'jadual',
                  tajuk: jad.jenis_aktiviti,
                  mesej: jad.jenis_aktiviti + " pada " + new Date(jad.tarikh).toLocaleDateString() + " jam " + jad.masa.slice(0, 5) + " di " + jad.lokasi,
                  tarikh_dibuat: jad.tarikh,
                  sudah_dibaca: 0
                });
              }
            });
          }

          const allNotifications = newNotifications.concat(storedNotifData).slice(0, 20);
          setNotifications(allNotifications);
          saveStoredNotificationData(allNotifications);
        }

      } catch (error) {
        console.error("Ralat mendapatkan data papan pemuka:", error);
      }
    }

    fetchData();
  }, []);

  function markNotifAsRead(notifId: string): void {
    const updated = notifications.map(function(n: Notification) {
      return n.id === notifId ? { ...n, sudah_dibaca: 1 } : n;
    });
    setNotifications(updated);
    saveStoredNotificationData(updated);
  }

  const unreadCount = notifications.filter(function(n: Notification) { return n.sudah_dibaca === 0; }).length;
  const setCurrentPage = props.setCurrentPage;
  const handleLogout = props.handleLogout;

  return (
    <div className="bg-white rounded-lg shadow-lg border-4 border-gray-800 max-w-6xl mx-auto">
        <div className="bg-gray-800 text-white p-4 flex justify-between items-center rounded-t">
          <h1 className="uppercase font-bold text-xl">Selamat Datang, {profile?.nama || 'Pemain'}</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button 
                onClick={function() { setShowNotifications(!showNotifications); }}
                className="relative p-2 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors"
              >
                🔔
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white border-2 border-gray-800 rounded-lg shadow-xl z-50">
                  <div className="p-3 border-b-2 border-gray-800 bg-gray-100">
                    <h3 className="font-bold text-gray-800 uppercase">Notifikasi</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map(function(notif) {
                        return (
                          <div 
                            key={notif.id} 
                            className={"p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer " + (notif.sudah_dibaca === 0 ? 'bg-blue-50' : '')}
                            onClick={function() { if (notif.sudah_dibaca === 0) markNotifAsRead(notif.id); }}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className={"font-bold " + (notif.sudah_dibaca === 0 ? 'text-blue-900' : 'text-gray-800')}>
                                  {notif.tajuk}
                                  {notif.sudah_dibaca === 0 && (
                                    <span className="ml-2 inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                                  )}
                                </h4>
                                <p className="text-sm text-gray-600 mt-1">{notif.mesej}</p>
                                <p className="text-xs text-gray-400 mt-2">
                                  {new Date(notif.tarikh_dibuat).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        Tiada notifikasi.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border-t-2 border-gray-800"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border-b-2 border-gray-800">
          <div className="bg-blue-50 border-2 border-blue-200 rounded p-6 shadow-sm">
             <h2 className="uppercase mb-4 font-bold text-lg border-b border-blue-200 pb-2 text-blue-800">Maklumat Peribadi</h2>
             {profile ? (
               <div className="space-y-3">
                 <div className="flex justify-between border-b border-blue-100 pb-1">
                   <span className="text-gray-600 font-semibold">Nama:</span>
                   <span className="font-bold text-gray-800">{profile.nama}</span>
                 </div>
                 <div className="flex justify-between border-b border-blue-100 pb-1">
                   <span className="text-gray-600 font-semibold">No. Matrik:</span>
                   <span className="font-mono text-gray-800">{profile.username}</span>
                 </div>
                 <div className="flex justify-between border-b border-blue-100 pb-1">
                   <span className="text-gray-600 font-semibold">Posisi:</span>
                   <span className="bg-blue-200 text-blue-800 px-2 py-0.5 rounded text-sm font-bold">{profile.posisi}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-gray-600 font-semibold">Status:</span>
                   <span className="text-green-600 font-bold flex items-center gap-1">
                     <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Aktif
                   </span>
                 </div>
               </div>
             ) : (
               <div className="animate-pulse space-y-3">
                 <div className="h-4 bg-blue-200 rounded w-3/4"></div>
                 <div className="h-4 bg-blue-200 rounded w-1/2"></div>
               </div>
             )}
          </div>

          <div className="bg-yellow-50 border-2 border-yellow-200 rounded p-6 shadow-sm">
            <h2 className="uppercase mb-4 font-bold text-lg border-b border-yellow-200 pb-2 text-yellow-800">Jadual Terkini</h2>
            <div className="space-y-3">
              {jadualEvents.length > 0 ? (
                jadualEvents.map(function(event) {
                  return (
                    <div key={event.jadualID} className="flex items-center gap-3 bg-white p-3 rounded border border-yellow-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="bg-yellow-100 text-yellow-800 p-2 rounded text-center min-w-[60px]">
                        <div className="text-xs font-bold uppercase">{new Date(event.tarikh).toLocaleString('default', { month: 'short' })}</div>
                        <div className="text-xl font-bold">{new Date(event.tarikh).getDate()}</div>
                      </div>
                      <div>
                        <div className="font-bold text-gray-800">{event.jenis || event.keterangan}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          🕒 {event.masa.slice(0, 5)}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 italic text-center py-4">Tiada acara akan datang.</p>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          <h2 className="uppercase mb-4 font-bold text-lg text-gray-800">Prestasi Keseluruhan</h2>
          {prestasi ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-green-100 border-2 border-green-200 rounded p-4 text-center">
                <div className="text-sm text-green-800 font-bold uppercase mb-1">Gol</div>
                <div className="text-3xl font-black text-green-900">{prestasi.gol}</div>
              </div>
              <div className="bg-blue-100 border-2 border-blue-200 rounded p-4 text-center">
                <div className="text-sm text-blue-800 font-bold uppercase mb-1">Assist</div>
                <div className="text-3xl font-black text-blue-900">{prestasi.assist}</div>
              </div>
              <div className="bg-red-100 border-2 border-red-200 rounded p-4 text-center">
                <div className="text-sm text-red-800 font-bold uppercase mb-1">Kad</div>
                <div className="text-3xl font-black text-red-900">{prestasi.kad_kuning + prestasi.kad_merah}</div>
                <div className="text-xs text-red-700 mt-1">Kuning: {prestasi.kad_kuning} | Merah: {prestasi.kad_merah}</div>
              </div>
              <div className="bg-purple-100 border-2 border-purple-200 rounded p-4 text-center">
                <div className="text-sm text-purple-800 font-bold uppercase mb-1">Rating Purata</div>
                <div className="text-3xl font-black text-purple-900">{prestasi.skor.toFixed(1)}</div>
                <div className="text-xs text-purple-700 mt-1">/ 10.0</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded border-2 border-dashed border-gray-300">
              <p className="text-gray-500">Tiada rekod prestasi ditemui.</p>
            </div>
          )}
        </div>
    </div>
  );
}
