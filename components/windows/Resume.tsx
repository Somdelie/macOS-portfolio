"use client";
import { useEffect, useRef, useState } from "react";
import WindowWrapper from "@/hoc/WindowWrapper";
import WindowControlls from "../common/WindowControlls";
import { Download } from "lucide-react";

const Resume = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPdf = async () => {
      try {
        // Dynamically import PDF.js
        const pdfjsLib = await import("pdfjs-dist");
        
        // Set worker - using unpkg to match the installed version
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

        // Load PDF
        const loadingTask = pdfjsLib.getDocument("/files/resume.pdf");
        const pdf = await loadingTask.promise;
        
        // Get first page
        const page = await pdf.getPage(1);
        
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const context = canvas.getContext("2d");
        if (!context) return;

        // Calculate scale to fit container
        const viewport = page.getViewport({ scale: 1.5 });
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render PDF page
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
          canvas: canvas,
        };
        
        await page.render(renderContext).promise;
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load PDF");
        setLoading(false);
      }
    };

    loadPdf();
  }, []);

  return (
    <>
      <div id="window-header">
        <WindowControlls target="resume" />
        <h2>Resume.pdf</h2>
        <a
          href="/files/resume.pdf"
          download
          className="cursor-pointer"
          title="Download Resume"
        >
          <Download size={20} className="icon" />
        </a>
      </div>
      <div className="overflow-auto p-4 bg-gray-100">
        {loading && <div className="text-center p-8">Loading PDF...</div>}
        {error && <div className="text-center p-8 text-red-600">Error: {error}</div>}
        <canvas ref={canvasRef} className="mx-auto shadow-lg" />
      </div>
    </>
  );
};

const ResumeWindow = WindowWrapper(Resume, "resume");

export default ResumeWindow;