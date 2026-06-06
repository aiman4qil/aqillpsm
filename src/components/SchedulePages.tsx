export function SchedulePage({ setCurrentPage, scheduleEvents, currentMonth }: any) {
  return (
    <div className="min-h-screen bg-[#D3D3D3] p-6">
      <div className="bg-white rounded-lg shadow-lg border-4 border-gray-800 max-w-6xl mx-auto">
        <div className="bg-gray-800 text-white p-4 flex justify-between items-center rounded-t">
          <h1 className="uppercase">Jadual Aktiviti Pasukan</h1>
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
              onClick={() => setCurrentPage("tambah-jadual")}
              className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors uppercase"
            >
              Tambah Jadual
            </button>
            <button className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors uppercase">
              Edit
            </button>
            <button className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors uppercase">
              Padam
            </button>
            <button className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors uppercase">
              Cetak
            </button>
          </div>
        </div>

        <div className="p-6 border-b-2 border-gray-800">
          <div className="mb-4 uppercase">Bulan: {currentMonth}</div>
          <div className="overflow-x-auto">
            <table className="w-full border-2 border-gray-800">
              <thead>
                <tr className="bg-gray-200 border-b-2 border-gray-800">
                  <th className="border-r-2 border-gray-800 p-3 text-left">Hari</th>
                  <th className="border-r-2 border-gray-800 p-3 text-left">Tarikh</th>
                  <th className="border-r-2 border-gray-800 p-3 text-left">Aktiviti</th>
                  <th className="border-r-2 border-gray-800 p-3 text-left">Masa</th>
                  <th className="border-gray-800 p-3 text-left">Lokasi</th>
                </tr>
              </thead>
              <tbody>
                {scheduleEvents.map((event: any) => (
                  <tr key={event.id} className="border-b-2 border-gray-800">
                    <td className="border-r-2 border-gray-800 p-3">{event.hari}</td>
                    <td className="border-r-2 border-gray-800 p-3">{event.tarikh}</td>
                    <td className="border-r-2 border-gray-800 p-3">{event.aktiviti}</td>
                    <td className="border-r-2 border-gray-800 p-3">{event.masa}</td>
                    <td className="border-gray-800 p-3">{event.lokasi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-6">
          <div className="flex justify-center gap-4">
            <button className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors">
              &lt; Bulan Lepas
            </button>
            <button className="px-6 py-2 bg-gray-200 border-2 border-gray-800 rounded">
              {currentMonth}
            </button>
            <button className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors">
              Bulan Depan &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AddSchedulePage({ setCurrentPage, newEventForm, setNewEventForm }: any) {
  return (
    <div className="min-h-screen bg-[#D3D3D3] p-6">
      <div className="bg-white rounded-lg shadow-lg border-4 border-gray-800 max-w-4xl mx-auto">
        <div className="bg-gray-800 text-white p-4 flex justify-between items-center rounded-t">
          <h1 className="uppercase">Tambah Jadual Aktiviti Baru</h1>
          <button
            onClick={() => setCurrentPage("jadual-aktiviti")}
            className="bg-white text-gray-800 px-4 py-2 rounded hover:bg-gray-100 transition-colors"
          >
            Kembali
          </button>
        </div>

        <div className="border-t-2 border-gray-800"></div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block mb-2">Jenis Aktiviti:</label>
            <select
              value={newEventForm.jenis}
              onChange={(e) => setNewEventForm({ ...newEventForm, jenis: e.target.value })}
              className="w-full px-4 py-2 bg-[#F5F5F5] border-2 border-gray-300 rounded focus:outline-none focus:border-gray-500"
            >
              <option>Latihan</option>
              <option>Perlawanan</option>
              <option>Mesyuarat</option>
              <option>Lain-lain</option>
            </select>
          </div>

          <div>
            <label className="block mb-2">Tajuk Aktiviti:</label>
            <input
              type="text"
              value={newEventForm.tajuk}
              onChange={(e) => setNewEventForm({ ...newEventForm, tajuk: e.target.value })}
              className="w-full px-4 py-2 bg-[#F5F5F5] border-2 border-gray-300 rounded focus:outline-none focus:border-gray-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">Tarikh:</label>
              <input
                type="date"
                value={newEventForm.tarikh}
                onChange={(e) => setNewEventForm({ ...newEventForm, tarikh: e.target.value })}
                className="w-full px-4 py-2 bg-[#F5F5F5] border-2 border-gray-300 rounded focus:outline-none focus:border-gray-500"
              />
            </div>
            <div>
              <label className="block mb-2">Masa:</label>
              <input
                type="time"
                value={newEventForm.masa}
                onChange={(e) => setNewEventForm({ ...newEventForm, masa: e.target.value })}
                className="w-full px-4 py-2 bg-[#F5F5F5] border-2 border-gray-300 rounded focus:outline-none focus:border-gray-500"
              />
            </div>
          </div>

          <div>
            <label className="block mb-2">Lokasi:</label>
            <input
              type="text"
              value={newEventForm.lokasi}
              onChange={(e) => setNewEventForm({ ...newEventForm, lokasi: e.target.value })}
              className="w-full px-4 py-2 bg-[#F5F5F5] border-2 border-gray-300 rounded focus:outline-none focus:border-gray-500"
            />
          </div>

          <div>
            <label className="block mb-2">Objektif:</label>
            <textarea
              value={newEventForm.objektif}
              onChange={(e) => setNewEventForm({ ...newEventForm, objektif: e.target.value })}
              className="w-full px-4 py-3 bg-[#F5F5F5] border-2 border-gray-300 rounded focus:outline-none focus:border-gray-500 min-h-[80px]"
            />
          </div>

          <div>
            <label className="block mb-2">Penerangan:</label>
            <textarea
              value={newEventForm.penerangan}
              onChange={(e) => setNewEventForm({ ...newEventForm, penerangan: e.target.value })}
              className="w-full px-4 py-3 bg-[#F5F5F5] border-2 border-gray-300 rounded focus:outline-none focus:border-gray-500 min-h-[80px]"
            />
          </div>

          <div className="flex flex-wrap gap-3 pt-4">
            <button className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors uppercase">
              Simpan Jadual
            </button>
            <button
              onClick={() => setCurrentPage("jadual-aktiviti")}
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
