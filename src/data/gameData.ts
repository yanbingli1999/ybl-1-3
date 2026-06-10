export interface Breed {
  id: string
  name: string
  emoji: string
  color: string
  shape: string
}

export interface Disease {
  id: string
  name: string
  description: string
  correctAction: ActionType
  medicineId: string | null
  accidentType: AccidentType
}

export interface Medicine {
  id: string
  name: string
  effect: string
  color: string
  cost: number
}

export interface Symptom {
  id: string
  name: string
  description: string
  vitals: string
}

export interface Equipment {
  id: string
  name: string
  status: 'normal' | 'damaged' | 'repairing'
  repairCost: number
  requiredAction: ActionType
}

export interface PetCase {
  id: string
  petName: string
  breedId: string
  diseaseId: string
  symptomIds: string[]
  urgency: 'low' | 'medium' | 'high'
  status: 'waiting' | 'diagnosing' | 'treating' | 'cured' | 'accident'
  examined: boolean
}

export interface Player {
  coins: number
  level: number
  exp: number
  cured: number
  misdiagnosed: number
  totalIncome: number
}

export type ActionType = 'examine' | 'medicate' | 'inject' | 'feed' | 'isolate'
export type AccidentType = 'split' | 'float' | 'bite'
export type GamePhase = 'idle' | 'diagnosing' | 'treating' | 'accident' | 'result'

export interface DiagnosisResult {
  success: boolean
  diseaseName: string
  actionTaken: ActionType
  correctAction: ActionType
  medicineUsed: string | null
  correctMedicine: string | null
  coinsEarned: number
  medicineCost: number
  accidentType: AccidentType | null
  damagedEquipment: string | null
  message: string
  errorType: 'action' | 'medicine' | 'funds' | null
}

export const breeds: Breed[] = [
  { id: 'slime', name: '黏液球', emoji: '🟢', color: '#00ff88', shape: 'blob' },
  { id: 'tentacle', name: '触手怪', emoji: '🟣', color: '#7b61ff', shape: 'tentacles' },
  { id: 'crystal', name: '晶晶体', emoji: '🔷', color: '#00d4ff', shape: 'prism' },
  { id: 'bubble', name: '气泡兽', emoji: '🟠', color: '#ff8855', shape: 'bubbles' },
  { id: 'shadow', name: '影子虫', emoji: '⚫', color: '#888899', shape: 'shadow' },
  { id: 'flame', name: '火焰崽', emoji: '🔴', color: '#ff4422', shape: 'flame' },
]

export const diseases: Disease[] = [
  { id: 'split_pox', name: '分裂痘', description: '宠物身上出现分裂斑点', correctAction: 'inject', medicineId: 'stabilizer', accidentType: 'split' },
  { id: 'float_fever', name: '飘浮热', description: '宠物不受控制向上飘浮', correctAction: 'medicate', medicineId: 'gravity_pill', accidentType: 'float' },
  { id: 'chomp_bite', name: '噬咬狂', description: '宠物疯狂咬周围一切', correctAction: 'isolate', medicineId: null, accidentType: 'bite' },
  { id: 'hunger_storm', name: '饥饿风暴', description: '宠物极度饥饿产生能量风暴', correctAction: 'feed', medicineId: 'cosmic_kibble', accidentType: 'float' },
  { id: 'crystal_cough', name: '晶体咳', description: '咳出小晶体碎片', correctAction: 'medicate', medicineId: 'soft_syrup', accidentType: 'split' },
  { id: 'shadow_rust', name: '暗影锈', description: '身体逐渐腐蚀生锈', correctAction: 'inject', medicineId: 'shine_serum', accidentType: 'bite' },
]

export const medicines: Medicine[] = [
  { id: 'stabilizer', name: '稳定剂', effect: '阻止分裂', color: '#00ff88', cost: 30 },
  { id: 'gravity_pill', name: '重力丸', effect: '恢复引力', color: '#7b61ff', cost: 25 },
  { id: 'cosmic_kibble', name: '宇宙粮', effect: '满足饥饿', color: '#ff8855', cost: 15 },
  { id: 'soft_syrup', name: '软化糖浆', effect: '溶解晶体', color: '#00d4ff', cost: 35 },
  { id: 'shine_serum', name: '闪光血清', effect: '驱散暗影', color: '#ffdd00', cost: 40 },
]

export const symptoms: Symptom[] = [
  { id: 'spotted_skin', name: '斑点皮肤', description: '皮肤上出现闪烁的分裂斑点', vitals: '细胞分裂速率: 900%' },
  { id: 'rising_body', name: '身体上升', description: '宠物不受控制地向上飘浮', vitals: '重力系数: -2.3' },
  { id: 'gnashing', name: '磨牙撕咬', description: '疯狂咬任何靠近的东西', vitals: '咬合力: 5000N' },
  { id: 'empty_stomach', name: '胃部空虚', description: '能量场剧烈波动', vitals: '饥饿指数: 99.7%' },
  { id: 'crystal_sputum', name: '晶体痰', description: '咳出小型晶体碎片', vitals: '硬度: 莫氏8.5' },
  { id: 'rust_patches', name: '锈斑', description: '身体表面出现腐蚀锈斑', vitals: '腐蚀速率: 3mm/h' },
]

