import { useState } from "react";

interface DaftarPageProps {
  onShowLogin?: () => void;
  onBack?: () => void;
  isAdminAdd?: boolean;
  createRole?: "Pemain" | "Jurulatih";
}

export function DaftarPage({ onShowLogin, onBack, isAdminAdd = false, createRole }: DaftarPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [posisi, setPosisi] = useState("2");
  const [peranan] = useState<"Pemain" | "Jurulatih">((isAdminAdd ? (createRole || "Pemain") : "Pemain"));

  const isValid =
    username.trim().length > 0 &&
    password.trim().length > 0 &&
    confirmPassword === password;

  const getApiCandidates = (path: string) => {
    const envBase = (import.meta as any).env?.VITE_API_BASE as string | undefined;
    const resolvedEnvBase = envBase ? String(envBase).replace(/\/+$/, "") : "";
    const hostname = window.location.hostname;
    const backendHostBase = `${window.location.protocol}//${hostname}:3002`;
    const candidates: string[] = [];
    if (resolvedEnvBase) candidates.push(resolvedEnvBase + path);
    candidates.push(path);
    candidates.push(backendHostBase + path);
    return candidates;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    try {
      const token = localStorage.getItem("token") || "";
      const candidates = getApiCandidates("/api/register");
      let response: Response | null = null;
      let data: any = null;
      let lastError: unknown = null;

      for (const url of candidates) {
        try {
          const res = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: "Bearer " + token } : {}),
            },
            body: JSON.stringify({ username, password, role: peranan, posisi }),
          });
          const text = await res.text();
          let parsed: any = null;
          try {
            parsed = text ? JSON.parse(text) : null;
          } catch {
            parsed = null;
          }
          if (parsed === null && res.ok) continue;
          if (res.status === 404 || res.status === 502 || res.status === 503 || res.status === 504) {
            lastError = new Error(`HTTP ${res.status}`);
            continue;
          }
          response = res;
          data = parsed;
          break;
        } catch (err) {
          lastError = err;
        }
      }

      if (!response) throw lastError || new Error("Request failed");

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

  const headerTitle = isAdminAdd ? (peranan === "Jurulatih" ? "Tambah Jurulatih" : "Tambah Pemain") : "Sign up";

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
            <div className="text-sm text-gray-700">
              Pendaftaran melalui halaman ini hanya untuk Pemain. Akaun Pentadbir/Jurulatih didaftarkan oleh Pentadbir.
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
            {headerTitle}
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
