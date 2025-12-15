import { useEffect, useState } from "react";
import Select from "react-select";
import jsPDF from "jspdf";


const SHEET_ID = "1SLKCs9jTObGlI5o5npWm232gfLBxBxG_UQ0mMk_7tKU";
const SHEET_NAME = "cloths";
const RAW_WIDTH_IN = 60;
const INCHES_PER_METER = 39;

const ReactSelect = ({
  label,
  value,
  onChange,
  options,
  isDisabled,
  theme
}) => {
  const selectOptions = options.map(o => ({
    value: o,
    label: o
  }));

  return (
    <div style={{ marginBottom: "16px" }}>
      <label style={styles.label(theme)}>{label}</label>
      <Select
        value={selectOptions.find(opt => opt.value === value) || null}
        onChange={opt => onChange(opt ? opt.value : "")}
        options={selectOptions}
        isDisabled={isDisabled}
        isClearable
        placeholder={`Select ${label}`}
        styles={{
          control: (base, state) => ({
            ...base,
            backgroundColor: theme.backgroundSecondary,
            borderColor: state.isFocused
              ? theme.accent
              : theme.borderSubtle,
            boxShadow: "none",
            minHeight: "44px",
            borderRadius: "8px"
          }),
          menu: base => ({
            ...base,
            backgroundColor: theme.backgroundSecondary,
            zIndex: 20
          }),
          singleValue: base => ({
            ...base,
            color: theme.textPrimary
          }),
          placeholder: base => ({
            ...base,
            color: theme.textSecondary
          }),
          option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected
              ? theme.accent
              : state.isFocused
                ? theme.borderSubtle
                : "transparent",
            color: state.isSelected
              ? "#fff"
              : theme.textPrimary,
            cursor: "pointer"
          })
        }}
      />
    </div>
  );
};

// --- STYLES OBJECT ---

// 1. Define Theme Colors (Must come first to avoid TDZ)
const lightTheme = {
  backgroundPrimary: "#f4f4f9",
  backgroundSecondary: "#ffffff",
  textPrimary: "#1c1c1e",
  textSecondary: "#8e8e93",
  accent: "#007aff",
  borderSubtle: "#d1d1d6",
  shadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
};

const darkTheme = {
  backgroundPrimary: "#121214",
  backgroundSecondary: "#1c1c1e",
  textPrimary: "#f4f4f9",
  textSecondary: "#8e8e93",
  accent: "#0a84ff",
  borderSubtle: "#2c2c2e",
  shadow: "0 4px 16px rgba(0, 0, 0, 0.4)",
};

// 2. Define Styles Object, referencing the already-defined themes
const styles = {
  light: lightTheme,
  dark: darkTheme,

  // --- Component Styles ---
  container: (theme) => ({
    minHeight: "100vh",
    padding: "30px",
    backgroundColor: theme.backgroundPrimary,
    color: theme.textPrimary,
    fontFamily: "'SF Pro Display', 'Helvetica Neue', Arial, sans-serif",
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
    marginTop: "40px",
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "40px",
    transition: "box-shadow 0.2s ease-in-out",
    // Note: Inline media queries are often tricky/non-standard in pure React inline styles, 
    // relying on JavaScript for responsiveness in the render function is safer.
  }),
  title: {
    fontSize: "28px",
    fontWeight: "700",
    marginBottom: "30px",
    letterSpacing: "-0.5px",
    // This is a responsive style that needs JavaScript logic in the component
  },
  sectionHeader: {
    fontSize: "16px",
    fontWeight: "600",
    // FIXED: Using darkTheme directly here is safe because darkTheme is defined above
    color: darkTheme.textSecondary,
    marginBottom: "10px",
    marginTop: "20px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  label: (theme) => ({
    fontSize: "14px",
    fontWeight: "500",
    color: theme.textSecondary,
    marginBottom: "4px",
    display: "block",
  }),
  inputField: (theme) => ({
    width: "100%",
    padding: "10px 12px",
    marginTop: "4px",
    marginBottom: "16px",
    border: `1px solid ${theme.borderSubtle}`,
    borderRadius: "8px",
    backgroundColor: theme.backgroundSecondary,
    color: theme.textPrimary,
    fontSize: "16px",
    minHeight: "44px",
    boxSizing: "border-box",
    boxShadow: "inset 0 1px 3px rgba(0, 0, 0, 0.04)",
    transition: "border-color 0.2s, box-shadow 0.2s",
    WebkitAppearance: "none",
    MozAppearance: "none",
    appearance: "none",
    // Pseudo-classes like :focus cannot be reliably done inline, 
    // focus state will be subtle without external CSS/JS handlers.
  }),
  inputWrapper: {
    position: "relative",
  },
  unit: (theme) => ({
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "14px",
    color: theme.textSecondary,
    pointerEvents: "none",
  }),
  separator: (theme) => ({
    height: "1px",
    backgroundColor: theme.borderSubtle,
    margin: "20px 0",
  }),
  resultContainer: {
    paddingTop: "10px",
  },
  resultRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    fontSize: "16px",
  },
  resultLabel: (theme) => ({
    color: theme.textSecondary,
    fontWeight: "500",
  }),
  resultValue: {
    fontWeight: "600",
    textAlign: "right",
  },
  resultTotal: (theme) => ({
    fontWeight: "700",
    color: theme.accent,
    fontSize: "18px",
  }),
  toggleButton: (theme) => ({
    position: "absolute",
    top: "20px",
    right: "20px",
    padding: "8px",
    borderRadius: "50%",
    backgroundColor: theme.backgroundSecondary,
    border: "none",
    cursor: "pointer",
    transition: "background-color 0.2s, box-shadow 0.2s",
  }),
};

