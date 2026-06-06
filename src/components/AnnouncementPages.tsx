export function AnnouncementPage({ setCurrentPage, announcements }: any) {
  return (
    <div className="min-h-screen bg-[#D3D3D3] p-6">
      <div className="bg-white rounded-lg shadow-lg border-4 border-gray-800 max-w-6xl mx-auto">
        <div className="bg-gray-800 text-white p-4 flex justify-between items-center rounded-t">
          <h1 className="uppercase">Pengumuman & Notifikasi</h1>
          <button
            onClick={() => setCurrentPage("dashboard")}
            className="bg-white text-gray-800 px-4 py-2 rounded hover:bg-gray-100 transition-colors"
          >
            Kembali
          </button>
        </div>

        <div className="border-t-2 border-gray-800"></div>

        <div className="p-6 border-b-2 border-gray-800">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setCurrentPage("buat-pengumuman")}
              className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors uppercase"
            >
              Buat Pengumuman
            </button>
            <button className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors uppercase">
              Edit
            </button>
            <button className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors uppercase">
              Padam
            </button>
          </div>
        </div>

        <div className="p-6">
          <h2 className="uppercase mb-4">Pengumuman Terkini:</h2>
          <div className="space-y-4">
            {announcements.map((announcement: any) => (
              <div key={announcement.id} className="border-4 border-gray-800 rounded-lg p-6">
                <div className="mb-2">
                  <span className="uppercase">{announcement.tajuk}</span>
                </div>
                <div className="text-sm mb-3 text-gray-600">
                  Dihantar: {announcement.pengirim} | {announcement.tarikh}
                </div>
                <div className="border-t-2 border-gray-300 pt-3">
                  {announcement.kandungan}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 pt-0">
          <div className="flex flex-wrap gap-3">
            <button className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors uppercase">
              Lihat Semua Pengumuman
            </button>
            <button className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors uppercase">
              Arkib
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CreateAnnouncementPage({ setCurrentPage, newAnnouncementForm, setNewAnnouncementForm }: any) {
  return (
    <div className="min-h-screen bg-[#D3D3D3] p-6">
      <div className="bg-white rounded-lg shadow-lg border-4 border-gray-800 max-w-4xl mx-auto">
        <div className="bg-gray-800 text-white p-4 flex justify-between items-center rounded-t">
          <h1 className="uppercase">Buat Pengumuman Baru</h1>
          <button
            onClick={() => setCurrentPage("pengumuman")}
            className="bg-white text-gray-800 px-4 py-2 rounded hover:bg-gray-100 transition-colors"
          >
            Kembali
          </button>
        </div>

        <div className="border-t-2 border-gray-800"></div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block mb-2">Kepada:</label>
            <select
              value={newAnnouncementForm.kepada}
              onChange={(e) => setNewAnnouncementForm({ ...newAnnouncementForm, kepada: e.target.value })}
              className="w-full px-4 py-2 bg-[#F5F5F5] border-2 border-gray-300 rounded focus:outline-none focus:border-gray-500"
            >
              <option>Semua Pemain</option>
              <option>Pemain Sahaja</option>
              <option>Jurulatih Sahaja</option>
              <option>Admin Sahaja</option>
            </select>
          </div>

          <div>
            <label className="block mb-2">Tajuk:</label>
            <input
              type="text"
              value={newAnnouncementForm.tajuk}
              onChange={(e) => setNewAnnouncementForm({ ...newAnnouncementForm, tajuk: e.target.value })}
              className="w-full px-4 py-2 bg-[#F5F5F5] border-2 border-gray-300 rounded focus:outline-none focus:border-gray-500"
            />
          </div>

          <div>
            <label className="block mb-2">Kandungan:</label>
            <textarea
              value={newAnnouncementForm.kandungan}
              onChange={(e) => setNewAnnouncementForm({ ...newAnnouncementForm, kandungan: e.target.value })}
              className="w-full px-4 py-3 bg-[#F5F5F5] border-2 border-gray-300 rounded focus:outline-none focus:border-gray-500 min-h-[150px]"
            />
          </div>

          <div>
            <label className="block mb-2">Lampiran:</label>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-gray-200 border-2 border-gray-800 rounded hover:bg-gray-300 transition-colors">
                Pilih Fail...
              </button>
              <span className="text-gray-500">tiada fail dipilih</span>
            </div>
          </div>

          <div>
            <label className="block mb-2">Hantar Sebagai:</label>
            <select
              value={newAnnouncementForm.hantar}
              onChange={(e) => setNewAnnouncementForm({ ...newAnnouncementForm, hantar: e.target.value })}
              className="w-full px-4 py-2 bg-[#F5F5F5] border-2 border-gray-300 rounded focus:outline-none focus:border-gray-500"
            >
              <option>Admin</option>
              <option>Jurulatih</option>
            </select>
          </div>

          <div className="flex flex-wrap gap-3 pt-4">
            <button className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors uppercase">
              Hantar Pengumuman
            </button>
            <button className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors uppercase">
              Pratonton
            </button>
            <button
              onClick={() => setCurrentPage("pengumuman")}
              className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors uppercase"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
