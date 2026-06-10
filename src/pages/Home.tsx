import CaseQueue from '@/components/CaseQueue'
import SymptomCard from '@/components/SymptomCard'
import TreatmentPanel from '@/components/TreatmentPanel'
import AccidentOverlay from '@/components/AccidentOverlay'
import EquipmentPanel from '@/components/EquipmentPanel'
import PlayerProgress from '@/components/PlayerProgress'
import DiagnosisResult from '@/components/DiagnosisResult'
import { useGameStore } from '@/store/useGameStore'
import { getBreed } from '@/data/gameData'
import { Cross, Zap, FlaskConical } from 'lucide-react'

export default function Home() {
  const activeCaseId = useGameStore(s => s.activeCaseId)
  const cases = useGameStore(s => s.cases)
  const generateNewCase = useGameStore(s => s.generateNewCase)
  const loadTestCases = useGameStore(s => s.loadTestCases)
  const resetGame = useGameStore(s => s.resetGame)

  const activeCase = cases.find(c => c.id === activeCaseId)
  const breed = activeCase ? getBreed(activeCase.breedId) : null

  return (
    <div className="h-screen w-screen bg-deep-space text-gray-100 overflow-hidden flex flex-col">
      <header className="flex items-center justify-between px-6 py-3 border-b border-cyan-900/30 bg-gray-950/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Cross className="w-5 h-5 text-cyan-400" />
            <h1 className="font-display text-lg tracking-widest text-cyan-300">
              外星宠物诊所
            </h1>
          </div>
          <span className="text-[10px] text-gray-600 hidden sm:inline">
            ALIEN PET CLINIC v2.7
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>在线</span>
          </div>
          <button
            onClick={loadTestCases}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-900/30 border border-purple-700/30 text-purple-400 text-xs hover:bg-purple-900/50 transition-colors"
          >
            <FlaskConical className="w-3 h-3" />
            测试病例
          </button>
          <button
            onClick={generateNewCase}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-900/30 border border-cyan-700/30 text-cyan-400 text-xs hover:bg-cyan-900/50 transition-colors"
          >
            <Zap className="w-3 h-3" />
            新病例
          </button>
          <button
            onClick={resetGame}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-900/30 border border-red-700/30 text-red-400 text-xs hover:bg-red-900/50 transition-colors"
          >
            重置游戏
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-64 flex-shrink-0 border-r border-cyan-900/30 bg-gray-950/40">
          <CaseQueue />
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4">
            <div className="max-w-2xl mx-auto space-y-4">
              {activeCase ? (
                <>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{breed?.emoji}</span>
                    <div>
                      <h2 className="font-display text-lg text-cyan-200 tracking-wide">
                        {activeCase.petName} — {breed?.name}
                      </h2>
                      <p className="text-xs text-gray-500">病例 #{activeCase.id.slice(-6)}</p>
                    </div>
                  </div>
                  <SymptomCard />
                  <TreatmentPanel />
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                  <div className="relative mb-6">
                    <span className="text-8xl block animate-pet-idle">🟢</span>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-20 h-3 bg-green-500/20 rounded-full blur-md" />
                  </div>
                  <h2 className="font-display text-xl text-gray-500 tracking-wider mb-2">
                    等待接诊
                  </h2>
                  <p className="text-sm text-gray-600 max-w-xs">
                    从左侧病例队列中选择一个外星宠物开始诊断治疗
                  </p>
                  <div className="mt-6 flex items-center gap-4 text-xs text-gray-700">
                    <span>📋 查看症状</span>
                    <span>→</span>
                    <span>🔍 检查诊断</span>
                    <span>→</span>
                    <span>💊 治疗处理</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        <aside className="w-56 flex-shrink-0 border-l border-cyan-900/30 bg-gray-950/40 p-4 space-y-4 overflow-y-auto">
          <PlayerProgress />
          <div className="border-t border-gray-800/50 pt-4">
            <EquipmentPanel />
          </div>
        </aside>
      </div>

      <AccidentOverlay />
      <DiagnosisResult />
    </div>
  )
}
