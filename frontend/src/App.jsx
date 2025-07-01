import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './App.css'

function App() {
  const navigate = useNavigate()
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const fileInputRef = useRef(null)

  const handleProcessFiles = () => {
    console.log('Processing uploaded file:', uploadedFiles[0])
    
    const file = uploadedFiles[0]
    if (!file) return
    
    // Определяем тип файла и открываем соответствующий viewer
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      handlePDFView(file)
      return
    }

    if (file.type === 'video/mp4' || file.name.toLowerCase().endsWith('.mp4')) {
      handleMP4View(file)
      return
    }

    if (file.type === 'audio/mpeg' || file.name.toLowerCase().endsWith('.mp3')) {
      handleMP3View(file)
      return
    }
  }



  const handleDragEnter = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      setUploadedFiles([files[0]]) // Заменяем на только первый файл
    }
  }

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      setUploadedFiles([files[0]]) // Заменяем на только первый файл
    }
  }

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const clearAll = () => {
    setUploadedFiles([])
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handlePDFView = (file) => {
    // Создаем URL для файла
    const fileUrl = URL.createObjectURL(file)
    
    // Переходим на страницу просмотра PDF с данными файла
    navigate('/pdf-viewer', {
      state: {
        fileData: {
          name: file.name,
          size: file.size,
          type: file.type,
          url: fileUrl,
          file: file
        }
      }
    })
  }

  const handleMP4View = (file) => {
    const fileUrl = URL.createObjectURL(file)
    
    navigate('/video-viewer', {
      state: {
        fileData: {
          name: file.name,
          size: file.size,
          type: file.type,
          url: fileUrl,
          file: file
        }
      }
    })
  }

  const handleMP3View = (file) => {
    const fileUrl = URL.createObjectURL(file)
    
    navigate('/audio-viewer', {
      state: {
        fileData: {
          name: file.name,
          size: file.size,
          type: file.type,
          url: fileUrl,
          file: file
        }
      }
    })
  }

  const handleQuickAction = (type) => {
    if (uploadedFiles.length === 0) return
    
    const file = uploadedFiles[0]
    
    // Проверяем соответствует ли файл выбранному типу
    switch(type) {
      case 'documents':
        if (file.type.includes('pdf') || 
            file.type.includes('doc') || 
            file.type.includes('text') ||
            file.name.toLowerCase().match(/\.(pdf|doc|docx|txt|rtf)$/)) {
          if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
            handlePDFView(file)
          }
        }
        break
      case 'audio':
        if (file.type.includes('audio') ||
            file.name.toLowerCase().match(/\.(mp3|wav|flac|aac|ogg)$/)) {
          handleMP3View(file)
        }
        break
      case 'videos':
        if (file.type.includes('video') ||
            file.name.toLowerCase().match(/\.(mp4|avi|mkv|mov|wmv|flv)$/)) {
          handleMP4View(file)
        }
        break
    }

    console.log(`${type} file:`, file)
  }

  return (
    <div className="app">
      <div className="container">
        {/* Header */}
        <header className="header">
          <h1 className="logo">Findi</h1>
          <p className="tagline">Discover, Search, Find Everything</p>
          <div className="header-divider"></div>
        </header>

        {/* Main Search Area */}
        <main className="search-section">
          {/* Drag and Drop Zone */}
          <div 
            className={`drop-zone ${isDragOver ? 'drag-over' : ''} ${uploadedFiles.length > 0 ? 'has-files' : ''}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="file-input"
              onChange={handleFileInput}
              accept="*/*"
            />
            
            {uploadedFiles.length === 0 ? (
              <div className="drop-zone-content">
                <div className="upload-icon">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                    <path d="M7 18a1 1 0 01-1-1V8a1 1 0 011-1h10a1 1 0 011 1v9a1 1 0 01-1 1H7z" stroke="currentColor" strokeWidth="2" fill="none"/>
                    <path d="M3 8l4-4h10l4 4" stroke="currentColor" strokeWidth="2" fill="none"/>
                    <path d="M7 12l5-3 5 3" stroke="currentColor" strokeWidth="2" fill="none"/>
                  </svg>
                </div>
                <h3>Drop a file here to analyze</h3>
                <p>or click to browse for a file</p>
                <span className="supported-formats">
                  PDF, MP4, MP3, and more
                </span>
              </div>
            ) : (
              <div className="uploaded-files">
                <div className="files-header">
                  <span className="files-count">File uploaded</span>
                  <button className="clear-all-btn" onClick={(e) => { e.stopPropagation(); clearAll(); }}>
                    Remove
                  </button>
                </div>
                <div className="files-list">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="file-item">
                      <div className="file-info">
                        <span className="file-name">{file.name}</span>
                        <span className="file-size">{formatFileSize(file.size)}</span>
                      </div>
                      <div className="file-actions">
                        <button 
                          className="remove-file-btn"
                          onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Process Files Button */}
          {uploadedFiles.length > 0 && (
            <>
              <div className="section-divider"></div>
              <div className="process-container">
                <button 
                  className="process-button"
                  onClick={handleProcessFiles}
                >
                  <span>Analyze File</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="m9 18 6-6-6-6" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </button>
              </div>
            </>
          )}

          <div className="section-divider dotted"></div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <button className="quick-action-btn" onClick={() => handleQuickAction('documents')}>
              <span>📄</span>
              Documents
            </button>
            <button className="quick-action-btn" onClick={() => handleQuickAction('audio')}>
              <span>🎵</span>
              Audio
            </button>
            <button className="quick-action-btn" onClick={() => handleQuickAction('videos')}>
              <span>🎬</span>
              Videos
            </button>
          </div>
        </main>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-divider"></div>
          <p>@Findi</p>
        </footer>
      </div>
    </div>
  )
}

export default App
