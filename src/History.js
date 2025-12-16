import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

// --- THEME & STYLES (Reused from App.js for consistency) ---

const API_URL =  "https://script.google.com/macros/s/AKfycbyM-gruCb6hIz9RY68wdkRY6DR1ABFElTh6hwS-fNzbVO1m5SRddEIRol2mCp8BOfg/exec";


const lightTheme = {
  backgroundPrimary: "#f2f2f7", // System Grouped Background
  backgroundSecondary: "#ffffff", // System Primary Background
  textPrimary: "#1c1c1e", // System Label
  textSecondary: "#636366", // System Secondary Label
  accent: "#007aff", // System Blue
  borderSubtle: "#e5e5ea", // System Separator
  shadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
  buttonHover: "rgba(0, 122, 255, 0.05)",
  red: "#ff3b30",
};

const darkTheme = {
  backgroundPrimary: "#000000", // System Dark Background
  backgroundSecondary: "#1c1c1e", // System Primary Dark Background
  textPrimary: "#ffffff", // System Label Dark
  textSecondary: "#8e8e93", // System Secondary Label Dark
  accent: "#0a84ff", // System Blue Dark
  borderSubtle: "#3a3a3c", // System Separator Dark
  shadow: "0 4px 16px rgba(0, 0, 0, 0.4)",
  buttonHover: "rgba(10, 132, 255, 0.1)",
  red: "#ff453a",
};

const themes = { light: lightTheme, dark: darkTheme };

const styles = {
  container: (theme) => ({
    minHeight: "100vh",
    padding: "20px",
    backgroundColor: theme.backgroundPrimary,
    color: theme.textPrimary,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",
    transition: "background-color 0.3s ease, color 0.3s ease",
  }),
  contentWrapper: {
    maxWidth: "900px",
    margin: "0 auto",
    paddingTop: "60px",
  },
  title: (theme) => ({
    fontSize: "28px",
    fontWeight: "700",
    marginBottom: "30px",
    letterSpacing: "-0.5px",
    color: theme.textPrimary,
  }),
  loadingText: (theme) => ({
    color: theme.textSecondary,
    fontSize: "16px",
    textAlign: "center",
    padding: "40px 0",
  }),
  billCard: (theme) => ({
    border: `1px solid ${theme.borderSubtle}`,
    padding: "16px",
    marginBottom: "12px",
    borderRadius: "12px",
    backgroundColor: theme.backgroundSecondary,
    boxShadow: theme.shadow.split(",")[0], // Subtle inner shadow
    transition: "transform 0.2s, box-shadow 0.2s",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  }),
  billDetails: {
    flexGrow: 1,
    paddingRight: "15px",
  },
  billNo: (theme) => ({
    fontWeight: 600,
    fontSize: "18px",
    color: theme.accent,
  }),
  billDate: (theme) => ({
    color: theme.textSecondary,
    fontSize: "14px",
    marginTop: "4px",
  }),
  billTotal: (theme) => ({
    marginTop: "6px",
    fontWeight: 700,
    fontSize: "16px",
    color: theme.textPrimary,
  }),
  actionButton: (theme, type = "default") => {
    let bgColor = theme.backgroundSecondary;
    let textColor = theme.accent;
    let borderColor = theme.accent;
    let hoverBg = theme.buttonHover;

    if (type === "primary") {
        bgColor = theme.accent;
        textColor = "#ffffff";
        borderColor = theme.accent;
        hoverBg = theme.accent;
    }
    
    return {
      padding: "10px 18px",
      borderRadius: "8px",
      border: `1px solid ${borderColor}`,
      background: bgColor,
      color: textColor,
      fontWeight: 600,
      cursor: "pointer",
      fontSize: "14px",
      transition: "background-color 0.2s, opacity 0.2s",
      "&:hover": {
        backgroundColor: hoverBg,
      },
    };
  },
  navButton: (theme) => ({
    padding: "8px 14px",
    borderRadius: "10px",
    border: `1px solid ${theme.borderSubtle}`,
    background: theme.backgroundSecondary,
    color: theme.textPrimary,
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.2s",
    boxShadow: theme.shadow.split(",")[0],
  }),
};

// Function to determine dark mode based on system/previous state (defaulting to dark for "pro" look)
const getInitialTheme = () => {
    try {
        const saved = localStorage.getItem('isDarkMode');
        if (saved !== null) return JSON.parse(saved);
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
        return true; // Default to dark
    }
}


