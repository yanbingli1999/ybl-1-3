import { useGameStore } from '@/store/useGameStore'
import { getBreed, getSymptom, getDisease, getSymptomsForDisease } from '@/data/gameData'
import { Activity, Scan } from 'lucide-react'

export default function SymptomCard() {
  const activeCaseId = useGameStore(s => s.activeCaseId)
  const cases = useGameStore(s => s.cases)
  const gamePhase = useGameStore(s => s.gamePhase)

  const activeCase = cases.find(c => c.id === activeCaseId)

  if (!activeCase) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-600">
        <Scan className="w-12 h-12 mb-3 opacity-30" />
        <p className="text-sm">从左侧选择一个病例开始诊断</p>
      </div>
    )
  }

  const breed = getBreed(activeCase.breedId)
  const disease = getDisease(activeCase.diseaseId)
  const caseSymptoms = activeCase.symptomIds.map(sid => getSymptom(sid)).filter(Boolean)
  const diseaseSymptomIds = getSymptomsForDisease(activeCase.diseaseId)

  return (
    <div className="relative overflow-hidden rounded-xl border border-cyan-800/30 bg-gray-900/60 backdrop-blur-sm">
      <div className="scan-line" />
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{breed?.emoji}</span>
            <div>
              <h3 className="font-display text-base text-cyan-300 tracking-wide">
                {activeCase.petName}
              </h3>
              <p className="text-xs text-gray-500">{breed?.name}</p>
            </div>
          </div>
          <div className={`
            px-2 py-1 rounded text-xs font-medium
            ${activeCase.urgency === 'high' ? 'bg-red-900/50 text-red-300' :
              activeCase.urgency === 'medium' ? 'bg-yellow-900/50 text-yellow-300' :
              'bg-green-900/50 text-green-300'}
          `}>
            {activeCase.urgency === 'high' ? '⚠ 紧急' :
             activeCase.urgency === 'medium' ? '◉ 一般' : '✦ 轻微'}
          </div>
        </div>

        <div className="space-y-2 mb-3">
          <h4 className="text-[10px] uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
            <Activity className="w-3 h-3" />症状列表
          </h4>
          {caseSymptoms.map((symptom, i) => (
            <div
              key={symptom!.id}
              className="symptom-item bg-gray-800/60 rounded-lg p-3 border border-gray-700/50"
              style={{ animationDelay: `${i * 150}ms` }}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-200 font-medium">
                  {symptom!.name}
                </span>
                {!activeCase.examined && !diseaseSymptomIds.includes(symptom!.id) && (
                  <span className="text-[9px] text-gray-600 bg-gray-800 px-1.5 py-0.5 rounded">
                    干扰项
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1">{symptom!.description}</p>
              <div className="flex items-center gap-1.5 mt-2">
                <div className="h-1 flex-1 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-500/60 rounded-full vital-bar"
                    style={{ width: `${60 + Math.random() * 35}%` }}
                  />
                </div>
                <span className="text-[10px] text-cyan-400 font-mono">{symptom!.vitals}</span>
              </div>
            </div>
          ))}
        </div>

        {activeCase.examined && disease && (
          <div className="mt-3 p-3 rounded-lg bg-cyan-900/20 border border-cyan-700/30">
            <h4 className="text-[10px] uppercase tracking-widest text-cyan-500 mb-1.5 flex items-center gap-1">
              <Scan className="w-3 h-3" />深度扫描结果
            </h4>
            <p className="text-xs text-cyan-300">
              检测到疑似疾病：<span className="text-cyan-200 font-semibold">{disease.name}</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">{disease.description}</p>
            <p className="text-xs text-gray-500 mt-1.5 italic">
              建议操作：{
                disease.correctAction === 'medicate' ? '使用对应药品口服' :
                disease.correctAction === 'inject' ? '使用对应药品注射' :
                disease.correctAction === 'feed' ? '喂食特殊饲料' :
                disease.correctAction === 'isolate' ? '立即隔离观察' :
                '需要进一步检查'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
