import { useEffect, useRef, useState } from 'react'
import { select } from 'd3-selection'
import { scaleLinear } from 'd3-scale'
import { extent } from 'd3-array'

interface DataPoint {
  x: number
  y: number
}

const data: DataPoint[] = [
  { x: 132, y: 391 },
  { x: 330, y: 349 },
  { x: 410, y: 192 },
  { x: 527, y: 257 },
  { x: 688, y: 119 },
  { x: 878, y: 55 },
]

const ORIGINAL_WIDTH = 960
const ORIGINAL_HEIGHT = 500
const RADIUS = 34
const PADDING_RATIO = 0.05

// Compute data extents using d3-array for robust scaling
const xExtent = extent(data, (d: DataPoint) => d.x) as [number, number]
const yExtent = extent(data, (d: DataPoint) => d.y) as [number, number]

export function ResponsivePseudoScatterPlot() {
  const divRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const div = divRef.current
    if (!div) return

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      const { width, height } = entry.contentRect
      setDimensions({ width, height })
    })

    observer.observe(div)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const svg = svgRef.current
    if (!svg || dimensions.width === 0 || dimensions.height === 0) return

    // Calculate viewport-aware padding
    const xPadding = dimensions.width * PADDING_RATIO
    const yPadding = dimensions.height * PADDING_RATIO

    const xScale = scaleLinear()
      .domain(xExtent)
      .range([xPadding, dimensions.width - xPadding])

    const yScale = scaleLinear()
      .domain(yExtent)
      .range([dimensions.height - yPadding, yPadding])

    const scaleFactor = Math.min(
      dimensions.width / ORIGINAL_WIDTH,
      dimensions.height / ORIGINAL_HEIGHT
    )
    const scaledRadius = RADIUS * scaleFactor

    const selection = select(svg)

    const circles = selection.selectAll('circle').data(data)

    circles
      .enter()
      .append('circle')
      .attr('cx', (d: DataPoint) => xScale(d.x))
      .attr('cy', (d: DataPoint) => yScale(d.y))
      .attr('r', scaledRadius)

    circles
      .attr('cx', (d: DataPoint) => xScale(d.x))
      .attr('cy', (d: DataPoint) => yScale(d.y))
      .attr('r', scaledRadius)

    circles.exit().remove()
  }, [dimensions])

  return (
    <div ref={divRef} className="relative w-full h-full">
      <svg
        ref={svgRef}
        className="absolute inset-0"
        width={dimensions.width}
        height={dimensions.height}
        role="img"
        aria-label="Responsive scatter plot showing 6 data points"
      >
      </svg>
    </div>
  )
}
