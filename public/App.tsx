import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import yaml from "js-yaml";

interface GraphData {
    nodes: unknown[];
    links: unknown[];
}

function App() {
    const [graph, setGraph] = useState<GraphData>({ nodes: [], links: [] });
    const [arkStatus, setArkStatus] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/graph")
            .then((res) => res.json())
            .then(setGraph)
            .catch((err) => console.error("Graph fetch failed:", err));
    }, []);

    const syncArk = async () => {
        setArkStatus("syncing...");
        try {
            const res = await fetch("/api/sync-ark");
            const data = await res.json();
            setArkStatus(data.message || data.status);
        } catch (err) {
            setArkStatus("Sync failed");
        }
    };

    return (
        <div style={{ maxWidth: 720, margin: "2rem auto", padding: "0 1rem" }}>
            <h1 style={{ color: "#58a6ff" }}>OPVS Genesis Engine</h1>
            <p style={{ color: "#3fb950", fontSize: "1.2rem" }}>🟢 ONLINE</p>

            <section style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 6, padding: "1.5rem", marginTop: "2rem" }}>
                <h2 style={{ color: "#58a6ff", marginTop: 0 }}>Ark Sync</h2>
                <button onClick={syncArk} style={{ padding: "0.6rem 1.5rem", background: "#238636", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: "1rem" }}>
                    Sync Ark
                </button>
                {arkStatus && <p style={{ marginTop: "1rem", color: "#8b949e" }}>{arkStatus}</p>}
            </section>

            <section style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 6, padding: "1.5rem", marginTop: "2rem" }}>
                <h2 style={{ color: "#58a6ff", marginTop: 0 }}>Bean Graph</h2>
                <p style={{ color: "#8b949e" }}>
                    {graph.nodes.length} nodes, {graph.links.length} links
                </p>
            </section>
        </div>
    );
}

const container = document.getElementById("root");
if (container) {
    createRoot(container).render(<App />);
}
