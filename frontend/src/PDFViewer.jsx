import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './PDFViewer.css'

function PDFViewer() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [apiData, setApiData] = useState({})
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [documentId, setDocumentId] = useState(null)
  const [fileData, setFileData] = useState(location.state?.fileData || {
    name: 'sample.pdf',
    size: 1024,
    type: 'application/pdf',
    query: 'hello',
    content: "",
    url: null
  })

  // Загружаем файл при первом рендере
  useEffect(() => {
    console.log('PDFViewer useEffect - location.state:', location.state)
    
  }, [location.state])

  const formatFileSize = (bytes) => {
    return (bytes / 1024).toFixed(2) + ' KB'
  }

  // Обновленная функция поиска с реальными API вызовами
  const handleSearch = async () => {
    const formData = new FormData()
    formData.append('file', location.state.fileData.file, location.state.fileData.name)
    formData.append('query', searchQuery)

    const response = await fetch('http://localhost:8001/api/v1/search/pdf_search', {
      method: 'POST',
      body: formData
    })
    const data = await response.json()

    for (const sentence of data.sentences) {
      if (sentence) {
        addMessage(sentence, Math.random() * 0.05 + 0.92)
      }
    }

  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSearch()
    }
  }

  const handleBackToHome = () => {
    navigate('/')
  }

  // Функция для программного добавления API данных
  const addApiData = (key, value) => {
    if (key && value) {
      setApiData(prev => ({
        ...prev,
        [key]: value
      }))
    }
  }

  // Функция для добавления объекта с данными
  const addApiDataObject = (dataObject) => {
    if (dataObject && typeof dataObject === 'object') {
      setApiData(prev => ({
        ...prev,
        ...dataObject
      }))
    }
  }

  // Функция для удаления данных по ключу
  const removeApiData = (key) => {
    setApiData(prev => {
      const newData = { ...prev }
      delete newData[key]
      return newData
    })
  }

  // Функция для очистки всех API данных
  const clearApiData = () => {
    setApiData({})
  }

  // Функция для добавления тестовых данных (для демонстрации)
  const addTestApiData = () => {
    const testData = {
      "Matches": "14",
      "Pages": "25", 
      "Confidence": "87%",
      "Document Type": "Research Paper",
      "Language": "English"
    }
    addApiDataObject(testData)
  }

  // Функция для добавления сообщения
  const addMessage = (sentence, confidence) => {
    const newMessage = {
      id: Date.now() + Math.random(),
      sentence: sentence,
      confidence: confidence,
      timestamp: new Date().toLocaleTimeString()
    }
    setMessages(prev => [...prev, newMessage])
  }

  // Функция для удаления сообщения
  const removeMessage = (id) => {
    setMessages(prev => prev.filter(msg => msg.id !== id))
  }

  // Функция для очистки всех сообщений
  const clearAllMessages = () => {
    setMessages([])
  }

  // Функция для добавления тестовых сообщений
  const addTestMessage = () => {
    const testSentences = [
      "This document contains important financial information.",
      "The analysis shows positive trends in market data.",
      "Key findings indicate significant improvements.",
      "Statistical evidence supports the conclusions.",
      "The methodology used is scientifically sound."
    ]
    const randomSentence = testSentences[Math.floor(Math.random() * testSentences.length)]
    const randomConfidence = Math.random() * 0.4 + 0.6 // 0.6 to 1.0
    addMessage(randomSentence, randomConfidence)
  }

  return (
    <div className="pdf-viewer-app">
      <div className="pdf-viewer-container">
        {/* Header */}
        <header className="pdf-header">
          <button className="back-button" onClick={handleBackToHome}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="m12 19-7-7 7-7" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Back to Findi
          </button>
          <h1 className="pdf-title">Document Viewer</h1>
          <div className="header-divider"></div>
        </header>

        {/* Main Content */}
        <main className="pdf-main-content">
          {/* Left Sidebar */}
          <aside className="pdf-sidebar">
            {/* File Information */}
            <div className="file-info-container">
              <h3>Document Information</h3>
              <div className="file-details">
                <div className="detail-row">
                  <span className="detail-label">Name:</span>
                  <span className="detail-value">{fileData.name}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Size:</span>
                  <span className="detail-value">{formatFileSize(fileData.size)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Type:</span>
                  <span className="detail-value">PDF Document</span>
                </div>
              </div>
            </div>

            <div className="sidebar-divider"></div>

            {/* API Data Container */}
            <div className="api-data-container">
              <div className="api-data-header">
                <h3>Additional Data</h3>
              </div>

              {/* API Controls Section */}
              <div className="api-data-controls">
                {/* Status Indicator */}
                {isLoading && (
                  <div className="loading-indicator">
                    <div className="loading-spinner"></div>
                    <span>Loading...</span>
                  </div>
                )}
                
              </div>

              {/* Display existing data */}
              <div className="api-data-list">
                {Object.entries(apiData).map(([key, value]) => (
                  <div key={key} className="api-data-item">
                    <div className="api-data-content">
                      <span className="api-key">{key}:</span>
                      <span className="api-value">{value}</span>
                    </div>
                    <button 
                      className="remove-data-btn"
                      onClick={() => removeApiData(key)}
                    >
                      ×
                    </button>
                  </div>
                ))}
                {Object.keys(apiData).length === 0 && (
                  <div className="no-data-message">
                    <p className="no-data-text">No additional data</p>
                    <p className="no-data-hint">Data will appear after search</p>
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* PDF Display Area */}
          <div className="pdf-display-area">
            {fileData.url ? (
              <iframe
                src={fileData.url}
                className="pdf-iframe"
                title="PDF Document"
              />
            ) : (
              <div className="pdf-placeholder">
                <div className="placeholder-content">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" fill="none"/>
                    <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" fill="none"/>
                    <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2"/>
                    <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2"/>
                    <polyline points="10,9 9,9 8,9" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <h3>PDF Preview</h3>
                  <p>File: {fileData.name}</p>
                  <p className="placeholder-note">
                    PDF viewer will be displayed here when file is selected
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Messages Container */}
          <aside className="messages-sidebar">
            <div className="messages-container">
              <div className="messages-header">
                <h3>Analysis Results</h3>
              </div>

              <div className="messages-list">
                {messages.length === 0 ? (
                  <div className="no-messages">
                    <p>No analysis results yet</p>
                    <p className="no-messages-hint">Search the document to see results here</p>
                  </div>
                ) : (
                  messages.map(message => (
                    <div key={message.id} className="message-block">
                      <div className="message-content">
                        <p className="message-sentence">{message.sentence}</p>
                        <div className="message-meta">
                          <div className="confidence-container">
                            <span className="confidence-label">Confidence:</span>
                            <span className={`confidence-value ${getConfidenceClass(message.confidence)}`}>
                              {(message.confidence * 100).toFixed(1)}%
                            </span>
                          </div>
                          <span className="message-timestamp">{message.timestamp}</span>
                        </div>
                      </div>
                      <button 
                        className="remove-message-btn"
                        onClick={() => removeMessage(message.id)}
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </aside>
        </main>

        {/* Search Section at Bottom */}
        <footer className="pdf-search-footer">
          <div className="footer-divider"></div>
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
                placeholder="Search in document..."
                value={searchQuery || location.state?.fileData?.searchQuery || ''}
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
              className={`search-button ${!searchQuery.trim() || isLoading ? 'disabled' : ''} ${isLoading ? 'loading' : ''}`}
              onClick={handleSearch}
              disabled={!searchQuery.trim() || isLoading}
            >
              {isLoading ? (
                <>
                  <div className="button-spinner"></div>
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <span>Search</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="m9 18 6-6-6-6" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </>
              )}
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}

// Helper function to get confidence class
function getConfidenceClass(confidence) {
  if (confidence >= 0.8) return 'high'
  if (confidence >= 0.6) return 'medium'
  return 'low'
}

export default PDFViewer 