/* eslint-disable no-unused-vars */
import React, { useState } from 'react';

function BrandBook({ onColorSelect, onImageSelect }) {
    const [newColor, setNewColor] = useState('#ffffff');


    const [colors, setColors] = useState(() => {
        return JSON.parse(localStorage.getItem("brandColors")) || [];
    });

    const [images, setImages] = useState(() => {
        return JSON.parse(localStorage.getItem("brandImages")) || [];
    });

 
    const handleAddColor = () => {
        if (newColor && !colors.includes(newColor)) {
            const updatedColors = [...colors, newColor];
            setColors(updatedColors);
            localStorage.setItem("brandColors", JSON.stringify(updatedColors));
        }
    };

    const handleDeleteColor = (colorToRemove) => {
        const updatedColors = colors.filter((color) => color !== colorToRemove);
        setColors(updatedColors);
        localStorage.setItem("brandColors", JSON.stringify(updatedColors));
    };

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const updatedImages = [...images, e.target.result];
                setImages(updatedImages);
                localStorage.setItem("brandImages", JSON.stringify(updatedImages));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDeleteImage = (imageToRemove) => {
        const updatedImages = images.filter((imgUrl) => imgUrl !== imageToRemove);
        setImages(updatedImages);
        localStorage.setItem("brandImages", JSON.stringify(updatedImages));
    };

    return (
        <div className="brandbook p-3 border rounded shadow-sm bg-body-tertiary">
            <h4 className="mb-3">Brand Book</h4>

            {/* Brand Colors */}
            <div className="mb-4">
                <h5>Brand Colors</h5>
                <div className="d-flex flex-wrap mb-2">
                    {colors.map((color, index) => (
                        <div key={index} className="position-relative">
                            <div
                                draggable
                                onDragStart={(e) => {
                                    e.dataTransfer.setData("text/plain", color);
                                }}
                                onClick={() => onColorSelect(color)}
                                title={color}
                                style={{
                                    backgroundColor: color,
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    margin: '5px',
                                    cursor: 'pointer',
                                    border: '2px solid #ddd',
                                    position: "relative"
                                }}
                            ></div>
                            <button
                                className="btn btn-sm btn-danger position-absolute top-0 start-100 translate-middle"
                                style={{ fontSize: "12px", padding: "2px 6px" }}
                                onClick={() => handleDeleteColor(color)}
                            >
                                x
                            </button>
                        </div>
                    ))}
                </div>
                <div className="d-flex align-items-center">
                    <input
                        type="color"
                        value={newColor}
                        onChange={(e) => setNewColor(e.target.value)}
                        className="form-control form-control-color me-2"
                        title="Choose your color"
                    />
                    <button className="btn btn-primary" onClick={handleAddColor}>
                        Add Color
                    </button>
                </div>
            </div>

            {/* Brand Images */}
            <div className="mb-4">
                <h5>Brand Images</h5>
                <div className="d-flex flex-wrap mb-2">
                    {images.map((imgUrl, index) => (
                        <div key={index} className="position-relative">
                            <img
                                src={imgUrl}
                                alt={`Brand ${index}`}
                                draggable
                                onDragStart={(e) => {
                                    e.dataTransfer.setData('text/plain', imgUrl);
                                }}
                                style={{
                                    width: '80px',
                                    height: '80px',
                                    objectFit: 'cover',
                                    borderRadius: '8px',
                                    margin: '5px',
                                    cursor: 'grab',
                                }}
                            />
                            <button
                                className="btn btn-sm btn-danger position-absolute top-0 start-100 translate-middle"
                                style={{ fontSize: "12px", padding: "2px 6px" }}
                                onClick={() => handleDeleteImage(imgUrl)}
                            >
                                x
                            </button>
                        </div>
                    ))}
                </div>
                <div>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="form-control"
                    />
                </div>
            </div>
        </div>
    );
}

export default BrandBook;
