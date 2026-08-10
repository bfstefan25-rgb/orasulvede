// Hand-rolled replacement for google.maps.visualization.HeatmapLayer, which
// Google removed from the Maps JavaScript API as of v3.65. Draws a canvas
// overlay on the map: soft radial blobs accumulated additively (so
// overlapping points get hotter), then remapped through a blue→red color
// ramp based on accumulated intensity. Uses only google.maps.OverlayView,
// no extra dependency.

const COLOR_STOPS = [
  [0.0, [37, 99, 235]],   // blue
  [0.35, [34, 197, 94]],  // green
  [0.6, [234, 179, 8]],   // yellow
  [1.0, [239, 68, 68]],   // red
]

function heatColor(t) {
  for (let i = 1; i < COLOR_STOPS.length; i++) {
    const [t1, c1] = COLOR_STOPS[i]
    if (t <= t1) {
      const [t0, c0] = COLOR_STOPS[i - 1]
      const localT = (t - t0) / (t1 - t0 || 1)
      return c0.map((c, idx) => Math.round(c + (c1[idx] - c) * localT))
    }
  }
  return COLOR_STOPS[COLOR_STOPS.length - 1][1]
}

// Must be called only after window.google.maps exists (OverlayView needs it
// as a base class at definition time).
export function createCanvasHeatmapOverlay() {
  class CanvasHeatmapOverlay extends window.google.maps.OverlayView {
    constructor({ radius = 32, maxIntensityAlpha = 40 } = {}) {
      super()
      this.canvas = null
      this.points = []
      this.radius = radius
      this.maxIntensityAlpha = maxIntensityAlpha
    }

    setPoints(points) {
      this.points = points
      this.draw()
    }

    onAdd() {
      this.canvas = document.createElement('canvas')
      this.canvas.style.position = 'absolute'
      this.canvas.style.pointerEvents = 'none'
      this.getPanes().overlayLayer.appendChild(this.canvas)
    }

    onRemove() {
      if (this.canvas?.parentNode) this.canvas.parentNode.removeChild(this.canvas)
      this.canvas = null
    }

    draw() {
      if (!this.canvas) return
      const projection = this.getProjection()
      const map = this.getMap()
      const bounds = map?.getBounds()
      if (!projection || !bounds) return

      const sw = projection.fromLatLngToDivPixel(bounds.getSouthWest())
      const ne = projection.fromLatLngToDivPixel(bounds.getNorthEast())
      const width = Math.max(1, Math.round(ne.x - sw.x))
      const height = Math.max(1, Math.round(sw.y - ne.y))

      this.canvas.style.left = `${sw.x}px`
      this.canvas.style.top = `${ne.y}px`
      this.canvas.width = width
      this.canvas.height = height

      const ctx = this.canvas.getContext('2d')
      ctx.clearRect(0, 0, width, height)
      if (!this.points.length) return

      ctx.globalCompositeOperation = 'lighter'
      this.points.forEach(({ lat, lng }) => {
        const px = projection.fromLatLngToDivPixel(new window.google.maps.LatLng(lat, lng))
        const x = px.x - sw.x
        const y = px.y - ne.y
        if (x < -this.radius || x > width + this.radius || y < -this.radius || y > height + this.radius) return
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, this.radius)
        gradient.addColorStop(0, `rgba(0,0,0,${this.maxIntensityAlpha / 255})`)
        gradient.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(x, y, this.radius, 0, Math.PI * 2)
        ctx.fill()
      })
      ctx.globalCompositeOperation = 'source-over'

      const imgData = ctx.getImageData(0, 0, width, height)
      const data = imgData.data
      for (let i = 0; i < data.length; i += 4) {
        const alpha = data[i + 3]
        if (alpha === 0) continue
        const [r, g, b] = heatColor(Math.min(alpha / 255, 1))
        data[i] = r; data[i + 1] = g; data[i + 2] = b
        data[i + 3] = Math.min(255, alpha * 2.2)
      }
      ctx.putImageData(imgData, 0, 0)
    }
  }

  return CanvasHeatmapOverlay
}
