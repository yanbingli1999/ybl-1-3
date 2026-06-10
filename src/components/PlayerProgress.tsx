import { useGameStore } from '@/store/useGameStore'
import { Star, TrendingUp, AlertTriangle, Heart, RotateCcw } from 'lucide-react'

export default function PlayerProgress() {
  const player = useGameStore(s => s.player)
  const resetGame = useGameStore(s => s.resetGame)

  const expPercent = (player.exp / 100) * 100

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xs tracking-widest text-gray-400 uppercase">
          星际兽医档案
        </h3>
        <button
          onClick={resetGame}
          className="text-gray-600 hover:text-gray-400 transition-colors"
          title="重置游戏"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700/30">
        <div className="flex items-center gap-2 mb-2">
          <Star className="w-4 h-4 text-yellow-400" />
          <span className="font-display text-sm text-yellow-300">Lv.{player.level}</span>
          <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-full transition-all duration-500"
              style={{ width: `${expPercent}%` }}
            />
          </div>
          <span className="text-[10px] text-gray-500">{player.exp}/100</span>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">⬡</span>
          <span className="font-display text-xl text-cyan-300 coin-display">{player.coins}</span>
          <span className="text-xs text-gray-500">星币</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-green-900/20 rounded-lg p-2 text-center border border-green-800/20">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Heart className="w-3 h-3 text-green-400" />
              <span className="text-[10px] text-green-500">治愈</span>
            </div>
            <span className="font-display text-base text-green-300">{player.cured}</span>
          </div>
          <div className="bg-red-900/20 rounded-lg p-2 text-center border border-red-800/20">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <AlertTriangle className="w-3 h-3 text-red-400" />
              <span className="text-[10px] text-red-500">误诊</span>
            </div>
            <span className="font-display text-base text-red-300">{player.misdiagnosed}</span>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-2 bg-gray-900/40 rounded p-1.5">
          <TrendingUp className="w-3 h-3 text-cyan-500" />
          <span className="text-[10px] text-gray-400">累计收入</span>
          <span className="text-xs text-cyan-400 ml-auto">{player.totalIncome} ⬡</span>
        </div>
      </div>
    </div>
  )
}
