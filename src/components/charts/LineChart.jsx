import React from 'react'
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  Brush
} from 'recharts'

const LineChart = ({
  data = [],
  dataKey = 'value',
  nameKey = 'name',
  title = '',
  height = 300,
  colors = ['#388E3C', '#81C784', '#2E7D32', '#FF9800', '#F44336'],
  strokeWidth = 2,
  dotSize = 4,
  showDots = true,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  showArea = false,
  areaOpacity = 0.3,
  smooth = true,
  xAxisLabel = '',
  yAxisLabel = '',
  tooltipFormatter = (value) => value,
  onLineClick = null,
  multipleLines = null,
  enableBrush = false,
  brushHeight = 30
}) => {
  const safeData = Array.isArray(data) ? data : []

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-3 shadow-lg border border-secondary">
          <p className="fw-semibold text-dark mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="small mb-0" style={{ color: entry.color }}>
              {entry.name || entry.dataKey}: {tooltipFormatter(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (multipleLines && multipleLines.length > 0) {
    return (
      <div className="w-100">
        {title && <h3 className="h6 text-center fw-semibold text-dark mb-3">{title}</h3>}
        <ResponsiveContainer width="100%" height={height}>
          <RechartsLineChart data={safeData} onClick={(chartData) => onLineClick && onLineClick(chartData)}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
            <XAxis 
              dataKey={nameKey}
              label={{ value: xAxisLabel, position: 'insideBottom', offset: -5, style: { fill: '#6b7280', fontSize: 12 } }}
              tick={{ fill: '#6b7280', fontSize: 12 }}
            />
            <YAxis 
              label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', style: { fill: '#6b7280', fontSize: 12 } }}
              tick={{ fill: '#6b7280', fontSize: 12 }}
            />
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            {showLegend && <Legend wrapperStyle={{ fontSize: 12 }} />}
            {multipleLines.map((line, index) => (
              <Line
                key={line.dataKey}
                type={smooth ? 'monotone' : 'linear'}
                dataKey={line.dataKey}
                name={line.name || line.dataKey}
                stroke={line.color || colors[index % colors.length]}
                strokeWidth={strokeWidth}
                dot={showDots ? { r: dotSize } : false}
                activeDot={{ r: dotSize + 2 }}
              />
            ))}
            {enableBrush && <Brush dataKey={nameKey} height={brushHeight} stroke="#388E3C" />}
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    )
  }

  return (
    <div className="w-100">
      {title && <h3 className="h6 text-center fw-semibold text-dark mb-3">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart data={safeData} onClick={(chartData) => onLineClick && onLineClick(chartData)}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
          <XAxis 
            dataKey={nameKey}
            label={{ value: xAxisLabel, position: 'insideBottom', offset: -5, style: { fill: '#6b7280', fontSize: 12 } }}
            tick={{ fill: '#6b7280', fontSize: 12 }}
          />
          <YAxis 
            label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', style: { fill: '#6b7280', fontSize: 12 } }}
            tick={{ fill: '#6b7280', fontSize: 12 }}
          />
          {showTooltip && <Tooltip content={<CustomTooltip />} />}
          {showLegend && showLegend}
          {showArea ? (
            <Area
              type={smooth ? 'monotone' : 'linear'}
              dataKey={dataKey}
              stroke={colors[0]}
              fill={colors[0]}
              fillOpacity={areaOpacity}
              strokeWidth={strokeWidth}
              dot={showDots ? { r: dotSize } : false}
              activeDot={{ r: dotSize + 2 }}
            />
          ) : (
            <Line
              type={smooth ? 'monotone' : 'linear'}
              dataKey={dataKey}
              stroke={colors[0]}
              strokeWidth={strokeWidth}
              dot={showDots ? { r: dotSize } : false}
              activeDot={{ r: dotSize + 2 }}
            />
          )}
          {enableBrush && <Brush dataKey={nameKey} height={brushHeight} stroke="#388E3C" />}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  )
}

export const LineChartWithGradient = ({ data = [], dataKey = 'value', nameKey = 'name', title = '', height = 300, color = '#388E3C' }) => {
  const safeData = Array.isArray(data) ? data : []
  const gradientId = `line-gradient-${Math.random().toString(36).substr(2, 9)}`
  
  return (
    <div className="w-100">
      {title && <h3 className="h6 text-center fw-semibold text-dark mb-3">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart data={safeData}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey={nameKey} tick={{ fill: '#6b7280', fontSize: 12 }} />
          <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
          <Tooltip />
          <Area type="monotone" dataKey={dataKey} stroke={color} fill={`url(#${gradientId})`} strokeWidth={2} />
          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={{ r: 4, fill: color }} />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  )
}

export const MiniLineChart = ({ data = [], dataKey = 'value', color = '#388E3C', height = 60 }) => {
  const safeData = Array.isArray(data) ? data : []
  
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart data={safeData}>
        <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} isAnimationActive={true} />
      </RechartsLineChart>
    </ResponsiveContainer>
  )
}

export default LineChart