import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './App.css'

function App() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const fileInputRef = useRef(null)

  const handleSearch = () => {
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery)
      console.log('Uploaded files:', uploadedFiles)
      
      // Если есть PDF файлы, переходим к первому найденному PDF
      const pdfFile = uploadedFiles.find(file => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'))
      if (pdfFile) {
        handlePDFView(pdfFile)
      }
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
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
      setUploadedFiles(prev => [...prev, ...files])
    }
  }

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      setUploadedFiles(prev => [...prev, ...files])
    }
  }

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const clearAll = () => {
    setUploadedFiles([])
    setSearchQuery('')
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
          url: fileUrl
        }
      }
    })
  }

  const handleQuickAction = (type) => {
    // Фильтруем файлы по типу
    let filteredFiles = []
    
    switch(type) {
      case 'documents':
        filteredFiles = uploadedFiles.filter(file => 
          file.type.includes('pdf') || 
          file.type.includes('doc') || 
          file.type.includes('text') ||
          file.name.toLowerCase().match(/\.(pdf|doc|docx|txt|rtf)$/)
        )
        break
      case 'images':
        filteredFiles = uploadedFiles.filter(file => 
          file.type.includes('image') ||
          file.name.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|svg|webp)$/)
        )
        break
      case 'audio':
        filteredFiles = uploadedFiles.filter(file => 
          file.type.includes('audio') ||
          file.name.toLowerCase().match(/\.(mp3|wav|flac|aac|ogg)$/)
        )
        break
      case 'videos':
        filteredFiles = uploadedFiles.filter(file => 
          file.type.includes('video') ||
          file.name.toLowerCase().match(/\.(mp4|avi|mkv|mov|wmv|flv)$/)
        )
        break
    }

    // Если нашли PDF документ, открываем его
    if (type === 'documents') {
      const pdfFile = filteredFiles.find(file => 
        file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
      )
      if (pdfFile) {
        handlePDFView(pdfFile)
      }
    }

    console.log(`${type} files:`, filteredFiles)
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
              multiple
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
                <h3>Drop files here to search</h3>
                <p>or click to browse files</p>
                <span className="supported-formats">
                  Documents, Images, Videos, and more
                </span>
              </div>
            ) : (
              <div className="uploaded-files">
                <div className="files-header">
                  <span className="files-count">{uploadedFiles.length} file(s) uploaded</span>
                  <button className="clear-all-btn" onClick={(e) => { e.stopPropagation(); clearAll(); }}>
                    Clear All
                  </button>
                </div>
                <div className="files-list">
                  {uploadedFiles.slice(0, 3).map((file, index) => (
                    <div key={index} className="file-item">
                      <div className="file-info">
                        <span className="file-name">{file.name}</span>
                        <span className="file-size">{formatFileSize(file.size)}</span>
                      </div>
                      <div className="file-actions">
                        {(file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) && (
                          <button 
                            className="view-pdf-btn"
                            onClick={(e) => { e.stopPropagation(); handlePDFView(file); }}
                            title="View PDF"
                          >
                            👁️
                          </button>
                        )}
                        <button 
                          className="remove-file-btn"
                          onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                  {uploadedFiles.length > 3 && (
                    <div className="more-files">
                      +{uploadedFiles.length - 3} more files
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="section-divider"></div>

          {/* Search Input & Button */}
          <div className="search-container">
            <div className={`search-input-wrapper ${isSearchFocused ? 'focused' : ''}`}>
              <div className="search-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                  <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <input
                type="text"
                className="search-input"
                placeholder="What are you looking for?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
              {searchQuery && (
                <button 
                  className="clear-input-btn"
                  onClick={() => setSearchQuery('')}
                >
                  ×
                </button>
              )}
            </div>
            <button 
              className={`search-button ${!searchQuery.trim() ? 'disabled' : ''}`}
              onClick={handleSearch}
              disabled={!searchQuery.trim()}
            >
              <span>Search</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="m9 18 6-6-6-6" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </button>
          </div>

          <div className="section-divider dotted"></div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <button className="quick-action-btn" onClick={() => handleQuickAction('documents')}>
              <span>📄</span>
              Documents
            </button>
            <button className="quick-action-btn" onClick={() => handleQuickAction('images')}>
              <span>🖼️</span>
              Images
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
