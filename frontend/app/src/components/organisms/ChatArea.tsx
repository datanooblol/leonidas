import { useState, useEffect, useRef } from 'react'
import { ChatInput } from '../molecules/ChatInput'
import { MarkdownRenderer } from './MarkdownRenderer'
import React from 'react'

declare global {
  interface Window {
    d3: any;
    Plotly: any;
  }
}

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  artifacts?: any[]
}

interface ChatAreaProps {
  messages: Message[]
  input: string
  isLoading: boolean
  currentSession: string | null
  selectedFilesCount: number
  useFileData: boolean
  onInputChange: (value: string) => void
  onSendMessage: () => void
  onToggleSidebar: () => void
  onToggleFileData: () => void
  onBack: () => void
}

const D3Renderer = ({ d3Code }: { d3Code: string }) => {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || !d3Code) return

    // Load D3 if not available
    if (!window.d3) {
      const script = document.createElement('script')
      script.src = 'https://d3js.org/d3.v7.min.js'
      script.onload = () => executeD3Code()
      document.head.appendChild(script)
    } else {
      executeD3Code()
    }

    function executeD3Code() {
      try {
        const svg = window.d3.select(svgRef.current)
        svg.selectAll('*').remove()

        // Decode HTML entities
        const decodedCode = d3Code
          .replace(/&gt;/g, '>')
          .replace(/&lt;/g, '<')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&amp;/g, '&')

        // Execute D3 code with dynamic width
        const containerWidth = svgRef.current?.clientWidth || 800
        const func = new Function('d3', 'svg', 'width', 'height', decodedCode)
        func(window.d3, svg, containerWidth - 32, 400)
      } catch (error) {
        console.error('D3 execution error:', error)

      }
    }
  }, [d3Code])

  return (
    <div className="w-full p-4">
      <svg ref={svgRef} width="100%" height="400" className="border border-gray-200 rounded"></svg>
    </div>
  )
}

const PlotlyRenderer = ({ plotlyCode }: { plotlyCode: string }) => {
  const divRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!divRef.current || !plotlyCode) return

    if (!window.Plotly) {
      const script = document.createElement('script')
      script.src = 'https://cdn.plot.ly/plotly-latest.min.js'
      script.onload = () => executePlotlyCode()
      document.head.appendChild(script)
    } else {
      executePlotlyCode()
    }

    function executePlotlyCode() {
      try {
        const decodedCode = plotlyCode
          .replace(/&gt;/g, '>')
          .replace(/&lt;/g, '<')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&amp;/g, '&')

        const func = new Function('Plotly', 'div', decodedCode)
        func(window.Plotly, divRef.current)
      } catch (error) {
        console.error('Plotly execution error:', error)
      }
    }
  }, [plotlyCode])

  return (
    <div className="w-full p-4">
      <div ref={divRef} style={{ width: '100%', height: '400px' }} className="border border-gray-200 rounded"></div>
    </div>
  )
}

const IframeWithAdjustment = ({ htmlContent }: { htmlContent: string }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const adjustIframeContent = () => {
    const iframe = iframeRef.current
    if (!iframe) return

    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
      const body = iframeDoc?.body
      
      if (body) {
        const iframeHeight = 500 // ขนาดความสูงของ iframe
        const style = iframeDoc.createElement('style')
        style.textContent = `
          body { 
            margin: 0 !important; 
            padding: 0 !important; 
            overflow: hidden !important;
            height: auto !important;
            border: 5px solid green !important;
            box-sizing: border-box !important;
          }
          html { height: 100% !important; }
          .plotly-graph-div, div[style*="height:100%"] { 
            width: 100% !important; 
            height: ${iframeHeight - 10}px !important;
            max-height: ${iframeHeight - 10}px !important;
          }
        `
        iframeDoc.head.appendChild(style)
      }
    } catch (error) {
      console.error('Cannot access iframe content:', error)
    }
  }

  return (
    <iframe
      ref={iframeRef}
      srcDoc={htmlContent}
      className="w-full border-2 border-red-500"
      style={{ height: '500px'  }}
      title="Plotly HTML Chart"
      onLoad={adjustIframeContent}
    />
  )
}

