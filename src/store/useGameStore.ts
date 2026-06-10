import { create } from 'zustand'
import {
  type PetCase,
  type Player,
  type Equipment,
  type GamePhase,
  type DiagnosisResult,
  type ActionType,
  type AccidentType,
  type EnergySystem,
  type PowerSource,
  initialEquipment,
  initialEnergySystem,
  generatePetCase,
  generateInitialCases,
  generateTestCases,
  getDisease,
  getMedicine,
} from '@/data/gameData'

interface GameState {
  cases: PetCase[]
  activeCaseId: string | null
  player: Player
  equipment: Equipment[]
  energySystem: EnergySystem
  gamePhase: GamePhase
  accidentType: AccidentType | null
  diagnosisResult: DiagnosisResult | null
  actionCooldowns: Record<ActionType, number>
  selectedMedicineId: string | null
  showMedicineSelector: boolean
  pendingAction: 'medicate' | 'inject' | 'feed' | null

  selectCase: (id: string) => void
  examine: () => void
  medicate: () => void
  inject: () => void
  feed: () => void
  isolate: () => void
  selectMedicine: (id: string) => void
  cancelMedicineSelect: () => void
  performTreatment: (action: ActionType, medicineId?: string | null) => void
  repairEquipment: (id: string) => void
  dismissResult: () => void
  dismissAccident: () => void
  generateNewCase: () => void
  loadTestCases: () => void
  resetGame: () => void

  toggleBlackout: () => void
  restorePower: () => void
  setPowerSource: (source: PowerSource) => void
  adjustPowerPriority: (equipmentId: string, direction: 'up' | 'down') => void
  chargeBatteries: () => void
  canEquipmentRun: (equipmentId: string) => boolean
}

const initialPlayer: Player = {
  coins: 200,
  level: 1,
  exp: 0,
  cured: 0,
  misdiagnosed: 0,
  totalIncome: 0,
}

const expPerLevel = 100

function getCoinsForUrgency(urgency: PetCase['urgency']): number {
  switch (urgency) {
    case 'low': return 30
    case 'medium': return 50
    case 'high': return 80
  }
}

function getPenaltyForAccident(urgency: PetCase['urgency']): number {
  switch (urgency) {
    case 'low': return 20
    case 'medium': return 35
    case 'high': return 60
  }
}

function getActionLabel(action: ActionType): string {
  switch (action) {
    case 'examine': return '检查'
    case 'medicate': return '用药'
    case 'inject': return '打针'
    case 'feed': return '喂食'
    case 'isolate': return '隔离'
  }
}

function calculateGridLoad(equipment: Equipment[]): number {
  return equipment.reduce((sum, e) => sum + e.currentLoad, 0)
}

function hasEnoughPower(
  equip: Equipment,
  energySystem: EnergySystem,
  equipment: Equipment[]
): boolean {
  if (energySystem.gridStatus === 'online' && energySystem.powerSource !== 'battery') {
    const currentLoad = calculateGridLoad(
      equipment.filter(e => e.id !== equip.id)
    )
    return currentLoad + equip.powerConsumption <= energySystem.totalGridCapacity
  }

  if (energySystem.powerSource !== 'grid') {
    if (equip.batteryLevel >= equip.powerConsumption) return true
    if (energySystem.currentBackupBattery >= equip.powerConsumption) return true
  }

  return false
}

