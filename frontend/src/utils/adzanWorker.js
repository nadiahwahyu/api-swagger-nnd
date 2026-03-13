// src/utils/adzanWorker.js

export const checkAndNotifyAdzan = (jadwalToday) => {
  const sekarang = new Date();
  const jam = String(sekarang.getHours()).padStart(2, '0');
  const menit = String(sekarang.getMinutes()).padStart(2, '0');
  const waktuSekarang = `${jam}:${menit}`;

  // Daftar waktu sholat yang ingin dicek
  const listSholat = ["Subuh", "Dzuhur", "Ashar", "Maghrib", "Isya"];

  listSholat.forEach((namaSholat) => {
    if (jadwalToday[namaSholat] === waktuSekarang) {
      triggerNotification(namaSholat);
    }
  });
};

const triggerNotification = (namaSholat) => {
  // 1. Munculkan Notifikasi Browser
  if (Notification.permission === "granted") {
    new Notification(`Waktunya Sholat ${namaSholat}`, {
      body: `Allahu Akbar, Allahu Akbar! Sudah masuk waktu ${namaSholat}.`,
      icon: "/mosque-icon.png", // Letakkan file ini di folder public
    });
  }

  // 2. Putar Suara Adzan
  const audio = new Audio("/assets/sounds/adzan.mp3"); // Letakkan file ini di public/assets/sounds/
  audio.play().catch(err => console.log("Autoplay diblokir browser, butuh interaksi user."));
};