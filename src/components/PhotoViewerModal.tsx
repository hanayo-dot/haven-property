import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, Tag, Calendar } from 'lucide-react';
import { useProperty } from '../context/PropertyContext';

export const PhotoViewerModal: React.FC = () => {
  const { photoViewer, closePhotoViewer } = useProperty();
  const [currentIndex, setCurrentIndex] = useState(photoViewer.initialIndex || 0);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    if (photoViewer.isOpen) {
      setCurrentIndex(photoViewer.initialIndex || 0);
      setIsZoomed(false);
    }
  }, [photoViewer.isOpen, photoViewer.initialIndex]);

  useEffect(() => {
    if (!photoViewer.isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closePhotoViewer();
      } else if (e.key === 'ArrowLeft') {
        setIsZoomed(false);
        setCurrentIndex(prev => (prev === 0 ? photoViewer.photos.length - 1 : prev - 1));
      } else if (e.key === 'ArrowRight') {
        setIsZoomed(false);
        setCurrentIndex(prev => (prev === photoViewer.photos.length - 1 ? 0 : prev + 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [photoViewer.isOpen, photoViewer.photos.length, closePhotoViewer]);

  if (!photoViewer.isOpen || photoViewer.photos.length === 0) {
    return null;
  }

  const activePhoto = photoViewer.photos[currentIndex] || photoViewer.photos[0];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsZoomed(false);
    setCurrentIndex(prev => (prev === 0 ? photoViewer.photos.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsZoomed(false);
    setCurrentIndex(prev => (prev === photoViewer.photos.length - 1 ? 0 : prev + 1));
  };

  return (
    <div 
      id="photo-viewer-backdrop"
      onClick={closePhotoViewer}
      className="fixed inset-0 z-50 bg-[#0F172A]/90 backdrop-blur-md flex flex-col justify-between p-3 sm:p-6 select-none animate-fadeIn"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between text-white z-10">
        <div className="flex items-center space-x-3">
          <div className="bg-white/10 border border-white/20 px-3.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-xs">
            Photo {currentIndex + 1} of {photoViewer.photos.length}
          </div>
          <span className="text-sm font-medium text-slate-200 hidden sm:inline">
            {photoViewer.title}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsZoomed(!isZoomed);
            }}
            title={isZoomed ? "Zoom Out" : "Zoom In"}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            {isZoomed ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
          </button>
          <button
            id="close-photo-viewer-btn"
            onClick={closePhotoViewer}
            className="p-2.5 rounded-full bg-white/10 hover:bg-rose-600 text-white transition hover:scale-105"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div 
        className="relative flex-1 flex items-center justify-center overflow-hidden my-2"
        onClick={(e) => e.stopPropagation()}
      >
        {photoViewer.photos.length > 1 && (
          <button
            id="prev-photo-btn"
            onClick={handlePrev}
            className="absolute left-2 sm:left-4 z-10 p-3 rounded-full bg-[#0F172A]/80 hover:bg-[#1E293B] text-white border border-white/20 shadow-xl transition"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        <div className="max-w-full max-h-full flex items-center justify-center p-2">
          <img
            src={activePhoto.url}
            alt={activePhoto.caption || "Damage inspection photo"}
            className={`rounded-2xl object-contain max-h-[72vh] max-w-full shadow-2xl transition-transform duration-300 ${
              isZoomed ? 'scale-150 cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'
            }`}
            onClick={() => setIsZoomed(!isZoomed)}
          />
        </div>

        {photoViewer.photos.length > 1 && (
          <button
            id="next-photo-btn"
            onClick={handleNext}
            className="absolute right-2 sm:right-4 z-10 p-3 rounded-full bg-[#0F172A]/80 hover:bg-[#1E293B] text-white border border-white/20 shadow-xl transition"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Bottom Info Bar & Thumbnails */}
      <div 
        className="bg-[#0F172A]/95 border border-white/15 rounded-3xl p-5 max-w-2xl mx-auto w-full text-white z-10 shadow-2xl backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            {activePhoto.tag && (
              <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-[#0045A5] text-white">
                <Tag className="w-3 h-3 mr-1" />
                {activePhoto.tag}
              </span>
            )}
            {activePhoto.timestamp && (
              <span className="inline-flex items-center text-xs text-slate-300">
                <Calendar className="w-3 h-3 mr-1 text-sky-400" />
                {new Date(activePhoto.timestamp).toLocaleDateString()} at {new Date(activePhoto.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
          <span className="text-xs text-slate-400">Click photo to zoom</span>
        </div>

        {activePhoto.caption && (
          <p className="text-sm text-slate-100 font-medium mt-1">
            "{activePhoto.caption}"
          </p>
        )}

        {/* Thumbnails Row */}
        {photoViewer.photos.length > 1 && (
          <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-white/10 overflow-x-auto pb-1">
            {photoViewer.photos.map((p, idx) => (
              <button
                key={p.id || idx}
                onClick={() => {
                  setIsZoomed(false);
                  setCurrentIndex(idx);
                }}
                className={`relative rounded-xl overflow-hidden shrink-0 w-14 h-14 border-2 transition ${
                  idx === currentIndex ? 'border-[#38BDF8] ring-2 ring-[#38BDF8]/50 scale-105' : 'border-white/20 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={p.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
