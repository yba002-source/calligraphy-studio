import { useState, useRef, useEffect } from 'react'
import { fabric } from 'fabric'

const TRANSLATIONS = {
  en: {
    appTitle: 'Calligraphy Studio',
    exportPng: 'Export PNG',
    yourText: 'Your text',
    textPlaceholder: 'Type here...',
    font: 'Font',
    textColor: 'Text color',
    size: 'Size',
    frame: 'Frame',
    noFrame: 'No frame',
    backgroundImage: 'Background image',
    importImage: 'Import image',
    editBackground: 'Edit background',
    editingBackground: '✓ Editing background',
    fitToCanvas: 'Fit to canvas',
    clearImage: 'Clear image',
    hint: 'Double-tap image to fit. Pinch to resize.',
    backgroundColor: 'Background color',
    center: 'Center',
    textToFront: 'Text to front',
    customColor: 'Custom color',
    transparent: 'Transparent',
    square: 'Square (1080×1080)',
    landscape: 'Landscape (1920×1080)',
    story: 'Story (1080×1920)',
    xPost: 'X Post (1200×675)',
  },
  ar: {
    appTitle: 'استوديو الخط',
    exportPng: 'تصدير PNG',
    yourText: 'النص',
    textPlaceholder: 'اكتب هنا...',
    font: 'الخط',
    textColor: 'لون النص',
    size: 'الحجم',
    frame: 'الإطار',
    noFrame: 'بدون إطار',
    backgroundImage: 'صورة الخلفية',
    importImage: 'استيراد صورة',
    editBackground: 'تعديل الخلفية',
    editingBackground: '✓ تعديل الخلفية',
    fitToCanvas: 'ملء اللوحة',
    clearImage: 'حذف الصورة',
    hint: 'انقر مرتين للملء. اقرص للتكبير.',
    backgroundColor: 'لون الخلفية',
    center: 'توسيط',
    textToFront: 'النص للأمام',
    customColor: 'لون مخصص',
    transparent: 'شفاف',
    square: 'مربع (1080×1080)',
    landscape: 'أفقي (1920×1080)',
    story: 'ستوري (1080×1920)',
    xPost: 'منشور X (1200×675)',
  }
}

const CANVAS_SIZES = {
  square: { width: 1080, height: 1080 },
  landscape: { width: 1920, height: 1080 },
  story: { width: 1080, height: 1920 },
  xPost: { width: 1200, height: 675 },
}

const FONTS = [
  { name: 'Amiri', label: 'Amiri' },
  { name: 'Noto Naskh Arabic', label: 'Noto Naskh' },
  { name: 'Scheherazade New', label: 'Scheherazade' },
  { name: 'Aref Ruqaa', label: 'Aref Ruqaa' },
  { name: 'Lateef', label: 'Lateef' },
  { name: 'Reem Kufi', label: 'Reem Kufi' },
  { name: 'Marhey', label: 'Marhey' },
  { name: 'Tajawal', label: 'Tajawal' },
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
  { name: 'Markazi Text', label: 'Markazi' },
]

const FRAMES = [
  { id: 'none' },
  { id: 'frame-01', num: 1 },
  { id: 'frame-02', num: 2 },
  { id: 'frame-03', num: 3 },
  { id: 'frame-04', num: 4 },
  { id: 'frame-05', num: 5 },
  { id: 'frame-06', num: 6 },
  { id: 'frame-07', num: 7 },
  { id: 'frame-08', num: 8 },
  { id: 'frame-09', num: 9 },
  { id: 'frame-10', num: 10 },
]

const SIZE_TO_SUFFIX = {
  square: 'square',
  landscape: 'landscape',
  story: 'story',
  xPost: 'xpost',
}

const TEXT_COLORS = [
  '#000000', '#1a1a1a', '#4a4a4a', '#808080', '#b0b0b0', '#ffffff',
  '#C9A227', '#D4AF37', '#996515', '#854F0B', '#712B13', '#5C4033',
  '#0F6E56', '#1B5E20', '#2E7D32', '#388E3C', '#4CAF50', '#81C784',
  '#185FA5', '#1565C0', '#1976D2', '#2196F3', '#42A5F5', '#0D47A1',
  '#8B0000', '#B71C1C', '#C62828', '#D32F2F', '#E53935', '#EF5350',
  '#3C3489', '#4A148C', '#6A1B9A', '#7B1FA2', '#8E24AA', '#9C27B0',
]

