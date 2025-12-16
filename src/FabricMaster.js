import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

// --- THEME & STYLES (Consistency and Mobile Focus) ---

const lightTheme = {
    backgroundPrimary: "#f2f2f7", // System Grouped Background
    backgroundSecondary: "#ffffff", // System Primary Background
    textPrimary: "#1c1c1e",
    textSecondary: "#636366",
    accent: "#007aff",
    borderSubtle: "#e5e5ea",
    shadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
    red: "#ff3b30",
};

const darkTheme = {
    backgroundPrimary: "#000000",
    backgroundSecondary: "#1c1c1e",
    textPrimary: "#ffffff",
    textSecondary: "#8e8e93",
    accent: "#0a84ff",
    borderSubtle: "#3a3a3c",
    shadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
    red: "#ff453a",
};

const themes = { light: lightTheme, dark: darkTheme };
const currentTheme = themes.dark;

const styles = {
    container: (theme) => ({
        minHeight: "100vh",
        padding: "0 10px", // Reduced padding for mobile
        backgroundColor: theme.backgroundPrimary,
        color: theme.textPrimary,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",
        transition: "background-color 0.3s ease, color 0.3s ease",
    }),
    contentWrapper: {
        maxWidth: "600px", // Max width for app-like feeling
        margin: "0 auto",
        paddingTop: "70px", // Space for fixed header
        paddingBottom: "30px",
    },
    title: (theme) => ({
        fontSize: "24px",
        fontWeight: "700",
        marginBottom: "20px",
        letterSpacing: "-0.5px",
        color: theme.textPrimary,
    }),
    // --- List Item Styles (Card for mobile) ---
    card: (theme) => ({
        padding: "15px",
        marginBottom: "12px",
        borderRadius: "12px",
        backgroundColor: theme.backgroundSecondary,
        boxShadow: theme.shadow,
        border: `1px solid ${theme.borderSubtle}`,
    }),
    cardHeader: (theme) => ({
        fontWeight: 600,
        fontSize: "18px",
        color: theme.accent,
        marginBottom: '10px',
        paddingBottom: '5px',
        borderBottom: `1px solid ${theme.borderSubtle}`,
    }),
    fieldGroup: {
        marginBottom: '10px',
    },
    label: (theme) => ({
        fontSize: "13px",
        color: theme.textSecondary,
        display: "block",
        marginBottom: "3px",
        fontWeight: 500,
    }),
    inputField: (theme, isNumeric = false) => ({
        width: "100%",
        padding: "10px",
        border: `1px solid ${theme.borderSubtle}`,
        borderRadius: "8px",
        backgroundColor: theme.backgroundPrimary,
        color: theme.textPrimary,
        fontSize: "16px",
        boxSizing: "border-box",
        textAlign: isNumeric ? 'right' : 'left',
        transition: 'border-color 0.2s',
    }),
    saveButton: (theme, isUpdating) => ({
        width: "100%",
        marginTop: '15px',
        padding: "12px",
        borderRadius: "10px",
        border: 'none',
        background: isUpdating ? theme.textSecondary : theme.accent,
        color: "#ffffff",
        fontWeight: 600,
        cursor: isUpdating ? 'not-allowed' : 'pointer',
        fontSize: "16px",
        opacity: isUpdating ? 0.9 : 1,
    }),
    // --- Navigation & Add New Section ---
    fixedHeader: (theme) => ({
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        backgroundColor: theme.backgroundPrimary,
        padding: "10px 15px",
        borderBottom: `1px solid ${theme.borderSubtle}`,
        boxShadow: theme.shadow,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    }),
    addButton: (theme) => ({
        padding: "12px",
        borderRadius: "10px",
        background: theme.accent,
        color: "#ffffff",
        fontWeight: 600,
        fontSize: "16px",
        width: '100%',
        border: 'none',
        marginTop: '20px',
        marginBottom: '30px',
    }),
    addNewSection: (theme) => ({
        padding: "15px",
        marginBottom: "30px",
        borderRadius: "12px",
        backgroundColor: theme.backgroundSecondary,
        border: `2px dashed ${theme.accent}`,
    }),
};

