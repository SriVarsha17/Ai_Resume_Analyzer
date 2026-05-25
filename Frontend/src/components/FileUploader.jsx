import React, { useState, useRef } from "react";
import { UploadCloud, File, X, AlertCircle } from "lucide-react";

const FileUploader = ({ onFileSelect, selectedFile, error }) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFile = (file) => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (
      allowedTypes.includes(file.type) ||
      file.name.endsWith(".pdf") ||
      file.name.endsWith(".docx") ||
      file.name.endsWith(".doc")
    ) {
      return true;
    }
    return false;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        onFileSelect(file);
      } else {
        alert("Only PDF and DOCX formats are supported.");
      }
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        onFileSelect(file);
      } else {
        alert("Only PDF and DOCX formats are supported.");
      }
    }
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  const removeFile = (e) => {
    e.stopPropagation();
    onFileSelect(null);
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.docx,.doc"
        onChange={handleChange}
      />

      {!selectedFile ? (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={onButtonClick}
          className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
            dragActive
              ? "border-brand-500 bg-brand-500/5 scale-[0.99]"
              : "border-white/10 hover:border-brand-500/50 hover:bg-white/5"
          }`}
        >
          <div className="p-4 rounded-xl bg-white/5 mb-4 text-brand-400">
            <UploadCloud className="h-8 w-8" />
          </div>
          <p className="text-sm font-semibold mb-1 text-white">Drag & drop your resume here</p>
          <p className="text-xs text-dark-500 mb-4">Supports PDF, DOCX, DOC (Max 5MB)</p>
          <button
            type="button"
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-all"
          >
            Browse Files
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between p-4 rounded-xl border border-brand-500/20 bg-brand-500/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-brand-500/10 text-brand-400">
              <File className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-white truncate max-w-[200px] sm:max-w-xs">
                {selectedFile.name}
              </p>
              <p className="text-xs text-dark-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
            </div>
          </div>
          <button
            onClick={removeFile}
            className="p-1 rounded-lg text-dark-500 hover:text-white hover:bg-white/10 transition-all"
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 mt-2 text-danger-500 text-xs">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
