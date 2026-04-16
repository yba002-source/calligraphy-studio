import { useState, useRef, useEffect } from 'react'
import { fabric } from 'fabric'

// Canvas size presets
const CANVAS_SIZES = {
  square: { width: 1080, height: 1080, label: 'Square (1080×1080)' },
  landscape: { width: 1920, height: 1080, label: 'Landscape (1920×1080)' },
  story: { width: 1080, height: 1920, label: 'Story (1080×1920)' },
  xPost: { width: 1200, height: 675, label: 'X Post (1200×675)' },
}

// Available fonts
const FONTS = [
  { name: 'Amiri', label: 'Amiri' },
  { name: 'Noto Naskh Arabic', label: 'Noto Naskh' },
  { name: 'Scheherazade New', label: 'Scheherazade' },
]

// Color palette
const COLORS = [
  '#1a1a1a', '#ffffff', '#C9A227', '#0F6E56', 
  '#185FA5', '#854F0B', '#712B13', '#3C3489'
]

function App() {
  const canvasRef = useRef(null)
  const fabricRef = useRef(null)
  const fileInputRef = useRef(null)
  
  const [text, setText] = useState('بِسْمِ اللَّهِ')
  const [font, setFont] = useState('Amiri')
  const [textColor, setTextColor] = useState('#1a1a1a')
  const [fontSize, setFontSize] = useState(64)
  const [canvasSize, setCanvasSize] = useState('square')
  const [bgColor, setBgColor] = useState('#ffffff')

  // Initialize Fabric.js canvas
  useEffect(() => {
    const size = CANVAS_SIZES[canvasSize]
    const scale = Math.min(500 / size.width, 400 / size.height)
    
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: size.width * scale,
      height: size.height * scale,
      backgroundColor: bgColor,
    })
    
    fabricRef.current = canvas
    canvas.originalWidth = size.width
    canvas.originalHeight = size.height
    canvas.scale = scale

    // Add initial text
    const textObj = new fabric.IText(text, {
      left: (size.width * scale) / 2,
      top: (size.height * scale) / 2,
      fontFamily: font,
      fontSize: fontSize * scale,
      fill: textColor,
      originX: 'center',
      originY: 'center',
      direction: 'rtl',
      textAlign: 'center',
    })
    
    canvas.add(textObj)
    canvas.setActiveObject(textObj)
    canvas.renderAll()

    return () => {
      canvas.dispose()
    }
  }, [canvasSize])

  // Update text properties when they change
  useEffect(() => {
    const canvas = fabricRef.current
    if (!canvas) return
    
    const activeObj = canvas.getActiveObject()
    if (activeObj && activeObj.type === 'i-text') {
      activeObj.set({
        text: text,
        fontFamily: font,
        fontSize: fontSize * canvas.scale,
        fill: textColor,
      })
      canvas.renderAll()
    }
  }, [text, font, fontSize, textColor])

  // Update background color
  useEffect(() => {
    const canvas = fabricRef.current
    if (!canvas) return
    canvas.setBackgroundColor(bgColor, () => canvas.renderAll())
  }, [bgColor])

  // Handle background image upload
  const handleBgUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const canvas = fabricRef.current
      fabric.Image.fromURL(event.target.result, (img) => {
        // Scale image to cover canvas
        const scaleX = canvas.width / img.width
        const scaleY = canvas.height / img.height
        const scale = Math.max(scaleX, scaleY)
        
        img.set({
          scaleX: scale,
          scaleY: scale,
          originX: 'center',
          originY: 'center',
          left: canvas.width / 2,
          top: canvas.height / 2,
        })
        
        canvas.setBackgroundImage(img, () => canvas.renderAll())
      })
    }
    reader.readAsDataURL(file)
  }

  // Export canvas as PNG
  const handleExport = () => {
    const canvas = fabricRef.current
    if (!canvas) return

    const size = CANVAS_SIZES[canvasSize]
    const multiplier = size.width / canvas.width

    const dataURL = canvas.toDataURL({
      format: 'png',
      multiplier: multiplier,
    })

    const link = document.createElement('a')
    link.download = `calligraphy-${Date.now()}.png`
    link.href = dataURL
    link.click()
  }

  // Clear background image
  const clearBackground = () => {
    const canvas = fabricRef.current
    if (!canvas) return
    canvas.setBackgroundImage(null, () => {
      canvas.setBackgroundColor(bgColor, () => canvas.renderAll())
    })
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Calligraphy Studio</h1>
        <button className="export-btn" onClick={handleExport}>
          Export PNG ↓
        </button>
      </header>

      <main className="main">
        {/* Left Panel - Controls */}
        <aside className="panel left-panel">
          {/* Text Input */}
          <section className="control-group">
            <label className="label">Your text</label>
            <textarea
              className="text-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              dir="rtl"
              placeholder="اكتب هنا..."
            />
          </section>

          {/* Font Selection */}
          <section className="control-group">
            <label className="label">Font</label>
            <div className="font-list">
              {FONTS.map((f) => (
                <button
                  key={f.name}
                  className={`font-btn ${font === f.name ? 'active' : ''}`}
                  onClick={() => setFont(f.name)}
                  style={{ fontFamily: f.name }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </section>

          {/* Text Color */}
          <section className="control-group">
            <label className="label">Text color</label>
            <div className="color-grid">
              {COLORS.map((color) => (
                <button
                  key={color}
                  className={`color-btn ${textColor === color ? 'active' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setTextColor(color)}
                />
              ))}
            </div>
          </section>

          {/* Font Size */}
          <section className="control-group">
            <label className="label">Size: {fontSize}px</label>
            <input
              type="range"
              min="24"
              max="200"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="slider"
            />
          </section>
        </aside>

        {/* Center - Canvas */}
        <div className="canvas-container">
          <div className="canvas-toolbar">
            <select
              value={canvasSize}
              onChange={(e) => setCanvasSize(e.target.value)}
              className="size-select"
            >
              {Object.entries(CANVAS_SIZES).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
          </div>
          <div className="canvas-wrapper">
            <canvas ref={canvasRef} />
          </div>
        </div>

        {/* Right Panel - Background & Export */}
        <aside className="panel right-panel">
          {/* Background */}
          <section className="control-group">
            <label className="label">Background</label>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleBgUpload}
              style={{ display: 'none' }}
            />
            <button
              className="upload-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              📷 Import image
            </button>
            <button className="clear-btn" onClick={clearBackground}>
              Clear image
            </button>
            <div className="color-grid" style={{ marginTop: '12px' }}>
              {['#ffffff', '#1a1a1a', '#0F6E56', '#185FA5', '#854F0B', '#FAEEDA'].map((color) => (
                <button
                  key={color}
                  className={`color-btn square ${bgColor === color ? 'active' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    setBgColor(color)
                    clearBackground()
                  }}
                />
              ))}
            </div>
          </section>

          {/* Ad Platform Guides */}
          <section className="control-group">
            <label className="label">Ad platform guides</label>
            <div className="guide-links">
              <a href="https://business.x.com/en/help/campaign-setup" target="_blank" rel="noopener">
                𝕏 X Ads →
              </a>
              <a href="https://www.facebook.com/business/help/1438417719786914" target="_blank" rel="noopener">
                Meta Ads →
              </a>
              <a href="https://support.google.com/youtube/answer/2375497" target="_blank" rel="noopener">
                YouTube Ads →
              </a>
            </div>
          </section>
        </aside>
      </main>
    </div>
  )
}

export default App
