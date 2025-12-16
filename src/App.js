import { useEffect, useState } from "react";
import Select from "react-select";
import jsPDF from "jspdf";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

// --- CONSTANTS ---
const SHEET_ID = "1SLKCs9jTObGlI5o5npWm232gfLBxBxG_UQ0mMk_7tKU"; // Unused in this file, but kept for context
const SHEET_NAME = "cloths"; // Unused in this file, but kept for context
const RAW_WIDTH_IN = 60; // Standard raw cloth width in inches
const INCHES_PER_METER = 39.37; // Updated value for better accuracy
const API_URL =
  "https://script.google.com/macros/s/AKfycbxW6cFOEI-g-4GpO3TmtH3UHQc1cn7b2kTFby4gCbxi7hFUAmHvREzW87nqO-D86ImI/exec";

// --- THEME & STYLES (Apple UI Inspired) ---

const translations = {
  en: {
    title: "Fabric Requirement & Cost Calculator",
    fabricSelection: "Fabric Selection",
    clothType: "Cloth Type",
    thickness: "Thickness / Grade",
    color: "Color",
    orderDetails: "Order Details",
    quantity: "Quantity (Pieces)",
    pricePerMeter: "Price per Meter",
    addItem: "Add Item to Bill",
    exportPdf: "Export Bill as PDF",
    cuttingPlan: "Cutting Plan",
    estimatedTotal: "ESTIMATED TOTAL COST",
    grandTotal: "GRAND TOTAL (Bill)",
    loading: "Loading fabric data...",
    selectHint: "Select a complete fabric item to see calculations",
    StitchRateperPiece: "Stitch Rate per Piece",
    cuttingHint: "The cutting plan will show how much raw cloth is needed.",
    calculator: "Calculator",
    history: "History",
    updateCloth: "Update Cloth",
    lightMode: "Switch to Light Mode",
    darkMode: "Switch to Dark Mode",
  },

  ta: {
    title: "துணி தேவை மற்றும் செலவு கணக்கீடு",
    fabricSelection: "துணி தேர்வு",
    clothType: "துணி வகை",
    thickness: "தரம் / தடிப்பு",
    color: "நிறம்",
    orderDetails: "ஆர்டர் விவரங்கள்",
    quantity: "எண்ணிக்கை (பீசுகள்)",
    pricePerMeter: "ஒரு மீட்டருக்கான விலை",
    addItem: "பில்லில் சேர்க்க",
    exportPdf: "PDF ஆக பில் ஏற்றுமதி",
    cuttingPlan: "வெட்டும் திட்டம்",
    estimatedTotal: "மதிப்பிடப்பட்ட மொத்த செலவு",
    grandTotal: "மொத்த தொகை",
    loading: "துணி விவரங்கள் ஏற்றப்படுகிறது...",
    selectHint: "கணக்கீடுகளை பார்க்க முழு துணி விவரத்தை தேர்வு செய்யவும்",
    StitchRateperPiece: "ஒரு துண்டுக்கு தையல் வீதம்",
    cuttingHint: "எவ்வளவு மூல துணி தேவை என்பதை வெட்டும் திட்டம் காட்டும்",
    calculator: "கணக்கீடு",
    history: "வரலாறு",
    updateCloth: "துணி புதுப்பிப்பு",
    lightMode: "ஒளி முறை",
    darkMode: "இருள் முறை",
  }
};


// 1. Define Theme Colors
const lightTheme = {
  backgroundPrimary: "#f2f2f7", // System Grouped Background
  backgroundSecondary: "#ffffff", // System Primary Background
  textPrimary: "#1c1c1e", // System Label
  textSecondary: "#636366", // System Secondary Label
  accent: "#007aff", // System Blue
  borderSubtle: "#e5e5ea", // System Separator
  shadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
  buttonHover: "rgba(0, 122, 255, 0.05)",
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
};

