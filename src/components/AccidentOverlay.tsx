import { useGameStore } from '@/store/useGameStore'
import { getMedicine, type AccidentType } from '@/data/gameData'

export default function AccidentOverlay() {
  const accidentType = useGameStore(s => s.accidentType)
  const diagnosisResult = useGameStore(s => s.diagnosisResult)
  const dismissAccident = useGameStore(s => s.dismissAccident)
  const gamePhase = useGameStore(s => s.gamePhase)

  if (gamePhase !== 'accident' || !accidentType) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => dismissAccident()}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm accident-overlay-bg" />
      <div className="relative z-10 flex flex-col items-center">
        <AccidentAnimation type={accidentType} />
        <div className="mt-6 text-center max-w-md">
          <h2 className="font-display text-2xl text-red-400 tracking-wider glitch-text mb-2">
            ⚠ 医疗事故 ⚠
          </h2>
          <p className="text-sm text-gray-300 mb-1">
            {diagnosisResult?.message}
          </p>
          {diagnosisResult?.damagedEquipment && (
            <p className="text-xs text-orange-400 mt-2">
              🔧 设备已损坏，请尽快维修！
            </p>
          )}
          {diagnosisResult?.errorType === 'medicine' && diagnosisResult.correctMedicine && (
            <p className="text-xs text-purple-400 mt-1">
              💊 正确药品：{(() => { const m = getMedicine(diagnosisResult.correctMedicine!); return m?.name; })()}
            </p>
          )}
          <p className="text-xs text-red-400 mt-2">
            星币 {diagnosisResult?.coinsEarned} ⬡
          </p>
          <p className="text-[10px] text-gray-600 mt-4 animate-pulse">点击任意处继续</p>
        </div>
      </div>
    </div>
  )
}

function AccidentAnimation({ type }: { type: AccidentType }) {
  switch (type) {
    case 'split':
      return <SplitAnimation />
    case 'float':
      return <FloatAnimation />
    case 'bite':
      return <BiteAnimation />
  }
}

function SplitAnimation() {
  return (
    <div className="relative w-40 h-40">
      <div className="absolute inset-0 flex items-center justify-center accident-split-left">
        <span className="text-7xl">🟢</span>
      </div>
      <div className="absolute inset-0 flex items-center justify-center accident-split-right">
        <span className="text-7xl">🟢</span>
      </div>
      <div className="absolute inset-0 flex items-center justify-center accident-split-center">
        <span className="text-5xl">💥</span>
      </div>
    </div>
  )
}

function FloatAnimation() {
  return (
    <div className="relative w-40 h-40">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 accident-float-up">
        <span className="text-7xl block">🟠</span>
      </div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2">
        <span className="text-3xl block animate-pulse">☁️</span>
      </div>
      {[0, 1, 2].map(i => (
        <div
          key={i}
          className="absolute bottom-2 left-1/2 accident-bubble"
          style={{ animationDelay: `${i * 300}ms` }}
        >
          <span className="text-lg">💫</span>
        </div>
      ))}
    </div>
  )
}

function BiteAnimation() {
  return (
    <div className="relative w-48 h-40">
      <div className="absolute left-2 top-1/2 -translate-y-1/2 accident-bite-pet">
        <span className="text-6xl block">🟣</span>
      </div>
      <div className="absolute right-0 top-1/2 -translate-y-1/2">
        <div className="relative">
          <span className="text-5xl block">⚙️</span>
          <div className="absolute inset-0 flex items-center justify-center accident-bite-crack">
            <span className="text-2xl">💥</span>
          </div>
        </div>
      </div>
      <div className="absolute right-6 top-1/4 accident-bite-jaw">
        <span className="text-3xl">🦷</span>
      </div>
    </div>
  )
}
