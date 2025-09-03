import React, { useState } from "react";
import './LayersStyle.css';
function LayersPanel({ layers, setLayers, deleteLayerHandler }) {

    const [isExpanded, setIsExpanded] = useState(false);

    // Handle drag–and–drop ordering of layers
    const handleDragStart = (e, index) => {
        e.dataTransfer.setData("dragIndex", index);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e, dropIndex) => {
        const dragIndex = e.dataTransfer.getData("dragIndex");
        if (dragIndex === null) return;
        const newLayers = [...layers];
        const [draggedLayer] = newLayers.splice(dragIndex, 1);
        newLayers.splice(dropIndex, 0, draggedLayer);
        setLayers(newLayers);
    };

    return (
        <div
            className="layers-panel shadow-sm p-3 bg-body-tertiary rounded text-dark"
            style={{
                padding: "10px",
                border: "1px solid #ddd",
                marginTop: "20px",
                maxWidth: "300px",
            }}
        >
            <h3>Layers</h3>
            <ul className="list-group" style={{ listStyleType: "none", padding: 0 }}>
                {layers.slice(0, isExpanded ? layers.length : 3).map((layer, index) => (
                    <li className={`shadow-sm p-3 rounded text-dark ${layer.isSelected ? "bg-secondary-bgsubtle" : "bg-body-tertiary"}`}
                        key={layer.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                        style={{
                            border: "1px solid #ccc",
                            padding: "8px",
                            marginBottom: "4px",
                            cursor: "move",
                            background: layer.isSelected ? "#e0e0e0" : "#fff",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <span>{layer.type === "image" ? "Image Layer" : "Text Layer"}</span>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteLayerHandler(layer.id)} style={{ marginLeft: "10px" }}>
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
            <button
                className="shadow-sm p-2 bg-body-tertiary rounded text-dark mt-2"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                {isExpanded ? "Collapse" : "Expand"}
            </button>

        </div>
    );
}

export default LayersPanel;