export const initialEquipment: Equipment[] = [
  { id: 'scanner', name: '扫描仪', status: 'normal', repairCost: 50, requiredAction: 'examine' },
  { id: 'injector', name: '注射器', status: 'normal', repairCost: 60, requiredAction: 'inject' },
  { id: 'dispenser', name: '药品发放器', status: 'normal', repairCost: 45, requiredAction: 'medicate' },
  { id: 'feeder', name: '喂食器', status: 'normal', repairCost: 30, requiredAction: 'feed' },
  { id: 'isolation_unit', name: '隔离舱', status: 'normal', repairCost: 80, requiredAction: 'isolate' },
]

const diseaseSymptomMap: Record<string, string[]> = {
  split_pox: ['spotted_skin'],
  float_fever: ['rising_body'],
  chomp_bite: ['gnashing'],
  hunger_storm: ['empty_stomach'],
  crystal_cough: ['crystal_sputum'],
  shadow_rust: ['rust_patches'],
}

const petNames: string[] = [
  '咕噜', '哔哔', '噗噗', '嘶嘶', '嗡嗡', '咔咔',
  '哧哧', '咻咻', '嗒嗒', '嘟嘟', '啵啵', '嗷嗷',
  '呱呱', '喵喵', '汪汪', '吱吱', '嘎嘎', '喵呜',
  '波波', '闪闪', '星星', '球球', '泡泡', '萌萌',
]

export function getSymptomsForDisease(diseaseId: string): string[] {
  return diseaseSymptomMap[diseaseId] || []
}

export function getBreed(id: string): Breed | undefined {
  return breeds.find(b => b.id === id)
}

export function getDisease(id: string): Disease | undefined {
  return diseases.find(d => d.id === id)
}

export function getSymptom(id: string): Symptom | undefined {
  return symptoms.find(s => s.id === id)
}

export function getMedicine(id: string): Medicine | undefined {
  return medicines.find(m => m.id === id)
}

let caseCounter = 0

export function generatePetCase(): PetCase {
  caseCounter++
  const disease = diseases[Math.floor(Math.random() * diseases.length)]
  const breed = breeds[Math.floor(Math.random() * breeds.length)]
  const name = petNames[Math.floor(Math.random() * petNames.length)]
  const urgencyLevels: PetCase['urgency'][] = ['low', 'medium', 'high']
  const urgency = urgencyLevels[Math.floor(Math.random() * urgencyLevels.length)]
  const symptomIds = getSymptomsForDisease(disease.id)
  const extraSymptoms = symptoms
    .filter(s => !symptomIds.includes(s.id))
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.floor(Math.random() * 2))
    .map(s => s.id)

  return {
    id: `case_${Date.now()}_${caseCounter}`,
    petName: name,
    breedId: breed.id,
    diseaseId: disease.id,
    symptomIds: [...symptomIds, ...extraSymptoms],
    urgency,
    status: 'waiting',
    examined: false,
  }
}

export function generateInitialCases(count: number): PetCase[] {
  return Array.from({ length: count }, () => generatePetCase())
}

export function generateTestCases(): PetCase[] {
  caseCounter += 4
  return [
    {
      id: `test_hunger_${Date.now()}_${caseCounter - 3}`,
      petName: '饿饿',
      breedId: 'slime',
      diseaseId: 'hunger_storm',
      symptomIds: ['empty_stomach'],
      urgency: 'medium',
      status: 'waiting',
      examined: false,
    },
    {
      id: `test_float_${Date.now()}_${caseCounter - 2}`,
      petName: '飘飘',
      breedId: 'flame',
      diseaseId: 'float_fever',
      symptomIds: ['rising_body'],
      urgency: 'medium',
      status: 'waiting',
      examined: false,
    },
    {
      id: `test_shadow_${Date.now()}_${caseCounter - 1}`,
      petName: '锈锈',
      breedId: 'shadow',
      diseaseId: 'shadow_rust',
      symptomIds: ['rust_patches'],
      urgency: 'medium',
      status: 'waiting',
      examined: false,
    },
    {
      id: `test_chomp_${Date.now()}_${caseCounter}`,
      petName: '咬咬',
      breedId: 'tentacle',
      diseaseId: 'chomp_bite',
      symptomIds: ['gnashing'],
      urgency: 'medium',
      status: 'waiting',
      examined: false,
    },
  ]
}
