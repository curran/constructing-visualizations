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

// Compute data extents using d3-array for robust scaling
const xExtent = extent(data, (d: DataPoint) => d.x) as [number, number]
const yExtent = extent(data, (d: DataPoint) => d.y) as [number, number]

// Calculate padding based on data extent using d3-array max
const xRange = xExtent[1] - xExtent[0]
const yRange = yExtent[1] - yExtent[0]
const padding = Math.max(xRange, yRange) * 0.05

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

    const xScale = scaleLinear()
      .domain([0, ORIGINAL_WIDTH])
      .range([padding, dimensions.width - padding])

    const yScale = scaleLinear()
      .domain([0, ORIGINAL_HEIGHT])
      .range([padding, dimensions.height - padding])

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
        className="absolute inset-0 w-full h-full"
      >
      </svg>
    </div>
  )
}
