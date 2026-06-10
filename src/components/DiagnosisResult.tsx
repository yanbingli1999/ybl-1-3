import { useGameStore } from '@/store/useGameStore'
import { getMedicine } from '@/data/gameData'
import { CheckCircle, XCircle, ArrowRight, Pill, AlertCircle, Coins } from 'lucide-react'

export default function DiagnosisResult() {
  const diagnosisResult = useGameStore(s => s.diagnosisResult)
  const dismissResult = useGameStore(s => s.dismissResult)
  const gamePhase = useGameStore(s => s.gamePhase)

  if (gamePhase !== 'result' || !diagnosisResult) return null

  const actionLabels: Record<string, string> = {
    examine: '检查',
    medicate: '用药',
    inject: '打针',
    feed: '喂食',
    isolate: '隔离',
  }

  const usedMed = diagnosisResult.medicineUsed ? getMedicine(diagnosisResult.medicineUsed) : null
  const correctMed = diagnosisResult.correctMedicine ? getMedicine(diagnosisResult.correctMedicine) : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative z-10 bg-gray-900 border border-cyan-700/30 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl shadow-cyan-900/20">
        <div className="text-center">
          {diagnosisResult.success ? (
            <>
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-green-900/30 border border-green-600/30 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="font-display text-xl text-green-400 tracking-wider mb-1">
                治疗成功！
              </h2>
              <p className="text-sm text-gray-300 mb-3">{diagnosisResult.message}</p>
              <div className="bg-green-900/20 rounded-lg p-3 border border-green-800/20 space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl">⬡</span>
                  <span className={`font-display text-2xl ${diagnosisResult.coinsEarned >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                    {diagnosisResult.coinsEarned >= 0 ? '+' : ''}{diagnosisResult.coinsEarned}
                  </span>
                </div>
                {diagnosisResult.medicineCost > 0 && (
                  <div className="flex items-center justify-center gap-1 text-[10px] text-gray-500">
                    <span>收入 {diagnosisResult.coinsEarned + diagnosisResult.medicineCost} ⬡</span>
                    <span>−</span>
                    <span className="text-red-400">药品费 {diagnosisResult.medicineCost} ⬡</span>
                  </div>
                )}
                {usedMed && (
                  <div className="flex items-center justify-center gap-1.5 text-[10px] text-purple-400">
                    <Pill className="w-2.5 h-2.5" />
                    <span>使用：{usedMed.name}</span>
                  </div>
                )}
              </div>
            </>
          ) : diagnosisResult.errorType === 'funds' ? (
            <>
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-yellow-900/30 border border-yellow-600/30 flex items-center justify-center">
                <Coins className="w-8 h-8 text-yellow-400" />
              </div>
              <h2 className="font-display text-xl text-yellow-400 tracking-wider mb-1">
                星币不足
              </h2>
              <p className="text-sm text-gray-300 mb-3">{diagnosisResult.message}</p>
              <div className="bg-yellow-900/20 rounded-lg p-3 border border-yellow-800/20">
                <p className="text-xs text-yellow-300">
                  请赚取更多星币后再尝试，或选择其他治疗方式
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-red-900/30 border border-red-600/30 flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="font-display text-xl text-red-400 tracking-wider mb-1">
                治疗失败
              </h2>
              <p className="text-sm text-gray-300 mb-3">{diagnosisResult.message}</p>
              <div className="bg-gray-800/60 rounded-lg p-3 border border-gray-700/30 space-y-2">
                {diagnosisResult.errorType === 'action' && (
                  <div className="flex items-center justify-center gap-2 text-xs">
                    <span className="text-red-400">{actionLabels[diagnosisResult.actionTaken]}</span>
                    <ArrowRight className="w-3 h-3 text-gray-600" />
                    <span className="text-green-400">{actionLabels[diagnosisResult.correctAction]}</span>
                  </div>
                )}
                {diagnosisResult.errorType === 'medicine' && usedMed && correctMed && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-2 text-xs">
                      <Pill className="w-3 h-3 text-red-400" />
                      <span className="text-red-400">{usedMed.name}</span>
                      <ArrowRight className="w-3 h-3 text-gray-600" />
                      <Pill className="w-3 h-3 text-green-400" />
                      <span className="text-green-400">{correctMed.name}</span>
                    </div>
                    <p className="text-[10px] text-gray-500">药品用错了</p>
                  </div>
                )}
                <div className="flex items-center justify-center gap-1 text-[10px] text-red-400 pt-1 border-t border-gray-700/50">
                  <AlertCircle className="w-2.5 h-2.5" />
                  <span>罚款 {Math.abs(diagnosisResult.coinsEarned)} ⬡</span>
                </div>
              </div>
            </>
          )}

          <button
            onClick={dismissResult}
            className="mt-4 w-full py-2.5 rounded-lg bg-cyan-900/30 border border-cyan-700/30 text-cyan-300 text-sm font-display tracking-wide hover:bg-cyan-900/50 transition-colors"
          >
            继续诊疗
          </button>
        </div>
      </div>
    </div>
  )
}
