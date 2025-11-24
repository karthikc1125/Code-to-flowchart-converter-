import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import mermaid from 'mermaid';
import { FiDownload, FiArrowLeft, FiZoomIn, FiZoomOut, FiMaximize2 } from 'react-icons/fi';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import ThemeSwitch from '../components/ThemeSwitchButton';
import styled from 'styled-components';

const Container = styled.div<{ theme?: { background: string, text: string } }>`
  background-color: ${props => props.theme?.background || '#f5f7fa'};
  color: ${props => props.theme?.text || '#222'};
  min-height: 100vh;
`;

const defaultCode = `graph TD
A[Start] --> B{Is it?}
B -- Yes --> C[OK]
B -- No --> D[End]`;

const MermaidEditor: React.FC = () => {
  const location = useLocation();
  const [code, setCode] = useState(defaultCode);
  const navigate = useNavigate();
  const previewRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Check if we received Mermaid code from CodeEntry page
  useEffect(() => {
    if (location.state?.mermaidCode) {
      setCode(location.state.mermaidCode);
    }
  }, [location.state]);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis'
      }
    });
  }, []);

  // Real-time rendering
  useEffect(() => {
    renderDiagram();
  }, [code]);

  const renderDiagram = async () => {
    if (previewRef.current && code.trim()) {
      try {
        setError(null);
        previewRef.current.innerHTML = '';
        
        // Create a unique ID for each diagram to avoid conflicts
        const uniqueId = `mermaid-${Date.now()}`;
        const diagramDiv = document.createElement('div');
        diagramDiv.className = 'mermaid';
        diagramDiv.id = uniqueId;
        diagramDiv.textContent = code;
        previewRef.current.appendChild(diagramDiv);
        
        // Use mermaid.render instead of init for better control
        const { svg } = await mermaid.render(uniqueId + '-svg', code);
        previewRef.current.innerHTML = svg;
      } catch (err: any) {
        const errorMessage = err?.message || err?.toString() || 'Error rendering diagram';
        setError(errorMessage);
        if (previewRef.current) {
          previewRef.current.innerHTML = `<div style="color: #ef4444; padding: 20px; text-align: center; font-size: 14px;">⚠️ ${errorMessage}</div>`;
        }
      }
    }
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));
  const handleResetZoom = () => setZoom(1);

  const exportDiagram = async (format: 'svg' | 'png' | 'pdf') => {
    if (!previewRef.current) {
      alert('No diagram to export');
      return;
    }
    
    try {
      const svgElement = previewRef.current.querySelector('svg') as SVGSVGElement | null;
      if (!svgElement) {
        alert('No diagram found. Please ensure the diagram is rendered.');
        return;
      }
      
      if (format === 'svg') {
        // Export SVG
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);
        const downloadLink = document.createElement('a');
        downloadLink.href = svgUrl;
        downloadLink.download = 'mermaid-diagram.svg';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(svgUrl);
        console.log('SVG export completed');
      } else if (format === 'png') {
        // Export PNG using html2canvas - wrap SVG in a container
        const wrapper = document.createElement('div');
        wrapper.style.position = 'absolute';
        wrapper.style.left = '-9999px';
        wrapper.style.background = '#ffffff';
        wrapper.appendChild(svgElement.cloneNode(true));
        document.body.appendChild(wrapper);
        
        const canvas = await html2canvas(wrapper, {
          backgroundColor: '#ffffff',
          scale: 3, // Higher quality
          logging: false,
          useCORS: true
        });
        
        document.body.removeChild(wrapper);
        
        canvas.toBlob((blob) => {
          if (!blob) {
            alert('Failed to generate PNG');
            return;
          }
          const url = URL.createObjectURL(blob);
          const downloadLink = document.createElement('a');
          downloadLink.href = url;
          downloadLink.download = 'mermaid-diagram.png';
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          URL.revokeObjectURL(url);
          console.log('PNG export completed');
        }, 'image/png');
      } else if (format === 'pdf') {
        // Export PDF using html2canvas + jsPDF - wrap SVG in a container
        const wrapper = document.createElement('div');
        wrapper.style.position = 'absolute';
        wrapper.style.left = '-9999px';
        wrapper.style.background = '#ffffff';
        wrapper.appendChild(svgElement.cloneNode(true));
        document.body.appendChild(wrapper);
        
        const canvas = await html2canvas(wrapper, {
          backgroundColor: '#ffffff',
          scale: 2,
          logging: false,
          useCORS: true
        });
        
        document.body.removeChild(wrapper);
        
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        
        // Calculate PDF dimensions
        const pdfWidth = imgWidth / 3.78; // Convert px to mm (96 DPI)
        const pdfHeight = imgHeight / 3.78;
        
        const pdf = new jsPDF({
          orientation: imgWidth > imgHeight ? 'landscape' : 'portrait',
          unit: 'mm',
          format: [pdfWidth, pdfHeight]
        });
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('mermaid-diagram.pdf');
        console.log('PDF export completed');
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert(`Export failed: ${error}`);
    }
  };


  return (
    <Container>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: 'inherit',
        overflow: 'hidden'
      }}>
        <ThemeSwitch />
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 24px',
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: 'inherit',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              transition: 'all 0.2s',
              boxShadow: '0 2px 4px rgba(102, 126, 234, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(102, 126, 234, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(102, 126, 234, 0.3)';
            }}
          >
            <FiArrowLeft size={14} />
            Back
          </button>
          <h1 style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: '600',
            color: 'inherit'
          }}>
            Mermaid Diagram Viewer
          </h1>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Zoom Controls */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px',
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            borderRadius: '6px'
          }}>
            <button
              onClick={handleZoomOut}
              style={{
                padding: '6px',
                backgroundColor: '#ef4444',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.15s',
                boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#dc2626';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ef4444';
                e.currentTarget.style.transform = 'scale(1)';
              }}
              title="Zoom Out"
            >
              <FiZoomOut size={16} />
            </button>
            <span style={{
              fontSize: '13px',
              fontWeight: '500',
              color: '#374151',
              minWidth: '45px',
              textAlign: 'center'
            }}>
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              style={{
                padding: '6px',
                backgroundColor: '#3b82f6',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.15s',
                boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#2563eb';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#3b82f6';
                e.currentTarget.style.transform = 'scale(1)';
              }}
              title="Zoom In"
            >
              <FiZoomIn size={16} />
            </button>
            <button
              onClick={handleResetZoom}
              style={{
                padding: '6px',
                backgroundColor: '#f59e0b',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.15s',
                boxShadow: '0 2px 4px rgba(245, 158, 11, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#d97706';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f59e0b';
                e.currentTarget.style.transform = 'scale(1)';
              }}
              title="Reset Zoom"
            >
              <FiMaximize2 size={14} />
            </button>
          </div>

          {/* Export Buttons - SimpleMermaid Style */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => exportDiagram('svg')}
              style={{
                padding: '6px 14px',
                backgroundColor: '#10b981',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500',
                transition: 'all 0.15s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#059669';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#10b981';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <FiDownload size={14} />
              SVG
            </button>
            <button
              onClick={() => exportDiagram('png')}
              style={{
                padding: '6px 14px',
                backgroundColor: '#f59e0b',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500',
                transition: 'all 0.15s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 4px rgba(245, 158, 11, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#d97706';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f59e0b';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <FiDownload size={14} />
              PNG
            </button>
            <button
              onClick={() => exportDiagram('pdf')}
              style={{
                padding: '6px 14px',
                backgroundColor: '#ec4899',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500',
                transition: 'all 0.15s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 4px rgba(236, 72, 153, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#db2777';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ec4899';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <FiDownload size={14} />
              PDF
            </button>
          </div>
        </div>
      </div>
      
      {/* Diagram Viewer - Full Screen with Scrolling */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          overflow: 'auto',
          backgroundColor: 'inherit',
          position: 'relative',
          scrollBehavior: 'smooth'
        }}
      >
        <div
          style={{
            minWidth: 'fit-content',
            minHeight: 'fit-content',
            padding: '32px'
          }}
        >
          <div
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'top left',
              transition: 'transform 0.2s ease',
              display: 'inline-block'
            }}
          >
            <div
              ref={previewRef}
              style={{
                backgroundColor: 'inherit',
                borderRadius: '8px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                display: 'inline-block',
                minWidth: '200px',
                minHeight: '200px'
              }}
            />
          </div>
        </div>
      </div>
    </div>
    </Container>
  );
};

export default MermaidEditor; 