// --- Spinner Icon ---
const Spinner = ({ theme }) => (
  // Note: Inline styles cannot define @keyframes, so the animation property is non-functional without external CSS.
  <svg style={{ width: "20px", height: "20px", color: theme.textPrimary, opacity: 0.75 }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

// --- Dropdown Component ---
const ClaritySelect = ({ label, value, onChange, options, disabled, theme }) => (
  <div>
    <label style={styles.label(theme)}>{label}</label>
    <select
      style={styles.inputField(theme)}
      value={value}
      onChange={onChange}
      disabled={disabled}
    >
      <option value="" disabled>Select {label}</option>
      {options.map(o => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  </div>
);

// --- Input Component ---
const ClarityInput = ({ label, value, onChange, type = "text", placeholder, unit, theme }) => (
  <div>
    <label style={styles.label(theme)}>{label}</label>
    <div style={styles.inputWrapper}>
      <input
        type={type}
        style={styles.inputField(theme)}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
      {unit && (
        <span style={styles.unit(theme)}>{unit}</span>
      )}
    </div>
  </div>
);

// --- Main App Component ---
function App() {
  const [cloths, setCloths] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [items, setItems] = useState([]);


  const currentTheme = isDarkMode ? styles.dark : styles.light;

  const [clothName, setClothName] = useState("");
  const [thickness, setThickness] = useState("");
  const [color, setColor] = useState("");
  const [quantity, setQuantity] = useState("");
  const [pricePerMeter, setPricePerMeter] = useState("");

  const addItemToBill = () => {
    if (!selected) return;

    const qty = Number(quantity);
    const price = Number(pricePerMeter);

    if (!qty || qty <= 0) {
      alert("Enter valid quantity");
      return;
    }

    if (price < 0 || pricePerMeter === "") {
      alert("Enter valid price per meter");
      return;
    }

    const item = {
      clothName,
      thickness,
      color,
      quantity: qty,
      rawLengthMeters,
      rawClothCost,
      stitchingCost,
      totalCost
    };

    setItems(prev => [...prev, item]);

    setQuantity("");
    setPricePerMeter("");
  };



  // Effect to handle responsiveness
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const grandTotal = items.reduce(
    (sum, item) => sum + item.totalCost,
    0
  );

  const d = new Date();

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const formattedDate =
    String(d.getDate()).padStart(2, "0") +
    " / " +
    months[d.getMonth()] +
    " / " +
    d.getFullYear();


  const exportBillPDF = () => {
    if (items.length === 0) return;

    const doc = new jsPDF("p", "mm", "a4");
    let y = 20;

    // ===== Header =====
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("JOTHI TAILORING", 105, y, { align: "center" });

    y += 8;
    doc.setFontSize(12);
    doc.text("Cloth & Stitching Bill", 105, y, { align: "center" });

    y += 6;
    doc.line(15, y, 195, y);

    // ===== Meta =====
    y += 10;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    doc.text(`Date : ${formattedDate}`, 15, y);
    doc.text(`Bill No : JT-${Date.now().toString().slice(-4)}`, 140, y);

    // ===== Table Header =====
    y += 12;
    doc.setFont("helvetica", "bold");
    doc.text("Item", 15, y);
    doc.text("Qty", 120, y);
    doc.text("Amount (Rs.)", 195, y, { align: "right" });

    y += 4;
    doc.line(15, y, 195, y);

    // ===== Items =====
    doc.setFont("helvetica", "normal");

    items.forEach(item => {
      y += 8;

      // Page break handling
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
        `Rs. ${item.totalCost.toFixed(2)}`,
        195,
        y,
        { align: "right" }
      );
    });

    // ===== Grand Total =====
    y += 10;
    doc.line(15, y, 195, y);

    y += 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(
      `GRAND TOTAL : Rs. ${grandTotal.toFixed(2)}`,
      195,
      y,
      { align: "right" }
    );

    // ===== Footer =====
    y += 15;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(
      "Thank you for your business!",
      105,
      y,
      { align: "center" }
    );

    doc.save("Jothi_Tailoring_Bill.pdf");
  };



  // Effect to handle data fetching
  useEffect(() => {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${SHEET_NAME}`;

    fetch(url)
      .then(res => res.text())
      .then(csv => {
        const rows = csv.trim().split("\n");
        const headers = rows[0].split(",").map(h => h.replace(/"/g, ""));

        const data = rows.slice(1).map(row => {
          const values = row.split(/","/).map(v => v.replace(/"/g, ""));
          const obj = {};
          headers.forEach((h, i) => { obj[h] = values[i]; });

          return {
            cloth_name: obj.cloth_name,
            thickness: obj.thickness,
            color: obj.color,
            req_length: Number(obj.req_length_in),
            req_width: Number(obj.req_width_in),
            stitch_rate: Number(obj.stitch_rate)
          };
        });
        setCloths(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const clothNames = [...new Set(cloths.map(c => c.cloth_name))].filter(Boolean);
  const thicknessOptions = [...new Set(cloths.filter(c => c.cloth_name === clothName).map(c => c.thickness))].filter(Boolean);
  const colorOptions = [...new Set(cloths.filter(c => c.cloth_name === clothName && c.thickness === thickness).map(c => c.color))].filter(Boolean);

  const selected = cloths.find(
    c => c.cloth_name === clothName && c.thickness === thickness && c.color === color
  );

  let piecesPerRow = 0;
  let rowsNeeded = 0;
  let rawLengthInches = 0;
  let rawLengthMeters = 0;
  let rawClothCost = 0;
  let stitchingCost = 0;
  let totalCost = 0;

  if (selected && quantity > 0 && pricePerMeter >= 0) {
    piecesPerRow = Math.floor(RAW_WIDTH_IN / selected.req_width);
    rowsNeeded = Math.ceil(quantity / piecesPerRow);
    rawLengthInches = rowsNeeded * selected.req_length;
    rawLengthMeters = rawLengthInches / INCHES_PER_METER;
    rawClothCost = rawLengthMeters * pricePerMeter;
    stitchingCost = quantity * selected.stitch_rate;
    totalCost = rawClothCost + stitchingCost;
  }

  // Dynamic styles based on viewport size (to replace CSS media queries)
  const cardStyle = {
    ...styles.card(currentTheme),
    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
  };
  const titleStyle = {
    ...styles.title,
    gridColumn: isMobile ? "auto" : "1 / -1",
  };
  const inputColumnStyle = {
    paddingRight: isMobile ? "0" : "20px"
  };
  const resultColumnStyle = {
    paddingLeft: isMobile ? "0" : "20px"
  };
  const inputGridStyle = {
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
    gap: "15px"
  }

  return (
    <div style={styles.container(currentTheme)}>
      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        style={styles.toggleButton(currentTheme)}
      >
        <svg style={{ width: "24px", height: "24px", color: currentTheme.textSecondary }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          {isDarkMode ?
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            :
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          }
        </svg>
      </button>

      <div style={cardStyle}>

        <h2 style={titleStyle}>Cloth Requirement Calculator</h2>

        {isLoading ? (
          <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "center", alignItems: "center", padding: "40px", fontSize: "18px", color: currentTheme.textSecondary }}>
            <Spinner theme={currentTheme} />
            <span style={{ marginLeft: "10px" }}>Loading fabric data...</span>
          </div>
        ) : (
          <>
            {/* Column 1: Inputs */}
            <div style={inputColumnStyle}>

              <div style={styles.sectionHeader}>Fabric Selection</div>

              <ReactSelect
                label="Cloth Type"
                value={clothName}
                onChange={val => {
                  setClothName(val);
                  setThickness("");
                  setColor("");
                }}
                options={clothNames}
                theme={currentTheme}
              />

              <ReactSelect
                label="Thickness / Grade"
                value={thickness}
                onChange={val => {
                  setThickness(val);
                  setColor("");
                }}
                options={thicknessOptions}
                isDisabled={!clothName}
                theme={currentTheme}
              />

              <ReactSelect
                label="Color"
                value={color}
                onChange={val => setColor(val)}
                options={colorOptions}
                isDisabled={!clothName || !thickness}
                theme={currentTheme}
              />

              <div style={styles.separator(currentTheme)} />

              {/* Order Details */}
              <div style={styles.sectionHeader}>Order Details</div>

              <div style={inputGridStyle}>
                <ClarityInput
                  label="Quantity (Pieces)"
                  type="number"
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                  placeholder="0"
                  theme={currentTheme}
                />

                <ClarityInput
                  label="Price per Meter"
                  type="number"
                  value={pricePerMeter}
                  onChange={e => setPricePerMeter(e.target.value)}
                  unit="₹ / m"
                  placeholder="0"
                  theme={currentTheme}
                />

              </div>

              {/* Add Item */}
              <button
                onClick={addItemToBill}
                disabled={!selected}
                style={{
                  marginTop: "14px",
                  padding: "12px",
                  width: "100%",
                  borderRadius: "8px",
                  backgroundColor: currentTheme.accent,
                  color: "#fff",
                  border: "none",
                  fontWeight: "600",
                  fontSize: "14px",
                  cursor: selected ? "pointer" : "not-allowed",
                  opacity: selected ? 1 : 0.5
                }}
              >
                Add Item to Bill
              </button>

              {/* Export Bill */}
              <button
                onClick={exportBillPDF}
                disabled={items.length === 0}
                style={{
                  marginTop: "10px",
                  padding: "10px",
                  width: "100%",
                  borderRadius: "8px",
                  backgroundColor: items.length
                    ? currentTheme.accent
                    : currentTheme.borderSubtle,
                  color: "#fff",
                  border: "none",
                  fontWeight: "600",
                  fontSize: "14px",
                  cursor: items.length ? "pointer" : "not-allowed",
                  opacity: items.length ? 1 : 0.6
                }}
              >
                Export Bill as PDF
              </button>

            </div>


            {/* Column 2: Results */}
            <div style={resultColumnStyle}>
              {selected ? (
                <div style={styles.resultContainer}>
                  <div style={styles.sectionHeader}>📐 Cutting Plan</div>
                  <div style={styles.resultRow}>
                    <span style={styles.resultLabel(currentTheme)}>Raw Cloth Width (Fixed)</span>
                    <span style={styles.resultValue}>60 in</span>
                  </div>
                  <div style={styles.resultRow}>
                    <span style={styles.resultLabel(currentTheme)}>Piece Width / Length</span>
                    <span style={styles.resultValue}>{selected.req_width}" / {selected.req_length}"</span>
                  </div>
                  <div style={styles.resultRow}>
                    <span style={styles.resultLabel(currentTheme)}>Pieces per Row (Cut)</span>
                    <span style={styles.resultValue}>{piecesPerRow}</span>
                  </div>
                  <div style={styles.resultRow}>
                    <span style={styles.resultLabel(currentTheme)}>Total Rows Needed</span>
                    <span style={styles.resultValue}>{rowsNeeded}</span>
                  </div>

                  <div style={styles.separator(currentTheme)}></div>

                  <div style={styles.sectionHeader}>💵 Material & Labor Cost</div>

                  <div style={styles.resultRow}>
                    <span style={styles.resultLabel(currentTheme)}>Raw Length Required</span>
                    <span style={styles.resultValue}>{rawLengthInches} in ({rawLengthMeters.toFixed(2)} m)</span>
                  </div>
                  <div style={styles.resultRow}>
                    <span style={styles.resultLabel(currentTheme)}>Raw Cloth Cost</span>
                    <span style={styles.resultValue}>₹{rawClothCost.toFixed(2)}</span>
                  </div>
                  <div style={styles.resultRow}>
                    <span style={styles.resultLabel(currentTheme)}>Total Stitching Cost</span>
                    <span style={styles.resultValue}>₹{stitchingCost.toFixed(2)}</span>
                  </div>

                  {items.length > 0 && (
                    <div style={{ marginBottom: "20px" }}>
                      <div style={styles.sectionHeader}>Bill Items</div>

                      {items.map((item, i) => (
                        <div key={i} style={styles.resultRow}>
                          <span>
                            {item.clothName} ({item.quantity})
                          </span>
                          <span>₹{item.totalCost.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ ...styles.resultRow, marginTop: "15px" }}>
                    <span style={styles.resultTotal(currentTheme)}>ESTIMATED TOTAL COST</span>
                    <span style={styles.resultTotal(currentTheme)}>₹{totalCost.toFixed(2)}</span>
                  </div>

                  <div style={{ ...styles.resultRow, marginTop: "10px" }}>
                    <span style={styles.resultTotal(currentTheme)}>GRAND TOTAL</span>
                    <span style={styles.resultTotal(currentTheme)}>
                      ₹{grandTotal.toFixed(2)}
                    </span>
                  </div>

                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "40px", color: currentTheme.textSecondary }}>
                  <p style={{ fontWeight: "600" }}>Select cloth, thickness, and color to calculate requirements.</p>
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