const BG_COLORS = ['transparent', '#ffffff', '#1a1a1a', '#0F6E56', '#185FA5', '#854F0B', '#FAEEDA', '#F5F5DC', '#1B5E20', '#8B0000']

function App() {
  const canvasRef = useRef(null)
  const fabricRef = useRef(null)
  const fileInputRef = useRef(null)
  const colorInputRef = useRef(null)
  const bgImageRef = useRef(null)
  const bgImageDataRef = useRef(null)
  const frameRef = useRef(null)
  const lastTapRef = useRef(0)
  const lastTapTargetRef = useRef(null)
  
  const [lang, setLang] = useState('ar')
  const [text, setText] = useState('بِسْمِ اللَّهِ')
  const [font, setFont] = useState('Amiri')
  const [textColor, setTextColor] = useState('#1a1a1a')
  const [fontSize, setFontSize] = useState(64)
  const [canvasSize, setCanvasSize] = useState('square')
  const [bgColor, setBgColor] = useState('#ffffff')
  const [selectedFrame, setSelectedFrame] = useState('none')
  const [bgEditable, setBgEditable] = useState(false)

  const t = TRANSLATIONS[lang]
  const isRTL = lang === 'ar'

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
    if (frameRef.current) {
      canvas.bringToFront(frameRef.current)
    }
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

  const loadBgImage = (canvas, dataUrl, editable = false) => {
    if (!dataUrl) return
    
    fabric.Image.fromURL(dataUrl, (img) => {
      const scaleX = canvas.width / img.width
      const scaleY = canvas.height / img.height
      const scale = Math.max(scaleX, scaleY)
      img.set({
        scaleX: scale,
        scaleY: scale,
        selectable: editable,
        hasControls: editable,
        hasBorders: editable,
        evented: editable,
        lockUniScaling: false,
      })
      bgImageRef.current = img
      canvas.add(img)
      centerObjectOnCanvas(canvas, img)
      canvas.sendToBack(img)
      if (frameRef.current) {
        canvas.bringToFront(frameRef.current)
      }
      canvas.discardActiveObject()
      canvas.renderAll()
    })
  }

  const toggleBgEditable = () => {
    const canvas = fabricRef.current
    const img = bgImageRef.current
    if (!canvas || !img) return
    
    const newEditable = !bgEditable
    setBgEditable(newEditable)
    
    img.set({
      selectable: newEditable,
      hasControls: newEditable,
      hasBorders: newEditable,
      evented: newEditable,
    })
    
    if (newEditable) {
      canvas.setActiveObject(img)
    } else {
      canvas.discardActiveObject()
    }
    canvas.renderAll()
  }

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

    if (bgImageDataRef.current) {
      loadBgImage(canvas, bgImageDataRef.current, false)
      setBgEditable(false)
    }

    const framePath = getFramePath(selectedFrame, canvasSize)
    if (framePath) {
      loadFrame(canvas, framePath)
    }

    canvas.renderAll()

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

    canvas.on('mouse:dblclick', function(e) {
      if (e.target && e.target.type === 'image' && e.target === bgImageRef.current) {
        fitImageToCanvas(canvas, e.target)
      }
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
  }, [canvasSize])

  useEffect(() => {
    const canvas = fabricRef.current
    if (!canvas) return
    
    const framePath = getFramePath(selectedFrame, canvasSize)
    loadFrame(canvas, framePath)
  }, [selectedFrame])

  useEffect(() => {
    const canvas = fabricRef.current
    if (!canvas) return
    const textObj = canvas.getObjects().find(obj => obj.type === 'i-text')
    if (textObj) {
      if (textObj.isEditing) {
        textObj.exitEditing()
      }
      textObj.set({ 
        text, 
        fontFamily: font, 
        fontSize: fontSize * canvas.scale, 
        fill: textColor 
      })
      textObj.initDimensions()
      textObj.dirty = true
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
      bgImageDataRef.current = event.target.result
      loadBgImage(canvas, event.target.result, false)
      setBgEditable(false)
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
      bgImageDataRef.current = null
      setBgEditable(false)
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
    const img = bgImageRef.current
    if (!canvas || !img) return
    fitImageToCanvas(canvas, img)
  }

  const handleCustomColor = (e) => {
    setTextColor(e.target.value)
  }

  const toggleLanguage = () => {
    setLang(lang === 'ar' ? 'en' : 'ar')
  }

  const getFrameLabel = (frame) => {
    if (frame.id === 'none') return t.noFrame
    return `${lang === 'ar' ? 'إطار' : 'Frame'} ${frame.num}`
  }

  return (
    <div className={`app ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <header className="header">
        <h1>{t.appTitle}</h1>
        <div className="header-actions">
          <button className="lang-btn" onClick={toggleLanguage}>
            {lang === 'ar' ? 'EN' : 'عربي'}
          </button>
          <button className="export-btn" onClick={handleExport}>{t.exportPng}</button>
        </div>
      </header>

      <main className="main">
        <aside className="panel left-panel">
          <section className="control-group">
            <label className="label">{t.yourText}</label>
            <textarea
              className="text-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              dir="rtl"
              placeholder={t.textPlaceholder}
            />
          </section>

          <section className="control-group">
            <label className="label">{t.font}</label>
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
            <label className="label">{t.textColor}</label>
            <div className="color-grid">
              {TEXT_COLORS.map((color) => (
                <button
                  key={color}
                  className={`color-btn ${textColor === color ? 'active' : ''} ${color === '#ffffff' ? 'white-btn' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setTextColor(color)}
                  title={color}
                />
              ))}
              <div className="color-picker-wrapper">
                <input
                  type="color"
                  ref={colorInputRef}
                  value={textColor}
                  onChange={handleCustomColor}
                  className="color-picker-input"
                />
                <button
                  className={`color-btn color-picker-btn ${!TEXT_COLORS.includes(textColor) ? 'active' : ''}`}
                  onClick={() => colorInputRef.current?.click()}
                  style={{ backgroundColor: !TEXT_COLORS.includes(textColor) ? textColor : 'transparent' }}
                  title={t.customColor}
                >
                  +
                </button>
              </div>
            </div>
          </section>

          <section className="control-group">
            <label className="label">{t.size}: {fontSize}px</label>
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
              <option value="square">{t.square}</option>
              <option value="landscape">{t.landscape}</option>
              <option value="story">{t.story}</option>
              <option value="xPost">{t.xPost}</option>
            </select>
            <button className="toolbar-btn" onClick={centerSelection}>{t.center}</button>
            <button className="toolbar-btn" onClick={bringTextToFront}>{t.textToFront}</button>
          </div>
          <div className="canvas-wrapper">
            <canvas ref={canvasRef} />
          </div>
        </div>

        <aside className="panel right-panel">
          <section className="control-group">
            <label className="label">{t.frame}</label>
            <div className="frame-list">
              {FRAMES.map((f) => (
                <button
                  key={f.id}
                  className={`frame-btn ${selectedFrame === f.id ? 'active' : ''}`}
                  onClick={() => setSelectedFrame(f.id)}
                >
                  {getFrameLabel(f)}
                </button>
              ))}
            </div>
          </section>

          <section className="control-group">
            <label className="label">{t.backgroundImage}</label>
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
              {t.importImage}
            </button>
            {bgImageRef.current && (
              <button 
                className={`clear-btn ${bgEditable ? 'active-toggle' : ''}`} 
                onClick={toggleBgEditable}
              >
                {bgEditable ? t.editingBackground : t.editBackground}
              </button>
            )}
            <button className="clear-btn" onClick={fitBgToCanvas}>{t.fitToCanvas}</button>
            <button className="clear-btn" onClick={clearBgImage}>{t.clearImage}</button>
            <p className="hint">{t.hint}</p>
          </section>

          <section className="control-group">
            <label className="label">{t.backgroundColor}</label>
            <div className="color-grid">
              {BG_COLORS.map((color) => (
                <button
                  key={color}
                  className={`color-btn square ${bgColor === color ? 'active' : ''} ${color === 'transparent' ? 'transparent-btn' : ''} ${color === '#ffffff' ? 'white-btn' : ''}`}
                  style={{ backgroundColor: color === 'transparent' ? 'transparent' : color }}
                  onClick={() => setBgColor(color)}
                  title={color === 'transparent' ? t.transparent : color}
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
