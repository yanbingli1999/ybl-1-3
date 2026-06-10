import { useGameStore } from '@/store/useGameStore'
import { Wrench, CheckCircle, AlertTriangle, Loader, Zap, Battery } from 'lucide-react'

export default function EquipmentPanel() {
  const equipment = useGameStore(s => s.equipment)
  const repairEquipment = useGameStore(s => s.repairEquipment)
  const canEquipmentRun = useGameStore(s => s.canEquipmentRun)
  const player = useGameStore(s => s.player)

  return (
    <div className="space-y-2">
      <h3 className="font-display text-xs tracking-widest text-gray-400 uppercase">
        设备状态
      </h3>
      <div className="space-y-1.5">
        {equipment.map(equip => {
          const isDamaged = equip.status === 'damaged'
          const canRepair = isDamaged && player.coins >= equip.repairCost
          const isOverloaded = equip.currentLoad > equip.overloadThreshold
          const isRunning = equip.currentLoad > 0
          const batteryPercent = (equip.batteryLevel / equip.batteryCapacity) * 100
          const hasPower = canEquipmentRun(equip.id)

          return (
            <div
              key={equip.id}
              className={`
                p-2 rounded-lg border
                ${isDamaged
                  ? 'bg-red-900/20 border-red-800/40'
                  : isOverloaded
                  ? 'bg-orange-900/20 border-orange-800/40'
                  : !hasPower
                  ? 'bg-yellow-900/10 border-yellow-800/30'
                  : 'bg-gray-800/30 border-gray-700/30'
                }
              `}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  {equip.status === 'normal' && (
                    <CheckCircle className={`w-3.5 h-3.5 ${hasPower ? 'text-green-500' : 'text-yellow-500'}`} />
                  )}
                  {equip.status === 'damaged' && (
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                  )}
                  {equip.status === 'repairing' && (
                    <Loader className="w-3.5 h-3.5 text-yellow-400 animate-spin" />
                  )}
                  <span className={`text-xs ${isDamaged ? 'text-red-300' : !hasPower ? 'text-yellow-300' : 'text-gray-300'}`}>
                    {equip.name}
                  </span>
                  {isRunning && (
                    <span className="flex items-center gap-0.5 text-[9px] text-cyan-400">
                      <Zap className="w-2.5 h-2.5 animate-pulse" />
                      {equip.currentLoad}kW
                    </span>
                  )}
                  {isOverloaded && (
                    <span className="text-[9px] text-orange-400 animate-pulse">
                      ⚠️ 过载
                    </span>
                  )}
                  {!hasPower && !isDamaged && (
                    <span className="text-[9px] text-yellow-400">
                      低电
                    </span>
                  )}
                </div>
                {isDamaged && (
                  <button
                    onClick={() => canRepair && repairEquipment(equip.id)}
                    disabled={!canRepair}
                    className={`
                      flex items-center gap-1 text-[10px] px-2 py-0.5 rounded
                      ${canRepair
                        ? 'bg-yellow-900/40 text-yellow-300 hover:bg-yellow-900/60 cursor-pointer'
                        : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                      }
                    `}
                  >
                    <Wrench className="w-2.5 h-2.5" />
                    {equip.repairCost} ⬡
                  </button>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[9px] text-gray-500">
                  <span className="flex items-center gap-0.5">
                    <Zap className="w-2 h-2" />
                    功率 {equip.powerConsumption}kW / 阈值 {equip.overloadThreshold}kW
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Battery className={`w-2.5 h-2.5 ${
                    batteryPercent < 20 ? 'text-red-500' :
                    batteryPercent < 50 ? 'text-yellow-500' : 'text-green-500'
                  }`} />
                  <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        batteryPercent < 20 ? 'bg-red-500' :
                        batteryPercent < 50 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${batteryPercent}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-gray-500 w-8 text-right">
                    {equip.batteryLevel}/{equip.batteryCapacity}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
