
require('dotenv').config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const port = Number(process.env.PORT || 3002);

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

app.use('/uploads', express.static(uploadsDir));

const db = require("./db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const normalizeRole = (value) => {
  if (!value) return value;
  const normalized = String(value).trim().toLowerCase();
  if (normalized === "admin" || normalized === "pentadbir") return "Pentadbir";
  if (normalized === "jurulatih" || normalized === "coach") return "Jurulatih";
  if (normalized === "pemain" || normalized === "player") return "Pemain";
  return String(value).trim();
};

const normalizePosisi = (value) => {
  if (value === undefined || value === null) return 2;
  const normalized = String(value).trim().toLowerCase();
  if (normalized === "1" || normalized === "keeper" || normalized === "gk") return 1;
  if (normalized === "2" || normalized === "flexible" || normalized === "field") return 2;
  return 2;
};

(async () => {
  try {
    try {
      await db.execute("ALTER TABLE user ADD COLUMN is_active TINYINT NOT NULL DEFAULT 1");
    } catch (e) {
      if (!(e && e.code === "ER_DUP_FIELDNAME")) {
        console.error("Ralat tambah column is_active:", e);
      }
    }
    await db.execute(
      "UPDATE data_pemain SET posisi = 2 WHERE posisi IS NULL OR posisi NOT IN (1,2)"
    );

    const tableExists = async (name) => {
      const [rows] = await db.execute(
        "SELECT COUNT(*) as c FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?",
        [name]
      );
      return Number(rows && rows[0] && rows[0].c) > 0;
    };

    const dropForeignKeysReferencing = async (referencedTable) => {
      const [rows] = await db.execute(
        `SELECT TABLE_NAME as tableName, CONSTRAINT_NAME as constraintName
         FROM information_schema.KEY_COLUMN_USAGE
         WHERE TABLE_SCHEMA = DATABASE()
           AND REFERENCED_TABLE_NAME = ?
           AND CONSTRAINT_NAME IS NOT NULL
           AND CONSTRAINT_NAME <> 'PRIMARY'`,
        [referencedTable]
      );
      for (const r of rows || []) {
        try {
          await db.execute(`ALTER TABLE \`${r.tableName}\` DROP FOREIGN KEY \`${r.constraintName}\``);
        } catch (e) {}
      }
    };

    const ensureJadualAktivitiUnified = async () => {
      const hasUnified = await tableExists("jadual_aktiviti");
      if (hasUnified) return;

      const hasPerlawanan = await tableExists("jadual_perlawanan");
      const hasLatihan = await tableExists("latihan");
      if (!hasPerlawanan && !hasLatihan) return;

      await db.execute(`
        CREATE TABLE IF NOT EXISTS jadual_aktiviti (
          jadual_id INT NOT NULL,
          kategori VARCHAR(20) NOT NULL,
          jenis_aktiviti VARCHAR(100) NOT NULL,
          tarikh DATE NOT NULL,
          masa TIME NOT NULL,
          lokasi VARCHAR(255) NOT NULL,
          keterangan TEXT,
          tajuk VARCHAR(255),
          kandungan TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          kehadiran_json LONGTEXT,
          PRIMARY KEY (jadual_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);

      let offset = 0;
      if (hasPerlawanan) {
        const [maxRows] = await db.execute("SELECT COALESCE(MAX(jadual_id), 0) as maxId FROM jadual_perlawanan");
        offset = Number(maxRows && maxRows[0] && maxRows[0].maxId) || 0;

        await db.execute(`
          INSERT INTO jadual_aktiviti (
            jadual_id, kategori, jenis_aktiviti, tarikh, masa, lokasi, keterangan, tajuk, kandungan, created_at, kehadiran_json
          )
          SELECT
            jadual_id,
            CASE WHEN jenis_aktiviti = 'Pengumuman' THEN 'PENGUMUMAN' ELSE 'PERLAWANAN' END as kategori,
            jenis_aktiviti,
            tarikh,
            masa,
            lokasi,
            keterangan,
            tajuk,
            kandungan,
            created_at,
            NULL
          FROM jadual_perlawanan
        `);
      }

      if (hasLatihan) {
        await db.execute(
          `
          INSERT INTO jadual_aktiviti (
            jadual_id, kategori, jenis_aktiviti, tarikh, masa, lokasi, keterangan, tajuk, kandungan, created_at, kehadiran_json
          )
          SELECT
            jadual_id + ?,
            'LATIHAN',
            jenis_aktiviti,
            tarikh,
            masa,
            lokasi,
            keterangan,
            NULL,
            NULL,
            CURRENT_TIMESTAMP,
            kehadiran_json
          FROM latihan
          `,
          [offset]
        );

        if (await tableExists("bukti_latihan")) {
          if (offset > 0) {
            await db.execute("UPDATE bukti_latihan SET jadual_id = jadual_id + ?", [offset]);
          }
        }
      }

      const [maxNewRows] = await db.execute("SELECT COALESCE(MAX(jadual_id), 0) as maxId FROM jadual_aktiviti");
      const nextId = (Number(maxNewRows && maxNewRows[0] && maxNewRows[0].maxId) || 0) + 1;
      await db.execute(`ALTER TABLE jadual_aktiviti MODIFY jadual_id INT NOT NULL AUTO_INCREMENT, AUTO_INCREMENT = ${nextId}`);

      await dropForeignKeysReferencing("latihan");
      await dropForeignKeysReferencing("jadual_perlawanan");

      try {
        if (hasLatihan) await db.execute("DROP TABLE latihan");
      } catch (e) {}
      try {
        if (hasPerlawanan) await db.execute("DROP TABLE jadual_perlawanan");
      } catch (e) {}

      if (await tableExists("kesebelasan_utama")) {
        try {
          await db.execute(
            "ALTER TABLE kesebelasan_utama ADD CONSTRAINT fk_kesebelasan_jadual FOREIGN KEY (jadual_id) REFERENCES jadual_aktiviti(jadual_id) ON DELETE SET NULL"
          );
        } catch (e) {}
      }
      if (await tableExists("bukti_latihan")) {
        try {
          await db.execute(
            "ALTER TABLE bukti_latihan ADD CONSTRAINT fk_bukti_jadual FOREIGN KEY (jadual_id) REFERENCES jadual_aktiviti(jadual_id) ON DELETE CASCADE"
          );
        } catch (e) {}
      }
    };

    await ensureJadualAktivitiUnified();
  } catch (error) {
    console.error("Ralat normalisasi posisi:", error);
  }
})();

app.post('/api/login', async (req, res) => {
  console.log('=== RECEIVED LOGIN REQUEST ===');
  console.log('Body:', req.body);
  
  const { username, password, role } = req.body;

  if (!username || !password) {
    console.log('Missing username or password');
    return res.status(400).json({ message: 'Sila masukkan nama pengguna dan kata laluan.' });
  }

  try {
    console.log('Querying database for user:', username);
    const [rows] = await db.execute("SELECT * FROM user WHERE username = ?", [username]);
    console.log('Database rows returned:', rows.length);

    if (rows.length === 0) {
      console.log('User not found');
      return res.status(401).json({ message: 'Nama pengguna atau kata laluan tidak sah.' });
    }

    const user = rows[0];
    console.log('User found:', { user_id: user.user_id, username: user.username, role: user.role });
    const requestedRole = normalizeRole(role);
    const userRole = normalizeRole(user.role);
    const isActive = user.is_active === undefined || user.is_active === null ? 1 : Number(user.is_active);

    if (isActive !== 1) {
      return res.status(403).json({ message: "Akaun ini tidak aktif. Sila hubungi pentadbir." });
    }
    
    console.log('Comparing passwords...');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('Invalid password');
      return res.status(401).json({ message: 'Nama pengguna atau kata laluan tidak sah.' });
    }

    if (requestedRole && userRole !== requestedRole) {
      console.log('Role mismatch:', { requested: requestedRole, actual: userRole });
      return res.status(401).json({ message: 'Peranan yang dipilih tidak sepadan dengan akaun ini.' });
    }

    console.log('Generating JWT token...');
    const token = jwt.sign(
      { userId: user.user_id, role: userRole },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "1h" }
    );

    console.log('Login successful!');
    let profile = null;
    if (userRole === "Pemain") {
      try {
        let [pRows] = await db.execute(
          `SELECT 
            nama,
            posisi,
            no_jersi,
            umur,
            no_matrik,
            no_telefon,
            email
          FROM data_pemain
          WHERE user_id = ?`,
          [user.user_id]
        );
        if (pRows.length === 0) {
          await db.execute(
            "INSERT INTO data_pemain (user_id, nama, posisi, umur, no_jersi) VALUES (?, ?, ?, ?, ?)",
            [user.user_id, user.username, 2, 0, 0]
          );
          [pRows] = await db.execute(
            `SELECT 
              nama,
              posisi,
              no_jersi,
              umur,
              no_matrik,
              no_telefon,
              email
            FROM data_pemain
            WHERE user_id = ?`,
            [user.user_id]
          );
        }
        if (pRows.length > 0) {
          const p = pRows[0];
          profile = {
            nama: p.nama,
            posisi: normalizePosisi(p.posisi),
            posisiLabel: normalizePosisi(p.posisi) === 1 ? "KEEPER" : "FLEXIBLE",
            no_jersi: p.no_jersi,
            umur: p.umur,
            no_matrik: p.no_matrik,
            no_telefon: p.no_telefon,
            email: p.email
          };
        }
      } catch (e) {
        profile = null;
      }
    }
    res.json({
      token,
      role: userRole,
      userId: user.user_id,
      username: user.username,
      profile
    });
  } catch (error) {
    console.error("=== RALAT LOG MASUK ===");
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);
    console.error("Error stack:", error.stack);
    res.status(500).json({ message: "Log masuk gagal. Sila cuba lagi." });
  }
});

app.post('/api/register', async (req, res) => {
  const { username, password, role, posisi } = req.body;
  const normalizedRole = normalizeRole(role) || "Pemain";

  if (!username || !password || !normalizedRole) {
    return res.status(400).json({ message: "Sila isi semua medan yang diperlukan." });
  }

  try {
    if (normalizedRole !== "Pemain") {
      const authHeader = req.headers && req.headers["authorization"];
      const token = authHeader && String(authHeader).startsWith("Bearer ") ? String(authHeader).slice(7) : null;
      if (!token) {
        return res.status(403).json({ message: "Pendaftaran akaun Pentadbir/Jurulatih tidak dibenarkan. Hanya Pentadbir boleh cipta akaun ini." });
      }
      let requester = null;
      try {
        requester = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
      } catch {
        requester = null;
      }
      const requesterRole = normalizeRole(requester && requester.role);
      if (requesterRole !== "Pentadbir") {
        return res.status(403).json({ message: "Akses ditolak. Hanya Pentadbir boleh cipta akaun Pentadbir/Jurulatih." });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [userResult] = await db.execute(
      "INSERT INTO user (username, password, role) VALUES (?, ?, ?)",
      [username, hashedPassword, normalizedRole]
    );

    const userId = userResult.insertId;

    if (normalizedRole === "Pemain") {
      await db.execute(
        "INSERT INTO data_pemain (user_id, nama, posisi, umur, no_jersi) VALUES (?, ?, ?, ?, ?)",
        [userId, username, normalizePosisi(posisi), 0, 0]
      );
    }

    res.status(201).json({ message: "Pendaftaran berjaya!" });
  } catch (error) {
    if (error && error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Nama pengguna telah wujud." });
    }
    console.error("Ralat pendaftaran:", error);
    res.status(500).json({ message: "Pendaftaran gagal. Sila cuba lagi." });
  }
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

app.get('/api/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const [uRows] = await db.execute(
      "SELECT user_id as userId, username, role FROM user WHERE user_id = ?",
      [userId]
    );
    if (uRows.length === 0) {
      return res.status(404).json({ message: "Pengguna tidak dijumpai." });
    }
    const u = uRows[0];
    const userRole = normalizeRole(u.role);
    let profile = null;
    if (userRole === "Pemain") {
      let [pRows] = await db.execute(
        `SELECT 
          nama,
          posisi,
          no_jersi,
          umur,
          no_matrik,
          no_telefon,
          email
        FROM data_pemain
        WHERE user_id = ?`,
        [userId]
      );
      if (pRows.length === 0) {
        await db.execute(
          "INSERT INTO data_pemain (user_id, nama, posisi, umur, no_jersi) VALUES (?, ?, ?, ?, ?)",
          [userId, u.username, 2, 0, 0]
        );
        [pRows] = await db.execute(
          `SELECT 
            nama,
            posisi,
            no_jersi,
            umur,
            no_matrik,
            no_telefon,
            email
          FROM data_pemain
          WHERE user_id = ?`,
          [userId]
        );
      }
      if (pRows.length > 0) {
        const p = pRows[0];
        profile = {
          nama: p.nama,
          posisi: normalizePosisi(p.posisi),
          posisiLabel: normalizePosisi(p.posisi) === 1 ? "KEEPER" : "FLEXIBLE",
          no_jersi: p.no_jersi,
          umur: p.umur,
          no_matrik: p.no_matrik,
          no_telefon: p.no_telefon,
          email: p.email
        };
      }
    }
    res.json({ userId: u.userId, username: u.username, role: userRole, profile });
  } catch (error) {
    console.error("Ralat mendapatkan maklumat pengguna:", error);
    res.status(500).json({ message: "Gagal mendapatkan maklumat pengguna." });
  }
});

app.get('/api/pemain', authenticateToken, async (req, res) => {
  try {
    const includeInactive = String((req.query && req.query.include_inactive) || "").trim() === "1";
    const [rows] = await db.execute(`
      SELECT 
        p.pemain_id as pemainID, 
        u.username, 
        p.nama, 
        CASE WHEN p.posisi = 1 THEN 'KEEPER' ELSE 'FLEXIBLE' END as posisi,
        u.is_active as isActive
      FROM user u 
      JOIN data_pemain p ON u.user_id = p.user_id
      ${includeInactive ? "" : "WHERE u.is_active = 1"}
    `);
    res.json(rows);
  } catch (error) {
    console.error("Ralat mendapatkan data pemain:", error);
    res.status(500).json({ message: "Gagal mendapatkan data pemain." });
  }
});

app.get('/api/pemain/profil', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        u.username, 
        p.nama, 
        CASE WHEN p.posisi = 1 THEN 'KEEPER' ELSE 'FLEXIBLE' END as posisi,
        p.no_jersi, 
        p.umur,
        p.no_matrik,
        p.no_telefon,
        p.email
      FROM user u 
      JOIN data_pemain p ON u.user_id = p.user_id 
      WHERE u.user_id = ?
    `, [req.user.userId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Profil pemain tidak dijumpai.' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error("Ralat mendapatkan profil pemain:", error);
    res.status(500).json({ message: "Gagal mendapatkan profil pemain." });
  }
});

app.put('/api/pemain/profil', authenticateToken, async (req, res) => {
  try {
    const { 
      nama, 
      posisi, 
      no_jersi, 
      umur, 
      no_matrik, 
      no_telefon, 
      email
    } = req.body;
    
    const userId = req.user.userId;

    if (!nama || !posisi) {
      return res.status(400).json({ message: "Sila isi semua medan yang diperlukan." });
    }

    await db.execute(
      `UPDATE data_pemain SET 
        nama = ?, 
        posisi = ?, 
        no_jersi = ?, 
        umur = ?,
        no_matrik = ?,
        no_telefon = ?,
        email = ?
       WHERE user_id = ?`,
      [
        nama, 
        normalizePosisi(posisi),
        no_jersi || null, 
        umur || null, 
        no_matrik || null,
        no_telefon || null,
        email || null,
        userId
      ]
    );

    res.json({ message: "Profil berjaya dikemas kini." });
  } catch (error) {
    console.error("Ralat mengemas kini profil:", error);
    res.status(500).json({ message: "Gagal mengemas kini profil." });
  }
});

app.put('/api/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Sila masukkan kata laluan semasa dan baharu." });
    }

    const [rows] = await db.execute("SELECT password FROM user WHERE user_id = ?", [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Pengguna tidak dijumpai." });
    }

    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Kata laluan semasa tidak sah." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.execute("UPDATE user SET password = ? WHERE user_id = ?", [hashedPassword, userId]);

    res.json({ message: "Kata laluan berjaya ditukar." });
  } catch (error) {
    console.error("Ralat menukar kata laluan:", error);
    res.status(500).json({ message: "Gagal menukar kata laluan." });
  }
});

app.post('/api/penilaian', authenticateToken, async (req, res) => {
  try {
    const userRole = normalizeRole(req.user && req.user.role);
    if (userRole !== "Jurulatih") {
      return res.status(403).json({ message: "Akses ditolak. Hanya Jurulatih boleh simpan penilaian." });
    }

    const { pemainID, tarikh, teknikal, fizikal, taktikal, mental, komen } = req.body || {};
    const pid = Number(pemainID);
    if (!pid || Number.isNaN(pid)) {
      return res.status(400).json({ message: "Pemain tidak sah." });
    }
    if (!tarikh) {
      return res.status(400).json({ message: "Tarikh diperlukan." });
    }

    const asScore = (v) => {
      const n = Number(v);
      if (Number.isNaN(n)) return null;
      return Math.max(1, Math.min(10, Math.round(n)));
    };

    const sTeknikal = asScore(teknikal);
    const sFizikal = asScore(fizikal);
    const sTaktikal = asScore(taktikal);
    const sMental = asScore(mental);
    if (sTeknikal === null || sFizikal === null || sTaktikal === null || sMental === null) {
      return res.status(400).json({ message: "Skor penilaian tidak sah." });
    }

    await db.execute(`
      CREATE TABLE IF NOT EXISTS penilaian_pemain (
        penilaian_id INT AUTO_INCREMENT PRIMARY KEY,
        pemain_id INT NOT NULL,
        jurulatih_user_id INT NOT NULL,
        tarikh DATE NOT NULL,
        teknikal TINYINT NOT NULL,
        fizikal TINYINT NOT NULL,
        taktikal TINYINT NOT NULL,
        mental TINYINT NOT NULL,
        komen TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    const [pRows] = await db.execute("SELECT pemain_id FROM data_pemain WHERE pemain_id = ?", [pid]);
    if (pRows.length === 0) {
      return res.status(404).json({ message: "Pemain tidak dijumpai." });
    }

    await db.execute(
      `INSERT INTO penilaian_pemain
        (pemain_id, jurulatih_user_id, tarikh, teknikal, fizikal, taktikal, mental, komen)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        pid,
        req.user.userId,
        tarikh,
        sTeknikal,
        sFizikal,
        sTaktikal,
        sMental,
        komen ? String(komen) : null,
      ]
    );

    res.status(201).json({ message: "Penilaian berjaya disimpan." });
  } catch (error) {
    console.error("Ralat menyimpan penilaian:", error);
    res.status(500).json({ message: "Gagal menyimpan penilaian." });
  }
});

