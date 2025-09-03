import React, { useState } from "react";
import "./LayersStyle.css"; 
import "bootstrap/dist/css/bootstrap.min.css";

const templatesData = [
    { id: 1, name: "Template 1" },
    { id: 2, name: "Template 2" },
    { id: 3, name: "Template 3" },
];

const TemplateLibrary = ({ onTemplateApply }) => {
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [customizations, setCustomizations] = useState({
        brandName: "",
        cost: "",
        details: "",
        mainImage: null,
        pngImage: null,
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCustomizations((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (files && files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setCustomizations((prev) => ({
                    ...prev,
                    [name]: event.target.result,
                }));
            };
            reader.readAsDataURL(files[0]);
        }
    };

    const handleApplyTemplate = () => {
        if (onTemplateApply) {
            onTemplateApply({
                templateId: selectedTemplate.id,
                customizations,
            });
        }
        setSelectedTemplate(null);
        setCustomizations({
            brandName: "",
            cost: "",
            details: "",
            mainImage: null,
            pngImage: null,
        });
    };

    return (
        <div className="container shadow-sm p-3 bg-body-tertiary rounded text-dark mt-3">
            <h3 className="mb-3">Template Library</h3>
            {!selectedTemplate ? (
                <div className="row">
                    {templatesData.map((template) => (
                        <div className="col-md-4" key={template.id}>
                            <button
                                className="btn btn-outline-primary w-100"
                                onClick={() => setSelectedTemplate(template)}
                            >
                                {template.name}
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="p-3 bg-light rounded">
                    <h4>Customize {selectedTemplate.name}</h4>
                    <div className="mb-3">
                        <label className="form-label">Brand Name:</label>
                        <input
                            type="text"
                            className="form-control"
                            name="brandName"
                            value={customizations.brandName}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Cost:</label>
                        <input
                            type="text"
                            className="form-control"
                            name="cost"
                            value={customizations.cost}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Details:</label>
                        <textarea
                            className="form-control"
                            name="details"
                            value={customizations.details}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Main Image:</label>
                        <input
                            type="file"
                            className="form-control"
                            name="mainImage"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                        {customizations.mainImage && (
                            <img
                                src={customizations.mainImage}
                                alt="Main Preview"
                                className="img-thumbnail mt-2"
                                style={{ width: "100px" }}
                            />
                        )}
                    </div>
                    <div className="mb-3">
                        <label className="form-label">PNG Image (For Template 1):</label>
                        <input
                            type="file"
                            className="form-control"
                            name="pngImage"
                            accept="image/png, image/*"
                            onChange={handleFileChange}
                        />
                        {customizations.pngImage && (
                            <img
                                src={customizations.pngImage}
                                alt="PNG Preview"
                                className="img-thumbnail mt-2"
                                style={{ width: "100px" }}
                            />
                        )}
                    </div>
                    <button className="btn btn-success me-2" onClick={handleApplyTemplate}>
                        Apply Template
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={() => setSelectedTemplate(null)}
                    >
                        Back to Templates
                    </button>
                </div>
            )}
        </div>
    );
};

export default TemplateLibrary;
