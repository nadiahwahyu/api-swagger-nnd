import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
// IMPORT LIBRARY UNTUK EKSPOR
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // Perbaikan: Import langsung sebagai fungsi
import "../App.css";

export default function RiwayatBelajar() {
  const navigate = useNavigate();
  
  // Ambil user dengan proteksi null
  const getUserData = () => {
    try {
      const data = localStorage.getItem("currentUser");
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  };
  
  const user = getUserData();
  const isAdmin = user?.role === "admin";
  
  const [riwayat, setRiwayat] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); 
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  /**
   * FUNGSI EKSPOR EXCEL
   */
  const exportToExcel = () => {
    const dataToExport = filteredData.map((item, index) => ({
      No: index + 1,
      Pengguna: item.user_name || "Guest",
      Materi: item.materi_nama || item.nama || "-",
      Kategori: item.display_category || "Umum",
      Tanggal: item.tanggal_formatted || "-",
      Jam: item.jam_formatted || "-",
      Status: item.status || "-"
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Riwayat");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" });
    saveAs(data, `Riwayat_Belajar_${new Date().getTime()}.xlsx`);
  };

  /**
   * FUNGSI EKSPOR PDF (PERBAIKAN TOTAL)
   */
  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Judul Laporan
      doc.setFontSize(16);
      doc.text("LAPORAN RIWAYAT BELAJAR E-MUSLIM", 14, 15);
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Tanggal Cetak: ${new Date().toLocaleString('id-ID')}`, 14, 22);

      const tableColumn = ["No", "Pengguna", "Materi", "Kategori", "Tanggal", "Status"];
      const tableRows = filteredData.map((item, index) => [
        index + 1,
        item.user_name || "Guest",
        item.materi_nama || item.nama || "-",
        item.display_category || "Umum",
        item.tanggal_formatted || "-",
        item.status || "-"
      ]);

      // PERBAIKAN: Gunakan autoTable(doc, { ... }) bukan doc.autoTable
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 30,
        theme: 'grid',
        headStyles: { 
          fillColor: [49, 130, 206],
          fontSize: 10,
          halign: 'center'
        },
        styles: { fontSize: 9 },
        margin: { top: 30 }
      });

      doc.save(`Riwayat_Belajar_${new Date().getTime()}.pdf`);
    } catch (error) {
      console.error("PDF Export Error:", error);
      alert("Terjadi kesalahan saat mengekspor PDF.");
    }
  };

  const loadRiwayatFromAPI = async () => {
    try {
      const statusParam = filterStatus !== "Semua" ? `&status=${filterStatus}` : "";
      const response = await fetch(`http://localhost:5000/api/riwayat/all?page=1&limit=200${statusParam}`);
      const result = await response.json();

      if (result.success) {
        let fetchedData = result.data;

        if (!isAdmin) {
          const currentSearchName = (user?.name || user?.username || "Guest").toLowerCase();
          fetchedData = fetchedData.filter(item => 
            (item.user_name || "").toLowerCase() === currentSearchName
          );
        }

        const formattedData = fetchedData.map(item => {
          const dateObj = item.created_at ? new Date(item.created_at) : null;
          return {
            ...item,
            display_category: item.category_name || "Umum",
            tanggal_formatted: dateObj ? dateObj.toLocaleDateString("id-ID", { 
              day: "numeric", month: "long", year: "numeric" 
            }) : (item.tanggal || "-"),
            jam_formatted: dateObj ? dateObj.toLocaleTimeString("id-ID", { 
              hour: "2-digit", minute: "2-digit" 
            }) + " WIB" : "WIB"
          };
        });
        setRiwayat(formattedData);
      }
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    }
  };

  useEffect(() => {
    loadRiwayatFromAPI();
    
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = `
      @keyframes floatMoon { 0%, 100% { transform: translateY(0) rotate(-15deg); } 50% { transform: translateY(-20px) rotate(-10deg); } }
      @keyframes twinkle { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.8; } }
      .moon-container { position: fixed; top: 100px; right: 100px; width: 150px; height: 150px; z-index: 0; filter: drop-shadow(0 0 20px rgba(49, 130, 206, 0.4)); animation: floatMoon 6s ease-in-out infinite; pointer-events: none; }
      .moon { width: 100px; height: 100px; border-radius: 50%; box-shadow: 25px 10px 0 0 #3182ce; transform: rotate(-15deg); }
      .star { position: fixed; background: white; border-radius: 50%; opacity: 0.5; z-index: 0; pointer-events: none; animation: twinkle var(--duration) infinite ease-in-out; }
      .glass-card { background: rgba(255, 255, 255, 0.9) !important; backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.3) !important; }
      .btn-export { padding: 10px 18px; border-radius: 8px; border: none; cursor: pointer; font-size: 0.85rem; font-weight: 700; color: white !important; transition: 0.3s; display: flex; align-items: center; gap: 8px; }
      .btn-excel { background: #22c55e; box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3); }
      .btn-pdf { background: #ef4444; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3); }
      .btn-export:hover { transform: translateY(-3px); opacity: 0.9; }
      .search-input { padding: 10px 15px; border-radius: 8px; border: 1px solid #e2e8f0; width: 250px; font-size: 0.85rem; outline: none; transition: 0.2s; }
      .search-input:focus { border-color: #3182ce; box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1); }
      .cat-badge { font-size: 0.65rem; font-weight: 800; padding: 3px 10px; border-radius: 4px; text-transform: uppercase; }
      .cat-fardhu { background: #fee2e2; color: #ef4444; }
      .cat-sunnah { background: #ecfdf5; color: #10b981; }
      .cat-umum { background: #f1f5f9; color: #64748b; }
      .pagination-btn { padding: 8px 16px; border: 1px solid #e2e8f0; background: white; border-radius: 6px; cursor: pointer; transition: 0.2s; }
      .pagination-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      .pagination-btn:hover:not(:disabled) { background: #f8fafc; border-color: #3182ce; color: #3182ce; }
    `;
    document.head.appendChild(styleSheet);
    return () => { if (document.head.contains(styleSheet)) document.head.removeChild(styleSheet); };
  }, [user?.name, isAdmin, filterStatus]);

  // LOGIKA PENCARIAN & FILTER
  const filteredData = riwayat.filter(item => {
    const searchMatch = (item.user_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (item.materi_nama || item.nama || "").toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = filterStatus === "Semua" || item.status === filterStatus;
    return searchMatch && statusMatch;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <div className="dashboard-layout" style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh', display: 'flex' }}>
      <div className="moon-container"><div className="moon"></div></div>
      {[...Array(15)].map((_, i) => (
        <div key={i} className="star" style={{ top: `${Math.random() * 100}vh`, left: `${Math.random() * 100}vw`, width: `${Math.random() * 3}px`, height: `${Math.random() * 3}px`, "--duration": `${2 + Math.random() * 4}s` }} />
      ))}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1, backgroundImage: `linear-gradient(rgba(245, 247, 251, 0.9), rgba(245, 247, 251, 0.9)), url("https://images.unsplash.com/photo-1599011749870-13f50a8a6502?q=80&w=1974&auto=format&fit=crop")`, backgroundSize: 'cover' }} />

      <aside className="sidebar" style={{ backgroundColor: '#1e2530', color: '#fff', width: '260px', zIndex: 10, minHeight: '100vh' }}>
        <div className="sidebar-brand" style={{ padding: '30px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>E MUSLIM</h2>
        </div>
        <nav className="sidebar-nav" style={{ marginTop: '20px', padding: '0 10px' }}>
          <Link to="/dashboard" className="nav-link" style={{ color: '#cbd5e1', display: 'flex', padding: '12px 15px', textDecoration: 'none' }}>📊 Dashboard</Link>
          <Link to="/riwayat" className="nav-link active-nav" style={{ display: 'flex', padding: '12px 15px', textDecoration: 'none', backgroundColor: '#3182ce', color: 'white', borderRadius: '8px' }}>📜 Riwayat Belajar</Link>
        </nav>
      </aside>

      <main className="main-content" style={{ flex: 1, zIndex: 1, overflowY: 'auto' }}>
        <header className="top-bar" style={{ backgroundColor: 'white', padding: '15px 40px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ color: '#718096', fontSize: '0.85rem' }}>Dashboard / Riwayat</div>
          <button onClick={handleLogout} style={{ color: '#ef4444', fontWeight: 'bold', border: 'none', background: 'none', cursor: 'pointer' }}>Logout</button>
        </header>

        <div className="content-inner" style={{ padding: '40px' }}>
          <div style={{ marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <input 
                type="text" 
                placeholder="Cari materi atau nama..." 
                className="search-input"
                value={searchTerm}
                onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
              />
              <select 
                value={filterStatus} 
                onChange={(e) => {setFilterStatus(e.target.value); setCurrentPage(1);}}
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'pointer' }}
              >
                <option value="Semua">Semua Status</option>
                <option value="Selesai">Selesai</option>
                <option value="Belum Selesai">Belum Selesai</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={exportToExcel} className="btn-export btn-excel"><span>📈</span> Export Excel</button>
              <button onClick={exportToPDF} className="btn-export btn-pdf"><span>📕</span> Export PDF</button>
            </div>
          </div>

          <div className="data-card glass-card" style={{ borderRadius: '16px', overflow: 'hidden', backgroundColor: 'white' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #edf2f7' }}>
                  <th style={{ padding: '15px 20px', textAlign: 'left' }}>NO</th>
                  {isAdmin && <th style={{ padding: '15px 20px', textAlign: 'left' }}>PENGGUNA</th>}
                  <th style={{ padding: '15px 20px', textAlign: 'left' }}>MATERI</th>
                  <th style={{ padding: '15px 20px', textAlign: 'left' }}>KATEGORI</th>
                  <th style={{ padding: '15px 20px', textAlign: 'left' }}>WAKTU</th>
                  <th style={{ padding: '15px 20px', textAlign: 'center' }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? currentItems.map((item, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '15px 20px' }}>{indexOfFirstItem + index + 1}</td>
                    {isAdmin && <td style={{ padding: '15px 20px', fontWeight: 'bold', color: '#3182ce' }}>{item.user_name}</td>}
                    <td style={{ padding: '15px 20px', fontWeight: '700' }}>{item.materi_nama || item.nama}</td>
                    <td style={{ padding: '15px 20px' }}>
                      <span className={`cat-badge ${item.display_category.toLowerCase().includes('fardhu') ? 'cat-fardhu' : (item.display_category.toLowerCase().includes('sunnah') ? 'cat-sunnah' : 'cat-umum')}`}>
                        {item.display_category}
                      </span>
                    </td>
                    <td style={{ padding: '15px 20px' }}>
                      <div style={{ fontWeight: '600' }}>{item.tanggal_formatted}</div>
                      <div style={{ color: '#3182ce', fontSize: '0.75rem' }}>🕒 {item.jam_formatted}</div>
                    </td>
                    <td style={{ padding: '15px 20px', textAlign: 'center' }}>
                      <span style={{ padding: '5px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 'bold', backgroundColor: item.status === 'Selesai' ? '#ecfdf5' : '#fffbeb', color: item.status === 'Selesai' ? '#059669' : '#d97706' }}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={isAdmin ? "6" : "5"} style={{ padding: '30px', textAlign: 'center' }}>Data tidak ditemukan.</td></tr>
                )}
              </tbody>
            </table>
            
            <div style={{ padding: '20px', display: 'flex', justifyContent: 'center', gap: '15px', alignItems: 'center', borderTop: '1px solid #f1f5f9' }}>
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="pagination-btn">Prev</button>
              <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Halaman {currentPage} dari {totalPages || 1}</span>
              <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)} className="pagination-btn">Next</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}