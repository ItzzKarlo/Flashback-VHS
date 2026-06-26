'use client';

import { useRef, useState } from 'react';

function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return '';

  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

export default function UploadDropzone({ file, onFileChange, disabled = false }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  function openPicker() {
    if (disabled) return;
    inputRef.current?.click();
  }

  function selectFile(nextFile) {
    if (disabled || !nextFile) return;
    onFileChange(nextFile);
  }

  function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    const nextFile = event.dataTransfer.files?.[0];
    selectFile(nextFile);
  }

  function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    if (!disabled) setIsDragging(true);
  }

  function handleDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openPicker();
    }
  }

  return (
    <div
      className={`dropzone ${isDragging ? 'is-dragging' : ''} ${disabled ? 'is-disabled' : ''}`}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onClick={openPicker}
      onKeyDown={handleKeyDown}
      onDragEnter={handleDragOver}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      aria-disabled={disabled}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*,.gif,.webp,.mkv,.mov,.mp4,.webm,.jpg,.jpeg,.png"
        disabled={disabled}
        onChange={(event) => selectFile(event.target.files?.[0] || null)}
      />

      <span className="dropzone-icon">📼</span>

      {file ? (
        <>
          <strong>{file.name}</strong>
          <small>{formatBytes(file.size)} · click or drop to replace</small>
        </>
      ) : (
        <>
          <strong>Click to choose or drop your file here</strong>
          <small>MP4, MOV, WEBM, GIF, JPG, PNG, WEBP</small>
        </>
      )}
    </div>
  );
}