// --- HISTORY COMPONENT ---
export default function History() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(getInitialTheme);
  const navigate = useNavigate();

  const currentTheme = isDarkMode ? themes.dark : themes.light;

  // Save theme state
  useEffect(() => {
    localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  // Fetch Bills
  useEffect(() => {
    // Show loading indicator
    Swal.fire({
      title: 'Loading Bills...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    
    fetch(`${API_URL}?action=getBills`)
      .then(res => res.json())
      .then(data => {
        // Sort by date/ID descending (most recent first)
        const sortedData = Array.isArray(data) 
          ? data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) 
          : [];

        setBills(sortedData);
        setLoading(false);
        Swal.close();
      })
      .catch(err => {
        console.error("Failed to load bills", err);
        setBills([]);
        setLoading(false);
        Swal.fire('Error', 'Failed to load bill history.', 'error');
      });
  }, []);

  const exportPDF = (bill) => {
    if (!bill.items_json) {
        Swal.fire("Error", "Bill data is corrupt or missing items.", "error");
        return;
    }

    try {
        const items = JSON.parse(bill.items_json);
        const doc = new jsPDF("p", "mm", "a4");
        let y = 20;

        // Header
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.text("JOTHI TAILORING", 105, y, { align: "center" });

        y += 8;
        doc.setFontSize(12);
        doc.text("Bill Invoice", 105, y, { align: "center" });
        
        y += 6;
        doc.line(15, y, 195, y);

        // Details
        y += 10;
        const billDate = new Date(bill.created_at).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.text(`Bill No: ${bill.bill_no}`, 15, y);
        doc.text(`Date: ${billDate}`, 140, y);

        // Table Header
        y += 12;
        doc.setFont("helvetica", "bold");
        doc.text("Item / Description", 15, y);
        doc.text("Qty", 120, y);
        doc.text("Amount (Rs.)", 195, y, { align: "right" });

        y += 4;
        doc.line(15, y, 195, y);

        // Items
        doc.setFont("helvetica", "normal");
        items.forEach(item => {
            y += 8;
            if (y > 270) {
                doc.addPage();
                y = 20;
            }
            const quantityText = item.quantity ? `(${item.quantity} pcs)` : '';
            doc.text(
                `${item.clothName} / ${item.thickness} / ${item.color} ${quantityText}`,
                15,
                y
            );
            doc.text(
                `₹${Number(item.totalCost).toFixed(2)}`,
                195,
                y,
                { align: "right" }
            );
        });

        // Total
        y += 10;
        doc.line(15, y, 195, y);
        y += 10;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text(
            `GRAND TOTAL: ₹${Number(bill.grand_total).toFixed(2)}`,
            195,
            y,
            { align: "right" }
        );

        y += 15;
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("Thank you for your business!", 105, y, { align: "center" });


        doc.save(`${bill.bill_no}.pdf`);
        Swal.fire('Success', `Bill ${bill.bill_no} exported successfully.`, 'success');

    } catch (e) {
        console.error("PDF Export failed:", e);
        Swal.fire('Error', 'Could not generate PDF. Invalid data format.', 'error');
    }
  };
  
  // Toggle Button component (reused from App.js)
  const ThemeToggleButton = () => (
    <button
      onClick={() => setIsDarkMode(!isDarkMode)}
      style={styles.actionButton(currentTheme)}
      title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      <svg
        style={{ width: "20px", height: "20px", color: currentTheme.textSecondary }}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        {isDarkMode ? (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        ) : (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        )}
      </svg>
    </button>
  );

  return (
    <div style={styles.container(currentTheme)}>
      
      {/* Fixed Navigation & Toggle */}
      <div
        style={{
          position: "fixed",
          top: 20,
          left: 20,
          right: 20,
          display: "flex",
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: "10px",
          zIndex: 50,
        }}
      >
        <div style={{display: 'flex', gap: '10px'}}>
            <button
            onClick={() => navigate("/")}
            style={styles.navButton(currentTheme)}
            >
            🧮 Calculator
            </button>
            <button
            onClick={() => navigate("/fabric")}
            style={styles.navButton(currentTheme)}
            >
            🧵 Update Cloth
            </button>
        </div>
        <ThemeToggleButton />
      </div>

      <div style={styles.contentWrapper}>
        <h2 style={styles.title(currentTheme)}>Bill History</h2>

        {loading && <p style={styles.loadingText(currentTheme)}>Loading bills...</p>}

        {!loading && bills.length === 0 && (
          <div style={styles.loadingText(currentTheme)}>
            <p style={{ fontWeight: 600 }}>No bills found.</p>
            <p style={{ marginTop: 5, fontSize: "14px" }}>
              Export a bill from the Calculator to see history here.
            </p>
          </div>
        )}

        <div style={{ paddingBottom: '50px' }}>
            {bills.map(bill => (
                <div
                key={bill.bill_id}
                style={styles.billCard(currentTheme)}
                >
                <div style={styles.billDetails}>
                    <div style={styles.billNo(currentTheme)}>{bill.bill_no}</div>

                    <div style={styles.billDate(currentTheme)}>
                    {new Date(bill.created_at).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                    })}
                    </div>

                    <div style={styles.billTotal(currentTheme)}>
                    Total: <span style={{ color: currentTheme.accent }}>₹{Number(bill.grand_total).toFixed(2)}</span>
                    </div>
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                    <button 
                        onClick={() => exportPDF(bill)}
                        style={styles.actionButton(currentTheme, 'default')}
                    >
                    View / Re-export PDF
                    </button>
                </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}