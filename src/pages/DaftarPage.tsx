import { useState } from "react";

interface DaftarPageProps {
  onShowLogin?: () => void;
  onBack?: () => void;
  isAdminAdd?: boolean;
}

export function DaftarPage({ onShowLogin, onBack, isAdminAdd = false }: DaftarPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [posisi, setPosisi] = useState("2");
  const [peranan, setPeranan] = useState<"Pentadbir" | "Jurulatih" | "Pemain">("Pemain");

  const isValid =
    username.trim().length > 0 &&
    password.trim().length > 0 &&
    confirmPassword === password;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password, role: peranan, posisi }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        if (isAdminAdd) {
          onBack && onBack();
        } else {
          onShowLogin && onShowLogin();
        }
      } else {
        alert(`Ralat: ${data.message}`);
      }
    } catch (error) {
      console.error("Ralat pendaftaran:", error);
      alert("Pendaftaran gagal. Sila semak konsol untuk maklumat lanjut.");
    }
  };

  return (
    <div className={(isAdminAdd ? "flex justify-center p-4" : "min-h-screen login-page-bg flex items-center justify-center p-4")}>
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg border-4 border-gray-800">
        <div className="p-6 border-b-2 border-gray-800">
          <div className="text-center uppercase tracking-wide">
            <div className="mx-auto mb-2 flex items-center justify-center">
              <img src="/armada-logo.png" alt="Lambang ARMADA" className="logo" />
            </div>
            <div>Sistem Pengurusan</div>
            <div>Pasukan Futsal Armada</div>
            <div>UTHM</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 pt-6">
          <div>
            <label htmlFor="username" className="block mb-2">
              Username:
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ID, Matrik"
              className="w-full px-4 py-3 bg-[#F5F5F5] border-2 border-gray-300 rounded focus:outline-none focus:border-gray-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block mb-2">
              Password:
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 bg-[#F5F5F5] border-2 border-gray-300 rounded focus:outline-none focus:border-gray-500"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block mb-2">
              Confirm Password:
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              className={`w-full px-4 py-3 bg-[#F5F5F5] border-2 rounded focus:outline-none focus:border-gray-500 ${
                confirmPassword && password !== confirmPassword ? "border-red-500" : "border-gray-300"
              }`}
            />
            {confirmPassword && password !== confirmPassword && (
              <p className="text-red-500 text-sm mt-1">Kata laluan tidak sepadan</p>
            )}
          </div>

          {peranan === "Pemain" && (
            <div>
              <label htmlFor="posisi" className="block mb-2">
                Posisi:
              </label>
              <select
                id="posisi"
                value={posisi}
                onChange={(e) => setPosisi(e.target.value)}
                className="w-full px-4 py-3 bg-[#F5F5F5] border-2 border-gray-300 rounded focus:outline-none focus:border-gray-500"
              >
                <option value="1">Keeper</option>
                <option value="2">Flexible</option>
              </select>
            </div>
          )}

          {!isAdminAdd && (
            <div>
              <div className="mb-3">Peranan:</div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="peranan"
                    value="Pentadbir"
                    checked={peranan === "Pentadbir"}
                    onChange={(e) => setPeranan(e.target.value as typeof peranan)}
                    className="w-5 h-5"
                  />
                  <span>Pentadbir</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="peranan"
                    value="Jurulatih"
                    checked={peranan === "Jurulatih"}
                    onChange={(e) => setPeranan(e.target.value as typeof peranan)}
                    className="w-5 h-5"
                  />
                  <span>Jurulatih</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="peranan"
                    value="Pemain"
                    checked={peranan === "Pemain"}
                    onChange={(e) => setPeranan(e.target.value as typeof peranan)}
                    className="w-5 h-5"
                  />
                  <span>Pemain</span>
                </label>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!isValid}
            className={`w-full py-3 rounded uppercase tracking-wider mt-4 transition-colors ${
              isValid
                ? "bg-gray-800 text-white hover:bg-gray-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isAdminAdd ? "Tambah Pemain" : "Sign up"}
          </button>
        </form>
        <div className="text-center mt-6 pt-6 border-t-2 border-gray-800">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (onBack) onBack();
              else if (onShowLogin) onShowLogin();
            }}
            className="text-blue-600 hover:underline uppercase"
          >
            {isAdminAdd ? "Kembali" : "Kembali ke Log Masuk"}
          </a>
        </div>
      </div>
    </div>
  );
}