// 2. Define Styles Object, referencing the themes
const styles = {
  light: lightTheme,
  dark: darkTheme,

  // --- Utility & Layout Styles ---
  container: (theme) => ({
    minHeight: "100vh",
    padding: "20px",
    backgroundColor: theme.backgroundPrimary,
    color: theme.textPrimary,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    transition: "background-color 0.3s ease, color 0.3s ease",
  }),
  card: (theme) => ({
    width: "100%",
    maxWidth: "1024px",
    backgroundColor: theme.backgroundSecondary,
    borderRadius: "16px",
    boxShadow: theme.shadow,
    padding: "30px",
    marginTop: "60px", // Adjusted for fixed navigation
    gap: "40px",
    transition: "box-shadow 0.2s ease-in-out",
  }),
  title: (theme) => ({
    fontSize: "28px",
    fontWeight: "700",
    marginBottom: "30px",
    letterSpacing: "-0.5px",
    color: theme.textPrimary,
  }),
  sectionHeader: (theme) => ({
    fontSize: "15px",
    fontWeight: "600",
    color: theme.textSecondary,
    marginBottom: "12px",
    marginTop: "25px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  }),
  label: (theme) => ({
    fontSize: "14px",
    fontWeight: "500",
    color: theme.textSecondary,
    marginBottom: "4px",
    display: "block",
  }),
  separator: (theme) => ({
    height: "1px",
    backgroundColor: theme.borderSubtle,
    margin: "25px 0",
  }),
  resultRow: (theme) => ({
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 0",
    fontSize: "16px",
    borderBottom: `1px solid ${theme.borderSubtle}`,
    "&:last-child": { borderBottom: "none" },
  }),
  resultLabel: (theme) => ({
    color: theme.textSecondary,
    fontWeight: "500",
  }),
  resultValue: (theme) => ({
    fontWeight: "600",
    textAlign: "right",
    color: theme.textPrimary,
  }),
  resultTotal: (theme) => ({
    fontWeight: "700",
    color: theme.accent,
    fontSize: "18px",
  }),
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
    "&:hover": {
      background: theme.buttonHover,
    }
  }),
  // Toggle Button styles need special handling for the SVG appearance in inline styles
  toggleButton: (theme) => ({
    position: "fixed", // Changed to fixed for better UX
    top: "20px",
    right: "20px",
    padding: "10px",
    borderRadius: "50%",
    backgroundColor: theme.backgroundSecondary,
    border: `1px solid ${theme.borderSubtle}`,
    cursor: "pointer",
    transition: "background-color 0.2s, box-shadow 0.2s",
    zIndex: 100,
  }),
};

// --- CUSTOM COMPONENTS ---

// Select Component (using react-select)
const ReactSelect = ({
  label,
  value,
  onChange,
  options,
  isDisabled,
  theme,
}) => {
  const selectOptions = options.map((o) => ({
    value: o,
    label: o,
  }));

  return (
    <div style={{ marginBottom: "16px" }}>
      <label style={styles.label(theme)}>{label}</label>
      <Select
        value={selectOptions.find((opt) => opt.value === value) || null}
        onChange={(opt) => onChange(opt ? opt.value : "")}
        options={selectOptions}
        isDisabled={isDisabled}
        isClearable
        placeholder={label}
        styles={{
          control: (base, state) => ({
            ...base,
            backgroundColor: theme.backgroundPrimary, // Use primary for input body
            borderColor: state.isFocused ? theme.accent : theme.borderSubtle,
            boxShadow: state.isFocused
              ? `0 0 0 1px ${theme.accent}`
              : "none",
            minHeight: "44px",
            borderRadius: "10px",
            transition: "border-color 0.2s, box-shadow 0.2s, background-color 0.2s",
            cursor: isDisabled ? "not-allowed" : "pointer",
          }),
          menu: (base) => ({
            ...base,
            backgroundColor: theme.backgroundSecondary,
            borderRadius: "10px",
            boxShadow: theme.shadow,
            zIndex: 20,
          }),
          singleValue: (base) => ({
            ...base,
            color: theme.textPrimary,
            fontWeight: "500",
          }),
          placeholder: (base) => ({
            ...base,
            color: theme.textSecondary,
          }),
          option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected
              ? theme.accent
              : state.isFocused
                ? theme.buttonHover
                : "transparent",
            color: state.isSelected ? "#fff" : theme.textPrimary,
            cursor: "pointer",
            fontWeight: state.isSelected ? "600" : "400",
            transition: "background-color 0.1s, color 0.1s",
          }),
        }}
      />
    </div>
  );
};

