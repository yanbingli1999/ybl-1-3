import { useGameStore } from '@/store/useGameStore'
import { getDisease } from '@/data/gameData'
import { Wrench, CheckCircle, AlertTriangle, Loader } from 'lucide-react'

export default function EquipmentPanel() {
  const equipment = useGameStore(s => s.equipment)
  const repairEquipment = useGameStore(s => s.repairEquipment)
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

          return (
            <div
              key={equip.id}
              className={`
                flex items-center justify-between p-2 rounded-lg border
                ${isDamaged
                  ? 'bg-red-900/20 border-red-800/40'
                  : 'bg-gray-800/30 border-gray-700/30'
                }
              `}
            >
              <div className="flex items-center gap-2">
                {equip.status === 'normal' && (
                  <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                )}
                {equip.status === 'damaged' && (
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                )}
                {equip.status === 'repairing' && (
                  <Loader className="w-3.5 h-3.5 text-yellow-400 animate-spin" />
                )}
                <span className={`text-xs ${isDamaged ? 'text-red-300' : 'text-gray-300'}`}>
                  {equip.name}
                </span>
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
          )
        })}
      </div>
    </div>
  )
}
