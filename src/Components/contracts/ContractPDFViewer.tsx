import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon } from '@heroicons/react/24/outline'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import authenticatedPDFService from '../../services/authenticatedPDFService'

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

interface ContractPDFViewerProps {
  isOpen: boolean
  onClose: () => void
  pdfUrl: string
  contractTitle: string
}

const ContractPDFViewer: React.FC<ContractPDFViewerProps> = ({
  isOpen,
  onClose,
  pdfUrl,
  contractTitle
}) => {
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [scale, setScale] = useState<number>(1.0)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [authenticatedUrl, setAuthenticatedUrl] = useState<string | null>(null)  // Load authenticated PDF URL when component opens
  React.useEffect(() => {
    if (isOpen && pdfUrl) {
      console.log('PDF Viewer opened with URL:', pdfUrl)
      console.log('PDF.js worker source:', pdfjs.GlobalWorkerOptions.workerSrc)
      
      setLoading(true)
      setError(null)
      setAuthenticatedUrl(null)
      
      // Get authenticated PDF URL
      const loadAuthenticatedPDF = async () => {
        try {
          // Extract storage path from URL if needed
          const storagePath = authenticatedPDFService.extractStoragePath(pdfUrl)
          console.log('Extracted storage path:', storagePath)
          
          // Get authenticated object URL
          const objectUrl = await authenticatedPDFService.getPDFObjectUrl(storagePath)
          console.log('Authenticated PDF object URL obtained:', objectUrl)
          
          setAuthenticatedUrl(objectUrl)
          setLoading(false)
          
        } catch (error) {
          console.error('Error loading authenticated PDF:', error)
          setError(`Error al cargar el documento PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
          setLoading(false)
        }
      }
      
      loadAuthenticatedPDF()
      
    } else if (isOpen && !pdfUrl) {
      console.error('PDF Viewer opened without URL')
      setLoading(false)
      setError('No se proporcionó URL del documento PDF')
    }
  }, [isOpen, pdfUrl])

  // Clean up object URL when component unmounts or closes
  React.useEffect(() => {
    return () => {
      if (authenticatedUrl && authenticatedUrl.startsWith('blob:')) {
        URL.revokeObjectURL(authenticatedUrl)
      }
    }
  }, [authenticatedUrl])

  React.useEffect(() => {
    if (!isOpen && authenticatedUrl && authenticatedUrl.startsWith('blob:')) {
      URL.revokeObjectURL(authenticatedUrl)
      setAuthenticatedUrl(null)
    }
  }, [isOpen, authenticatedUrl])
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    console.log('PDF loaded successfully, pages:', numPages)
    setNumPages(numPages)
    setLoading(false)
    setError(null)
  }

  const onDocumentLoadError = (error: Error) => {
    console.error('PDF load error:', error)
    setLoading(false)
    setError(`Error al cargar el documento PDF: ${error.message}`)
  }

  const goToPrevPage = () => {
    setPageNumber(prev => Math.max(prev - 1, 1))
  }

  const goToNextPage = () => {
    setPageNumber(prev => Math.min(prev + 1, numPages))
  }

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3.0))
  }

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5))
  }
  const resetZoom = () => {
    setScale(1.0)
  }

  const downloadPDF = async () => {
    try {
      if (!pdfUrl) return
      
      // Get authenticated download URL
      const storagePath = authenticatedPDFService.extractStoragePath(pdfUrl)
      const authenticatedDownloadUrl = await authenticatedPDFService.getAuthenticatedPDFUrl(storagePath)
      
      const link = document.createElement('a')
      link.href = authenticatedDownloadUrl
      link.download = `${contractTitle}.pdf`
      link.click()
    } catch (error) {
      console.error('Error downloading PDF:', error)
      setError(`Error al descargar el documento: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={`fixed inset-0 z-50 ${isFullscreen ? 'bg-black' : 'bg-gray-900 bg-opacity-75'}`}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col h-full"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-white border-b">
              <div className="flex items-center space-x-4">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {contractTitle}
                </h3>
                {!loading && !error && (
                  <span className="text-sm text-gray-500">
                    Página {pageNumber} de {numPages}
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {/* Zoom Controls */}
                <div className="flex items-center space-x-1 border rounded-md">
                  <button
                    onClick={zoomOut}
                    className="p-2 hover:bg-gray-100 transition-colors"
                    title="Alejar"
                  >
                    <span className="text-sm">-</span>
                  </button>
                  <button
                    onClick={resetZoom}
                    className="px-3 py-2 text-sm hover:bg-gray-100 transition-colors"
                    title="Zoom 100%"
                  >
                    {Math.round(scale * 100)}%
                  </button>
                  <button
                    onClick={zoomIn}
                    className="p-2 hover:bg-gray-100 transition-colors"
                    title="Acercar"
                  >
                    <span className="text-sm">+</span>
                  </button>
                </div>

                {/* Page Navigation */}
                {!loading && !error && numPages > 1 && (
                  <div className="flex items-center space-x-1 border rounded-md">
                    <button
                      onClick={goToPrevPage}
                      disabled={pageNumber <= 1}
                      className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Página anterior"
                    >
                      <span className="text-sm">←</span>
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={numPages}
                      value={pageNumber}
                      onChange={(e) => {
                        const page = parseInt(e.target.value)
                        if (page >= 1 && page <= numPages) {
                          setPageNumber(page)
                        }
                      }}
                      className="w-16 px-2 py-1 text-sm text-center border-0 focus:outline-none"
                    />
                    <button
                      onClick={goToNextPage}
                      disabled={pageNumber >= numPages}
                      className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Página siguiente"
                    >
                      <span className="text-sm">→</span>
                    </button>
                  </div>
                )}

                {/* Fullscreen Toggle */}
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                  title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
                >
                  {isFullscreen ? (
                    <ArrowsPointingInIcon className="h-5 w-5" />
                  ) : (
                    <ArrowsPointingOutIcon className="h-5 w-5" />
                  )}
                </button>                {/* Download Button */}
                <button
                  onClick={downloadPDF}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                  title="Descargar PDF"
                >
                  Descargar
                </button>

                {/* Open in new tab with authenticated URL */}
                <button
                  onClick={async () => {
                    try {
                      if (authenticatedUrl) {
                        window.open(authenticatedUrl, '_blank')
                      } else {
                        setError('Esperando a que se cargue el documento...')
                      }
                    } catch (error) {
                      console.error('Error opening PDF in new tab:', error)
                      setError('Error al abrir documento en nueva pestaña')
                    }
                  }}
                  className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                  title="Abrir en nueva pestaña"
                  disabled={!authenticatedUrl}
                >
                  Nueva pestaña
                </button>

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                  title="Cerrar"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* PDF Content */}
            <div className="flex-1 overflow-auto bg-gray-100 flex items-center justify-center">
              {loading && (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Cargando documento...</span>
                </div>
              )}              {!pdfUrl && (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <div className="text-gray-400 text-4xl mb-4">📄</div>
                  <p className="text-gray-600">No se encontró el documento PDF</p>
                </div>
              )}

              {error && (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <div className="text-red-500 text-4xl mb-4">⚠️</div>
                  <p className="text-gray-600 mb-4">{error}</p>
                  <button
                    onClick={() => {
                      setError(null)
                      // Retry loading the PDF
                      if (pdfUrl) {
                        setLoading(true)
                        const loadAuthenticatedPDF = async () => {
                          try {
                            const storagePath = authenticatedPDFService.extractStoragePath(pdfUrl)
                            const objectUrl = await authenticatedPDFService.getPDFObjectUrl(storagePath)
                            setAuthenticatedUrl(objectUrl)
                            setLoading(false)
                          } catch (error) {
                            console.error('Error loading authenticated PDF:', error)
                            setError(`Error al cargar el documento PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
                            setLoading(false)
                          }
                        }
                        loadAuthenticatedPDF()
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Reintentar
                  </button>
                </div>
              )}

              {!loading && !error && authenticatedUrl && (
                <div className="p-4">
                  <Document
                    file={authenticatedUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    options={{
                      cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
                      cMapPacked: true,
                    }}
                    loading={
                      <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <span className="ml-3 text-gray-600">Cargando documento...</span>
                      </div>
                    }
                  >
                    <Page
                      pageNumber={pageNumber}
                      scale={scale}
                      loading={
                        <div className="flex items-center justify-center h-64">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                      }
                      className="shadow-lg"
                    />
                  </Document>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default ContractPDFViewer
