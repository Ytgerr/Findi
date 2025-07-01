import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './PDFViewer.css' // Базовые стили
import './VideoViewer.css' // Дополнительные стили для медиа

function AudioViewer() {
  const location = useLocation()
  const navigate = useNavigate()
  const audioRef = useRef(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [apiData, setApiData] = useState({})
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [fileData, setFileData] = useState(location.state?.fileData || {
    name: 'sample.mp3',
    size: 1024,
    type: 'audio/mp3',
    query: 'hello',
    content: "",
    url: null
  })

  // Загружаем файл при первом рендере
  useEffect(() => {
    console.log('AudioViewer useEffect - location.state:', location.state)
  }, [location.state])

  const formatFileSize = (bytes) => {
    return (bytes / 1024).toFixed(2) + ' KB'
  }

  const formatTime = (seconds) => {
    if (seconds === null || seconds === undefined) return 'N/A'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Функция для перехода к определенному времени в аудио
  const seekToTime = (startTime) => {
    if (audioRef.current && startTime !== null && startTime !== undefined) {
      audioRef.current.currentTime = startTime
      audioRef.current.play()
    }
  }

  // Обновленная функция поиска с реальными API вызовами
  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    setIsLoading(true)
    clearAllMessages()
    
    try {
      const formData = new FormData()
      formData.append('file', location.state.fileData.file, location.state.fileData.name)
      formData.append('query', searchQuery)

      const response = await fetch('http://localhost:8001/api/v1/search/mp3_search', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status} - ${response.statusText}`)
      }
      
      const data = await response.json()

      // Добавляем сообщения с временными интервалами
      if (data.sentences && data.time_intervals) {
        for (let i = 0; i < data.sentences.length; i++) {
          const sentence = data.sentences[i]
          const timeInterval = data.time_intervals[i]
          if (sentence && timeInterval) {
            addMessage(sentence, Math.random() * 0.05 + 0.92, timeInterval[0], timeInterval[1])
          }
        }
      }
    } catch (error) {
      console.error('Search error:', error)
      addApiData("Error", error.message)
    } finally {
      setIsLoading(false)
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

  // Функция для добавления сообщения с временными интервалами
  const addMessage = (sentence, confidence, startTime = null, endTime = null) => {
    const newMessage = {
      id: Date.now() + Math.random(),
      sentence: sentence,
      confidence: confidence,
      startTime: startTime,
      endTime: endTime,
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
          <h1 className="pdf-title">Audio Viewer</h1>
          <div className="header-divider"></div>
        </header>

        {/* Main Content */}
        <main className="pdf-main-content">
          {/* Left Sidebar */}
          <aside className="pdf-sidebar">
            {/* File Information */}
            <div className="file-info-container">
              <h3>Audio Information</h3>
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
                  <span className="detail-value">Audio File</span>
                </div>
              </div>
            </div>

            <div className="sidebar-divider"></div>

            {/* Audio Player Section */}
            {fileData.url && (
              <div className="sidebar-audio-player">
                <h3>Audio Player</h3>
                <audio
                  ref={audioRef}
                  src={fileData.url}
                  className="sidebar-audio-control"
                  controls
                />
              </div>
            )}

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
                    <span>Analyzing audio...</span>
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
                    <p className="no-data-hint">Data will appear after analysis</p>
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Audio Visualization Area */}
          <div className="pdf-display-area">
            <div className="audio-visualization-container">
              <div className="audio-waveform-placeholder">
                <div className="waveform-bars">
                  {Array.from({ length: 32 }, (_, i) => (
                    <div 
                      key={i} 
                      className="waveform-bar" 
                      style={{ 
                        height: `${Math.random() * 60 + 20}%`,
                        animationDelay: `${i * 0.1}s`
                      }}
                    />
                  ))}
                </div>
                <div className="audio-visualization-info">
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" fill="currentColor"/>
                  </svg>
                  <h3>Audio Visualization</h3>
                  <p className="audio-filename">{fileData.name}</p>
                  <p className="audio-visualization-hint">
                    {fileData.url ? 'Use the player in the sidebar to control playback' : 'Load an audio file to see visualization'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Messages Container */}
          <aside className="messages-sidebar">
            <div className="messages-container">
              <div className="messages-header">
                <h3>Analysis Results</h3>
                <p className="messages-hint">Click on a timestamp to jump to that moment</p>
              </div>

              <div className="messages-list">
                {messages.length === 0 ? (
                  <div className="no-messages">
                    <p>No analysis results yet</p>
                    <p className="no-messages-hint">Search the audio to see results here</p>
                  </div>
                ) : (
                  messages.map(message => (
                    <div key={message.id} className="message-block">
                      <div className="message-content">
                        <p className="message-sentence">{message.sentence}</p>
                        <div className="message-meta">
                          <div className="time-interval-container">
                            <span className="time-label">Time:</span>
                            <button 
                              className="time-interval clickable-time"
                              onClick={() => seekToTime(message.startTime)}
                              disabled={!fileData.url}
                              title="Click to jump to this moment"
                            >
                              {formatTime(message.startTime)} - {formatTime(message.endTime)}
                            </button>
                          </div>
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
                placeholder="Search in audio transcript..."
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
              className={`search-button ${!searchQuery.trim() || isLoading ? 'disabled' : ''} ${isLoading ? 'loading' : ''}`}
              onClick={handleSearch}
              disabled={!searchQuery.trim() || isLoading}
            >
              {isLoading ? (
                <>
                  <div className="button-spinner"></div>
                  <span>Analyzing...</span>
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

export default AudioViewer 