import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

interface GraphData {
    nodes: unknown[];
    links: unknown[];
}

const styles: Record<string, React.CSSProperties> = {
    wrap: { maxWidth: 800, margin: "0 auto", padding: "2rem 1.5rem", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
    header: { borderBottom: "1px solid #30363d", paddingBottom: "1.5rem", marginBottom: "1.5rem" },
    eyebrow: { fontSize: "0.75rem", textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#8b949e", margin: "0 0 0.4rem" },
    h1: { color: "#e6edf3", margin: "0 0 0.25rem", fontSize: "1.6rem" },
    statusBadge: { display: "inline-flex", alignItems: "center", gap: "0.35rem", fontSize: "0.8rem", color: "#3fb950", background: "#0d2818", border: "1px solid #238636", borderRadius: 20, padding: "0.2rem 0.8rem", marginTop: "0.75rem" },
    card: { background: "#161b22", border: "1px solid #30363d", borderRadius: 8, padding: "1.25rem 1.5rem", marginBottom: "1rem" },
    cardTitle: { color: "#58a6ff", margin: "0 0 0.75rem", fontSize: "1rem" },
    stat: { color: "#8b949e", margin: 0, fontSize: "0.9rem" },
    btn: { padding: "0.5rem 1.3rem", background: "#238636", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: "0.9rem", fontFamily: "inherit" },
    btnDisabled: { padding: "0.5rem 1.3rem", background: "#1a4d28", color: "#6e8f78", border: "none", borderRadius: 6, cursor: "not-allowed", fontSize: "0.9rem", fontFamily: "inherit", opacity: 0.6 },
    statusMsg: { marginTop: "0.75rem", color: "#8b949e", fontSize: "0.85rem" },
};

function App() {
    const [graph, setGraph] = useState<GraphData>({ nodes: [], links: [] });
    const [arkStatus, setArkStatus] = useState<string | null>(null);
    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        fetch("/api/graph")
            .then((res) => res.json())
            .then(setGraph)
            .catch((err) => console.error("Graph fetch failed:", err));
    }, []);

    const syncArk = async () => {
        setSyncing(true);
        setArkStatus("Syncing...");
        try {
            const res = await fetch("/api/sync-ark");
            const data = await res.json();
            setArkStatus(data.message || data.status || "Done");
        } catch {
            setArkStatus("Sync failed. Check server logs.");
        } finally {
            setSyncing(false);
        }
    };

    return (
        <div style={styles.wrap}>
            <header style={styles.header}>
                <p style={styles.eyebrow}>OPVS Genesis Engine</p>
                <h1 style={styles.h1}>Dashboard</h1>
                <span style={styles.statusBadge}>&#x25CF; ONLINE</span>
            </header>

            <div style={styles.card}>
                <h2 style={styles.cardTitle}>Bean Graph</h2>
                <p style={styles.stat}>{graph.nodes.length} nodes &middot; {graph.links.length} links</p>
            </div>

            <div style={styles.card}>
                <h2 style={styles.cardTitle}>Ark Sync</h2>
                <p style={{ ...styles.stat, marginBottom: "0.75rem" }}>Pull the latest commits from the Ark into the Soil.</p>
                <button style={syncing ? styles.btnDisabled : styles.btn} onClick={syncArk} disabled={syncing}>
                    {syncing ? "Syncing..." : "Sync Ark"}
                </button>
                {arkStatus && <p style={styles.statusMsg}>{arkStatus}</p>}
            </div>
        </div>
    );
}

const container = document.getElementById("root");
if (container) {
    createRoot(container).render(<App />);
}
