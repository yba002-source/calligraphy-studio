import { useState, useRef, useEffect } from 'react'
import { fabric } from 'fabric'

// Canvas size presets
const CANVAS_SIZES = {
  square: { width: 1080, height: 1080, label: 'Square (1080×1080)' },
  landscape: { width: 1920, height: 1080, label: 'Landscape (1920×1080)' },
  story: { width: 1080, height: 1920, label: 'Story (1080×1920)' },
  xPost: { width: 1200, height: 675, label: 'X Post (1200×675)' },
}

// Available fonts (8 Arabic calligraphy fonts)
const FONTS = [
  { name: 'Amiri', label: 'Amiri' },
  { name: 'Noto Naskh Arabic', label: 'Noto Naskh' },
  { name: 'Scheherazade New', label: 'Scheherazade' },
  { name: 'Aref Ruqaa', label: 'Aref Ruqaa' },
  { name: 'Lateef', label: 'Lateef' },
  { name: 'Reem Kufi', label: 'Reem Kufi' },
  { name: 'Marhey', label: 'Marhey' },
  { name: 'Tajawal', label: 'Tajawal' },
]

// Color palette for text
const TEXT_COLORS = [
  '#1a1a1a', '#ffffff', '#C9A227', '#0F6E56', 
  '#185FA5', '#854F0B', '#712B13', '#3C3489'
]

// Background colors (transparent first)
const BG_COLORS = [
  'transparent', '#ffffff', '#1a1a1a', '#0F6E56', 
  '#185FA5', '#854F0B', '#FAEEDA'
]

function App() {
  const canvasRef = useRef(null)
  const fabricRef = useRef(null)
  const fileInputRef = useRef(null)
  const bgImageRef = useRef(null)
  
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
      backgroundColor: bgColor === 'transparent' ? null : bgColor,
      preserveObjectStacking: true,
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

    // Enable touch gestures for mobile
    canvas.on('touch:gesture', function(e) {
      if (e.e.touches && e.e.touches.length === 2) {
        const point = new fabric.Point(e.self.x, e.self.y)
        if (e.self.state === 'start') {
          canvas.zoomStartScale = canvas.getZoom()
        }
        let zoom = canvas.zoomStartScale * e.self.scale
        canvas.zoomToPoint(point, zoom)
      }
    })

    return () => {
      canvas.dispose()
    }
  }, [canvasSize])

  // Update text properties when they change
  useEffect(() => {
    const canvas = fabricRef.current
    if (!canvas) return
    
    const objects = canvas.getObjects()
    const textObj = objects.find(obj => obj.type === 'i-text')
    if (textObj) {
      textObj.set({
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
    
    if (bgColor === 'transparent') {
      canvas.setBackgroundColor(null, () => canvas.renderAll())
    } else {
      canvas.setBackgroundColor(bgColor, () => canvas.renderAll())
    }
  }, [bgColor])

  // Handle background image upload
  const handleBgUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const canvas = fabricRef.current
      
      // Remove existing background image if any
      if (bgImageRef.current) {
        canvas.remove(bgImageRef.current)
      }
      
      fabric.Image.fromURL(event.target.result, (img) => {
        // Scale image to cover canvas initially
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
          // Make it selectable and resizable
          selectable: true,
          hasControls: true,
          hasBorders: true,
          lockUniScaling: false,
        })
        
        // Store reference
        bgImageRef.current = img
        
        // Add to canvas at the back
        canvas.add(img)
        canvas.sendToBack(img)
        canvas.renderAll()
      })
    }
    reader.readAsDataURL(file)
    
    // Reset file input so same file can be re-selected
    e.target.value = ''
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
  const clearBgImage = () => {
    const canvas = fabricRef.current
    if (!canvas) return
    
    if (bgImageRef.current) {
      canvas.remove(bgImageRef.current)
      bgImageRef.current = null
      canvas.renderAll()
    }
  }

  // Bring text to front (in case it goes behind image)
  const bringTextToFront = () => {
    const canvas = fabricRef.current
    if (!canvas) return
    
    const objects = canvas.getObjects()
    const textObj = objects.find(obj => obj.type === 'i-text')
    if (textObj) {
      canvas.bringToFront(textObj)
      canvas.renderAll()
    }
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
              {TEXT_COLORS.map((color) => (
                <button
                  key={color}
                  className={`color-btn ${textColor === color ? 'active' : ''} ${color === '#ffffff' ? 'white-btn' : ''}`}
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
            <button className="toolbar-btn" onClick={bringTextToFront}>
              Text to front
            </button>
          </div>
          <div className="canvas-wrapper">
            <canvas ref={canvasRef} />
          </div>
        </div>

        {/* Right Panel - Background */}
        <aside className="panel right-panel">
          {/* Background Image */}
          <section className="control-group">
            <label className="label">Background image</label>
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
            <button className="clear-btn" onClick={clearBgImage}>
              Clear image
            </button>
            <p className="hint">Tap image to select, then pinch to resize</p>
          </section>

          {/* Background Color */}
          <section className="control-group">
            <label className="label">Background color</label>
            <div className="color-grid">
              {BG_COLORS.map((color) => (
                <button
                  key={color}
                  className={`color-btn square ${bgColor === color ? 'active' : ''} ${color === 'transparent' ? 'transparent-btn' : ''} ${color === '#ffffff' ? 'white-btn' : ''}`}
                  style={{ backgroundColor: color === 'transparent' ? 'transparent' : color }}
                  onClick={() => setBgColor(color)}
                  title={color === 'transparent' ? 'Transparent' : color}
                >
                  {color === 'transparent' && <span className="transparent-icon">◇</span>}
                </button>
              ))}
            </div>
          </section>
        </aside>
      </main>
    </div>
  )
}

export default App