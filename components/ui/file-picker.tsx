"use client";

import { ChangeEvent, useRef } from "react";
import { Upload, X, FileIcon, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilePickerProps {
  value: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
  placeholder?: string;
  className?: string;
  id?: string;
}

export function FilePicker({
  value,
  onChange,
  accept = "image/*",
  placeholder = "Click or drag to upload",
  className,
  id
}: FilePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onChange(file);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const isImage = value?.type.startsWith("image/");

  return (
    <div className={cn("file-picker", className)}>
      <input
        ref={inputRef}
        type="file"
        id={id}
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        style={{ display: "none" }}
      />
      
      {!value ? (
        <div className="file-picker-trigger">
          <div className="file-picker-icon">
            <Upload size={20} />
          </div>
          <div className="stack" style={{ gap: "2px" }}>
            <span className="file-picker-label">{placeholder}</span>
            <span className="file-picker-hint">Support for PNG, JPG up to 10MB</span>
          </div>
        </div>
      ) : (
        <div className="file-picker-selected">
          <div 
            style={{ 
              width: 32, 
              height: 32, 
              borderRadius: 6, 
              background: "var(--primary-soft)", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              color: "var(--primary)"
            }}
          >
            {isImage ? <ImageIcon size={18} /> : <FileIcon size={18} />}
          </div>
          <div className="file-picker-filename" title={value.name}>
            {value.name}
          </div>
          <button 
            type="button" 
            className="file-picker-remove" 
            onClick={handleClear}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
