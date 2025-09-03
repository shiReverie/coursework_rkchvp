/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from "react";
import BrandBook from "./BrandBook";
import LayersPanel from "./LayersPanel";
import "bootstrap/dist/css/bootstrap.min.css";
import "./CanvasV.css";
import { useTranslation } from 'react-i18next';
import './i18n';
function VideoCanvas() {
    // ---------- Refs and States ----------
    const canvasRef = useRef(null);
    const backgroundVideoRef = useRef(null);
    const animationFrameRef = useRef(null);

    const [layers, setLayers] = useState([]);
    const [background, setBackground] = useState({ type: "color", value: "#ffffff" });
    const [selectedLayerId, setSelectedLayerId] = useState(null);

    // Modal visibility states
    const [isSaveModalVisible, setIsSaveModalVisible] = useState(false);
    const [isBackgroundModalVisible, setIsBackgroundModalVisible] = useState(false);
    const [isImageModalVisible, setIsImageModalVisible] = useState(false);
    const [isTextModalVisible, setIsTextModalVisible] = useState(false);
    const [isImageAnimationModalVisible, setIsImageAnimationModalVisible] = useState(false);
    const [isBrandBookVisible, setIsBrandBookVisible] = useState(false);

    // Inputs for image URL and background video URL 
    const [imageUrl, setImageUrl] = useState("");

    // For dragging/moving and resizing layers
    const [isMoving, setIsMoving] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const dragOffsetRef = useRef({ offsetX: 0, offsetY: 0 });
    const resizeStartRef = useRef({ startX: 0, startY: 0, initialWidth: 0, initialHeight: 0 });

    // ---------- Selection Helpers ----------
    const selectLayer = (id) => {
        setSelectedLayerId(id);
        setLayers((prev) =>
            prev.map((layer) => ({ ...layer, isSelected: layer.id === id }))
        );
    };

    const clearSelection = () => {
        setSelectedLayerId(null);
        setLayers((prev) =>
            prev.map((layer) => ({ ...layer, isSelected: false }))
        );
    };

    const deleteLayer = (id) => {
        setLayers((prev) => prev.filter((layer) => layer.id !== id));
        if (selectedLayerId === id) setSelectedLayerId(null);
    };

    // For BrandBook: update color for the currently selected text layer.
    const handleColorSelect = (color) => {
        setLayers((prevLayers) =>
            prevLayers.map((layer) =>
                layer.isSelected && layer.type === "textbox"
                    ? { ...layer, color }
                    : layer
            )
        );
    };

    // ---------- Utility Functions ----------
    const generateId = () => "_" + Math.random().toString(36).substr(2, 9);
    const lerp = (start, end, t) => start + (end - start) * t;

    // ---------- Canvas Drop Handler ----------
    const handleCanvasDrop = (event) => {
        event.preventDefault();
        const droppedColor = event.dataTransfer.getData('text/plain');
        const droppedImage = event.dataTransfer.getData('text/plain');
        if (droppedColor.startsWith('#')) {
            setBackground({ type: "color", value: droppedColor });
        } else if (droppedImage.startsWith('data:image')) {
            const img = new Image();
            img.onload = () => {
                addImageLayer(img);
            };
            img.src = droppedImage;
        }
    };

    // ---------- Drawing & Animation ----------
    const drawFrame = (progress) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (background.type === "color") {
            ctx.fillStyle = background.value;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else if (background.type === "video") {
            if (
                !backgroundVideoRef.current ||
                backgroundVideoRef.current.src !== background.value
            ) {
                backgroundVideoRef.current = document.createElement("video");
                backgroundVideoRef.current.src = background.value;
                backgroundVideoRef.current.loop = true;
                backgroundVideoRef.current.muted = true;
                backgroundVideoRef.current.play();
            }
            try {
                ctx.drawImage(backgroundVideoRef.current, 0, 0, canvas.width, canvas.height);
            } catch (err) {
                // Video isn't ready yet
            }
        }

        layers.forEach((layer) => {
            if (layer.type === "textbox") {
                ctx.save();
                let x = layer.x;
                let opacity = 1;
                let displayText = layer.text;
                if (layer.animation === "slide") {
                    x = lerp(-canvas.width, layer.x, progress);
                } else if (layer.animation === "fade") {
                    opacity = progress;
                } else if (layer.animation === "typing") {
                    const fullText = layer.text;
                    const charCount = Math.floor(fullText.length * progress);
                    displayText = fullText.substring(0, charCount);
                }
                ctx.globalAlpha = opacity;
                ctx.fillStyle = layer.color;
                ctx.font = `${layer.size}px ${layer.font}`;
                ctx.textAlign = layer.alignment;
                ctx.fillText(displayText, x, layer.y);

                if (layer.isSelected) {
                    const metrics = ctx.measureText(displayText);
                    const textWidth = metrics.width;
                    const textHeight = layer.size; 
                    let rectX;
                    if (layer.alignment === "center") rectX = x - textWidth / 2;
                    else if (layer.alignment === "right") rectX = x - textWidth;
                    else rectX = x;
                    ctx.strokeStyle = "#63636e";
                    ctx.lineWidth = 2;
                    ctx.strokeRect(rectX - 5, layer.y - textHeight - 5, textWidth + 10, textHeight + 10);
                }
                ctx.restore();

            } else if (layer.type === "image") {
                ctx.save();
                let x = layer.x;
                let opacity = 1;
                let scale = 1;

                if (layer.animation === "fade") {
                    opacity = progress;
                } else if (layer.animation === "zoom") {
                    scale = lerp(0.5, 1, progress);
                } else if (layer.animation === "slide") {
                    x = lerp(-canvas.width, layer.x, progress);
                }
                ctx.globalAlpha = opacity;
                if (scale !== 1) {
                    ctx.translate(layer.x + layer.width / 2, layer.y + layer.height / 2);
                    ctx.scale(scale, scale);
                    ctx.drawImage(layer.img, -layer.width / 2, -layer.height / 2, layer.width, layer.height);
                    if (layer.isSelected) {
                        ctx.strokeStyle = "#63636e";
                        ctx.lineWidth = 2;
                        ctx.strokeRect(-layer.width / 2, -layer.height / 2, layer.width, layer.height);
                    }
                } else {
                    ctx.drawImage(layer.img, x, layer.y, layer.width, layer.height);
                    if (layer.isSelected) {
                        ctx.strokeStyle = "#63636e";
                        ctx.lineWidth = 2;
                        ctx.strokeRect(x, layer.y, layer.width, layer.height);
                        const handleSize = 10;
                        ctx.fillStyle = "#63636e";
                        ctx.fillRect(x + layer.width - handleSize, layer.y + layer.height - handleSize, handleSize, handleSize);
                    }
                }
                ctx.restore();
            }
        });
    };


    useEffect(() => {
        let startTime = performance.now();
        const animate = (time) => {
            const elapsed = time - startTime;
            const progress = Math.min(elapsed / 1000, 1);
            drawFrame(progress);
            animationFrameRef.current = requestAnimationFrame(animate);
        };
        animationFrameRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrameRef.current);
    }, [layers, background]);

    // ---------- Save Video ----------
    const saveVideo = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const stream = canvas.captureStream(30);
        const mimeType = MediaRecorder.isTypeSupported("video/mp4")
            ? "video/mp4"
            : "video/webm";
        const recorder = new MediaRecorder(stream, { mimeType });
        const chunks = [];
        recorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                chunks.push(e.data);
            }
        };
        recorder.onstop = () => {
            const blob = new Blob(chunks, { type: mimeType });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = mimeType === "video/mp4" ? "video.mp4" : "video.webm";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setIsSaveModalVisible(false);
        };
        recorder.start();
        setTimeout(() => recorder.stop(), 10000);
    };

    // ---------- Layer Management ----------
    const addTextboxLayer = () => {
        const newLayer = {
            id: generateId(),
            type: "textbox",
            x: 100,
            y: 100,
            text: "New Text",
            color: "#000000",
            size: 40,
            font: "Arial",
            alignment: "center",
            animation: "none", 
            isSelected: false,
        };
        setLayers((prev) => [...prev, newLayer]);
    };

    const addImageLayer = (img) => {
        const newLayer = {
            id: generateId(),
            type: "image",
            img,
            x: 100,
            y: 100,
            width: img.width,
            height: img.height,
            animation: "none", 
            isSelected: false,
        };
        setLayers((prev) => [...prev, newLayer]);
    };

    // ---------- Image Upload / URL Handling ----------
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const img = new Image();
                img.onload = () => addImageLayer(img);
                img.src = ev.target.result;
            };
            reader.readAsDataURL(file);
        }
    };

    const addImageFromUrl = () => {
        if (imageUrl) {
            const img = new Image();
            img.onload = () => {
                addImageLayer(img);
                setImageUrl("");
                setIsImageModalVisible(false);
            };
            img.src = imageUrl;
        }
    };

    // ---------- Background Handling (Video or Color) ----------
    const handleBackgroundVideoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setBackground({ type: "video", value: url });
        }
    };

    const resetBackground = () => {
        setBackground({ type: "color", value: "#ffffff" });
    };

    // ---------- Canvas Mouse Interaction ----------
    const handleCanvasMouseDown = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const isRightClick = e.button === 2;
        const handleSize = 10;


        for (let i = layers.length - 1; i >= 0; i--) {
            const layer = layers[i];
            if (layer.type === "image") {
                if (
                    mouseX >= layer.x + layer.width - handleSize &&
                    mouseX <= layer.x + layer.width &&
                    mouseY >= layer.y + layer.height - handleSize &&
                    mouseY <= layer.y + layer.height
                ) {
                    selectLayer(layer.id);
                    setIsResizing(true);
                    resizeStartRef.current = {
                        startX: mouseX,
                        startY: mouseY,
                        initialWidth: layer.width,
                        initialHeight: layer.height,
                    };
                    return;
                }
                if (isRightClick) {
                    selectLayer(layer.id);
                    setIsImageAnimationModalVisible(true);
                    return;
                }
                if (
                    mouseX >= layer.x &&
                    mouseX <= layer.x + layer.width &&
                    mouseY >= layer.y &&
                    mouseY <= layer.y + layer.height
                ) {
                    selectLayer(layer.id);
                    setIsMoving(true);
                    dragOffsetRef.current = {
                        offsetX: mouseX - layer.x,
                        offsetY: mouseY - layer.y,
                    };
                    return;
                }
            } else if (layer.type === "textbox") {
                const ctx = canvas.getContext("2d");
                ctx.font = `${layer.size}px ${layer.font}`;
                const metrics = ctx.measureText(layer.text);
                const textWidth = metrics.width;
                let textStart = layer.x;
                if (layer.alignment === "center") textStart = layer.x - textWidth / 2;
                else if (layer.alignment === "right") textStart = layer.x - textWidth;
                if (
                    mouseX >= textStart - 5 &&
                    mouseX <= textStart + textWidth + 5 &&
                    mouseY >= layer.y - layer.size - 5 &&
                    mouseY <= layer.y + 5
                ) {
                    selectLayer(layer.id);
                    if (isRightClick) {
                        setIsTextModalVisible(true);
                    } else {
                        setIsMoving(true);
                        dragOffsetRef.current = {
                            offsetX: mouseX - layer.x,
                            offsetY: mouseY - layer.y,
                        };
                    }
                    return;
                }
            }
        }
        clearSelection();
    };

    const handleCanvasMouseMove = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        if (isResizing && selectedLayerId) {
            setLayers((prev) =>
                prev.map((layer) => {
                    if (layer.id === selectedLayerId && layer.type === "image") {
                        const newWidth = Math.max(
                            resizeStartRef.current.initialWidth + (mouseX - resizeStartRef.current.startX),
                            20
                        );
                        const newHeight = Math.max(
                            resizeStartRef.current.initialHeight + (mouseY - resizeStartRef.current.startY),
                            20
                        );
                        return { ...layer, width: newWidth, height: newHeight };
                    }
                    return layer;
                })
            );
        } else if (isMoving && selectedLayerId) {
            setLayers((prev) =>
                prev.map((layer) =>
                    layer.id === selectedLayerId
                        ? { ...layer, x: mouseX - dragOffsetRef.current.offsetX, y: mouseY - dragOffsetRef.current.offsetY }
                        : layer
                )
            );
        }
    };

    const handleCanvasMouseUp = () => {
        setIsMoving(false);
        setIsResizing(false);
    };

    const handleCanvasContextMenu = (e) => {
        e.preventDefault();
    };
    const { t } = useTranslation();

    // ---------- Modal Renderers ----------
    const renderTextEditingModal = () => {
        const layer = layers.find((l) => l.id === selectedLayerId && l.type === "textbox");
        if (!layer) return null;
        return (
            <div className="modal show" style={{ display: "block", background: "rgba(0,0,0,0.5)" }}>
                <div className="modal-content">
                    <h2>{t("editText")}</h2>
                    <div>
                        <label>{t("inputText")}: </label>
                        <input
                            type="text"
                            value={layer.text}
                            onChange={(e) =>
                                setLayers((prev) =>
                                    prev.map((l) => (l.id === layer.id ? { ...l, text: e.target.value } : l))
                                )
                            }
                        />
                    </div>
                    <div>
                        <label>{t("colorText")}: </label>
                        <input
                            type="color"
                            value={layer.color}
                            onChange={(e) =>
                                setLayers((prev) =>
                                    prev.map((l) => (l.id === layer.id ? { ...l, color: e.target.value } : l))
                                )
                            }
                        />
                    </div>
                    <div>
                        <label>{t("fontSizeText")}: </label>
                        <input
                            type="number"
                            value={layer.size}
                            onChange={(e) =>
                                setLayers((prev) =>
                                    prev.map((l) =>
                                        l.id === layer.id ? { ...l, size: Number(e.target.value) } : l
                                    )
                                )
                            }
                        />
                    </div>
                    <div>
                        <label>Animation: </label>
                        <select
                            value={layer.animation}
                            onChange={(e) =>
                                setLayers((prev) =>
                                    prev.map((l) =>
                                        l.id === layer.id ? { ...l, animation: e.target.value } : l
                                    )
                                )
                            }
                        >
                            <option value="none">None</option>
                            <option value="slide">Slide</option>
                            <option value="fade">Fade</option>
                            <option value="typing">Typing Machine</option>
                        </select>
                    </div>
                    <button onClick={() => setIsTextModalVisible(false)}>{t("closeButton")}</button>
                </div>
            </div>
        );
    };

    const renderImageAnimationModal = () => {
        const layer = layers.find((l) => l.id === selectedLayerId && l.type === "image");
        if (!layer) return null;
        return (
            <div className="modal show" style={{ display: "block", background: "rgba(0,0,0,0.5)" }}>
                <div className="modal-content">
                    <h2>Edit Image Animation</h2>
                    <div>
                        <label>Animation: </label>
                        <select
                            value={layer.animation}
                            onChange={(e) =>
                                setLayers((prev) =>
                                    prev.map((l) =>
                                        l.id === layer.id ? { ...l, animation: e.target.value } : l
                                    )
                                )
                            }
                        >
                            <option value="none">None</option>
                            <option value="fade">Fade</option>
                            <option value="zoom">Zoom In</option>
                            <option value="slide">Slide</option>
                        </select>
                    </div>
                    <button onClick={() => setIsImageAnimationModalVisible(false)}>{t("closeButton")}</button>
                </div>
            </div>
        );
    };

    return (
        <div>
            <div style={{ marginBottom: "10px" }}>
                <div className="buttonText">
                    <button className="shadow-sm p-3 bg-body-tertiary rounded text-dark"
                        onClick={addTextboxLayer}>{t("addText")}</button></div>
                <div className="buttonImage">
                    <button className="shadow-sm p-3 bg-body-tertiary rounded text-dark"
                        onClick={() => setIsImageModalVisible(true)}>{t("addImage")}</button></div>
                <div className="buttonBg">
                    <button className="shadow-sm p-3 bg-body-tertiary rounded text-dark"
                        onClick={() => setIsBackgroundModalVisible(true)}>{t("changeBg")}</button>
                </div>
                <div className="buttonSave">
                    <button className="shadow-sm p-3 bg-body-tertiary rounded text-dark"
                        onClick={() => setIsSaveModalVisible(true)}>{t("saveV")}</button>
                </div>
                <div className="buttonBB">
                    <button className="shadow-sm p-3 bg-body-tertiary rounded text-dark"
                        onClick={() => setIsBrandBookVisible(!isBrandBookVisible)}>
                        {isBrandBookVisible ? t("closeBB") : t("openBB")}
                </button></div>
            </div>

            <canvas
                ref={canvasRef}
                width={900}
                height={550}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onContextMenu={handleCanvasContextMenu}
                onDrop={handleCanvasDrop}
                onDragOver={(e) => e.preventDefault()}
                style={{ border: "1px solid #ccc" }}
            />

            {/* Save Modal */}
            {isSaveModalVisible && (
                <div className="modal show" style={{ display: "block", background: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-content">
                        <h2>Save Video</h2>
                        <p>Recording 10 seconds video...</p>
                        <button onClick={saveVideo}>Start Save</button>
                        <button onClick={() => setIsSaveModalVisible(false)}>{t("closeButton")}</button>
                    </div>
                </div>
            )}

            {/* Background Modal */}
            {isBackgroundModalVisible && (
                <div className="modal show" style={{ display: "block", background: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-content">
                        <h2>{t("changeBg")}</h2>
                        <div>
                            <label>{t("chooseBgColor")}:</label>
                            <input
                                type="color"
                                value={background.type === "color" ? background.value : "#ffffff"}
                                onChange={(e) => setBackground({ type: "color", value: e.target.value })}
                            />
                        </div>
                        <div>
                            <label>Upload Background Video:</label>
                            <input type="file" accept="video/*" onChange={handleBackgroundVideoUpload} />
                        </div>
                        
                        <div>
                            <button onClick={resetBackground} style={{ backgroundColor: "red", color: "white" }}>
                                {t("resetBg")}
                            </button>
                        </div>
                        <button onClick={() => setIsBackgroundModalVisible(false)}>{t("closeButton")}</button>
                    </div>
                </div>
            )}

            {/* Image Modal */}
            {isImageModalVisible && (
                <div className="modal show" style={{ display: "block", background: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-content">
                        <h2>{t("addImage")}</h2>
                        <div>
                            <label>{t("uploadImage")}:</label>
                            <input type="file" accept="image/*" onChange={handleImageUpload} />
                        </div>
                        <div>
                            <label>{t("enterImageURL")}:</label>
                            <input
                                type="text"
                                placeholder="Paste image URL"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                            />
                        </div>
                        <button onClick={addImageFromUrl}>{t("addImage")}</button>
                        <button onClick={() => { setIsImageModalVisible(false); setImageUrl(""); }}>
                            {t("closeButton")}
                        </button>
                    </div>
                </div>
            )}

            {/* Text Editing Modal */}
            {isTextModalVisible && renderTextEditingModal()}

            {/* Image Animation Modal */}
            {isImageAnimationModalVisible && renderImageAnimationModal()}

            {/* Render BrandBook if visible */}
            {isBrandBookVisible && <BrandBook onColorSelect={handleColorSelect} />}

            {/* Render LayersPanel */}
            <LayersPanel layers={layers} setLayers={setLayers} deleteLayerHandler={deleteLayer} />
        </div>
    );
}

export default VideoCanvas;