export const ChatArea = ({
  messages,
  input,
  isLoading,
  currentSession,
  selectedFilesCount,
  useFileData,
  onInputChange,
  onSendMessage,
  onToggleSidebar,
  onToggleFileData,
  onBack
}: ChatAreaProps) => {
  const [expandedArtifacts, setExpandedArtifacts] = useState<Set<string>>(new Set())

  // Mock messages for testing
  const mockMessages = [
    {
      id: '1',
      content: 'นี่คือกราฟแสดงยอดขายผลไม้',
      role: 'assistant' as const,
      timestamp: new Date(),
      artifacts: [
        {
          type: 'd3',
          content: `const data = [10, 15, 7, 12, 9];
const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
const labels = ['แอปเปิ้ล', 'ส้ม', 'กล้วย', 'องุ่น', 'สตรอเบอรี่'];

const margin = {top: 20, right: 30, bottom: 60, left: 40};
const chartWidth = width - margin.left - margin.right;
const chartHeight = height - margin.top - margin.bottom;

// สร้าง scales
const xScale = d3.scaleBand()
  .domain(labels)
  .range([0, chartWidth])
  .padding(0.1);

const yScale = d3.scaleLinear()
  .domain([0, d3.max(data)])
  .range([chartHeight, 0]);

// สร้าง main group
const g = svg.append('g')
  .attr('transform', \`translate(\${margin.left},\${margin.top})\`);

// สร้าง tooltip
const tooltip = d3.select('body')
  .append('div')
  .style('position', 'absolute')
  .style('padding', '6px 10px')
  .style('background', 'rgba(0,0,0,0.7)')
  .style('color', '#fff')
  .style('border-radius', '4px')
  .style('pointer-events', 'none')
  .style('opacity', 0);

g.selectAll('rect')
  .data(data)
  .enter()
  .append('rect')
  .attr('x', (d, i) => xScale(labels[i]))
  .attr('y', d => yScale(d))
  .attr('width', xScale.bandwidth())
  .attr('height', d => chartHeight - yScale(d))
  .attr('fill', (d, i) => colors[i])
  .attr('rx', 4)
  .on('mouseover', function(event, d) {
    d3.select(this).attr('fill', '#FFD93D');
    tooltip.transition().duration(200).style('opacity', 1);
    tooltip.html(\`Value: \${d}\`)
      .style('left', (event.pageX + 10) + 'px')
      .style('top', (event.pageY - 25) + 'px');
  })
  .on('mousemove', function(event) {
    tooltip
      .style('left', (event.pageX + 10) + 'px')
      .style('top', (event.pageY - 25) + 'px');
  })
  .on('mouseout', function(d, i) {
    d3.select(this).attr('fill', (d, i) => colors[i]);
    tooltip.transition().duration(200).style('opacity', 0);
  })
  .on('click', function(event, d) {
    alert(\`You clicked on value: \${d}\`);
  });

g.selectAll('text')
  .data(labels)
  .enter()
  .append('text')
  .attr('x', d => xScale(d) + xScale.bandwidth() / 2)
  .attr('y', chartHeight + 20)
  .attr('text-anchor', 'middle')
  .attr('font-size', '12px')
  .text(d => d);`
        }
      ]
    },
    {
      id: '2',
      content: 'นี่คือกราฟ Plotly แสดงข้อมูลการขาย',
      role: 'assistant' as const,
      timestamp: new Date(),
      artifacts: [
        {
          type: 'plotly',
          content: `const data = [{
  x: ['แอปเปิ้ล', 'ส้ม', 'กล้วย', 'องุ่น', 'สตรอเบอรี่'],
  y: [10, 15, 7, 12, 9],
  type: 'bar',
  marker: {
    color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']
  }
}];

const layout = {
  title: 'ยอดขายผลไม้',
  xaxis: { title: 'ผลไม้' },
  yaxis: { title: 'จำนวน' }
};

Plotly.newPlot(div, data, layout, {responsive: true});`
        }
      ]
    },
    {
      id: '3',
      content: 'นี่คือกราฟ HTML จาก API Response',
      role: 'assistant' as const,
      timestamp: new Date(),
      artifacts: [
        {
          type: 'plotly-html',
          content: `<html>

<head>
    <meta charset="utf-8" />
</head>

<body>
    <div>
        <script type="text/javascript">window.PlotlyConfig = { MathJaxConfig: 'local' };</script>
        <script charset="utf-8" src="https://cdn.plot.ly/plotly-3.0.1.min.js"
            integrity="sha256-oy6Be7Eh6eiQFs5M7oXuPxxm9qbJXEtTpfSI93dW16Q=" crossorigin="anonymous"></script>
        <div id="4ce0f7b1-6965-48d8-a6f9-9f6e4929d444" class="plotly-graph-div" style="height:100%; width:100%;"></div>
        <script type="text/javascript">                window.PLOTLYENV = window.PLOTLYENV || {}; if (document.getElementById("4ce0f7b1-6965-48d8-a6f9-9f6e4929d444")) { Plotly.newPlot("4ce0f7b1-6965-48d8-a6f9-9f6e4929d444", [{ "x": ["A", "B", "C"], "y": [10, 15, 7], "type": "bar" }], { "template": { "data": { "histogram2dcontour": [{ "type": "histogram2dcontour", "colorbar": { "outlinewidth": 0, "ticks": "" }, "colorscale": [[0.0, "#0d0887"], [0.1111111111111111, "#46039f"], [0.2222222222222222, "#7201a8"], [0.3333333333333333, "#9c179e"], [0.4444444444444444, "#bd3786"], [0.5555555555555556, "#d8576b"], [0.6666666666666666, "#ed7953"], [0.7777777777777778, "#fb9f3a"], [0.8888888888888888, "#fdca26"], [1.0, "#f0f921"]] }], "choropleth": [{ "type": "choropleth", "colorbar": { "outlinewidth": 0, "ticks": "" } }], "histogram2d": [{ "type": "histogram2d", "colorbar": { "outlinewidth": 0, "ticks": "" }, "colorscale": [[0.0, "#0d0887"], [0.1111111111111111, "#46039f"], [0.2222222222222222, "#7201a8"], [0.3333333333333333, "#9c179e"], [0.4444444444444444, "#bd3786"], [0.5555555555555556, "#d8576b"], [0.6666666666666666, "#ed7953"], [0.7777777777777778, "#fb9f3a"], [0.8888888888888888, "#fdca26"], [1.0, "#f0f921"]] }], "heatmap": [{ "type": "heatmap", "colorbar": { "outlinewidth": 0, "ticks": "" }, "colorscale": [[0.0, "#0d0887"], [0.1111111111111111, "#46039f"], [0.2222222222222222, "#7201a8"], [0.3333333333333333, "#9c179e"], [0.4444444444444444, "#bd3786"], [0.5555555555555556, "#d8576b"], [0.6666666666666666, "#ed7953"], [0.7777777777777778, "#fb9f3a"], [0.8888888888888888, "#fdca26"], [1.0, "#f0f921"]] }], "contourcarpet": [{ "type": "contourcarpet", "colorbar": { "outlinewidth": 0, "ticks": "" } }], "contour": [{ "type": "contour", "colorbar": { "outlinewidth": 0, "ticks": "" }, "colorscale": [[0.0, "#0d0887"], [0.1111111111111111, "#46039f"], [0.2222222222222222, "#7201a8"], [0.3333333333333333, "#9c179e"], [0.4444444444444444, "#bd3786"], [0.5555555555555556, "#d8576b"], [0.6666666666666666, "#ed7953"], [0.7777777777777778, "#fb9f3a"], [0.8888888888888888, "#fdca26"], [1.0, "#f0f921"]] }], "surface": [{ "type": "surface", "colorbar": { "outlinewidth": 0, "ticks": "" }, "colorscale": [[0.0, "#0d0887"], [0.1111111111111111, "#46039f"], [0.2222222222222222, "#7201a8"], [0.3333333333333333, "#9c179e"], [0.4444444444444444, "#bd3786"], [0.5555555555555556, "#d8576b"], [0.6666666666666666, "#ed7953"], [0.7777777777777778, "#fb9f3a"], [0.8888888888888888, "#fdca26"], [1.0, "#f0f921"]] }], "mesh3d": [{ "type": "mesh3d", "colorbar": { "outlinewidth": 0, "ticks": "" } }], "scatter": [{ "fillpattern": { "fillmode": "overlay", "size": 10, "solidity": 0.2 }, "type": "scatter" }], "parcoords": [{ "type": "parcoords", "line": { "colorbar": { "outlinewidth": 0, "ticks": "" } } }], "scatterpolargl": [{ "type": "scatterpolargl", "marker": { "colorbar": { "outlinewidth": 0, "ticks": "" } } }], "bar": [{ "error_x": { "color": "#2a3f5f" }, "error_y": { "color": "#2a3f5f" }, "marker": { "line": { "color": "#E5ECF6", "width": 0.5 }, "pattern": { "fillmode": "overlay", "size": 10, "solidity": 0.2 } }, "type": "bar" }], "scattergeo": [{ "type": "scattergeo", "marker": { "colorbar": { "outlinewidth": 0, "ticks": "" } } }], "scatterpolar": [{ "type": "scatterpolar", "marker": { "colorbar": { "outlinewidth": 0, "ticks": "" } } }], "histogram": [{ "marker": { "pattern": { "fillmode": "overlay", "size": 10, "solidity": 0.2 } }, "type": "histogram" }], "scattergl": [{ "type": "scattergl", "marker": { "colorbar": { "outlinewidth": 0, "ticks": "" } } }], "scatter3d": [{ "type": "scatter3d", "line": { "colorbar": { "outlinewidth": 0, "ticks": "" } }, "marker": { "colorbar": { "outlinewidth": 0, "ticks": "" } } }], "scattermap": [{ "type": "scattermap", "marker": { "colorbar": { "outlinewidth": 0, "ticks": "" } } }], "scattermapbox": [{ "type": "scattermapbox", "marker": { "colorbar": { "outlinewidth": 0, "ticks": "" } } }], "scatterternary": [{ "type": "scatterternary", "marker": { "colorbar": { "outlinewidth": 0, "ticks": "" } } }], "scattercarpet": [{ "type": "scattercarpet", "marker": { "colorbar": { "outlinewidth": 0, "ticks": "" } } }], "carpet": [{ "aaxis": { "endlinecolor": "#2a3f5f", "gridcolor": "white", "linecolor": "white", "minorgridcolor": "white", "startlinecolor": "#2a3f5f" }, "baxis": { "endlinecolor": "#2a3f5f", "gridcolor": "white", "linecolor": "white", "minorgridcolor": "white", "startlinecolor": "#2a3f5f" }, "type": "carpet" }], "table": [{ "cells": { "fill": { "color": "#EBF0F8" }, "line": { "color": "white" } }, "header": { "fill": { "color": "#C8D4E3" }, "line": { "color": "white" } }, "type": "table" }], "barpolar": [{ "marker": { "line": { "color": "#E5ECF6", "width": 0.5 }, "pattern": { "fillmode": "overlay", "size": 10, "solidity": 0.2 } }, "type": "barpolar" }], "pie": [{ "automargin": true, "type": "pie" }] }, "layout": { "autotypenumbers": "strict", "colorway": ["#636efa", "#EF553B", "#00cc96", "#ab63fa", "#FFA15A", "#19d3f3", "#FF6692", "#B6E880", "#FF97FF", "#FECB52"], "font": { "color": "#2a3f5f" }, "hovermode": "closest", "hoverlabel": { "align": "left" }, "paper_bgcolor": "white", "plot_bgcolor": "#E5ECF6", "polar": { "bgcolor": "#E5ECF6", "angularaxis": { "gridcolor": "white", "linecolor": "white", "ticks": "" }, "radialaxis": { "gridcolor": "white", "linecolor": "white", "ticks": "" } }, "ternary": { "bgcolor": "#E5ECF6", "aaxis": { "gridcolor": "white", "linecolor": "white", "ticks": "" }, "baxis": { "gridcolor": "white", "linecolor": "white", "ticks": "" }, "caxis": { "gridcolor": "white", "linecolor": "white", "ticks": "" } }, "coloraxis": { "colorbar": { "outlinewidth": 0, "ticks": "" } }, "colorscale": { "sequential": [[0.0, "#0d0887"], [0.1111111111111111, "#46039f"], [0.2222222222222222, "#7201a8"], [0.3333333333333333, "#9c179e"], [0.4444444444444444, "#bd3786"], [0.5555555555555556, "#d8576b"], [0.6666666666666666, "#ed7953"], [0.7777777777777778, "#fb9f3a"], [0.8888888888888888, "#fdca26"], [1.0, "#f0f921"]], "sequentialminus": [[0.0, "#0d0887"], [0.1111111111111111, "#46039f"], [0.2222222222222222, "#7201a8"], [0.3333333333333333, "#9c179e"], [0.4444444444444444, "#bd3786"], [0.5555555555555556, "#d8576b"], [0.6666666666666666, "#ed7953"], [0.7777777777777778, "#fb9f3a"], [0.8888888888888888, "#fdca26"], [1.0, "#f0f921"]], "diverging": [[0, "#8e0152"], [0.1, "#c51b7d"], [0.2, "#de77ae"], [0.3, "#f1b6da"], [0.4, "#fde0ef"], [0.5, "#f7f7f7"], [0.6, "#e6f5d0"], [0.7, "#b8e186"], [0.8, "#7fbc41"], [0.9, "#4d9221"], [1, "#276419"]] }, "xaxis": { "gridcolor": "white", "linecolor": "white", "ticks": "", "title": { "standoff": 15 }, "zerolinecolor": "white", "automargin": true, "zerolinewidth": 2 }, "yaxis": { "gridcolor": "white", "linecolor": "white", "ticks": "", "title": { "standoff": 15 }, "zerolinecolor": "white", "automargin": true, "zerolinewidth": 2 }, "scene": { "xaxis": { "backgroundcolor": "#E5ECF6", "gridcolor": "white", "linecolor": "white", "showbackground": true, "ticks": "", "zerolinecolor": "white", "gridwidth": 2 }, "yaxis": { "backgroundcolor": "#E5ECF6", "gridcolor": "white", "linecolor": "white", "showbackground": true, "ticks": "", "zerolinecolor": "white", "gridwidth": 2 }, "zaxis": { "backgroundcolor": "#E5ECF6", "gridcolor": "white", "linecolor": "white", "showbackground": true, "ticks": "", "zerolinecolor": "white", "gridwidth": 2 } }, "shapedefaults": { "line": { "color": "#2a3f5f" } }, "annotationdefaults": { "arrowcolor": "#2a3f5f", "arrowhead": 0, "arrowwidth": 1 }, "geo": { "bgcolor": "white", "landcolor": "#E5ECF6", "subunitcolor": "white", "showland": true, "showlakes": true, "lakecolor": "white" }, "title": { "x": 0.05 }, "mapbox": { "style": "light" } } } }, { "responsive": true }) };            </script>
    </div>
</body>

</html>`
        }
      ]
    }
  ]

  // Use mock messages if no real messages
  const displayMessages = messages.length > 0 ? messages : mockMessages

  const toggleArtifact = (messageId: string, artifactIndex: number) => {
    const key = `${messageId}-${artifactIndex}`
    setExpandedArtifacts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(key)) {
        newSet.delete(key)
      } else {
        newSet.add(key)
      }
      return newSet
    })
  }

  return (
    <div className="flex-1 flex flex-col relative">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="text-gray-600 hover:text-gray-800">
            🏠 Dashboard
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 pb-32">


        {!currentSession ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-lg font-medium mb-2">เริ่มการสนทนาใหม่</h3>
              <p className="text-gray-500">Data is power, questions are keys</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 max-w-3xl mx-auto">
            {displayMessages.map(message => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.role === 'user' ? (
                  <div className="max-w-xs lg:max-w-2xl px-4 py-2 rounded-lg bg-gray-200 text-gray-800">
                    {message.content}
                  </div>
                ) : (
                  <div className="w-full">
                    <MarkdownRenderer content={message.content} />



                    {/* Test Graph Buttons */}
                    <div className="mt-2 space-x-2">
                      <button
                        onClick={() => toggleArtifact(`${message.id}-test`, 0)}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                      >
                        📊 Test D3 {expandedArtifacts.has(`${message.id}-test-0`) ? '▼' : '▶'}
                      </button>
                      <button
                        onClick={() => toggleArtifact(`${message.id}-test`, 1)}
                        className="px-2 py-1 text-xs bg-green-100 text-green-600 rounded hover:bg-green-200 transition-colors"
                      >
                        📈 Test Plotly {expandedArtifacts.has(`${message.id}-test-1`) ? '▼' : '▶'}
                      </button>
                      <button
                        onClick={() => toggleArtifact(`${message.id}-test`, 2)}
                        className="px-2 py-1 text-xs bg-purple-100 text-purple-600 rounded hover:bg-purple-200 transition-colors"
                      >
                        🌐 Test HTML {expandedArtifacts.has(`${message.id}-test-2`) ? '▼' : '▶'}
                      </button>
                    </div>

                    {/* Test Charts */}
                    {expandedArtifacts.has(`${message.id}-test-0`) && (
                      <div className="mt-2 bg-white border border-gray-200 rounded p-4">
                        <D3Renderer d3Code={mockMessages[0].artifacts[0].content} />
                      </div>
                    )}
                    {expandedArtifacts.has(`${message.id}-test-1`) && (
                      <div className="mt-2 bg-white border border-gray-200 rounded p-4">
                        <PlotlyRenderer plotlyCode={mockMessages[1].artifacts[0].content} />
                      </div>
                    )}
                    {expandedArtifacts.has(`${message.id}-test-2`) && (
                      <div className="mt-2 bg-white border border-gray-200 rounded p-4">
                        <IframeWithAdjustment htmlContent={mockMessages[2].artifacts[0].content} />
                      </div>
                    )}


                    {/* Artifacts */}
                    {message.artifacts && message.artifacts.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {message.artifacts.map((artifact, index) => {
                          const key = `${message.id}-${index}`
                          const isExpanded = expandedArtifacts.has(key)

                          // D3 Chart Artifacts
                          if (artifact.type === 'd3') {
                            return (
                              <div key={index} className="w-full">
                                <button
                                  onClick={() => toggleArtifact(message.id, index)}
                                  className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors mb-2"
                                >
                                  📊 D3 Chart {isExpanded ? '▼' : '▶'}
                                </button>

                                {isExpanded && (
                                  <div className="mt-2 bg-white border border-gray-200 rounded p-4">
                                    <D3Renderer d3Code={artifact.content} />
                                  </div>
                                )}
                              </div>
                            )
                          }

                          // Plotly Chart Artifacts
                          if (artifact.type === 'plotly') {
                            return (
                              <div key={index} className="w-full">
                                <button
                                  onClick={() => toggleArtifact(message.id, index)}
                                  className="px-2 py-1 text-xs bg-green-100 text-green-600 rounded hover:bg-green-200 transition-colors mb-2"
                                >
                                  📈 Plotly Chart {isExpanded ? '▼' : '▶'}
                                </button>

                                {isExpanded && (
                                  <div className="mt-2 bg-white border border-gray-200 rounded p-4">
                                    <PlotlyRenderer plotlyCode={artifact.content} />
                                  </div>
                                )}
                              </div>
                            )
                          }

                          // Plotly HTML Artifacts
                          if (artifact.type === 'plotly-html') {
                            return (
                              <div key={index} className="w-full">
                                <button
                                  onClick={() => toggleArtifact(message.id, index)}
                                  className="px-2 py-1 text-xs bg-purple-100 text-purple-600 rounded hover:bg-purple-200 transition-colors mb-2"
                                >
                                  🌐 HTML Chart {isExpanded ? '▼' : '▶'}
                                </button>

                                {isExpanded && (
                                  <div className="mt-2 bg-white border border-gray-200 rounded p-4">
                                    <IframeWithAdjustment htmlContent={artifact.content} />
                                  </div>
                                )}
                              </div>
                            )
                          }

                          // SQL Artifacts
                          if (artifact.type === 'sql' || artifact.language === 'sql') {
                            return (
                              <div key={index} className="inline-block">
                                <button
                                  onClick={() => toggleArtifact(message.id, index)}
                                  className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                                >
                                  SQL {isExpanded ? '▼' : '▶'}
                                </button>

                                {isExpanded && (
                                  <div className="mt-2 bg-gray-50 border border-gray-200 rounded p-2">
                                    <pre className="text-xs text-gray-700 overflow-x-auto">
                                      <code>{artifact.content || artifact.code}</code>
                                    </pre>
                                  </div>
                                )}
                              </div>
                            )
                          }

                          return null
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center space-x-2 text-gray-500">
                <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                <span>AI กำลังตอบ...</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Input Area */}
      {currentSession && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white border border-gray-300 rounded-2xl shadow-lg p-4">
              <ChatInput
                value={input}
                onChange={onInputChange}
                onSend={onSendMessage}
                placeholder="พิมพ์คำถามเกี่ยวกับข้อมูล..."
                disabled={isLoading}
                useFileData={useFileData}
                onToggleFileData={onToggleFileData}
                selectedFilesCount={selectedFilesCount}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}