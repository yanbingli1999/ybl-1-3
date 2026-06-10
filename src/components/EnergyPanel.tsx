import { useGameStore } from '@/store/useGameStore'
import type { PowerSource } from '@/data/gameData'
import {
  Zap,
  ZapOff,
  Battery,
  BatteryCharging,
  Gauge,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  PlugZap,
  Activity,
  RefreshCw,
} from 'lucide-react'

const powerSources: { value: PowerSource; label: string; desc: string }[] = [
  { value: 'grid', label: '主电网', desc: '仅使用市电' },
  { value: 'hybrid', label: '混合模式', desc: '市电+备用电池' },
  { value: 'battery', label: '电池模式', desc: '仅使用设备电池' },
]

export default function EnergyPanel() {
  const energySystem = useGameStore(s => s.energySystem)
  const equipment = useGameStore(s => s.equipment)
  const player = useGameStore(s => s.player)
  const toggleBlackout = useGameStore(s => s.toggleBlackout)
  const setPowerSource = useGameStore(s => s.setPowerSource)
  const adjustPowerPriority = useGameStore(s => s.adjustPowerPriority)
  const chargeBatteries = useGameStore(s => s.chargeBatteries)

  const isBlackout = energySystem.gridStatus === 'offline'
  const isUnstable = energySystem.gridStatus === 'unstable'
  const gridLoadPercent = (energySystem.currentGridLoad / energySystem.totalGridCapacity) * 100
  const backupBatteryPercent = (energySystem.currentBackupBattery / energySystem.totalBackupBattery) * 100

  const getEquipmentName = (id: string) => {
    return equipment.find(e => e.id === id)?.name || id
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xs tracking-widest text-gray-400 uppercase">
          诊所能源网
        </h3>
        <button
          onClick={toggleBlackout}
          className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded transition-colors ${
            isBlackout
              ? 'bg-green-900/30 text-green-400 hover:bg-green-900/50 border border-green-700/30'
              : 'bg-red-900/30 text-red-400 hover:bg-red-900/50 border border-red-700/30'
          }`}
        >
          {isBlackout ? <Zap className="w-3 h-3" /> : <ZapOff className="w-3 h-3" />}
          {isBlackout ? '恢复供电' : '模拟断电'}
        </button>
      </div>

      <div className={`rounded-lg p-3 border ${
        isBlackout
          ? 'bg-red-900/20 border-red-800/40'
          : isUnstable
          ? 'bg-yellow-900/20 border-yellow-800/40'
          : 'bg-green-900/20 border-green-800/40'
      }`}>
        <div className="flex items-center gap-2 mb-2">
          {isBlackout ? (
            <ZapOff className="w-4 h-4 text-red-500 animate-pulse" />
          ) : isUnstable ? (
            <AlertTriangle className="w-4 h-4 text-yellow-500 animate-pulse" />
          ) : (
            <PlugZap className="w-4 h-4 text-green-500" />
          )}
          <span className={`text-xs font-medium ${
            isBlackout ? 'text-red-400' : isUnstable ? 'text-yellow-400' : 'text-green-400'
          }`}>
            {isBlackout ? '电网离线' : isUnstable ? '电网不稳定' : '电网正常'}
          </span>
        </div>

        <div className="space-y-2">
          <div>
            <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
              <span className="flex items-center gap-1">
                <Activity className="w-2.5 h-2.5" />
                电网负载
              </span>
              <span>{energySystem.currentGridLoad}/{energySystem.totalGridCapacity} kW</span>
            </div>
            <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  gridLoadPercent > 90
                    ? 'bg-red-500'
                    : gridLoadPercent > 70
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }`}
                style={{ width: `${gridLoadPercent}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
              <span className="flex items-center gap-1">
                <BatteryCharging className="w-2.5 h-2.5" />
                中央备用电池
              </span>
              <span>{energySystem.currentBackupBattery}/{energySystem.totalBackupBattery} kWh</span>
            </div>
            <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  backupBatteryPercent < 20
                    ? 'bg-red-500'
                    : backupBatteryPercent < 50
                    ? 'bg-yellow-500'
                    : 'bg-cyan-500'
                }`}
                style={{ width: `${backupBatteryPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700/30">
        <div className="flex items-center gap-1 mb-2">
          <Gauge className="w-3 h-3 text-purple-400" />
          <span className="text-xs text-purple-400">供电模式</span>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {powerSources.map(({ value, label, desc }) => (
            <button
              key={value}
              onClick={() => setPowerSource(value)}
              title={desc}
              className={`text-[9px] p-1.5 rounded transition-colors ${
                energySystem.powerSource === value
                  ? 'bg-purple-900/40 text-purple-300 border border-purple-700/40'
                  : 'bg-gray-800/50 text-gray-500 hover:text-gray-300 border border-transparent'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700/30">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            <Battery className="w-3 h-3 text-cyan-400" />
            <span className="text-xs text-cyan-400">供电优先级</span>
          </div>
          <button
            onClick={chargeBatteries}
            disabled={energySystem.gridStatus !== 'online' || player.coins < 20}
            className={`flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded ${
              energySystem.gridStatus === 'online' && player.coins >= 20
                ? 'bg-cyan-900/30 text-cyan-400 hover:bg-cyan-900/50'
                : 'bg-gray-800 text-gray-600 cursor-not-allowed'
            }`}
          >
            <RefreshCw className="w-2 h-2" />
            充满 20⬡
          </button>
        </div>
        <div className="space-y-1">
          {energySystem.powerPriority.map((equipId, index) => (
            <div
              key={equipId}
              className="flex items-center gap-2 bg-gray-900/40 rounded p-1.5"
            >
              <span className="text-[10px] text-gray-500 w-4 text-center">
                {index + 1}
              </span>
              <span className="text-[11px] text-gray-300 flex-1">
                {getEquipmentName(equipId)}
              </span>
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => adjustPowerPriority(equipId, 'up')}
                  disabled={index === 0}
                  className={`p-0.5 rounded ${
                    index === 0
                      ? 'text-gray-700 cursor-not-allowed'
                      : 'text-gray-500 hover:text-cyan-400'
                  }`}
                >
                  <ArrowUp className="w-2.5 h-2.5" />
                </button>
                <button
                  onClick={() => adjustPowerPriority(equipId, 'down')}
                  disabled={index === energySystem.powerPriority.length - 1}
                  className={`p-0.5 rounded ${
                    index === energySystem.powerPriority.length - 1
                      ? 'text-gray-700 cursor-not-allowed'
                      : 'text-gray-500 hover:text-cyan-400'
                  }`}
                >
                  <ArrowDown className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-red-900/20 rounded-lg p-2 text-center border border-red-800/20">
          <div className="text-[9px] text-red-500 mb-0.5">断电次数</div>
          <div className="font-display text-sm text-red-300">{energySystem.blackoutCount}</div>
        </div>
        <div className="bg-orange-900/20 rounded-lg p-2 text-center border border-orange-800/20">
          <div className="text-[9px] text-orange-500 mb-0.5">断电误诊</div>
          <div className="font-display text-sm text-orange-300">{energySystem.misdiagnosedDuringBlackout}</div>
        </div>
      </div>
    </div>
  )
}
