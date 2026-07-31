'use client';

import { Document, Page, pdfjs } from 'react-pdf';
import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import Spinner from './loaders/Spinner';

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

const MIN_ZOOM = 0.75;
const MAX_ZOOM = 1.75;
const ZOOM_STEP = 0.25;

export default function PDFViewer({ pdfUrl }: { pdfUrl: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageWidth, setPageWidth] = useState(800);
  const [zoom, setZoom] = useState(1);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateWidth = () => {
      setPageWidth(Math.max(260, Math.min(container.clientWidth - 32, 900)));
    };

    updateWidth();
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(updateWidth);
      observer.observe(container);
      return () => observer.disconnect();
    }

    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  useEffect(() => {
    setNumPages(0);
    setPageNumber(1);
    setZoom(1);
    setLoadError(false);
  }, [pdfUrl]);

  useEffect(() => {
    scrollAreaRef.current?.scrollTo({ top: 0, left: 0 });
  }, [pageNumber]);

  const goToPreviousPage = () =>
    setPageNumber(current => Math.max(1, current - 1));
  const goToNextPage = () =>
    setPageNumber(current => Math.min(numPages, current + 1));

  if (loadError) {
    return (
      <div className="flex min-h-72 items-center justify-center p-6 text-center text-sm text-gray-600">
        This PDF could not be displayed here. Use “Open full PDF” to view the
        original file.
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full bg-gray-200">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-300 bg-gray-800 px-3 py-2 text-white">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goToPreviousPage}
            disabled={pageNumber <= 1}
            className="rounded p-1.5 transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Previous PDF page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-24 text-center text-xs font-medium sm:text-sm">
            {numPages > 0 ? `Page ${pageNumber} of ${numPages}` : 'Loading…'}
          </span>
          <button
            type="button"
            onClick={goToNextPage}
            disabled={numPages === 0 || pageNumber >= numPages}
            className="rounded p-1.5 transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Next PDF page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() =>
              setZoom(current => Math.max(MIN_ZOOM, current - ZOOM_STEP))
            }
            disabled={zoom <= MIN_ZOOM}
            className="rounded p-1.5 transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Zoom out PDF"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="w-12 text-center text-xs">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() =>
              setZoom(current => Math.min(MAX_ZOOM, current + ZOOM_STEP))
            }
            disabled={zoom >= MAX_ZOOM}
            className="rounded p-1.5 transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Zoom in PDF"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollAreaRef}
        className="max-h-[75vh] min-h-72 overflow-auto p-3 sm:p-4"
      >
        <Document
          file={pdfUrl}
          loading={
            <div className="flex min-h-72 items-center justify-center">
              <Spinner />
            </div>
          }
          onLoadSuccess={({ numPages: loadedPages }) => {
            setNumPages(loadedPages);
            setPageNumber(1);
          }}
          onLoadError={error => {
            console.error('Error loading PDF:', error);
            setLoadError(true);
          }}
        >
          {numPages > 0 && (
            <div className="mx-auto w-max overflow-hidden bg-white shadow-lg">
              <Page
                pageNumber={pageNumber}
                renderTextLayer
                renderAnnotationLayer
                width={Math.round(pageWidth * zoom)}
              />
            </div>
          )}
        </Document>
      </div>
    </div>
  );
}
