import { ImageWithFallback } from "../components/figma/ImageWithFallback";

interface LoginPageProps {
  username: string;
  setUsername: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  role: string;
  setRole: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  onShowSignup: () => void;
}

export function LoginPage({ 
  username, 
  setUsername, 
  password, 
  setPassword, 
  role, 
  setRole, 
  handleSubmit,
  onShowSignup
}: LoginPageProps) {
  return (
    <div className="min-h-screen login-page-bg flex items-center justify-center p-6">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg border-4 border-gray-800">
        <div className="text-center mb-8">
          <div className="mx-auto mb-2 flex items-center justify-center">
            <ImageWithFallback src="/armada-logo.png" alt="Lambang ARMADA" className="logo" />
          </div>
          <div className="uppercase tracking-wide">
            <div>Sistem Pengurusan</div>
            <div>Pasukan Futsal Armada</div>
            <div>UTHM</div>
          </div>
        </div>

        <div className="border-t-2 border-gray-800 mb-8" />

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block mb-2">
              ID/Matrik:
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-[#F5F5F5] border-2 border-gray-300 rounded focus:outline-none focus:border-gray-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block mb-2">
              Kata Laluan:
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[#F5F5F5] border-2 border-gray-300 rounded focus:outline-none focus:border-gray-500"
            />
          </div>

          <div>
            <div className="mb-3">Peranan:</div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="Pentadbir"
                  checked={role === "Pentadbir"}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-5 h-5"
                />
                <span>Pentadbir</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="Jurulatih"
                  checked={role === "Jurulatih"}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-5 h-5"
                />
                <span>Jurulatih</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="Pemain"
                  checked={role === "Pemain"}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-5 h-5"
                />
                <span>Pemain</span>
              </label>
            </div>
          </div>

          <button type="submit" className="login-primary-button w-full py-3 rounded uppercase tracking-wider transition-colors mt-8 hover:brightness-95">
            Log Masuk
          </button>
        </form>

        <div className="mt-8 border-t-2 border-gray-800 pt-6 text-center">
          <span>Tiada akaun? </span>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onShowSignup();
            }}
            className="text-blue-600 hover:underline uppercase"
          >
            Daftar di sini
          </a>
        </div>
      </div>
    </div>
  );
}