// Input Component
const ClarityInput = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  unit,
  theme,
  disabled = false,
}) => {
  const inputStyle = {
    width: "100%",
    padding: "12px",
    marginTop: "4px",
    marginBottom: "16px",
    border: `1px solid ${theme.borderSubtle}`,
    borderRadius: "10px",
    backgroundColor: theme.backgroundPrimary, // Use primary for input body
    color: theme.textPrimary,
    fontSize: "16px",
    minHeight: "44px",
    boxSizing: "border-box",
    transition: "border-color 0.2s, box-shadow 0.2s, background-color 0.2s",
    WebkitAppearance: "none",
    MozAppearance: "none",
    appearance: "none",
    ...(disabled && { opacity: 0.7, cursor: "not-allowed" }),
  };

  return (
    <div>
      <label style={styles.label(theme)}>{label}</label>
      <div style={{ position: "relative" }}>
        <input
          type={type}
          style={inputStyle}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
        />
        {unit && (
          <span
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: "14px",
              color: theme.textSecondary,
              pointerEvents: "none",
            }}
          >
            {unit}
          </span>
        )}
      </div>
    </div>
  );
};

// Spinner Icon (Apple-like Activity Indicator)
const Spinner = ({ theme }) => (
  <svg
    style={{
      width: "20px",
      height: "20px",
      color: theme.textPrimary,
      opacity: 0.75,
      // Note: Full rotation animation requires external CSS or a complex JS handler
    }}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      style={{ opacity: 0.25 }}
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      style={{ opacity: 0.75 }}
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);


