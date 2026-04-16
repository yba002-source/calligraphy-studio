import { useState, useRef, useEffect } from 'react'
import { fabric } from 'fabric'

const CANVAS_SIZES = {
  square: { width: 1080, height: 1080, label: 'Square (1080×1080)' },
  landscape: { width: 1920, height: 1080, label: 'Landscape (1920×1080)' },
  story: { width: 1080, height: 1920, label: 'Story (1080×1920)' },
  xPost: { width: 1200, height: 675, label: 'X Post (1200×675)' },
}

const FONTS = [
  // Original fonts
  { name: 'Amiri', label: 'Amiri' },
  { name: 'Noto Naskh Arabic', label: 'Noto Naskh' },
  { name: 'Scheherazade New', label: 'Scheherazade' },
  { name: 'Aref Ruqaa', label: 'Aref Ruqaa' },
  { name: 'Lateef', label: 'Lateef' },
  { name: 'Reem Kufi', label: 'Reem Kufi' },
  { name: 'Marhey', label: 'Marhey' },
  { name: 'Tajawal', label: 'Tajawal' },
  // New fonts
  { name: 'Cairo', label: 'Cairo' },
  { name: 'El Messiri', label: 'El Messiri' },
  { name: 'Mirza', label: 'Mirza' },
  { name: 'Rakkas', label: 'Rakkas' },
  { name: 'Lalezar', label: 'Lalezar' },
  { name: 'Katibeh', label: 'Katibeh' },
  { name: 'Harmattan', label: 'Harmattan' },
  { name: 'Noto Kufi Arabic', label: 'Noto Kufi' },
  { name: 'Almarai', label: 'Almarai' },
  { name: 'Changa', label: 'Changa' },
  // Harakat-optimized
  { name: 'Markazi Text', label: 'Markazi' },
]

const FRAMES = [
  { id: 'none', label: 'No frame' },
  { id: 'frame-01', label: 'Frame 1' },
  { id: 'frame-02', label: 'Frame 2' },
  { id: 'frame-03', label: 'Frame 3' },
  { id: 'frame-04', label: 'Frame 4' },
  { id: 'frame-05', label: 'Frame 5' },
  { id: 'frame-06', label: 'Frame 6' },
  { id: 'frame-07', label: 'Frame 7' },
  { id: 'frame-08', label: 'Frame 8' },
  { id: 'frame-09', label: 'Frame 9' },
  { id: 'frame-10', label: 'Frame 10' },
]

const SIZE_TO_SUFFIX = {
  square: 'square',
  landscape: 'landscape',
  story: 'story',
  xPost: 'xpost',
}

const TEXT_COLORS = ['#1a1a1a', '#ffffff', '#C9A227', '#0F6E56', '#185FA5', '#854F0B', '#712B13', '#3C3489']
const BG_COLORS = ['transparent', '#ffffff', '#1a1a1a', '#0F6E56', '#185FA5', '#854F0B', '#FAEEDA']

