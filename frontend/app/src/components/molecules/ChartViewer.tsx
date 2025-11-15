'use client'

import { useEffect, useRef } from 'react'

interface ChartViewerProps {
  content: string
  title?: string
}

export const ChartViewer = ({ content, title }: ChartViewerProps) => {
  const plotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadPlotly = async () => {
      const Plotly = await import('plotly.js-dist-min')
      
      if (plotRef.current) {
        try {
          const plotData = JSON.parse(content)
          
          // Handle binary data in y values
          if (plotData.data) {
            plotData.data.forEach((trace: any) => {
              if (trace.y && typeof trace.y === 'object' && trace.y.bdata) {
                // Decode base64 binary data
                const buffer = Buffer.from(trace.y.bdata, 'base64')
                const float64Array = new Float64Array(buffer.buffer)
                trace.y = Array.from(float64Array)
              }
            })
          }
          
          await Plotly.newPlot(plotRef.current, plotData.data, plotData.layout, {
            responsive: true,
            displayModeBar: true
          })
        } catch (error) {
          console.error('Error rendering chart:', error)
          if (plotRef.current) {
            plotRef.current.innerHTML = '<div class="text-red-500 p-4">Error rendering chart</div>'
          }
        }
      }
    }

    loadPlotly()
  }, [content])

  return (
    <div className="border border-gray-200 dark:border-gray-600 rounded">
      <div className="bg-gray-50 dark:bg-gray-700 px-3 py-2 text-sm font-medium">
        📈 {title || 'Chart'}
      </div>
      <div className="p-3">
        <div ref={plotRef} style={{ width: '100%', height: '400px' }} />
      </div>
    </div>
  )
}