export function AttendancePage({ setCurrentPage, attendanceRecords }: any) {
  const hadirCount = attendanceRecords.filter((r: any) => r.status === 'hadir').length;
  const tidakCount = attendanceRecords.filter((r: any) => r.status === 'tidak').length;
  const cutiCount = attendanceRecords.filter((r: any) => r.status === 'cuti').length;
  const total = attendanceRecords.length;
  const percentage = Math.round((hadirCount / total) * 100);

  return (
    <div className="min-h-screen bg-[#D3D3D3] p-6">
      <div className="bg-white rounded-lg shadow-lg border-4 border-gray-800 max-w-6xl mx-auto">
        <div className="bg-gray-800 text-white p-4 flex justify-between items-center rounded-t">
          <h1 className="uppercase">Rekod Kehadiran Latihan</h1>
          <button
            onClick={() => setCurrentPage("dashboard")}
            className="bg-white text-gray-800 px-4 py-2 rounded hover:bg-gray-100 transition-colors"
          >
            Kembali
          </button>
        </div>

        <div className="border-t-2 border-gray-800"></div>

        <div className="p-6 border-b-2 border-gray-800">
          <div className="space-y-2">
            <div>Latihan: Latihan Taktikal</div>
            <div>Tarikh: 15/5/2025 &nbsp;&nbsp; Masa: 5:00 PM</div>
            <div>Lokasi: Stadium UTHM</div>
          </div>
        </div>

        <div className="p-6 border-b-2 border-gray-800">
          <h2 className="uppercase mb-4">Senarai Kehadiran Pemain:</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-2 border-gray-800">
              <thead>
                <tr className="bg-gray-200 border-b-2 border-gray-800">
                  <th className="border-r-2 border-gray-800 p-3 text-left">No.</th>
                  <th className="border-r-2 border-gray-800 p-3 text-left">Nama</th>
                  <th className="border-r-2 border-gray-800 p-3 text-left">Status</th>
                  <th className="border-gray-800 p-3 text-left">Catatan</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.map((record: any, index: number) => (
                  <tr key={record.id} className="border-b-2 border-gray-800">
                    <td className="border-r-2 border-gray-800 p-3">{index + 1}.</td>
                    <td className="border-r-2 border-gray-800 p-3">{record.nama}</td>
                    <td className="border-r-2 border-gray-800 p-3">
                      {record.status === 'hadir' && '[✓] Hadir'}
                      {record.status === 'tidak' && '[✗] Tidak'}
                      {record.status === 'cuti' && '[○] Cuti'}
                    </td>
                    <td className="border-gray-800 p-3">{record.catatan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-6 border-b-2 border-gray-800">
          <h2 className="uppercase mb-4">Statistik Kehadiran:</h2>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-xl">•</span>
              <span>Hadir: {hadirCount}/{total} ({percentage}%)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-xl">•</span>
              <span>Tidak Hadir: {tidakCount}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-xl">•</span>
              <span>Cuti: {cutiCount}</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-wrap gap-3">
            <button className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors uppercase">
              Simpan Kehadiran
            </button>
            <button className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors uppercase">
              Reset
            </button>
            <button className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors uppercase">
              Cetak Senarai
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
