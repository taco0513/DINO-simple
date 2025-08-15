'use client'

interface DonutChartProps {
  value: number
  total: number
  size?: number
  strokeWidth?: number
  colors?: {
    progress: string
    background: string
  }
  label?: string
  showPercentage?: boolean
  className?: string
}

export default function DonutChart({
  value,
  total,
  size = 80,
  strokeWidth = 6,
  colors = {
    progress: '#3b82f6',
    background: '#e5e7eb'
  },
  label,
  showPercentage = true,
  className = ''
}: DonutChartProps) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0
  
  // Calculate circle properties
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (circumference * percentage) / 100
  
  // Center coordinates
  const center = size / 2

  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke={colors.background}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          
          {/* Progress circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke={colors.progress}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-300 ease-in-out"
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            {showPercentage && (
              <div className="text-xs font-semibold text-gray-900">
                {percentage}%
              </div>
            )}
            {label && (
              <div className="text-[10px] text-gray-500 leading-tight">
                {label}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Optional bottom label */}
      {label && !showPercentage && (
        <div className="mt-1 text-xs text-gray-600 text-center max-w-[80px] truncate">
          {label}
        </div>
      )}
    </div>
  )
}