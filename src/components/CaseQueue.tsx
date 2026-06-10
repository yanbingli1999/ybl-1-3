import { useGameStore } from '@/store/useGameStore'
import { getBreed, getSymptomsForDisease, getDisease, getSymptom } from '@/data/gameData'
import { AlertTriangle, Clock, ChevronRight } from 'lucide-react'

export default function CaseQueue() {
  const cases = useGameStore(s => s.cases)
  const activeCaseId = useGameStore(s => s.activeCaseId)
  const selectCase = useGameStore(s => s.selectCase)
  const gamePhase = useGameStore(s => s.gamePhase)

  const waitingCases = cases.filter(c => c.status === 'waiting')

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-cyan-900/40">
        <h2 className="font-display text-sm tracking-widest text-cyan-400 uppercase">
          病例队列
        </h2>
        <p className="text-xs text-gray-500 mt-1">{waitingCases.length} 个待诊病例</p>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin">
        {waitingCases.map(c => {
          const breed = getBreed(c.breedId)
          const disease = getDisease(c.diseaseId)
          const isActive = c.id === activeCaseId
          const symptomPreview = getSymptomsForDisease(c.diseaseId)
            .slice(0, 1)
            .map(sid => getSymptom(sid))[0]

          return (
            <button
              key={c.id}
              onClick={() => selectCase(c.id)}
              disabled={gamePhase === 'accident' || gamePhase === 'result'}
              className={`
                w-full text-left rounded-lg p-3 transition-all duration-200 group relative overflow-hidden
                ${isActive
                  ? 'bg-cyan-900/30 border border-cyan-400/50 shadow-[0_0_15px_rgba(0,255,136,0.15)]'
                  : 'bg-gray-900/50 border border-gray-800 hover:border-cyan-800/50 hover:bg-gray-900/80'
                }
              `}
            >
              <div
                className={`absolute left-0 top-0 bottom-0 w-1 ${
                  c.urgency === 'high' ? 'bg-red-500' : c.urgency === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                }`}
              />
              <div className="flex items-center gap-3 pl-2">
                <span className="text-2xl">{breed?.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-200 truncate">
                      {c.petName}
                    </span>
                    <span className="text-xs text-gray-500">{breed?.name}</span>
                    {c.urgency === 'high' && (
                      <AlertTriangle className="w-3 h-3 text-red-400 animate-pulse" />
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5 truncate">
                    {c.examined ? disease?.description : (symptomPreview?.description || '未检查')}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 transition-colors" />
              </div>
              <div className="flex items-center gap-2 mt-1.5 pl-2">
                {c.urgency === 'high' && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] text-red-400 bg-red-900/30 px-1.5 py-0.5 rounded">
                    <AlertTriangle className="w-2.5 h-2.5" />紧急
                  </span>
                )}
                {c.urgency === 'medium' && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] text-yellow-400 bg-yellow-900/30 px-1.5 py-0.5 rounded">
                    <Clock className="w-2.5 h-2.5" />一般
                  </span>
                )}
                {c.examined && (
                  <span className="text-[10px] text-cyan-400 bg-cyan-900/30 px-1.5 py-0.5 rounded">
                    已检查
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
