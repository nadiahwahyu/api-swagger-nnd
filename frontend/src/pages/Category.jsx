import React, { useState, useEffect } from "react";
import axios from "axios";

/* ============================================================
    DATA SHOLAT + TATA CARA (Data Statis Kamu Tetap Utuh)
   ============================================================ */
const SHOLAT_DATA = [
  {
    id: 1,
    nama: "Sholat Subuh",
    jenis: "Wajib",
    tahapan: [
      {
        judul: "Berdiri Menghadap Kiblat",
        deskripsi: "Berdiri tegak menghadap kiblat dengan pandangan ke tempat sujud.",
      },
      {
        judul: "Membaca Niat",
        arab: "اُصَلّى فَرْضَ الصُّبْحِ رَكْعَتَيْنِ مُسْتَقْبِلَ الْقِبْلَةِ اَدَاءً ِللهِ تَعَالَى",
        latin: "Ushollii fardhosh shubhi rak'ataini mustaqbilal qiblati adaa-an lillaahi ta'aala",
        arti: "Aku berniat sholat Subuh dua rakaat karena Allah Ta'ala.",
      },
      { judul: "Takbiratul Ihram" },
      { judul: "Al-Fatihah & Surat" },
      { judul: "Rukuk, I'tidal, Sujud" },
      { judul: "Tasyahud Akhir & Salam" },
    ],
  },
  {
    id: 2,
    nama: "Sholat Dzuhur",
    jenis: "Wajib",
    tahapan: [
      { judul: "Niat Sholat Dzuhur" },
      { judul: "Takbiratul Ihram" },
      { judul: "Al-Fatihah & Surat" },
      { judul: "Rukuk, I'tidal, Sujud" },
      { judul: "Diulang hingga rakaat keempat" },
      { judul: "Tasyahud Akhir & Salam" },
    ],
  },
  {
    id: 3,
    nama: "Sholat Ashar",
    jenis: "Wajib",
    tahapan: [
      { judul: "Niat Sholat Ashar" },
      { judul: "Takbiratul Ihram" },
      { judul: "Al-Fatihah & Surat" },
      { judul: "Rukuk, I'tidal, Sujud" },
      { judul: "Tasyahud Akhir & Salam" },
    ],
  },
  {
    id: 4,
    nama: "Sholat Maghrib",
    jenis: "Wajib",
    tahapan: [
      { judul: "Niat Sholat Maghrib" },
      { judul: "Takbiratul Ihram" },
      { judul: "Al-Fatihah & Surat" },
      { judul: "Tasyahud Akhir & Salam" },
    ],
  },
  {
    id: 5,
    nama: "Sholat Isya",
    jenis: "Wajib",
    tahapan: [
      { judul: "Niat Sholat Isya" },
      { judul: "Takbiratul Ihram" },
      { judul: "Al-Fatihah & Surat" },
      { judul: "Tasyahud Akhir & Salam" },
    ],
  },
  {
    id: 6,
    nama: "Sholat Dhuha",
    jenis: "Sunnah",
    tahapan: [
      { judul: "Niat Sholat Dhuha" },
      { judul: "Takbiratul Ihram" },
      { judul: "Al-Fatihah & Surat" },
      { judul: "Tasyahud Akhir & Salam" },
    ],
  },
  {
    id: 7,
    nama: "Sholat Tahajud",
    jenis: "Sunnah",
    tahapan: [
      { judul: "Niat Sholat Tahajud" },
      { judul: "Takbiratul Ihram" },
      { judul: "Al-Fatihah & Surat" },
      { judul: "Tasyahud Akhir & Salam" },
    ],
  },
  {
    id: 8,
    nama: "Sholat Jenazah",
    jenis: "Khusus",
    tahapan: [
      { judul: "Niat Sholat Jenazah" },
      { judul: "Takbir Pertama" },
      { judul: "Takbir Kedua" },
      { judul: "Takbir Ketiga" },
      { judul: "Takbir Keempat & Salam" },
    ],
  },
];

export default function Dashboard() {
  const [activeId, setActiveId] = useState(null);
  const [categories, setCategories] = useState([]);

  // Ambil data kategori dari Backend agar sinkron
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/categories");
        if (res.data.success) {
          setCategories(res.data.data);
        }
      } catch (err) {
        console.error("Gagal memuat kategori dari database", err);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <h1 className="text-3xl font-extrabold text-center mb-4 text-blue-900">
        E-Muslim: Tata Cara Sholat
      </h1>
      <p className="text-center text-gray-600 mb-10">
        Panduan lengkap niat dan gerakan sholat sesuai sunnah.
      </p>

      {/* Menampilkan Chip Kategori yang ada di Database (Opsional) */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {categories.map((cat) => (
          <span key={cat.id} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
            {cat.name}
          </span>
        ))}
      </div>

      <div className="space-y-6 max-w-5xl mx-auto">
        {SHOLAT_DATA.map((sholat) => (
          <div
            key={sholat.id}
            className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden"
          >
            {/* HEADER MENU */}
            <button
              onClick={() =>
                setActiveId(activeId === sholat.id ? null : sholat.id)
              }
              className={`w-full text-left p-6 flex justify-between items-center transition-all ${
                activeId === sholat.id ? "bg-blue-50" : "hover:bg-gray-50"
              }`}
            >
              <div>
                <h2 className={`text-xl font-bold ${activeId === sholat.id ? "text-blue-700" : "text-gray-800"}`}>
                  {sholat.nama}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    sholat.jenis === "Wajib" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                  }`}>
                    {sholat.jenis}
                  </span>
                </div>
              </div>

              <span className="text-blue-600 font-bold text-sm">
                {activeId === sholat.id ? "TUTUP ▲" : "LIHAT PANDUAN ▼"}
              </span>
            </button>

            {/* TATA CARA */}
            {activeId === sholat.id && (
              <div className="border-t p-6 md:p-10 space-y-10 bg-white">
                {sholat.tahapan.map((step, index) => {
                  const isEven = index % 2 !== 0;

                  return (
                    <div
                      key={index}
                      className={`flex flex-col md:flex-row ${
                        isEven ? "md:flex-row-reverse" : ""
                      } gap-8 items-start`}
                    >
                      {/* Circle Step Number */}
                      <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-black text-xl shadow-lg shadow-blue-200">
                        {index + 1}
                      </div>

                      {/* Step Content */}
                      <div className="bg-gray-50 rounded-2xl p-6 w-full border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-bold text-blue-900 mb-3 border-b pb-2">
                          {step.judul}
                        </h3>

                        {step.deskripsi && (
                          <p className="text-gray-700 leading-relaxed mb-4">
                            {step.deskripsi}
                          </p>
                        )}

                        {step.arab && (
                          <div className="bg-white p-5 rounded-xl border border-gray-100 mb-4 shadow-inner">
                            <p className="text-right text-2xl md:text-3xl font-serif leading-loose text-gray-800" dir="rtl">
                              {step.arab}
                            </p>
                          </div>
                        )}

                        {step.latin && (
                          <p className="italic text-blue-700 font-medium text-sm mb-2 bg-blue-50 p-2 rounded">
                            {step.latin}
                          </p>
                        )}

                        {step.arti && (
                          <p className="text-sm text-gray-600">
                            <span className="font-bold text-gray-400 uppercase text-[10px] block mb-1">Artinya:</span>
                            "{step.arti}"
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}