function App() {
  const canvasRef = useRef(null)
  const fabricRef = useRef(null)
  const fileInputRef = useRef(null)
  const bgImageRef = useRef(null)
  const frameRef = useRef(null)
  const lastTapRef = useRef(0)
  const lastTapTargetRef = useRef(null)
  
  const [text, setText] = useState('بِسْمِ اللَّهِ')
  const [font, setFont] = useState('Amiri')
  const [textColor, setTextColor] = useState('#1a1a1a')
  const [fontSize, setFontSize] = useState(64)
  const [canvasSize, setCanvasSize] = useState('square')
  const [bgColor, setBgColor] = useState('#ffffff')
  const [selectedFrame, setSelectedFrame] = useState('none')

  const getFramePath = (frameId, sizeKey) => {
    if (frameId === 'none') return null
    const suffix = SIZE_TO_SUFFIX[sizeKey]
    return `/frames/${frameId}-${suffix}.png`
  }

  const centerObjectOnCanvas = (canvas, obj) => {
    if (!canvas || !obj) return
    const objWidth = obj.getScaledWidth()
    const objHeight = obj.getScaledHeight()
    obj.set({
      originX: 'left',
      originY: 'top',
      left: (canvas.width - objWidth) / 2,
      top: (canvas.height - objHeight) / 2,
    })
    obj.setCoords()
  }

  const fitImageToCanvas = (canvas, img) => {
    if (!canvas || !img) return
    const scaleX = canvas.width / img.width
    const scaleY = canvas.height / img.height
    const scale = Math.max(scaleX, scaleY)
    img.set({
      scaleX: scale,
      scaleY: scale,
      originX: 'left',
      originY: 'top',
      left: (canvas.width - img.width * scale) / 2,
      top: (canvas.height - img.height * scale) / 2,
    })
    img.setCoords()
    canvas.sendToBack(img)
    canvas.renderAll()
  }

  const loadFrame = (canvas, framePath) => {
    if (frameRef.current) {
      canvas.remove(frameRef.current)
      frameRef.current = null
    }
    
    if (!framePath) {
      canvas.renderAll()
      return
    }
    
    fabric.Image.fromURL(framePath, (img) => {
      if (!img || !img.width) {
        console.warn('Failed to load frame:', framePath)
        return
      }
      
      // Scale frame to exactly fill the canvas
      img.set({
        scaleX: canvas.width / img.width,
        scaleY: canvas.height / img.height,
        left: 0,
        top: 0,
        selectable: false,
        evented: false,
      })
      
      frameRef.current = img
      canvas.add(img)
      canvas.bringToFront(img)
      canvas.renderAll()
    }, { crossOrigin: 'anonymous' })
  }

  // Main canvas setup - runs when canvasSize OR selectedFrame changes
  useEffect(() => {
    const size = CANVAS_SIZES[canvasSize]
    const scale = Math.min(500 / size.width, 400 / size.height)
    
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: size.width * scale,
      height: size.height * scale,
      backgroundColor: bgColor === 'transparent' ? null : bgColor,
      preserveObjectStacking: true,
      allowTouchScrolling: false,
    })
    
    fabricRef.current = canvas
    canvas.scale = scale

    const textObj = new fabric.IText(text, {
      fontFamily: font,
      fontSize: fontSize * scale,
      fill: textColor,
      textAlign: 'center',
    })
    
    canvas.add(textObj)
    centerObjectOnCanvas(canvas, textObj)
    canvas.setActiveObject(textObj)
    canvas.renderAll()

    // Load correct frame variant for this canvas size
    const framePath = getFramePath(selectedFrame, canvasSize)
    if (framePath) {
      loadFrame(canvas, framePath)
    }

    canvas.on('mouse:dblclick', function(e) {
      if (e.target && e.target.type === 'image' && e.target === bgImageRef.current) {
        fitImageToCanvas(canvas, e.target)
      }
    })

    canvas.on('mouse:down', function(e) {
      const now = Date.now()
      if (now - lastTapRef.current < 300 && e.target === lastTapTargetRef.current) {
        if (e.target && e.target.type === 'image' && e.target === bgImageRef.current) {
          fitImageToCanvas(canvas, e.target)
        }
      }
      lastTapRef.current = now
      lastTapTargetRef.current = e.target
    })

    let initialDistance = 0
    let initialScale = 1
    let activeObj = null

    const getDistance = (touches) => {
      return Math.hypot(
        touches[0].clientX - touches[1].clientX,
        touches[0].clientY - touches[1].clientY
      )
    }

    const onTouchStart = (e) => {
      if (e.touches.length === 2) {
        e.preventDefault()
        activeObj = canvas.getActiveObject()
        if (activeObj) {
          initialDistance = getDistance(e.touches)
          initialScale = activeObj.scaleX || 1
        }
      }
    }

    const onTouchMove = (e) => {
      if (e.touches.length === 2 && activeObj && initialDistance > 0) {
        e.preventDefault()
        const currentDistance = getDistance(e.touches)
        const newScale = initialScale * (currentDistance / initialDistance)
        activeObj.set({ scaleX: newScale, scaleY: newScale })
        activeObj.setCoords()
        canvas.renderAll()
      }
    }

    const onTouchEnd = (e) => {
      if (e.touches.length < 2) {
        initialDistance = 0
        activeObj = null
      }
    }

    const el = canvas.upperCanvasEl
    if (el) {
      el.addEventListener('touchstart', onTouchStart, { passive: false })
      el.addEventListener('touchmove', onTouchMove, { passive: false })
      el.addEventListener('touchend', onTouchEnd)
    }

    return () => {
      if (el) {
        el.removeEventListener('touchstart', onTouchStart)
        el.removeEventListener('touchmove', onTouchMove)
        el.removeEventListener('touchend', onTouchEnd)
      }
      canvas.dispose()
    }
  }, [canvasSize, selectedFrame])

  useEffect(() => {
    const canvas = fabricRef.current
    if (!canvas) return
    const textObj = canvas.getObjects().find(obj => obj.type === 'i-text')
    if (textObj) {
      textObj.set({ text, fontFamily: font, fontSize: fontSize * canvas.scale, fill: textColor })
      canvas.renderAll()
    }
  }, [text, font, fontSize, textColor])

  useEffect(() => {
    const canvas = fabricRef.current
    if (!canvas) return
    canvas.setBackgroundColor(bgColor === 'transparent' ? null : bgColor, () => canvas.renderAll())
  }, [bgColor])

  const handleBgUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const canvas = fabricRef.current
      if (bgImageRef.current) {
        canvas.remove(bgImageRef.current)
      }
      fabric.Image.fromURL(event.target.result, (img) => {
        const scaleX = canvas.width / img.width
        const scaleY = canvas.height / img.height
        const scale = Math.max(scaleX, scaleY)
        img.set({
          scaleX: scale,
          scaleY: scale,
          selectable: true,
          hasControls: true,
          hasBorders: true,
          lockUniScaling: false,
        })
        bgImageRef.current = img
        canvas.add(img)
        centerObjectOnCanvas(canvas, img)
        canvas.sendToBack(img)
        if (frameRef.current) {
          canvas.bringToFront(frameRef.current)
        }
        canvas.renderAll()
      })
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

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

  const clearBgImage = () => {
    const canvas = fabricRef.current
    if (canvas && bgImageRef.current) {
      canvas.remove(bgImageRef.current)
      bgImageRef.current = null
      canvas.renderAll()
    }
  }

  const bringTextToFront = () => {
    const canvas = fabricRef.current
    if (!canvas) return
    const textObj = canvas.getObjects().find(obj => obj.type === 'i-text')
    if (textObj) {
      canvas.bringToFront(textObj)
      if (frameRef.current) {
        canvas.bringToFront(frameRef.current)
      }
      canvas.renderAll()
    }
  }

  const centerSelection = () => {
    const canvas = fabricRef.current
    if (!canvas) return
    let obj = canvas.getActiveObject()
    if (!obj) {
      obj = canvas.getObjects().find(o => o.type === 'i-text')
    }
    if (obj) {
      centerObjectOnCanvas(canvas, obj)
      canvas.renderAll()
    }
  }

  const fitBgToCanvas = () => {
    const canvas = fabricRef.current
    if (canvas && bgImageRef.current) {
      fitImageToCanvas(canvas, bgImageRef.current)
      if (frameRef.current) {
        canvas.bringToFront(frameRef.current)
      }
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Calligraphy Studio</h1>
        <button className="export-btn" onClick={handleExport}>Export PNG</button>
      </header>

      <main className="main">
        <aside className="panel left-panel">
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
            <button className="toolbar-btn" onClick={centerSelection}>Center</button>
            <button className="toolbar-btn" onClick={bringTextToFront}>Text to front</button>
          </div>
          <div className="canvas-wrapper">
            <canvas ref={canvasRef} />
          </div>
        </div>

        <aside className="panel right-panel">
          <section className="control-group">
            <label className="label">Frame</label>
            <div className="frame-list">
              {FRAMES.map((f) => (
                <button
                  key={f.id}
                  className={`frame-btn ${selectedFrame === f.id ? 'active' : ''}`}
                  onClick={() => setSelectedFrame(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </section>

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
              Import image
            </button>
            <button className="clear-btn" onClick={fitBgToCanvas}>Fit to canvas</button>
            <button className="clear-btn" onClick={clearBgImage}>Clear image</button>
            <p className="hint">Double-tap image to fit. Pinch to resize.</p>
          </section>

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