export const useGameStore = create<GameState>((set, get) => ({
  cases: generateInitialCases(5),
  activeCaseId: null,
  player: { ...initialPlayer },
  equipment: initialEquipment.map(e => ({ ...e })),
  energySystem: { ...initialEnergySystem },
  gamePhase: 'idle',
  accidentType: null,
  diagnosisResult: null,
  actionCooldowns: {
    examine: 0,
    medicate: 0,
    inject: 0,
    feed: 0,
    isolate: 0,
  },
  selectedMedicineId: null,
  showMedicineSelector: false,
  pendingAction: null,

  canEquipmentRun: (equipmentId: string) => {
    const state = get()
    const equip = state.equipment.find(e => e.id === equipmentId)
    if (!equip || equip.status !== 'normal') return false
    return hasEnoughPower(equip, state.energySystem, state.equipment)
  },

  selectCase: (id: string) => {
    const state = get()
    if (state.gamePhase === 'accident' || state.gamePhase === 'result') return
    set({
      activeCaseId: id,
      gamePhase: 'diagnosing',
      showMedicineSelector: false,
      selectedMedicineId: null,
      pendingAction: null,
    })
  },

  examine: () => {
    const state = get()
    const activeCase = state.cases.find(c => c.id === state.activeCaseId)
    if (!activeCase) return

    const scanner = state.equipment.find(e => e.requiredAction === 'examine')
    if (scanner?.status !== 'normal') return
    if (state.actionCooldowns.examine > Date.now()) return

    const isBlackout = state.energySystem.gridStatus === 'offline'
    const hasPower = get().canEquipmentRun(scanner.id)
    if (!hasPower) return

    let updatedEquipment = [...state.equipment]
    let updatedEnergy = { ...state.energySystem }

    if (isBlackout) {
      if (scanner.batteryLevel >= scanner.powerConsumption) {
        updatedEquipment = updatedEquipment.map(e =>
          e.id === scanner.id
            ? { ...e, batteryLevel: e.batteryLevel - scanner.powerConsumption, currentLoad: scanner.powerConsumption }
            : e
        )
      } else if (updatedEnergy.currentBackupBattery >= scanner.powerConsumption) {
        updatedEnergy.currentBackupBattery -= scanner.powerConsumption
        updatedEquipment = updatedEquipment.map(e =>
          e.id === scanner.id ? { ...e, currentLoad: scanner.powerConsumption } : e
        )
      }
    } else if (updatedEnergy.powerSource === 'battery') {
      if (scanner.batteryLevel >= scanner.powerConsumption) {
        updatedEquipment = updatedEquipment.map(e =>
          e.id === scanner.id
            ? { ...e, batteryLevel: e.batteryLevel - scanner.powerConsumption, currentLoad: scanner.powerConsumption }
            : e
        )
      } else {
        return
      }
    } else {
      updatedEquipment = updatedEquipment.map(e =>
        e.id === scanner.id ? { ...e, currentLoad: scanner.powerConsumption } : e
      )
      if (updatedEnergy.powerSource === 'hybrid' && scanner.batteryLevel < scanner.batteryCapacity) {
        updatedEquipment = updatedEquipment.map(e =>
          e.id === scanner.id
            ? { ...e, batteryLevel: Math.min(e.batteryCapacity, e.batteryLevel + 2) }
            : e
        )
      }
    }

    updatedEnergy.currentGridLoad = calculateGridLoad(updatedEquipment)

    const isOverloaded = updatedEquipment.some(
      e => e.currentLoad > e.overloadThreshold
    )

    const updatedCases = state.cases.map(c =>
      c.id === activeCase.id ? { ...c, examined: true } : c
    )

    setTimeout(() => {
      set(state => ({
        equipment: state.equipment.map(e => ({ ...e, currentLoad: 0 })),
        energySystem: { ...state.energySystem, currentGridLoad: 0 },
      }))
    }, 2000)

    set({
      cases: updatedCases,
      equipment: updatedEquipment,
      energySystem: updatedEnergy,
      actionCooldowns: { ...state.actionCooldowns, examine: Date.now() + 3000 },
    })
  },

  medicate: () => {
    set({ showMedicineSelector: true, pendingAction: 'medicate' })
  },

  inject: () => {
    set({ showMedicineSelector: true, pendingAction: 'inject' })
  },

  feed: () => {
    set({ showMedicineSelector: true, pendingAction: 'feed' })
  },

  isolate: () => {
    get().performTreatment('isolate')
  },

  selectMedicine: (id: string) => {
    const state = get()
    const action = state.pendingAction
    if (!action) return

    const medicine = getMedicine(id)
    if (medicine && state.player.coins < medicine.cost) {
      const activeCase = state.cases.find(c => c.id === state.activeCaseId)
      if (!activeCase) return

      const disease = getDisease(activeCase.diseaseId)
      const itemType = action === 'feed' ? '食物' : '药品'
      const result: DiagnosisResult = {
        success: false,
        diseaseName: disease?.name || '',
        actionTaken: action,
        correctAction: disease?.correctAction || 'medicate',
        medicineUsed: id,
        correctMedicine: disease?.medicineId || null,
        coinsEarned: 0,
        medicineCost: medicine.cost,
        accidentType: null,
        damagedEquipment: null,
        message: `星币不足！${medicine.name} 需要 ${medicine.cost} ⬡，你只有 ${state.player.coins} ⬡`,
        errorType: 'funds',
      }

      set({
        gamePhase: 'result',
        diagnosisResult: result,
        showMedicineSelector: false,
        selectedMedicineId: null,
        pendingAction: null,
      })
      return
    }

    get().performTreatment(action, id)
  },

  cancelMedicineSelect: () => {
    set({ showMedicineSelector: false, selectedMedicineId: null, pendingAction: null })
  },

  performTreatment: (action: ActionType, medicineId?: string | null) => {
    const state = get()
    const activeCase = state.cases.find(c => c.id === state.activeCaseId)
    if (!activeCase) return

    const disease = getDisease(activeCase.diseaseId)
    if (!disease) return

    const requiredEquip = state.equipment.find(e => e.requiredAction === action)
    if (requiredEquip?.status !== 'normal') return

    const isBlackout = state.energySystem.gridStatus === 'offline'
    const hasPower = get().canEquipmentRun(requiredEquip.id)
    if (!hasPower) return

    let updatedEquipment = [...state.equipment]
    let updatedEnergy = { ...state.energySystem }

    if (isBlackout) {
      if (requiredEquip.batteryLevel >= requiredEquip.powerConsumption) {
        updatedEquipment = updatedEquipment.map(e =>
          e.id === requiredEquip.id
            ? { ...e, batteryLevel: e.batteryLevel - requiredEquip.powerConsumption, currentLoad: requiredEquip.powerConsumption }
            : e
        )
      } else if (updatedEnergy.currentBackupBattery >= requiredEquip.powerConsumption) {
        updatedEnergy.currentBackupBattery -= requiredEquip.powerConsumption
        updatedEquipment = updatedEquipment.map(e =>
          e.id === requiredEquip.id ? { ...e, currentLoad: requiredEquip.powerConsumption } : e
        )
      }
    } else if (updatedEnergy.powerSource === 'battery') {
      if (requiredEquip.batteryLevel >= requiredEquip.powerConsumption) {
        updatedEquipment = updatedEquipment.map(e =>
          e.id === requiredEquip.id
            ? { ...e, batteryLevel: e.batteryLevel - requiredEquip.powerConsumption, currentLoad: requiredEquip.powerConsumption }
            : e
        )
      } else {
        return
      }
    } else {
      updatedEquipment = updatedEquipment.map(e =>
        e.id === requiredEquip.id ? { ...e, currentLoad: requiredEquip.powerConsumption } : e
      )
      if (updatedEnergy.powerSource === 'hybrid' && requiredEquip.batteryLevel < requiredEquip.batteryCapacity) {
        updatedEquipment = updatedEquipment.map(e =>
          e.id === requiredEquip.id
            ? { ...e, batteryLevel: Math.min(e.batteryCapacity, e.batteryLevel + 3) }
            : e
        )
      }
    }

    updatedEnergy.currentGridLoad = calculateGridLoad(updatedEquipment)

    const isOverloaded = updatedEquipment.some(
      e => e.currentLoad > e.overloadThreshold
    )

    setTimeout(() => {
      set(state => ({
        equipment: state.equipment.map(e => ({ ...e, currentLoad: 0 })),
        energySystem: { ...state.energySystem, currentGridLoad: 0 },
      }))
    }, 2000)

    const actionCorrect = action === disease.correctAction
    const needsMedicine = disease.medicineId !== null
    const medicine = medicineId ? getMedicine(medicineId) : null
    const medicineCorrect = !needsMedicine || (medicineId !== undefined && medicineId === disease.medicineId)
    const medicineCost = medicine?.cost || 0

    let errorType: 'action' | 'medicine' | null = null
    if (!actionCorrect) errorType = 'action'
    else if (actionCorrect && !medicineCorrect) errorType = 'medicine'

    const blackoutForcedMisdiagnosis = isBlackout && Math.random() < 0.4

    const isCorrect = actionCorrect && medicineCorrect && !blackoutForcedMisdiagnosis

    if (isCorrect) {
      const coinsEarned = getCoinsForUrgency(activeCase.urgency)
      const expGain = activeCase.urgency === 'high' ? 30 : activeCase.urgency === 'medium' ? 20 : 10
      const netCoins = coinsEarned - medicineCost
      const newExp = state.player.exp + expGain
      const levelUp = newExp >= expPerLevel
      const newLevel = levelUp ? state.player.level + 1 : state.player.level
      const newExpAfterLevel = levelUp ? newExp - expPerLevel : newExp

      const updatedCases = state.cases.map(c =>
        c.id === activeCase.id ? { ...c, status: 'cured' as const } : c
      )

      const itemType = action === 'feed' ? '食物' : action === 'inject' ? '注射剂' : '药品'
      let message = `诊断正确！${activeCase.petName} 的「${disease.name}」已治愈！`
      if (medicineCost > 0) {
        message += `（扣除${itemType}费 ${medicineCost} ⬡）`
      }

      const result: DiagnosisResult = {
        success: true,
        diseaseName: disease.name,
        actionTaken: action,
        correctAction: disease.correctAction,
        medicineUsed: medicineId || null,
        correctMedicine: disease.medicineId,
        coinsEarned: netCoins,
        medicineCost,
        accidentType: null,
        damagedEquipment: null,
        message,
        errorType: null,
      }

      if (blackoutForcedMisdiagnosis) {
        updatedEnergy.misdiagnosedDuringBlackout += 1
        message += ' ⚠️ 【断电干扰】备用电源不稳定导致数据偏差！'
      }

      set({
        cases: updatedCases,
        equipment: updatedEquipment,
        energySystem: updatedEnergy,
        player: {
          ...state.player,
          coins: state.player.coins + netCoins,
          level: newLevel,
          exp: newExpAfterLevel,
          cured: state.player.cured + 1,
          totalIncome: state.player.totalIncome + coinsEarned,
        },
        gamePhase: 'result',
        diagnosisResult: result,
        showMedicineSelector: false,
        selectedMedicineId: null,
        pendingAction: null,
      })
    } else {
      const penalty = getPenaltyForAccident(activeCase.urgency)
      const totalDeduction = penalty + medicineCost
      const damagedEquipId = disease.accidentType === 'bite'
        ? requiredEquip?.id || null
        : null

      const updatedCases = state.cases.map(c =>
        c.id === activeCase.id ? { ...c, status: 'accident' as const } : c
      )

      const finalEquipment = damagedEquipId
        ? updatedEquipment.map(e =>
            e.id === damagedEquipId ? { ...e, status: 'damaged' as const } : e
          )
        : updatedEquipment

      if (blackoutForcedMisdiagnosis) {
        updatedEnergy.misdiagnosedDuringBlackout += 1
      }

      let message = ''
      const itemType = action === 'feed' ? '食物' : action === 'inject' ? '注射剂' : '药品'
      if (blackoutForcedMisdiagnosis) {
        message = `⚠️ 【断电误诊】供电不稳定导致诊疗失误！${activeCase.petName} 未得到正确治疗。（扣除${itemType}费 ${medicineCost} ⬡，罚款 ${penalty} ⬡）`
        errorType = 'action'
      } else if (errorType === 'action') {
        message = `误诊！${activeCase.petName} 患的是「${disease.name}」，应该${getActionLabel(disease.correctAction)}而不是${getActionLabel(action)}！`
        if (medicineCost > 0) {
          message += `（扣除${itemType}费 ${medicineCost} ⬡）`
        }
      } else if (errorType === 'medicine') {
        const correctMed = disease.medicineId ? getMedicine(disease.medicineId) : null
        const usedMed = medicineId ? getMedicine(medicineId) : null
        message = `用错${itemType}了！${activeCase.petName} 患的是「${disease.name}」，应该用「${correctMed?.name || '正确物品'}」而不是「${usedMed?.name || '未知物品'}」！（扣除${itemType}费 ${medicineCost} ⬡）`
      }

      const result: DiagnosisResult = {
        success: false,
        diseaseName: disease.name,
        actionTaken: action,
        correctAction: disease.correctAction,
        medicineUsed: medicineId || null,
        correctMedicine: disease.medicineId,
        coinsEarned: -totalDeduction,
        medicineCost,
        accidentType: disease.accidentType,
        damagedEquipment: damagedEquipId,
        message,
        errorType,
      }

      set({
        cases: updatedCases,
        equipment: finalEquipment,
        energySystem: updatedEnergy,
        player: {
          ...state.player,
          coins: Math.max(0, state.player.coins - totalDeduction),
          misdiagnosed: state.player.misdiagnosed + 1,
        },
        gamePhase: 'accident',
        accidentType: disease.accidentType,
        diagnosisResult: result,
        showMedicineSelector: false,
        selectedMedicineId: null,
        pendingAction: null,
      })
    }
  },

  repairEquipment: (id: string) => {
    const state = get()
    const equip = state.equipment.find(e => e.id === id)
    if (!equip || equip.status === 'normal') return
    if (state.player.coins < equip.repairCost) return

    set({
      equipment: state.equipment.map(e =>
        e.id === id ? { ...e, status: 'normal' as const } : e
      ),
      player: {
        ...state.player,
        coins: state.player.coins - equip.repairCost,
      },
    })
  },

  dismissResult: () => {
    const state = get()
    const remainingCases = state.cases.filter(c => c.status !== 'cured' && c.status !== 'accident')
    while (remainingCases.length < 4) {
      remainingCases.push(generatePetCase())
    }

    set({
      activeCaseId: null,
      gamePhase: 'idle',
      diagnosisResult: null,
      cases: remainingCases,
    })
  },

  dismissAccident: () => {
    const state = get()
    const remainingCases = state.cases.filter(c => c.status !== 'cured' && c.status !== 'accident')
    while (remainingCases.length < 4) {
      remainingCases.push(generatePetCase())
    }

    set({
      activeCaseId: null,
      gamePhase: 'idle',
      accidentType: null,
      diagnosisResult: null,
      cases: remainingCases,
    })
  },

  generateNewCase: () => {
    const state = get()
    const newCase = generatePetCase()
    set({ cases: [...state.cases, newCase] })
  },

  loadTestCases: () => {
    set({
      cases: generateTestCases(),
      activeCaseId: null,
      gamePhase: 'idle',
      accidentType: null,
      diagnosisResult: null,
      showMedicineSelector: false,
      selectedMedicineId: null,
      pendingAction: null,
    })
  },

  toggleBlackout: () => {
    const state = get()
    const isCurrentlyOffline = state.energySystem.gridStatus === 'offline'
    if (isCurrentlyOffline) {
      get().restorePower()
      return
    }
    set(state => ({
      energySystem: {
        ...state.energySystem,
        gridStatus: 'offline',
        blackoutCount: state.energySystem.blackoutCount + 1,
      },
      equipment: state.equipment.map(e => ({ ...e, currentLoad: 0 })),
    }))
  },

  restorePower: () => {
    set(state => ({
      energySystem: {
        ...state.energySystem,
        gridStatus: 'online',
      },
    }))
  },

  setPowerSource: (source: PowerSource) => {
    set(state => ({
      energySystem: {
        ...state.energySystem,
        powerSource: source,
      },
    }))
  },

  adjustPowerPriority: (equipmentId: string, direction: 'up' | 'down') => {
    set(state => {
      const priority = [...state.energySystem.powerPriority]
      const index = priority.indexOf(equipmentId)
      if (index === -1) return state

      const newIndex = direction === 'up' ? index - 1 : index + 1
      if (newIndex < 0 || newIndex >= priority.length) return state

      const temp = priority[index]
      priority[index] = priority[newIndex]
      priority[newIndex] = temp

      return {
        energySystem: {
          ...state.energySystem,
          powerPriority: priority,
        },
      }
    })
  },

  chargeBatteries: () => {
    set(state => {
      if (state.energySystem.gridStatus !== 'online') return state
      if (state.player.coins < 20) return state

      return {
        equipment: state.equipment.map(e => ({
          ...e,
          batteryLevel: e.batteryCapacity,
        })),
        energySystem: {
          ...state.energySystem,
          currentBackupBattery: state.energySystem.totalBackupBattery,
        },
        player: {
          ...state.player,
          coins: state.player.coins - 20,
        },
      }
    })
  },

  resetGame: () => {
    set({
      cases: generateInitialCases(5),
      activeCaseId: null,
      player: { ...initialPlayer },
      equipment: initialEquipment.map(e => ({ ...e })),
      energySystem: { ...initialEnergySystem },
      gamePhase: 'idle',
      accidentType: null,
      diagnosisResult: null,
      actionCooldowns: {
        examine: 0,
        medicate: 0,
        inject: 0,
        feed: 0,
        isolate: 0,
      },
      showMedicineSelector: false,
      selectedMedicineId: null,
      pendingAction: null,
    })
  },
}))