app.get('/api/penilaian', authenticateToken, async (req, res) => {
  try {
    const userRole = normalizeRole(req.user && req.user.role);
    if (userRole !== "Pentadbir" && userRole !== "Jurulatih") {
      return res.status(403).json({ message: "Akses ditolak." });
    }

    await db.execute(`
      CREATE TABLE IF NOT EXISTS penilaian_pemain (
        penilaian_id INT AUTO_INCREMENT PRIMARY KEY,
        pemain_id INT NOT NULL,
        jurulatih_user_id INT NOT NULL,
        tarikh DATE NOT NULL,
        teknikal TINYINT NOT NULL,
        fizikal TINYINT NOT NULL,
        taktikal TINYINT NOT NULL,
        mental TINYINT NOT NULL,
        komen TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    const [rows] = await db.execute(
      `SELECT 
        pp.penilaian_id as penilaianID,
        pp.tarikh,
        pp.teknikal,
        pp.fizikal,
        pp.taktikal,
        pp.mental,
        pp.komen,
        p.pemain_id as pemainID,
        p.nama as nama,
        u.username as username
      FROM penilaian_pemain pp
      JOIN data_pemain p ON pp.pemain_id = p.pemain_id
      JOIN user u ON p.user_id = u.user_id
      ORDER BY pp.tarikh DESC, pp.penilaian_id DESC
      LIMIT 500`
    );

    res.json(rows);
  } catch (error) {
    console.error("Ralat mendapatkan penilaian:", error);
    res.status(500).json({ message: "Gagal mendapatkan penilaian." });
  }
});



app.post('/api/jadual', authenticateToken, async (req, res) => {
  try {
    const userRole = normalizeRole(req.user && req.user.role);
    if (userRole !== "Pentadbir" && userRole !== "Jurulatih") {
      return res.status(403).json({ message: "Akses ditolak. Hanya Pentadbir atau Jurulatih boleh urus jadual." });
    }
    const { jenis, tarikh, masa, lokasi, keterangan } = req.body;
    if (!jenis || !tarikh || !masa || !lokasi) {
      return res.status(400).json({ message: "Sila isi semua medan yang diperlukan." });
    }
    const isLatihan = String(jenis).toLowerCase().includes('latih');
    const kategori = isLatihan ? "LATIHAN" : "PERLAWANAN";
    const sql = "INSERT INTO jadual_aktiviti (kategori, jenis_aktiviti, tarikh, masa, lokasi, keterangan, kehadiran_json) VALUES (?, ?, ?, ?, ?, ?, ?)";
    const params = [kategori, jenis, tarikh, masa, lokasi, keterangan || null, isLatihan ? JSON.stringify([]) : null];
    const [result] = await db.execute(sql, params);
    res.status(201).json({ message: "Jadual berjaya ditambah.", insertId: result.insertId });
  } catch (error) {
    console.error("Ralat menambah jadual:", error);
    res.status(500).json({ message: "Gagal menambah jadual." });
  }
});

app.put('/api/jadual/:id', authenticateToken, async (req, res) => {
  try {
    const userRole = normalizeRole(req.user && req.user.role);
    if (userRole !== "Pentadbir" && userRole !== "Jurulatih") {
      return res.status(403).json({ message: "Akses ditolak. Hanya Pentadbir atau Jurulatih boleh urus jadual." });
    }
    const { id } = req.params;
    const { jenis, tarikh, masa, lokasi, keterangan } = req.body;
    if (!jenis || !tarikh || !masa || !lokasi) {
      return res.status(400).json({ message: "Sila isi semua medan yang diperlukan." });
    }
    const isLatihanBaru = String(jenis).toLowerCase().includes('latih');
    const [existing] = await db.execute("SELECT jadual_id, kategori, kehadiran_json FROM jadual_aktiviti WHERE jadual_id = ?", [id]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ message: "Jadual tidak dijumpai." });
    }
    const kategori = isLatihanBaru ? "LATIHAN" : "PERLAWANAN";
    const currentKehadiran = existing[0].kehadiran_json;
    const nextKehadiran = kategori === "LATIHAN"
      ? (currentKehadiran ? currentKehadiran : JSON.stringify([]))
      : null;
    await db.execute(
      "UPDATE jadual_aktiviti SET kategori = ?, jenis_aktiviti = ?, tarikh = ?, masa = ?, lokasi = ?, keterangan = ?, kehadiran_json = ? WHERE jadual_id = ?",
      [kategori, jenis, tarikh, masa, lokasi, keterangan || null, nextKehadiran, id]
    );
    res.json({ message: "Jadual berjaya dikemas kini." });
  } catch (error) {
    console.error("Ralat mengemas kini jadual:", error);
    res.status(500).json({ message: "Gagal mengemas kini jadual." });
  }
});

app.delete('/api/jadual/:id', authenticateToken, async (req, res) => {
  try {
    const userRole = normalizeRole(req.user && req.user.role);
    if (userRole !== "Pentadbir" && userRole !== "Jurulatih") {
      return res.status(403).json({ message: "Akses ditolak. Hanya Pentadbir atau Jurulatih boleh urus jadual." });
    }
    const { id } = req.params;
    await db.execute("DELETE FROM jadual_aktiviti WHERE jadual_id = ?", [id]);
    res.json({ message: "Jadual berjaya dipadam." });
  } catch (error) {
    console.error("Ralat memadam jadual:", error);
    res.status(500).json({ message: "Gagal memadam jadual." });
  }
});

app.get('/api/prestasi/pemain/saya', authenticateToken, async (req, res) => {
  try {
    const [pemainRows] = await db.execute("SELECT pemain_id FROM data_pemain WHERE user_id = ?", [req.user.userId]);
    if (pemainRows.length === 0) {
      return res.status(404).json({ message: "Pemain tidak dijumpai." });
    }
    const pemainID = pemainRows[0].pemain_id;

    const [rows] = await db.execute(`
      SELECT 
        d.perlawanan_id as statistik_id,
        d.pemain_id,
        d.tarikh,
        d.jaringan as gol,
        d.assist,
        CASE WHEN d.kad = 'Kuning' THEN 1 ELSE 0 END as kad_kuning,
        CASE WHEN d.kad = 'Merah' THEN 1 ELSE 0 END as kad_merah,
        d.skor as skor_perlawanan
      FROM data_perlawanan d
      WHERE d.pemain_id = ?
      ORDER BY d.tarikh DESC
    `, [pemainID]);
    res.json(rows);
  } catch (error) {
    console.error("Ralat mendapatkan data prestasi pemain:", error);
    res.status(500).json({ message: "Gagal mendapatkan data prestasi pemain." });
  }
});

app.get('/api/prestasi/pemain/:pemainId', authenticateToken, async (req, res) => {
  try {
    const userRole = normalizeRole(req.user && req.user.role);
    if (userRole !== "Pentadbir" && userRole !== "Jurulatih") {
      return res.status(403).json({ message: "Akses ditolak." });
    }
    const { pemainId } = req.params;
    const [rows] = await db.execute(`
      SELECT 
        d.perlawanan_id as statistik_id,
        d.pemain_id,
        d.tarikh,
        d.jaringan as gol,
        d.assist,
        CASE WHEN d.kad = 'Kuning' THEN 1 ELSE 0 END as kad_kuning,
        CASE WHEN d.kad = 'Merah' THEN 1 ELSE 0 END as kad_merah,
        d.skor as skor_perlawanan
      FROM data_perlawanan d
      WHERE d.pemain_id = ?
      ORDER BY d.tarikh DESC
    `, [pemainId]);
    res.json(rows);
  } catch (error) {
    console.error("Ralat mendapatkan data prestasi:", error);
    res.status(500).json({ message: "Gagal mendapatkan data prestasi." });
  }
});

app.post('/api/prestasi', authenticateToken, async (req, res) => {
  try {
    const userRole = normalizeRole(req.user && req.user.role);
    if (userRole !== "Pentadbir" && userRole !== "Jurulatih") {
      return res.status(403).json({ message: "Akses ditolak. Hanya Jurulatih atau Pentadbir boleh tambah prestasi." });
    }
    const { pemainID, tarikh, gol, assist, kad_kuning, kad_merah, skor_perlawanan } = req.body;
    if (!pemainID || !tarikh) {
      return res.status(400).json({ message: "Sila isi semua medan yang diperlukan." });
    }
    
    const kad = kad_kuning ? "Kuning" : (kad_merah ? "Merah" : "Tiada");
    await db.execute(
      "INSERT INTO data_perlawanan (pemain_id, tarikh, jaringan, assist, kad, skor) VALUES (?, ?, ?, ?, ?, ?)",
      [pemainID, tarikh, gol || 0, assist || 0, kad, skor_perlawanan || null]
    );

    res.status(201).json({ message: "Prestasi berjaya ditambah." });
  } catch (error) {
    console.error("Ralat menambah prestasi:", error);
    res.status(500).json({ message: "Gagal menambah prestasi." });
  }
});

app.get('/api/prestasi/tarikh/:date', authenticateToken, async (req, res) => {
  try {
    const userRole = normalizeRole(req.user && req.user.role);
    if (userRole !== "Pentadbir" && userRole !== "Jurulatih") {
      return res.status(403).json({ message: "Akses ditolak." });
    }
    const { date } = req.params;
    const [rows] = await db.execute(`
      SELECT 
        d.perlawanan_id as statistik_id,
        p.nama as nama_pemain, 
        u.username,
        d.jaringan as gol,
        d.assist,
        CASE WHEN d.kad = 'Kuning' THEN 1 ELSE 0 END as kad_kuning,
        CASE WHEN d.kad = 'Merah' THEN 1 ELSE 0 END as kad_merah,
        d.skor as skor_perlawanan
      FROM data_perlawanan d
      JOIN data_pemain p ON d.pemain_id = p.pemain_id
      JOIN user u ON p.user_id = u.user_id
      WHERE DATE(d.tarikh) = ?
      ORDER BY p.nama
    `, [date]);
    res.json(rows);
  } catch (error) {
    console.error("Ralat mendapatkan data prestasi mengikut tarikh:", error);
    res.status(500).json({ message: "Gagal mendapatkan data prestasi." });
  }
});

app.get('/api/pengumuman', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        jadual_id as pengumumanID,
        tajuk,
        kandungan,
        created_at as tarikh_dibuat,
        0 as isRead,
        0 as isArchived
      FROM jadual_aktiviti
      WHERE kategori = 'PENGUMUMAN' OR jenis_aktiviti = 'Pengumuman'
      ORDER BY created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error("Ralat mendapatkan data pengumuman:", error);
    res.status(500).json({ message: "Gagal mendapatkan data pengumuman." });
  }
});

app.post('/api/pengumuman', authenticateToken, async (req, res) => {
  try {
    const userRole = normalizeRole(req.user && req.user.role);
    if (userRole !== "Pentadbir" && userRole !== "Jurulatih") {
      return res.status(403).json({ message: "Akses ditolak. Hanya Pentadbir atau Jurulatih boleh buat pengumuman." });
    }
    const { tajuk, kandungan } = req.body;
    if (!tajuk || !kandungan) {
      return res.status(400).json({ message: "Sila isi semua medan yang diperlukan." });
    }
    const [result] = await db.execute(
      `INSERT INTO jadual_aktiviti (kategori, jenis_aktiviti, tarikh, masa, lokasi, keterangan, tajuk, kandungan)
       VALUES ('PENGUMUMAN', 'Pengumuman', CURDATE(), CURTIME(), '-', NULL, ?, ?)`,
      [tajuk, kandungan]
    );
    res.status(201).json({ message: "Pengumuman berjaya dibuat.", insertId: result.insertId });
  } catch (error) {
    console.error("Ralat membuat pengumuman:", error);
    res.status(500).json({ message: "Gagal membuat pengumuman." });
  }
});

app.patch('/api/pengumuman/:id', authenticateToken, async (req, res) => {
  try {
    const userRole = normalizeRole(req.user && req.user.role);
    if (userRole !== "Pentadbir" && userRole !== "Jurulatih") {
      return res.status(403).json({ message: "Akses ditolak." });
    }
    res.json({ message: "Pengumuman berjaya dikemas kini." });
  } catch (error) {
    console.error("Ralat mengemas kini pengumuman:", error);
    res.status(500).json({ message: "Gagal mengemas kini pengumuman." });
  }
});

app.get('/api/kehadiran', authenticateToken, async (req, res) => {
  try {
    const userRole = normalizeRole(req.user && req.user.role);
    if (userRole !== "Pentadbir" && userRole !== "Jurulatih") {
      return res.status(403).json({ message: "Akses ditolak." });
    }
    const [latihanRows] = await db.execute("SELECT jadual_id, tarikh, kehadiran_json FROM jadual_aktiviti WHERE kategori = 'LATIHAN' ORDER BY tarikh DESC");
    const output = [];
    for (const l of latihanRows) {
      let records = [];
      try {
        records = l.kehadiran_json ? JSON.parse(l.kehadiran_json) : [];
      } catch (e) {
        records = [];
      }
      for (const r of records) {
        output.push({
          jadual_id: l.jadual_id,
          tarikh: l.tarikh,
          pemainID: r.pemainID,
          status: r.status,
          catatan: r.catatan || null
        });
      }
    }
    res.json(output);
  } catch (error) {
    console.error("Ralat mendapatkan data kehadiran:", error);
    res.status(500).json({ message: "Gagal mendapatkan data kehadiran." });
  }
});

app.get('/api/kehadiran/pemain/saya', authenticateToken, async (req, res) => {
  try {
    const userRole = normalizeRole(req.user && req.user.role);
    if (userRole !== "Pemain") {
      return res.status(403).json({ message: "Akses ditolak." });
    }

    const [pemainRows] = await db.execute("SELECT pemain_id FROM data_pemain WHERE user_id = ?", [req.user.userId]);
    if (!pemainRows || pemainRows.length === 0) {
      return res.json([]);
    }
    const pemainID = pemainRows[0].pemain_id;

    const [latihanRows] = await db.execute(
      "SELECT jadual_id, DATE_FORMAT(tarikh, '%Y-%m-%d') as tarikh, kehadiran_json FROM jadual_aktiviti WHERE kategori = 'LATIHAN' ORDER BY tarikh DESC"
    );

    const output = [];
    for (const l of latihanRows || []) {
      let records = [];
      try {
        records = l.kehadiran_json ? JSON.parse(l.kehadiran_json) : [];
      } catch (e) {
        records = [];
      }
      const matched = (records || []).find((r) => Number(r && r.pemainID) === Number(pemainID));
      if (matched) {
        output.push({
          jadualID: l.jadual_id,
          status: matched.status,
          jenis: "Latihan",
          tarikh: l.tarikh
        });
      }
    }

    res.json(output);
  } catch (error) {
    console.error("Ralat mendapatkan data kehadiran pemain:", error);
    res.status(500).json({ message: "Gagal mendapatkan data kehadiran." });
  }
});

app.get('/api/dashboard/coach', authenticateToken, async (req, res) => {
  try {
    const userRole = normalizeRole(req.user && req.user.role);
    if (userRole !== "Jurulatih") {
      return res.status(403).json({ message: "Akses ditolak." });
    }
    const [topPlayer] = await db.execute(`
      SELECT p.nama, AVG(COALESCE(d.skor, 0)) as rating 
      FROM data_perlawanan d
      JOIN data_pemain p ON d.pemain_id = p.pemain_id 
      GROUP BY p.pemain_id 
      ORDER BY rating DESC 
      LIMIT 1
    `);

    const [teamStats] = await db.execute(`
      SELECT SUM(jaringan) as total_gol FROM data_perlawanan
    `);
    const [matchStats] = await db.execute(`
      SELECT COUNT(*) as total_matches FROM jadual_aktiviti
      WHERE kategori = 'PERLAWANAN' AND (jenis_aktiviti LIKE '%perlawanan%' OR jenis_aktiviti LIKE '%game%')
    `);
    const [latihanRows] = await db.execute(`SELECT kehadiran_json FROM jadual_aktiviti WHERE kategori = 'LATIHAN'`);
    let totalRecords = 0;
    let totalPresent = 0;
    for (const row of latihanRows) {
      let records = [];
      try {
        records = row.kehadiran_json ? JSON.parse(row.kehadiran_json) : [];
      } catch (e) {
        records = [];
      }
      totalRecords += records.length;
      totalPresent += records.filter(r => r && r.status === 'Hadir').length;
    }

    const [keepers] = await db.execute(`
      SELECT p.nama, COALESCE(AVG(d.skor), 0) as rating
      FROM data_pemain p
      LEFT JOIN data_perlawanan d ON p.pemain_id = d.pemain_id
      WHERE p.posisi = 1
      GROUP BY p.pemain_id
      ORDER BY rating DESC
      LIMIT 1
    `);

    const [flexibles] = await db.execute(`
      SELECT p.nama, COALESCE(AVG(d.skor), 0) as rating
      FROM data_pemain p
      LEFT JOIN data_perlawanan d ON p.pemain_id = d.pemain_id
      WHERE p.posisi = 2
      GROUP BY p.pemain_id
      ORDER BY rating DESC
      LIMIT 4
    `);

    const lineup = {
      GK: keepers,
      Fixo: flexibles.slice(0, 1),
      Ala: flexibles.slice(1, 3),
      Pivot: flexibles.slice(3, 4)
    };

    res.json({
      topPlayer: topPlayer[0] || { nama: "Tiada Data", rating: 0 },
      teamStats: {
        goals: teamStats[0].total_gol || 0,
        matches: matchStats[0].total_matches || 0
      },
      attendance: {
        total: totalRecords || 0,
        present: totalPresent || 0
      },
      lineup
    });

  } catch (error) {
    console.error("Ralat mendapatkan data dashboard jurulatih:", error);
    res.status(500).json({ message: "Gagal mendapatkan data dashboard." });
  }
});

app.delete('/api/pemain/:id', authenticateToken, async (req, res) => {
  try {
    const userRole = normalizeRole(req.user && req.user.role);
    if (userRole !== "Pentadbir") {
      return res.status(403).json({ message: "Akses ditolak. Hanya Pentadbir boleh nyahaktif pemain." });
    }
    const { id } = req.params;
    
    const [users] = await db.execute("SELECT user_id FROM user WHERE username = ?", [id]);
    if (users.length === 0) {
      return res.status(404).json({ message: "Pemain tidak dijumpai." });
    }
    const userID = users[0].user_id;

    await db.execute("UPDATE user SET is_active = 0 WHERE user_id = ?", [userID]);
    res.json({ message: "Pemain berjaya dinyahaktifkan." });
  } catch (error) {
    console.error("Ralat memadam pemain:", error);
    res.status(500).json({ message: "Gagal nyahaktifkan pemain." });
  }
});

app.patch('/api/pemain/:id/active', authenticateToken, async (req, res) => {
  try {
    const userRole = normalizeRole(req.user && req.user.role);
    if (userRole !== "Pentadbir") {
      return res.status(403).json({ message: "Akses ditolak. Hanya Pentadbir boleh aktif/nyahaktif pemain." });
    }
    const { id } = req.params;
    const desired = req.body && (req.body.is_active ?? req.body.isActive);
    const isActive = desired === 0 || desired === "0" || desired === false ? 0 : 1;

    const [users] = await db.execute("SELECT user_id FROM user WHERE username = ?", [id]);
    if (users.length === 0) {
      return res.status(404).json({ message: "Pemain tidak dijumpai." });
    }
    const userID = users[0].user_id;
    await db.execute("UPDATE user SET is_active = ? WHERE user_id = ?", [isActive, userID]);
    res.json({ message: isActive ? "Pemain berjaya diaktifkan." : "Pemain berjaya dinyahaktifkan." });
  } catch (error) {
    console.error("Ralat aktif/nyahaktif pemain:", error);
    res.status(500).json({ message: "Gagal kemas kini status pemain." });
  }
});

app.get('/api/jadual', authenticateToken, async (req, res) => {
  try {
    const requestedKategoriRaw = req.query && req.query.kategori ? String(req.query.kategori) : "";
    const requestedKategori = requestedKategoriRaw.trim().toUpperCase();

    let whereSql = "WHERE (kategori <> 'PENGUMUMAN') AND (jenis_aktiviti <> 'Pengumuman')";
    const params = [];
    if (requestedKategori) {
      whereSql += " AND kategori = ?";
      params.push(requestedKategori);
    }

    const [rows] = await db.execute(
      `
      SELECT 
        jadual_id as jadualID,
        kategori,
        jenis_aktiviti as jenis,
        DATE_FORMAT(tarikh, '%Y-%m-%d') as tarikh,
        masa,
        lokasi,
        COALESCE(keterangan,'') as keterangan
      FROM jadual_aktiviti
      ${whereSql}
      ORDER BY tarikh, masa
      `,
      params
    );
    res.json(rows);
  } catch (error) {
    console.error("Ralat mendapatkan jadual:", error);
    res.status(500).json({ message: "Gagal mendapatkan jadual." });
  }
});

app.get('/api/kehadiran/jadual/:jadualId', authenticateToken, async (req, res) => {
  try {
    const userRole = normalizeRole(req.user && req.user.role);
    if (userRole !== "Pentadbir" && userRole !== "Jurulatih") {
      return res.status(403).json({ message: "Akses ditolak." });
    }
    const { jadualId } = req.params;
    const [rows] = await db.execute("SELECT kehadiran_json FROM jadual_aktiviti WHERE jadual_id = ? AND kategori = 'LATIHAN'", [jadualId]);
    if (rows.length === 0) return res.status(404).json({ message: "Jadual latihan tidak dijumpai." });
    let records = [];
    try {
      records = rows[0].kehadiran_json ? JSON.parse(rows[0].kehadiran_json) : [];
    } catch (e) {
      records = [];
    }
    res.json(records);
  } catch (error) {
    console.error("Ralat mendapatkan data kehadiran:", error);
    res.status(500).json({ message: "Gagal mendapatkan data kehadiran." });
  }
});

app.post('/api/kehadiran/bulk', authenticateToken, async (req, res) => {
  try {
    const userRole = normalizeRole(req.user && req.user.role);
    if (userRole !== "Pentadbir" && userRole !== "Jurulatih") {
      return res.status(403).json({ message: "Akses ditolak. Hanya Jurulatih atau Pentadbir boleh simpan kehadiran." });
    }
    console.log("=== Menerima permintaan simpan kehadiran ===");
    const { records } = req.body;
    console.log("Data yang diterima:", records);
    
    if (!records || records.length === 0) {
      return res.status(400).json({ message: "Tiada rekod kehadiran untuk disimpan." });
    }

    const byJadual = new Map();
    for (const record of records) {
      const jadualID = record.jadualID;
      if (!byJadual.has(jadualID)) byJadual.set(jadualID, []);
      byJadual.get(jadualID).push({
        pemainID: record.pemainID,
        status: record.status,
        catatan: record.catatan || null
      });
    }

    for (const [jadualID, list] of byJadual.entries()) {
      const [exists] = await db.execute("SELECT jadual_id FROM jadual_aktiviti WHERE jadual_id = ? AND kategori = 'LATIHAN'", [jadualID]);
      if (exists.length === 0) return res.status(404).json({ message: "Jadual latihan tidak dijumpai: " + jadualID });
      await db.execute("UPDATE jadual_aktiviti SET kehadiran_json = ? WHERE jadual_id = ? AND kategori = 'LATIHAN'", [JSON.stringify(list), jadualID]);
    }

    console.log("=== Semua rekod berjaya disimpan ===");
    res.json({ message: "Kehadiran berjaya disimpan!" });
  } catch (error) {
    console.error("=== RALAT MENYIMPAN KEHADIRAN ===");
    console.error("Mesej ralat:", error.message);
    console.error("Kod ralat:", error.code);
    console.error("Stack:", error.stack);
    res.status(500).json({ message: "Gagal menyimpan kehadiran: " + error.message });
  }
});

app.post('/api/bukti-latihan/hantar', authenticateToken, async (req, res) => {
  try {
    const userRole = normalizeRole(req.user && req.user.role);
    if (userRole !== "Pemain") {
      return res.status(403).json({ message: "Akses ditolak. Hanya Pemain boleh hantar tugasan." });
    }

    const { jadual_id, catatan, buktiBase64, fileName } = req.body || {};
    const jadualId = jadual_id ? Number(jadual_id) : null;
    if (!jadualId) {
      return res.status(400).json({ message: "Sila pilih tugasan latihan terlebih dahulu." });
    }
    if (!buktiBase64) {
      return res.status(400).json({ message: "Sila pilih fail bukti." });
    }

    const [pemainRows] = await db.execute("SELECT pemain_id FROM data_pemain WHERE user_id = ?", [req.user.userId]);
    if (pemainRows.length === 0) {
      return res.status(404).json({ message: "Pemain tidak dijumpai." });
    }
    const pemainId = pemainRows[0].pemain_id;

    const [jadualRows] = await db.execute(
      "SELECT jadual_id FROM jadual_aktiviti WHERE jadual_id = ? AND kategori = 'LATIHAN'",
      [jadualId]
    );
    if (jadualRows.length === 0) {
      return res.status(404).json({ message: "Jadual latihan tidak dijumpai." });
    }

    const [cols] = await db.execute("SHOW COLUMNS FROM bukti_latihan");
    const colSet = new Set(cols.map((c) => String(c.Field)));

    let storedFilePath = "";
    const filePathCol = colSet.has("file_path") ? "file_path" : (colSet.has("path") ? "path" : null);
    if (filePathCol) {
      const raw = String(buktiBase64);
      const match = raw.match(/^data:([a-zA-Z0-9/+.-]+);base64,(.+)$/);
      const base64Data = match ? match[2] : raw;
      const buffer = Buffer.from(base64Data, "base64");

      const safeOriginal = fileName ? String(fileName).replace(/[^\w.\-() ]+/g, "_") : "bukti";
      const originalExt = path.extname(safeOriginal) || ".bin";
      const storedName = `bukti_${Date.now()}_${Math.random().toString(16).slice(2)}${originalExt}`;
      const absolutePath = path.join(uploadsDir, storedName);

      fs.writeFileSync(absolutePath, buffer);
      storedFilePath = `/uploads/${storedName}`;
    }

    const insertCols = [];
    const insertVals = [];

    if (colSet.has("jadual_id")) {
      insertCols.push("jadual_id");
      insertVals.push(jadualId);
    }
    if (colSet.has("pemain_id")) {
      insertCols.push("pemain_id");
      insertVals.push(pemainId);
    }

    const noteCol = colSet.has("catatan") ? "catatan" : (colSet.has("nota") ? "nota" : null);
    if (noteCol) {
      insertCols.push(noteCol);
      insertVals.push(catatan ? String(catatan) : "");
    }

    const fnCol = colSet.has("file_name") ? "file_name" : (colSet.has("nama_fail") ? "nama_fail" : null);
    if (fnCol) {
      insertCols.push(fnCol);
      insertVals.push(fileName ? String(fileName) : "");
    }

    if (filePathCol) {
      insertCols.push(filePathCol);
      insertVals.push(storedFilePath);
    }

    const buktiColCandidates = ["bukti_base64", "bukti", "bukti_fail", "buktiFile", "bukti_path", "bukti_url"];
    const buktiCol = buktiColCandidates.find((c) => colSet.has(c)) || null;
    if (buktiCol) {
      insertCols.push(buktiCol);
      insertVals.push(String(buktiBase64));
    }

    const dateCol = colSet.has("tarikh_hantar") ? "tarikh_hantar" : (colSet.has("created_at") ? "created_at" : null);
    if (dateCol && insertCols.indexOf(dateCol) === -1) {
      insertCols.push(dateCol);
      insertVals.push(new Date());
    }

    if (insertCols.length === 0) {
      return res.status(500).json({ message: "Struktur jadual bukti_latihan tidak serasi." });
    }

    const placeholders = insertCols.map(() => "?").join(", ");
    const sql = `INSERT INTO bukti_latihan (${insertCols.join(", ")}) VALUES (${placeholders})`;
    await db.execute(sql, insertVals);

    res.status(201).json({ message: "Tugasan berjaya dihantar!" });
  } catch (error) {
    console.error("Ralat menghantar tugasan:", error);
    res.status(500).json({ message: "Gagal menghantar tugasan." });
  }
});

app.post('/api/lineup', authenticateToken, async (req, res) => {
  try {
    const userRole = normalizeRole(req.user && req.user.role);
    if (userRole !== "Jurulatih") {
      return res.status(403).json({ message: "Akses ditolak. Line Up hanya untuk Jurulatih." });
    }
    const { formasi, pemain_positions, jadual_id } = req.body;
    
    await db.execute(`
      CREATE TABLE IF NOT EXISTS kesebelasan_utama (
        kesebelasan_id INT AUTO_INCREMENT PRIMARY KEY,
        jadual_id INT,
        formasi VARCHAR(20) NOT NULL,
        pemain_positions LONGTEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (jadual_id) REFERENCES jadual_aktiviti(jadual_id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    const [existing] = await db.execute("SELECT * FROM kesebelasan_utama WHERE jadual_id = ?", [jadual_id || null]);
    
    if (existing.length > 0) {
      await db.execute(
        "UPDATE kesebelasan_utama SET formasi = ?, pemain_positions = ? WHERE jadual_id = ?",
        [formasi, JSON.stringify(pemain_positions), jadual_id || null]
      );
    } else {
      await db.execute(
        "INSERT INTO kesebelasan_utama (jadual_id, formasi, pemain_positions) VALUES (?, ?, ?)",
        [jadual_id || null, formasi, JSON.stringify(pemain_positions)]
      );
    }
    
    res.status(201).json({ message: "Lineup berjaya disimpan!" });
  } catch (error) {
    console.error("Ralat menyimpan lineup:", error);
    res.status(500).json({ message: "Gagal menyimpan lineup." });
  }
});

app.get('/api/lineup', authenticateToken, async (req, res) => {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS kesebelasan_utama (
        kesebelasan_id INT AUTO_INCREMENT PRIMARY KEY,
        jadual_id INT,
        formasi VARCHAR(20) NOT NULL,
        pemain_positions LONGTEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (jadual_id) REFERENCES jadual_aktiviti(jadual_id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    
    const jadualId = req.query && req.query.jadual_id ? Number(req.query.jadual_id) : null;
    let rows;
    if (jadualId) {
      [rows] = await db.execute("SELECT * FROM kesebelasan_utama WHERE jadual_id = ? ORDER BY created_at DESC LIMIT 1", [jadualId]);
    } else {
      [rows] = await db.execute("SELECT * FROM kesebelasan_utama ORDER BY created_at DESC LIMIT 1");
    }
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.json({
        formasi: "1-2-1",
        pemain_positions: {
          gk: { nama: "Pilih", no: "-" },
          fixo: { nama: "Pilih", no: "-" },
          ala1: { nama: "Pilih", no: "-" },
          ala2: { nama: "Pilih", no: "-" },
          pivot: { nama: "Pilih", no: "-" }
        }
      });
    }
  } catch (error) {
    console.error("Ralat mendapatkan lineup:", error);
    res.status(500).json({ message: "Gagal mendapatkan lineup." });
  }
});

app.get('/', (req, res) => {
  res.send("Backend server is running!");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  setInterval(() => {}, 1000);
});
