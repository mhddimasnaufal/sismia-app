import React from 'react'
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts'

const BarChart = ({
  data = [],
  dataKey = 'value',
  nameKey = 'name',
  title = '',
  height = 300,
  colors = ['#388E3C', '#81C784', '#2E7D32', '#4CAF50', '#66BB6A'],
  barSize = 40,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  tooltipFormatter = (value) => value,
  xAxisLabel = '',
  yAxisLabel = '',
  isHorizontal = false,
  stacked = false,
  multipleBars = null,
  onBarClick = null
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

  if (multipleBars && multipleBars.length > 0) {
    return (
      <div className="w-100">
        {title && <h3 className="h6 text-center fw-semibold text-dark mb-3">{title}</h3>}
        <ResponsiveContainer width="100%" height={height}>
          <RechartsBarChart
            data={safeData}
            layout={isHorizontal ? 'vertical' : 'horizontal'}
            onClick={(chartData) => onBarClick && onBarClick(chartData)}
          >
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
            <XAxis 
              dataKey={isHorizontal ? dataKey : nameKey} 
              type={isHorizontal ? 'number' : 'category'}
              label={{ value: xAxisLabel, position: 'insideBottom', offset: -5, style: { fill: '#6b7280', fontSize: 12 } }}
              tick={{ fill: '#6b7280', fontSize: 12 }}
            />
            <YAxis 
              dataKey={isHorizontal ? nameKey : undefined}
              type={isHorizontal ? 'category' : 'number'}
              label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', style: { fill: '#6b7280', fontSize: 12 } }}
              tick={{ fill: '#6b7280', fontSize: 12 }}
            />
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            {showLegend && <Legend wrapperStyle={{ fontSize: 12 }} />}
            {multipleBars.map((bar, index) => (
              <Bar
                key={bar.dataKey}
                dataKey={bar.dataKey}
                name={bar.name || bar.dataKey}
                fill={bar.color || colors[index % colors.length]}
                stackId={stacked ? 'stack' : undefined}
                barSize={barSize}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  return (
    <div className="w-100">
      {title && <h3 className="h6 text-center fw-semibold text-dark mb-3">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart
          data={safeData}
          layout={isHorizontal ? 'vertical' : 'horizontal'}
          onClick={(chartData) => onBarClick && onBarClick(chartData)}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
          <XAxis 
            dataKey={isHorizontal ? dataKey : nameKey} 
            type={isHorizontal ? 'number' : 'category'}
            label={{ value: xAxisLabel, position: 'insideBottom', offset: -5, style: { fill: '#6b7280', fontSize: 12 } }}
            tick={{ fill: '#6b7280', fontSize: 12 }}
          />
          <YAxis 
            dataKey={isHorizontal ? nameKey : undefined}
            type={isHorizontal ? 'category' : 'number'}
            label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', style: { fill: '#6b7280', fontSize: 12 } }}
            tick={{ fill: '#6b7280', fontSize: 12 }}
          />
          {showTooltip && <Tooltip content={<CustomTooltip />} />}
          {showLegend && showLegend}
          <Bar dataKey={dataKey} fill={colors[0]} barSize={barSize} radius={[4, 4, 0, 0]}>
            {safeData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill || colors[index % colors.length]} />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  )
}

export const BarChartWithLabels = ({ data = [], dataKey = 'value', nameKey = 'name', title = '', height = 300, colors = ['#388E3C'] }) => {
  const safeData = Array.isArray(data) ? data : []
  
  const CustomBarLabel = (props) => {
    const { x, y, width, value } = props
    return (
      <text x={x + width / 2} y={y - 5} fill="#374151" textAnchor="middle" fontSize={11} fontWeight="500">
        {value}
      </text>
    )
  }

  return (
    <div className="w-100">
      {title && <h3 className="h6 text-center fw-semibold text-dark mb-3">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart data={safeData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey={nameKey} tick={{ fill: '#6b7280', fontSize: 12 }} />
          <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey={dataKey} fill={colors[0]} label={<CustomBarLabel />} radius={[4, 4, 0, 0]} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default BarChart