// --- MAIN APP COMPONENT ---
function App() {
  const [cloths, setCloths] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved ? saved === "dark" : true;
  });

  const [lang, setLang] = useState(() => {
    return localStorage.getItem("lang") || "en";
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [items, setItems] = useState([]);
  const t = (key) => translations[lang][key] || key;


  const navigate = useNavigate();

  const currentTheme = isDarkMode ? styles.dark : styles.light;

  const [clothName, setClothName] = useState("");
  const [thickness, setThickness] = useState("");
  const [color, setColor] = useState("");
  const [quantity, setQuantity] = useState("");
  const [pricePerMeter, setPricePerMeter] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showControls, setShowControls] = useState(true);



  useEffect(() => {
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem("lang", lang);
  }, [lang]);



  useEffect(() => {
    let lastScrollY = window.scrollY;

    const onScroll = () => {
      if (window.scrollY > lastScrollY && window.scrollY > 60) {
        setShowControls(false); // scrolling down
      } else {
        setShowControls(true); // scrolling up
      }
      lastScrollY = window.scrollY;
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);



  // --- LOGIC FUNCTIONS ---

  const addItemToBill = () => {
    // 1. Validation
    if (!selected) {
      Swal.fire("Error", "Please select all fabric properties first.", "warning");
      return;
    }

    const qty = Number(quantity);
    const price = Number(pricePerMeter || selected.price_per_meter);

    if (!qty || qty <= 0) {
      Swal.fire("Error", "Enter a valid quantity (> 0).", "warning");
      return;
    }

    if (!price || price <= 0) {
      Swal.fire("Error", "Enter a valid price per meter (> 0).", "warning");
      return;
    }


    // 2. Calculation (ensures latest calculated values are used)
    const item = {
      clothName,
      thickness,
      color,
      quantity: qty,
      rawLengthMeters,
      rawClothCost,
      stitchingCost,
      pricePerMeter: price,
      totalCost,
    };

    // 3. Add Item & Reset
    setItems((prev) => [...prev, item]);


    setQuantity("");
    setPricePerMeter("");

    Swal.fire({
      icon: "success",
      title: "Item Added",
      text: `${clothName} (${qty} pcs) added to bill.`,
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const exportBillPDF = async () => {
    if (items.length === 0 || grandTotal <= 0) {
      Swal.fire("Error", "Bill total must be greater than zero.", "warning");
      return;
    }
    setIsSaving(true);

    const dateStamp = Date.now().toString().slice(-4);
    const { value: billNo } = await Swal.fire({
      title: "Enter Bill Number",
      input: "text",
      inputPlaceholder: "Eg: JT-101",
      inputValue: `JT-${dateStamp}`,
      showCancelButton: true,
      confirmButtonText: "Generate Bill",
      cancelButtonText: "Cancel",
      inputValidator: (value) => {
        if (!value) return "Bill number is required";
      },
      backdrop: true,
      allowOutsideClick: false,
    });

    if (!billNo) {
      setIsSaving(false);
      return;
    }

    try {
      const d = new Date();
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const formattedDate =
        String(d.getDate()).padStart(2, "0") +
        " / " +
        months[d.getMonth()] +
        " / " +
        d.getFullYear();

      const normalizedItems = items.map((i) => ({
        ...i,
        rawLengthMeters: Number(i.rawLengthMeters || 0),
        rawClothCost: Number(i.rawClothCost || 0),
        stitchingCost: Number(i.stitchingCost || 0),
        totalCost: Number(i.totalCost || 0),
      }));

      // Save to Google Sheet
      await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({
          action: "saveBill",
          billNo,
          items: normalizedItems,
          grandTotal,
        }),
      });

      // Generate PDF
      const doc = new jsPDF("p", "mm", "a4");
      let y = 20;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("JOTHI TAILORING", 105, y, { align: "center" });

      y += 8;
      doc.setFontSize(12);
      doc.text("Cloth & Stitching Bill", 105, y, { align: "center" });

      y += 6;
      doc.line(15, y, 195, y);

      y += 10;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(`Date: ${formattedDate}`, 15, y);
      doc.text(`Bill No: ${billNo}`, 140, y);

      y += 12;
      doc.setFont("helvetica", "bold");
      doc.text("Item / Description", 15, y);
      doc.text("Qty", 120, y);
      doc.text("Amount (Rs.)", 195, y, { align: "right" });

      y += 4;
      doc.line(15, y, 195, y);

      doc.setFont("helvetica", "normal");
      normalizedItems.forEach((item) => {
        y += 8;
        if (y > 270) {
          doc.addPage();
          y = 20;
        }

        doc.text(
          `${item.clothName} / ${item.thickness} / ${item.color}`,
          15,
          y
        );
        doc.text(String(item.quantity), 125, y);
        doc.text(
          `Rs ${item.totalCost.toFixed(2)}`,
          195,
          y,
          { align: "right" }
        );
      });

      y += 10;
      doc.line(15, y, 195, y);

      y += 10;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text(
        `GRAND TOTAL : Rs ${grandTotal.toFixed(2)}`,
        195,
        y,
        { align: "right" }
      );

      y += 15;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Thank you for your business!", 105, y, { align: "center" });

      doc.save(`${billNo}.pdf`);

      Swal.fire({
        icon: "success",
        title: "Bill Generated",
        text: `Bill ${billNo} saved and exported successfully!`,
      });

      setItems([]);
    } catch (error) {
      Swal.fire("Error", "Failed to generate or save bill.", "error");
      console.error("Bill Export Error:", error);
    } finally {
      setIsSaving(false);
    }
  };




  // --- EFFECTS ---

  // Effect to handle responsiveness
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Effect to handle data fetching
  useEffect(() => {
    fetch(`${API_URL}?action=getCloths`)
      .then((res) => res.json())
      .then((data) => {
        setCloths(data);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
        console.error("Fetch Error:", error);
        Swal.fire("Error", "Could not load fabric data.", "error");
      });
  }, []);

  // --- CALCULATIONS ---

  // Fabric options derivation
  const clothNames = [...new Set(cloths.map((c) => c.cloth_name))].filter(Boolean);
  const thicknessOptions = [...new Set(cloths.filter((c) => c.cloth_name === clothName).map((c) => c.thickness))].filter(Boolean);
  const colorOptions = [...new Set(cloths.filter((c) => c.cloth_name === clothName && c.thickness === thickness).map((c) => c.color))].filter(Boolean);

  // Selected fabric object
  const selected = cloths.find(
    (c) => c.cloth_name === clothName && c.thickness === thickness && c.color === color
  );

  useEffect(() => {
    if (selected && selected.price_per_meter) {
      setPricePerMeter(String(selected.price_per_meter));
    } else {
      setPricePerMeter("");
    }
  }, [selected]);


  let piecesPerRow = 0;
  let rowsNeeded = 0;
  let rawLengthInches = 0;
  let rawLengthMeters = 0;
  let rawClothCost = 0;
  let stitchingCost = 0;
  let totalCost = 0;

  // Primary calculation logic
  if (selected && Number(quantity) > 0 && Number(pricePerMeter) >= 0) {
    const qty = Number(quantity);
    const price = Number(pricePerMeter || selected.price_per_meter);
    const reqWidth = Number(selected.req_width_in);
    const reqLength = Number(selected.req_length_in);
    const stitchRate = Number(selected.stitch_rate);

    // Ensure numeric values are valid
    if (qty > 0 && price >= 0 && reqWidth > 0 && reqLength > 0) {
      piecesPerRow = Math.floor(RAW_WIDTH_IN / reqWidth);
      if (piecesPerRow === 0) piecesPerRow = 1; // Fallback, shouldn't happen with 60" width

      rowsNeeded = Math.ceil(qty / piecesPerRow);

      rawLengthInches = rowsNeeded * reqLength;
      rawLengthMeters = rawLengthInches / INCHES_PER_METER;

      rawClothCost = rawLengthMeters * price;
      stitchingCost = qty * stitchRate;

      totalCost = rawClothCost + stitchingCost;
    }
  }

  // Grand Total for the entire bill
  const grandTotal = items.reduce(
    (sum, item) => sum + Number(item.totalCost || 0),
    0
  );


  // --- DYNAMIC STYLES ---

  const cardStyle = {
    ...styles.card(currentTheme),
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
  };
  const titleStyle = {
    ...styles.title(currentTheme),
    gridColumn: isMobile ? "auto" : "1 / -1",
  };
  const inputColumnStyle = {
    paddingRight: isMobile ? "0" : "20px",
  };
  const resultColumnStyle = {
    paddingLeft: isMobile ? "0" : "20px",
    borderLeft: isMobile ? "none" : `1px solid ${currentTheme.borderSubtle}`,
    paddingTop: isMobile ? "20px" : "0",
  };
  const inputGridStyle = {
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
    gap: "15px",
  };

  // --- RENDER ---

  return (
    <div style={styles.container(currentTheme)}>
      {/* Fixed Navigation */}
      {/* Top Navigation Bar */}
      {/* Top Navigation Bar */}
      <div
        style={{
          position: "fixed",
          top: 20,
          left: 20,
          right: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 100,
        }}
      >
        {/* Left buttons */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => navigate("/")}
            style={styles.navButton(currentTheme)}
          >
            🧮 {t("calculator")}
          </button>

          <button
            onClick={() => navigate("/history")}
            style={styles.navButton(currentTheme)}
          >
            📜 {t("history")}
          </button>

          <button
            onClick={() => navigate("/fabric")}
            style={styles.navButton(currentTheme)}
          >
            🧵 {t("updateCloth")}
          </button>
        </div>

        {/* Right controls */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
            transform: showControls ? "translateY(0)" : "translateY(-16px)",
            opacity: showControls ? 1 : 0,
            pointerEvents: showControls ? "auto" : "none",
            transition: "transform 0.25s ease, opacity 0.25s ease",
          }}
        >
          {/* Language */}
          <button
            onClick={() => setLang((prev) => (prev === "en" ? "ta" : "en"))}
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              border: `1px solid ${currentTheme.borderSubtle}`,
              background: currentTheme.backgroundSecondary,
              color: currentTheme.textPrimary,
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {lang === "en" ? "தமிழ்" : "EN"}
          </button>

          {/* Theme */}
          <button
            onClick={() => setIsDarkMode((prev) => !prev)}
            style={{
              ...styles.toggleButton(currentTheme),
              position: "relative",   // override fixed
              top: "auto",
              right: "auto",
            }}
            title={isDarkMode ? t("lightMode") : t("darkMode")}
          >
            <svg
              style={{
                width: 22,
                height: 22,
                color: currentTheme.textSecondary,
              }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isDarkMode ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3
             m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707
             m12.728 0l-.707.707M6.343 17.657l-.707.707
             M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646
             9.003 9.003 0 0012 21
             a9.003 9.003 0 008.354-5.646z"
                />
              )}
            </svg>
          </button>
        </div>

      </div>


      {/* Main Card */}
      <div style={cardStyle}>
        <h2 style={titleStyle}>{t("title")}</h2>

        {isLoading ? (
          <div
            style={{
              gridColumn: "1 / -1",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "40px",
              fontSize: "18px",
              color: currentTheme.textSecondary,
            }}
          >
            <Spinner theme={currentTheme} />
            <span style={{ marginLeft: "10px", fontWeight: "500" }}>  {t("loading")}
            </span>
          </div>
        ) : (
          <>
            {/* Column 1: Inputs & Actions */}
            <div style={inputColumnStyle}>
              <div style={styles.sectionHeader(currentTheme)}>
                {t("fabricSelection")}
              </div>

              {/* Fabric Selects */}
              <ReactSelect
                label={t("clothType")}
                value={clothName}
                placeholder={t("clothType")}
                onChange={(val) => {
                  setClothName(val);
                  setThickness("");
                  setColor("");
                }}
                options={clothNames}
                theme={currentTheme}
              />

              <ReactSelect
                label={t("thickness")}
                value={thickness}
                onChange={(val) => {
                  setThickness(val);
                  setColor("");
                }}
                options={thicknessOptions}
                isDisabled={!clothName}
                theme={currentTheme}
              />

              <ReactSelect
                label={t("color")}
                value={color}
                onChange={(val) => setColor(val)}
                options={colorOptions}
                isDisabled={!clothName || !thickness}
                theme={currentTheme}
              />

              <div style={styles.separator(currentTheme)} />

              {/* Order Details */}
              <div style={styles.sectionHeader(currentTheme)}>
                {t("orderDetails")}
              </div>

              <div style={inputGridStyle}>
                <ClarityInput
                  label={t("quantity")}
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0"
                  theme={currentTheme}
                  disabled={!selected}
                />

                <ClarityInput
                  label={t("pricePerMeter")}
                  type="number"
                  value={pricePerMeter}
                  onChange={(e) => setPricePerMeter(e.target.value)}
                  unit="₹ / m"
                  placeholder="0.00"
                  theme={currentTheme}
                  disabled={!selected}
                />


              </div>

              <div style={{ ...styles.resultRow(currentTheme), borderBottom: 'none', padding: '10px 0' }}>
                <span style={styles.resultLabel(currentTheme)}>{t("StitchRateperPiece")}</span>
                <span style={styles.resultValue(currentTheme)}>₹{selected ? Number(selected.stitch_rate).toFixed(2) : "0.00"}</span>
              </div>


              {/* Action Buttons */}
              <button
                onClick={addItemToBill}
                disabled={
                  !selected ||
                  Number(quantity) <= 0 ||
                  Number(pricePerMeter) <= 0 ||
                  isSaving
                }
                style={{
                  marginTop: "14px",
                  padding: "12px",
                  width: "100%",
                  borderRadius: "10px",
                  backgroundColor: currentTheme.accent,
                  color: "#fff",
                  border: "none",
                  fontWeight: "600",
                  fontSize: "16px",
                  cursor: (selected && quantity && pricePerMeter) ? "pointer" : "not-allowed",
                  opacity: (selected && quantity && pricePerMeter) ? 1 : 0.4,
                  transition: "background-color 0.2s, opacity 0.2s",
                  boxShadow: "0 2px 8px rgba(0, 122, 255, 0.3)",
                }}
              >
                {isSaving ? "Processing..." : t("addItem")}
              </button>

              <button
                onClick={exportBillPDF}
                disabled={items.length === 0 || isSaving}
                style={{
                  marginTop: "10px",
                  padding: "12px",
                  width: "100%",
                  borderRadius: "10px",
                  backgroundColor: items.length
                    ? currentTheme.accent
                    : currentTheme.borderSubtle,
                  color: items.length ? "#fff" : currentTheme.textSecondary,
                  border: "none",
                  fontWeight: "600",
                  fontSize: "16px",
                  cursor: items.length && !isSaving ? "pointer" : "not-allowed",
                  opacity: items.length && !isSaving ? 1 : 0.6,
                  transition: "background-color 0.2s, opacity 0.2s",
                }}
              >
                {isSaving
                  ? "Saving Bill..."
                  : `${t("exportPdf")} (${items.length})`}
              </button>
            </div>

            {/* Column 2: Results & Summary */}
            <div style={resultColumnStyle}>
              {selected ? (
                <div style={{ padding: "0 10px" }}>

                  {/* Cutting Plan */}
                  <div style={styles.sectionHeader(currentTheme)}>
                    📐 {t("cuttingPlan")}
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <div style={styles.resultRow(currentTheme)}>
                      <span style={styles.resultLabel(currentTheme)}>Raw Cloth Width (Fixed)</span>
                      <span style={styles.resultValue(currentTheme)}>{RAW_WIDTH_IN} in</span>
                    </div>
                    <div style={styles.resultRow(currentTheme)}>
                      <span style={styles.resultLabel(currentTheme)}>Piece Width / Length</span>
                      <span style={styles.resultValue(currentTheme)}>{Number(selected.req_width_in)}" / {Number(selected.req_length_in)}"</span>
                    </div>
                    <div style={styles.resultRow(currentTheme)}>
                      <span style={styles.resultLabel(currentTheme)}>Pieces per Row (Cut)</span>
                      <span style={styles.resultValue(currentTheme)}>{piecesPerRow}</span>
                    </div>
                    <div style={styles.resultRow(currentTheme)}>
                      <span style={styles.resultLabel(currentTheme)}>Total Rows Needed</span>
                      <span style={styles.resultValue(currentTheme)}>{rowsNeeded}</span>
                    </div>
                  </div>

                  {/* Material & Labor Cost */}
                  <div style={styles.sectionHeader(currentTheme)}>💵 Material & Labor Cost (Current Item)</div>
                  <div style={{ marginBottom: '20px' }}>
                    <div style={styles.resultRow(currentTheme)}>
                      <span style={styles.resultLabel(currentTheme)}>Raw Length Required</span>
                      <span style={styles.resultValue(currentTheme)}>{rawLengthInches} in ({rawLengthMeters.toFixed(2)} m)</span>
                    </div>
                    <div style={styles.resultRow(currentTheme)}>
                      <span style={styles.resultLabel(currentTheme)}>Raw Cloth Cost</span>
                      <span style={styles.resultValue(currentTheme)}>₹{rawClothCost.toFixed(2)}</span>
                    </div>
                    <div style={styles.resultRow(currentTheme)}>
                      <span style={styles.resultLabel(currentTheme)}>Total Stitching Cost</span>
                      <span style={styles.resultValue(currentTheme)}>₹{stitchingCost.toFixed(2)}</span>
                    </div>
                  </div>

                  <div style={styles.separator(currentTheme)}></div>

                  {/* Estimated Total */}
                  <div style={{ ...styles.resultRow(currentTheme), borderBottom: 'none' }}>
                    <span style={styles.resultTotal(currentTheme)}>  {t("estimatedTotal")}</span>
                    <span style={styles.resultTotal(currentTheme)}>₹{totalCost.toFixed(2)}</span>
                  </div>

                  {/* Bill Items Summary */}
                  {items.length > 0 && (
                    <div style={{ marginTop: "30px" }}>
                      <div style={styles.sectionHeader(currentTheme)}>📝 Bill Summary ({items.length} Items)</div>
                      <div style={{ maxHeight: '150px', overflowY: 'auto', paddingRight: '10px' }}>
                        {items.map((item, i) => (
                          <div key={i} style={{ ...styles.resultRow(currentTheme), fontSize: '14px', padding: '6px 0' }}>
                            <span style={styles.resultLabel(currentTheme)}>
                              {item.clothName} ({item.quantity} pcs)
                            </span>
                            <span style={styles.resultValue(currentTheme)}>₹{item.totalCost.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      <div style={styles.separator(currentTheme)}></div>

                      {/* Grand Total */}
                      <div style={{ ...styles.resultRow(currentTheme), borderBottom: 'none' }}>
                        <span style={styles.resultTotal(currentTheme)}>  {t("grandTotal")}
                        </span>
                        <span style={styles.resultTotal(currentTheme)}>
                          ₹{grandTotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}

                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "40px", color: currentTheme.textSecondary }}>
                  <p style={{ fontWeight: "600", fontSize: "16px" }}><p>{t("selectHint")}</p></p>
                  <p style={{ marginTop: "10px", fontSize: "14px" }}>  {t("cuttingHint")}</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;