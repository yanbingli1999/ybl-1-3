import { useGameStore } from '@/store/useGameStore'
import { getBreed, medicines } from '@/data/gameData'
import type { ActionType } from '@/data/gameData'
import {
  Search, Pill, Syringe, UtensilsCrossed, ShieldAlert, X
} from 'lucide-react'

const actions: { type: ActionType; label: string; icon: typeof Search; color: string; bgColor: string }[] = [
  { type: 'examine', label: '检查', icon: Search, color: 'text-cyan-400', bgColor: 'from-cyan-900/40 to-cyan-800/20' },
  { type: 'medicate', label: '用药', icon: Pill, color: 'text-purple-400', bgColor: 'from-purple-900/40 to-purple-800/20' },
  { type: 'inject', label: '打针', icon: Syringe, color: 'text-green-400', bgColor: 'from-green-900/40 to-green-800/20' },
  { type: 'feed', label: '喂食', icon: UtensilsCrossed, color: 'text-orange-400', bgColor: 'from-orange-900/40 to-orange-800/20' },
  { type: 'isolate', label: '隔离', icon: ShieldAlert, color: 'text-red-400', bgColor: 'from-red-900/40 to-red-800/20' },
]

export default function TreatmentPanel() {
  const activeCaseId = useGameStore(s => s.activeCaseId)
  const cases = useGameStore(s => s.cases)
  const equipment = useGameStore(s => s.equipment)
  const gamePhase = useGameStore(s => s.gamePhase)
  const showMedicineSelector = useGameStore(s => s.showMedicineSelector)
  const pendingAction = useGameStore(s => s.pendingAction)
  const loadTestCases = useGameStore(s => s.loadTestCases)
  const examine = useGameStore(s => s.examine)
  const medicate = useGameStore(s => s.medicate)
  const inject = useGameStore(s => s.inject)
  const feed = useGameStore(s => s.feed)
  const isolate = useGameStore(s => s.isolate)
  const selectMedicine = useGameStore(s => s.selectMedicine)
  const cancelMedicineSelect = useGameStore(s => s.cancelMedicineSelect)

  const selectorTitle = pendingAction === 'feed' ? '选择食物' : pendingAction === 'inject' ? '选择注射剂' : '选择药品'

  const activeCase = cases.find(c => c.id === activeCaseId)
  const breed = activeCase ? getBreed(activeCase.breedId) : null

  if (!activeCase || !breed) return null

  const isDisabled = gamePhase === 'accident' || gamePhase === 'result'

  function isActionAvailable(type: ActionType): boolean {
    if (isDisabled) return false
    const equip = equipment.find(e => e.requiredAction === type)
    return equip?.status === 'normal'
  }

  function handleAction(type: ActionType) {
    switch (type) {
      case 'examine': examine(); break
      case 'medicate': medicate(); break
      case 'inject': inject(); break
      case 'feed': feed(); break
      case 'isolate': isolate(); break
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xs tracking-widest text-gray-400 uppercase">
          诊疗操作
        </h3>
        {activeCase.examined && (
          <span className="text-[10px] text-cyan-500 bg-cyan-900/30 px-2 py-0.5 rounded-full">
            ✓ 已检查
          </span>
        )}
      </div>

      <div className="grid grid-cols-5 gap-2">
        {actions.map(({ type, label, icon: Icon, color, bgColor }) => {
          const available = isActionAvailable(type)
          const equip = equipment.find(e => e.requiredAction === type)

          return (
            <button
              key={type}
              onClick={() => handleAction(type)}
              disabled={!available}
              className={`
                relative flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all duration-200
                bg-gradient-to-b ${bgColor}
                border ${available ? 'border-gray-700/50 hover:border-gray-600' : 'border-gray-800/30'}
                ${available ? 'hover:scale-105 hover:shadow-lg cursor-pointer' : 'opacity-40 cursor-not-allowed'}
                ${type === 'examine' && activeCase.examined ? 'ring-1 ring-cyan-700/30' : ''}
              `}
            >
              <Icon className={`w-5 h-5 ${available ? color : 'text-gray-600'}`} />
              <span className={`text-[11px] font-medium ${available ? 'text-gray-300' : 'text-gray-600'}`}>
                {label}
              </span>
              {equip?.status === 'damaged' && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              )}
            </button>
          )
        })}
      </div>

      {showMedicineSelector && (
        <div className="relative bg-gray-900/80 border border-purple-700/30 rounded-xl p-3 backdrop-blur-sm">
          <button
            onClick={cancelMedicineSelect}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-300"
          >
            <X className="w-4 h-4" />
          </button>
          <h4 className="text-xs text-purple-400 mb-2 font-display tracking-wide">{selectorTitle}</h4>
          <div className="grid grid-cols-1 gap-1.5">
            {medicines.map(med => (
              <button
                key={med.id}
                onClick={() => selectMedicine(med.id)}
                className="flex items-center gap-3 p-2 rounded-lg bg-gray-800/60 border border-gray-700/40 hover:border-purple-600/40 transition-all text-left"
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: med.color, boxShadow: `0 0 8px ${med.color}40` }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-200">{med.name}</div>
                  <div className="text-[10px] text-gray-500">{med.effect}</div>
                </div>
                <span className="text-[10px] text-yellow-500">{med.cost} ⬡</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-center py-2">
        <div className="pet-display">
          <div className={`pet-${breed.shape}`} style={{ color: breed.color }}>
            <span className="text-5xl block animate-pet-idle">{breed.emoji}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
