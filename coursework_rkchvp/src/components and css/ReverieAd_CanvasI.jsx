/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from "react";
import { writePsd } from "ag-psd";
import LayersPanel from "./LayersPanel";
import BrandBook from "./BrandBook";
import TemplateLibrary from "./TemplateLibrary";
import "bootstrap/dist/css/bootstrap.min.css";
import "./CanvasI.css";
import { useTranslation } from 'react-i18next';
import './i18n'; 

function BannerCanvas() {
    // -------- Combined Layers State ----------
    const [layers, setLayers] = useState([]);
    const [isSaveModalVisible, setIsSaveModalVisible] = useState(false);
    const [selectedFormat, setSelectedFormat] = useState("png");
    const [textColor, setTextColor] = useState('#000000');
    const [isBrandBookVisible, setIsBrandBookVisible] = useState(false);
    const [isLibraryOpen, setIsLibraryOpen] = useState(false);


    // -------- Background State & Modal ----------
    const [background, setBackground] = useState({ type: "color", value: "#ffffff" });
    const [isBackgroundModalVisible, setIsBackgroundModalVisible] = useState(false);

    // -------- Modals for Adding / Editing ----------
    const [isImageModalVisible, setIsImageModalVisible] = useState(false);
    const [isTextModalVisible, setIsTextModalVisible] = useState(false);
    const [imageUrl, setImageUrl] = useState("");

    // -------- Selection & Interaction ----------
    const [selectedLayerId, setSelectedLayerId] = useState(null);
    const [isMoving, setIsMoving] = useState(false);
    const [isResizing, setIsResizing] = useState(false);

    // -------- Refs ----------
    const canvasRef = useRef(null);
    const dragOffsetRef = useRef({ offsetX: 0, offsetY: 0 });
    const resizeStartRef = useRef({ startX: 0, startY: 0, initialWidth: 0, initialHeight: 0 });

    // -------- Drawing the Canvas ----------
    useEffect(() => {
        const ctx = canvasRef.current.getContext("2d");
        drawCanvas(ctx);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [layers, background]);

    const drawCanvas = (ctx) => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        if (background.type === "color") {
            ctx.fillStyle = background.value;
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            drawLayers(ctx);
        } else if (background.type === "image") {
            const bgImg = new Image();
            bgImg.src = background.value;
            bgImg.onload = () => {
                ctx.drawImage(bgImg, 0, 0, ctx.canvas.width, ctx.canvas.height);
                drawLayers(ctx);
            };
        }
    };

    const handleColorSelect = (color) => {
        setLayers((prevLayers) =>
            prevLayers.map((layer) =>
                layer.isSelected && layer.type === "textbox"
                    ? { ...layer, color }
                    : layer
            )
        );
    };


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
    const handleTemplateApply = (data) => {
        console.log("Selected Template Data:", data);

        setLayers((prevLayers) => [
            ...prevLayers,
            {
                type: "template",
                templateId: data.templateId,
                brandName: data.customizations.brandName,
                cost: data.customizations.cost,
                details: data.customizations.details,
                mainImage: data.customizations.mainImage,
                pngImage: data.customizations.pngImage,
                
            },
        ]);
    };



    const drawLayers = (ctx) => {
        layers.forEach((layer) => {
            if (layer.type === "image") {

                ctx.drawImage(layer.img, layer.x, layer.y, layer.width, layer.height);
                if (layer.isSelected) {
                    ctx.strokeStyle = "#63636e";
                    ctx.lineWidth = 2;
                    ctx.strokeRect(layer.x, layer.y, layer.width, layer.height);
                }
            } else if (layer.type === "textbox") {

                ctx.font = `${layer.size}px ${layer.font}`;
                ctx.textBaseline = 'middle';
                ctx.textAlign = layer.alignment;

                const padding = 5;

                let rectX, textX;

                if (layer.alignment === "center") {
                    rectX = layer.x - layer.width / 2 - padding;
                    textX = layer.x; 
                } else if (layer.alignment === "right") {
                    rectX = layer.x - layer.width - padding;
                    textX = layer.x; 
                } else {
                    rectX = layer.x - padding;
                    textX = layer.x; 
                }

                const rectWidth = layer.width + 2 * padding;
                const rectY = layer.y - layer.size / 2 - padding;
                const rectHeight = layer.size + 2 * padding;

   
                const alpha = layer.backgroundTransparency / 100;
                ctx.fillStyle = `rgba(${hexToRgb(layer.backgroundColor)}, ${alpha})`;
                ctx.fillRect(rectX, rectY, rectWidth, rectHeight);

                ctx.fillStyle = layer.color;
                ctx.fillText(layer.text, textX, layer.y);

           
                if (layer.isSelected) {
                    ctx.strokeStyle = "#63636e";
                    ctx.lineWidth = 2;
                    ctx.strokeRect(rectX, rectY, rectWidth, rectHeight);
                }
            }
            else if (layer.type === "template") {
                if (layer.templateId === 1) {
                    //  TEMPLATE 1: Image on Left, Brand Info on Right
                    if (layer.mainImage) {
                        const img = new Image();
                        img.src = layer.mainImage;
                        img.onload = () => ctx.drawImage(img, 30, 90, 300, 400);
                    }

                    ctx.fillStyle = "#000";
                    ctx.font = "40px Arial";
                    ctx.fillText(layer.brandName, 400, 120);
                    ctx.font = "28px Arial";
                    ctx.fillText(`$${layer.cost}`, 400, 160);
                    ctx.font = "24px Arial";
                    ctx.fillText(layer.details, 400, 200);
                }

                else if (layer.templateId === 2) {
                    //  TEMPLATE 2: Large Center Image with Text Below
                    if (layer.mainImage) {
                        const img = new Image();
                        img.src = layer.mainImage;
                        img.onload = () => ctx.drawImage(img, 470, 0, 450, 600);
                    }

                    ctx.fillStyle = "#000";
                    ctx.font = "40px Arial";
                    ctx.fillText(layer.brandName, 100, 40);
                    ctx.font = "30px Arial";
                    ctx.fillText(`$${layer.cost}`, 100, 80);
                    ctx.fillText(layer.details, 100, 110);
                }

                else if (layer.templateId === 3) {
                    //  TEMPLATE 3: Text on Top, Image Below

                    if (layer.mainImage) {
                        const img = new Image();
                        img.src = layer.mainImage;
                        img.onload = () => ctx.drawImage(img, 0, 0, 430, 600);
                    }
                    ctx.save();
                    ctx.translate(450, 0);
                    ctx.rotate(Math.PI / 2);
                    ctx.fillStyle = "#000";
                    ctx.font = "60px Arial";
                    ctx.fillText(layer.brandName, 100, 0);

                    ctx.restore();

                    ctx.fillStyle = "#000";
                    ctx.font = "24px Arial";
                    ctx.fillText(`$${layer.cost}`, 550, 100);
                    ctx.fillText(layer.details, 550, 130);
                   
                }

                // Draw PNG overlay 
                if (layer.pngImage) {
                    const img = new Image();
                    img.src = layer.pngImage;
                    img.onload = () => ctx.drawImage(img, 300, 350, 150, 190);
                }
            }
        
        }
        );
    };

    const saveCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        if (selectedFormat === "png" || selectedFormat === "jpeg") {
            const image = canvas.toDataURL(`image/${selectedFormat}`);
            const link = document.createElement("a");
            link.href = image;
            link.download = `canvas.${selectedFormat}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else if (selectedFormat === "psd") {
            const ctx = canvas.getContext("2d");
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const psdBuffer = writePsd({ width: canvas.width, height: canvas.height, imageData });

            const blob = new Blob([psdBuffer], { type: "application/octet-stream" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "canvas.psd";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

        setIsSaveModalVisible(false);
    };



    const hexToRgb = (hex) => {
        hex = hex.replace("#", "");
        const bigint = parseInt(hex, 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return `${r}, ${g}, ${b}`;
    };

    // -------- Generators for IDs and Layers ----------
    const generateId = () => "_" + Math.random().toString(36).substr(2, 9);

    const addTextboxLayer = () => {
        const newLayer = {
            id: generateId(),
            type: "textbox",
            x: 50,
            y: 50,
            text: "New Text",
            color: "#000000",
            backgroundColor: "#ffffff",
            backgroundTransparency: 0,
            size: 20,
            font: "Arial",
            width: 200,
            alignment: "left",
            isSelected: false,
        };
        setLayers((prev) => [...prev, newLayer]);
    };

    const addImageLayer = (img) => {
        const newLayer = {
            id: generateId(),
            type: "image",
            img: img,
            x: 50,
            y: 50,
            width: img.width,
            height: img.height,
            isSelected: false,
        };
        setLayers((prev) => [...prev, newLayer]);
    };

    // -------- Image Upload / URL Handling ----------
    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.crossOrigin = "anonymous";
                img.onload = () => {
                    addImageLayer(img);
                };
                img.src = e.target.result;
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

    // -------- Background Handling ----------
    const handleBackgroundUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setBackground({ type: "image", value: e.target.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const resetBackground = () => {
        setBackground({ type: "color", value: "#ffffff" });
    };

    // -------- Canvas Mouse Interaction Handlers ----------
    const handleCanvasMouseDown = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const isRightClick = e.button === 2;

      
        for (let i = layers.length - 1; i >= 0; i--) {
            const layer = layers[i];
            if (layer.type === "image") {
                if (mouseX >= layer.x && mouseX <= layer.x + layer.width && mouseY >= layer.y && mouseY <= layer.y + layer.height) {
                    selectLayer(layer.id);
                    if (isRightClick) {
                     
                        setIsMoving(true);
                        dragOffsetRef.current = { offsetX: mouseX - layer.x, offsetY: mouseY - layer.y };
                    } else {
                       
                        setIsResizing(true);
                        resizeStartRef.current = {
                            startX: mouseX,
                            startY: mouseY,
                            initialWidth: layer.width,
                            initialHeight: layer.height,
                        };
                    }
                    return;
                }
            } else if (layer.type === "textbox") {
                
                const rectX = layer.x - 5;
                if (mouseX >= rectX && mouseX <= rectX + layer.width + 10 && mouseY >= layer.y - layer.size && mouseY <= layer.y - layer.size + layer.size + 5) {
                    selectLayer(layer.id);
                    setIsMoving(true);
                    dragOffsetRef.current = { offsetX: mouseX - layer.x, offsetY: mouseY - layer.y }; 
                    if (isRightClick) setIsTextModalVisible(true);
                    return;
                }
            }
        }
        clearSelection();
    };

    const handleCanvasMouseMove = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        if (isResizing && selectedLayerId) {
            setLayers((prev) =>
                prev.map((layer) => {
                    if (layer.id === selectedLayerId && layer.type === "image") {
                        return {
                            ...layer,
                            width: Math.max(mouseX - layer.x, 20),
                            height: Math.max(mouseY - layer.y, 20),
                        };
                    }
                    return layer;
                })
            );
        }
        if (isMoving && selectedLayerId) {
            setLayers((prev) =>
                prev.map((layer) => {
                    if (layer.id === selectedLayerId) {
                        return {
                            ...layer,
                            x: mouseX - dragOffsetRef.current.offsetX,
                            y: mouseY - dragOffsetRef.current.offsetY,
                        };
                    }
                    return layer;
                })
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

    // -------- Selection Helpers ----------
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

    // -------- Delete Handler (used by the LayersPanel) ----------
    const deleteLayer = (id) => {
        setLayers((prev) => prev.filter((layer) => layer.id !== id));
        if (selectedLayerId === id) setSelectedLayerId(null);
    };

    const { t } = useTranslation();

    return (
        <div>
            
            <div className="buttonAddtext">
                <button className="shadow-sm p-3 bg-body-tertiary rounded text-dark" onClick={addTextboxLayer}>
                    {t("addText")}
                </button>
            </div>


            <div className="buttonAddimage">
                <button className="shadow-sm p-3 bg-body-tertiary rounded text-dark" onClick={() => setIsImageModalVisible(true)}>
                    {t("addImage")}
                </button>
            </div>


            <div className="buttonChangeBackground">
                <button className="shadow-sm p-3 bg-body-tertiary rounded text-dark" onClick={() => setIsBackgroundModalVisible(true)}>
                    {t("changeBg")}
                </button>
            </div>

            <div className="buttonSaveCanvas">
                <button
                    className="shadow-sm p-3 bg-body-tertiary rounded text-dark"
                    onClick={() => setIsSaveModalVisible(true)}
                >
                    {t("saveB")}
                </button>
            </div>

            <div className="buttonBrandBook">
            <button
                className="shadow-sm p-3 bg-body-tertiary rounded text-dark"
                onClick={() => setIsBrandBookVisible(!isBrandBookVisible)}
            >
                    {isBrandBookVisible ? t("closeBB") : t("openBB")}
                </button>
                {isBrandBookVisible && <BrandBook onColorSelect={handleColorSelect} />}

           </div>
            <div className ="buttonTemplates">
                <button className="shadow-sm p-3 bg-body-tertiary rounded text-dark"
                    onClick={() => setIsLibraryOpen(!isLibraryOpen)}>
                    {isLibraryOpen ? t("closeTL") : t("openTL")}
                </button>

                {isLibraryOpen && (
                    <TemplateLibrary onTemplateApply={handleTemplateApply} />
                )}
            </div>
            <LayersPanel layers={layers} setLayers={setLayers} deleteLayerHandler={deleteLayer} />

           
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
                
            ></canvas>
            {isSaveModalVisible && (
                <div className="modal show" style={{ display: "block", background: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-content">
                        <h2>{t("saveB")}</h2>
                        <label>{t("selectFormat")}:</label>
                        <select
                            value={selectedFormat}
                            onChange={(e) => setSelectedFormat(e.target.value)}
                        >
                            <option value="png">PNG</option>
                            <option value="jpeg">JPEG</option>
                            <option value="psd">PSD</option>
                        </select>
                        <button onClick={saveCanvas}>{t("saveButtonB")}</button>
                        <button onClick={() => setIsSaveModalVisible(false)}>{t("closeButton")}</button>
                    </div>
                </div>
            )}

            {/* --- Background Modal --- */}
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
                            <label>{t("chooseBgImage")}:</label>
                            <input type="file" accept="image/*" onChange={handleBackgroundUpload} />
                        </div>
                        <div>
                            <label>{t("enterBgImageURL")}:</label>
                            <input
                                type="text"
                                placeholder="Paste image URL"
                                value={background.type === "image" ? background.value : ""}
                                onChange={(e) => setBackground({ type: "image", value: e.target.value })}
                            />
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

            {/* --- Image Modal --- */}
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
                        <button
                            onClick={() => {
                                setIsImageModalVisible(false);
                                setImageUrl("");
                            }}
                        >
                            {t("closeButton")}
                        </button>
                    </div>
                </div>
            )}

            {/* --- Text Editing Modal --- */}
            {isTextModalVisible && selectedLayerId && layers.find((layer) => layer.id === selectedLayerId && layer.type === "textbox") && (
                <div className="modal show" style={{ display: "block", background: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-content">
                        <h2>{t("editText")}</h2>
                        {(() => {
                            const layer = layers.find((layer) => layer.id === selectedLayerId);
                            return (
                                <>
                                    <div>
                                        <label>{t("inputText")}: </label>
                                        <input
                                            type="text"
                                            value={layer.text}
                                            onChange={(e) => {
                                                setLayers((prev) =>
                                                    prev.map((l) => (l.id === layer.id ? { ...l, text: e.target.value } : l))
                                                );
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label>{t("colorText")}: </label>
                                        <input
                                            type="color"
                                            value={layer.color}
                                            onChange={(e) => {
                                                setLayers((prev) =>
                                                    prev.map((l) => (l.id === layer.id ? { ...l, color: e.target.value } : l))
                                                );
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label>{t("bgColorText")}: </label>
                                        <input
                                            type="color"
                                            value={layer.backgroundColor}
                                            onChange={(e) => {
                                                setLayers((prev) =>
                                                    prev.map((l) => (l.id === layer.id ? { ...l, backgroundColor: e.target.value } : l))
                                                );
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label>{t("bgTransText")}:</label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            step="1"
                                            value={layer.backgroundTransparency}
                                            onChange={(e) => {
                                                setLayers((prev) =>
                                                    prev.map((l) => (l.id === layer.id ? { ...l, backgroundTransparency: Number(e.target.value) } : l))
                                                );
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label>{t("fontSizeText")}: </label>
                                        <input
                                            type="number"
                                            value={layer.size}
                                            onChange={(e) => {
                                                setLayers((prev) =>
                                                    prev.map((l) => (l.id === layer.id ? { ...l, size: Number(e.target.value) } : l))
                                                );
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label>{t("alignText")}: </label>
                                        <select
                                            value={layer.alignment}
                                            onChange={(e) => {
                                                setLayers((prev) =>
                                                    prev.map((l) => (l.id === layer.id ? { ...l, alignment: e.target.value } : l))
                                                );
                                            }}
                                        >
                                            <option value="left">Left</option>
                                            <option value="center">Center</option>
                                            <option value="right">Right</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label>Font: </label>
                                        <select
                                            style={{ fontFamily: layer.font }}
                                            value={layer.font}
                                            onChange={(e) => {
                                                setLayers((prev) =>
                                                    prev.map((l) => (l.id === layer.id ? { ...l, font: e.target.value } : l))
                                                );
                                            }}
                                        >
                                            {["Arial", "Verdana", "Georgia", "Times New Roman", "Courier New", "Trebuchet MS",
                                                "Comic Sans MS", "Impact", "a_BosaNova", "Princess Sofia", "Aerospace"].map(
                                                (font) => (
                                                    <option key={font} value={font} style={{ fontFamily: font }}>
                                                        {font}
                                                    </option>
                                                )
                                            )}
                                        </select>
                                    </div>
                                    <button onClick={() => setIsTextModalVisible(false)}>{t("closeButton")}</button>
                                </>
                            );
                        })()}
                    </div>
                </div>
            )}
        </div>
    );
}

export default BannerCanvas;
