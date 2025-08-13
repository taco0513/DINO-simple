import { VisaStatus, Stay } from '@/lib/types'
import { useStore } from '@/lib/store'

interface VisaCardProps {
  status: VisaStatus
}

export default function VisaCard({ status }: VisaCardProps) {
  const stays = useStore((state) => state.stays)
  const hasSpecialKoreaVisa = status.country.code === 'KR' && 
    stays.filter(s => s.countryCode === 'KR').some(s => s.visaType === '183/365')
  
  const getStatusColor = () => {
    switch (status.status) {
      case 'danger': return 'bg-red-500'
      case 'warning': return 'bg-yellow-500'
      default: return 'bg-green-500'
    }
  }

  const getBorderColor = () => {
    switch (status.status) {
      case 'danger': return 'border-red-500 border-2'
      case 'warning': return 'border-yellow-500 border-2'
      default: return 'border-gray-200'
    }
  }

  return (
    <div className={`bg-white rounded-lg shadow p-6 border ${getBorderColor()}`}>
      <div className="flex items-center mb-4">
        <span className="text-3xl mr-3">{status.country.flag}</span>
        <div>
          <h3 className="text-lg font-semibold">{status.country.name}</h3>
          {hasSpecialKoreaVisa && (
            <span className="text-xs text-blue-600 font-medium">183/365 Special</span>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Days Used</span>
            <span className="font-medium">{status.daysUsed} / {status.maxDays}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${getStatusColor()}`}
              style={{ width: `${Math.min(100, status.percentage)}%` }}
            />
          </div>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Remaining</span>
          <span className={`font-medium ${status.remainingDays <= 7 ? 'text-red-600' : ''}`}>
            {status.remainingDays} days
          </span>
        </div>
      </div>
    </div>
  )
}