// --- COMPONENT LOGIC ---

const API_URL = "https://script.google.com/macros/s/AKfycbxW6cFOEI-g-4GpO3TmtH3UHQc1cn7b2kTFby4gCbxi7hFUAmHvREzW87nqO-D86ImI/exec";

// Default state for a new fabric entry
const defaultNewFabric = {
    cloth_name: '',
    thickness: '',
    color: '',
    req_length_in: 0,
    req_width_in: 0,
    stitch_rate: 0,
};

export default function FabricMaster() {
    const [cloths, setCloths] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingIndex, setUpdatingIndex] = useState(null);
    const [newFabric, setNewFabric] = useState(defaultNewFabric);
    const [isAdding, setIsAdding] = useState(false);
    const navigate = useNavigate();

    // Helper to fetch data
    const fetchCloths = () => {
        setLoading(true);
        fetch(`${API_URL}?action=getCloths`)
            .then(res => res.json())
            .then(data => {
                setCloths(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load fabric master:", err);
                Swal.fire('Error', 'Failed to load fabric master data.', 'error');
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchCloths();
    }, []);

    // 1. Update Existing Fabric
    const handleUpdateChange = (index, field, value) => {
        setCloths(prevCloths => {
            const newCloths = [...prevCloths];
            newCloths[index] = { ...newCloths[index], [field]: value };
            return newCloths;
        });
    };

    const updateRow = async (row, index) => {
        setUpdatingIndex(index);
        const numericFields = ['req_length_in', 'req_width_in', 'stitch_rate'];

        for (const field of numericFields) {
            if (isNaN(Number(row[field])) || Number(row[field]) < 0) {
                Swal.fire('Validation Error', `"${field}" must be a non-negative number.`, 'warning');
                setUpdatingIndex(null);
                return;
            }
        }

        try {
            await fetch(API_URL, {
                method: "POST",
                body: JSON.stringify({
                    action: "updateCloth",
                    ...row,
                    req_length_in: Number(row.req_length_in),
                    req_width_in: Number(row.req_width_in),
                    stitch_rate: Number(row.stitch_rate)
                })
            });


            Swal.fire({
                icon: 'success',
                title: 'Updated!',
                text: `"${row.cloth_name}" master data saved.`,
                timer: 1500,
                showConfirmButton: false,
            });
        } catch (error) {
            console.error("Update error:", error);
            Swal.fire('Error', 'Failed to update cloth master.', 'error');
        } finally {
            setUpdatingIndex(null);
        }
    };

    // 2. Add New Fabric
    const handleNewFabricChange = (field, value) => {
        setNewFabric(prev => ({ ...prev, [field]: value }));
    };

    const addNewRow = async () => {
        setIsAdding(true);
        const newRow = newFabric;
        const numericFields = ['req_length_in', 'req_width_in', 'stitch_rate'];

        if (!newRow.cloth_name.trim()) {
            Swal.fire('Validation Error', 'Cloth Name is required.', 'warning');
            setIsAdding(false);
            return;
        }

        for (const field of numericFields) {
            if (isNaN(Number(newRow[field])) || Number(newRow[field]) < 0) {
                Swal.fire('Validation Error', `"${field}" must be a non-negative number.`, 'warning');
                setIsAdding(false);
                return;
            }
        }

        try {
            await fetch(API_URL, {
                method: "POST",
                body: JSON.stringify({
                    action: "addCloth",
                    ...newRow,
                    req_length_in: Number(newRow.req_length_in),
                    req_width_in: Number(newRow.req_width_in),
                    stitch_rate: Number(newRow.stitch_rate)
                })
            });


            Swal.fire({
                icon: 'success',
                title: 'Added!',
                text: `New fabric "${newRow.cloth_name}" has been added.`,
                timer: 2000,
                showConfirmButton: false,
            });

            setNewFabric(defaultNewFabric); // Clear form
            fetchCloths(); // Refresh the list
        } catch (error) {
            console.error("Add error:", error);
            Swal.fire('Error', 'Failed to add new fabric.', 'error');
        } finally {
            setIsAdding(false);
        }
    };


    // --- RENDERING ---
    const renderInput = (index, field, value, label, isNumeric = false) => (
        <div style={styles.fieldGroup}>
            <label style={styles.label(currentTheme)}>{label}</label>
            <input
                style={styles.inputField(currentTheme, isNumeric)}
                type={isNumeric ? 'number' : 'text'}
                value={value || (isNumeric ? 0 : '')}
                onChange={e => handleUpdateChange(index, field, e.target.value)}
                min={isNumeric ? "0" : undefined}
            />
        </div>
    );

    const renderNewInput = (field, value, label, isNumeric = false) => (
        <div style={styles.fieldGroup}>
            <label style={styles.label(currentTheme)}>{label}</label>
            <input
                style={styles.inputField(currentTheme, isNumeric)}
                type={isNumeric ? 'number' : 'text'}
                value={value || (isNumeric ? 0 : '')}
                onChange={e => handleNewFabricChange(field, e.target.value)}
                min={isNumeric ? "0" : undefined}
            />
        </div>
    );


    return (
        <div style={styles.container(currentTheme)}>
            {/* Fixed Mobile Header */}
            <div style={styles.fixedHeader(currentTheme)}>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => navigate("/")} style={styles.navButton(currentTheme)}>
                        🧮 Calc
                    </button>
                    <button onClick={() => navigate("/history")} style={styles.navButton(currentTheme)}>
                        📜 History
                    </button>
                </div>
                <h1 style={{ fontSize: '18px', fontWeight: '700', color: currentTheme.textPrimary }}>Edit details</h1>
            </div>

            <div style={styles.contentWrapper}>

                {/* Add New Section */}
                <div style={styles.addNewSection(currentTheme)}>
                    <h3 style={{ ...styles.cardHeader(currentTheme), borderBottom: 'none', color: currentTheme.textPrimary, fontSize: '18px', marginBottom: '15px' }}>
                        ➕ Add New Fabric Type
                    </h3>

                    {renderNewInput('cloth_name', newFabric.cloth_name, 'Cloth Name (Required)')}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        {renderNewInput('thickness', newFabric.thickness, 'Thickness')}
                        {renderNewInput('color', newFabric.color, 'Color')}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                        {renderNewInput('req_length_in', newFabric.req_length_in, 'Req. Length (in)', true)}
                        {renderNewInput('req_width_in', newFabric.req_width_in, 'Req. Width (in)', true)}
                        {renderNewInput('stitch_rate', newFabric.stitch_rate, 'Stitch Rate (Rs)', true)}
                    </div>

                    <button
                        onClick={addNewRow}
                        style={styles.addButton(currentTheme)}
                        disabled={isAdding}
                    >
                        {isAdding ? 'Adding...' : 'Add Fabric'}
                    </button>
                </div>

                {/* Existing Fabric List */}
                <h3 style={styles.title(currentTheme)}>Manage Existing Data</h3>

                {loading && <p style={{ ...styles.card(currentTheme), textAlign: 'center' }}>Loading fabric data...</p>}

                {!loading && cloths.map((c, i) => (
                    <div key={c.cloth_id || i} style={styles.card(currentTheme)}>

                        <div style={styles.cardHeader(currentTheme)}>{c.cloth_name}</div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            {renderInput(i, 'thickness', c.thickness, 'Thickness')}
                            {renderInput(i, 'color', c.color, 'Color')}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                            {renderInput(i, 'req_length_in', c.req_length_in, 'Length (in)', true)}
                            {renderInput(i, 'req_width_in', c.req_width_in, 'Width (in)', true)}
                            {renderInput(i, 'stitch_rate', c.stitch_rate, 'Stitch Rate (Rs)', true)}
                        </div>

                        <button
                            onClick={() => updateRow(c, i)}
                            style={styles.saveButton(currentTheme, updatingIndex === i)}
                            disabled={updatingIndex === i}
                        >
                            {updatingIndex === i ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                ))}

                {!loading && cloths.length === 0 && (
                    <p style={{ ...styles.card(currentTheme), textAlign: 'center', color: currentTheme.textSecondary }}>
                        No fabric types found. Please add a new one above.
                    </p>
                )}
            </div>
        </div>
    );
}