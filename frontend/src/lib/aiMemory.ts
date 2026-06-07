export type CookEduAiMemory = {
  taste: string
  allergies: string
  budget: string
  cookingTime: string
  goals: string
  pantry: string
}

export const emptyAiMemory: CookEduAiMemory = {
  taste: '',
  allergies: '',
  budget: '',
  cookingTime: '',
  goals: '',
  pantry: '',
}

function storageKey(userId?: string | number | null) {
  return `cookedu_ai_memory_${userId || 'guest'}`
}

export function loadAiMemory(userId?: string | number | null): CookEduAiMemory {
  try {
    const saved = localStorage.getItem(storageKey(userId))
    if (!saved) return emptyAiMemory
    return { ...emptyAiMemory, ...JSON.parse(saved) }
  } catch {
    return emptyAiMemory
  }
}

export function saveAiMemory(userId: string | number | null | undefined, memory: CookEduAiMemory) {
  localStorage.setItem(storageKey(userId), JSON.stringify(memory))
}

export function formatAiMemory(memory: CookEduAiMemory) {
  const lines = [
    memory.taste && `Rasa favorit: ${memory.taste}`,
    memory.allergies && `Pantangan atau alergi: ${memory.allergies}`,
    memory.budget && `Budget: ${memory.budget}`,
    memory.cookingTime && `Waktu masak ideal: ${memory.cookingTime}`,
    memory.goals && `Target: ${memory.goals}`,
    memory.pantry && `Isi dapur yang sering tersedia: ${memory.pantry}`,
  ].filter(Boolean)

  return lines.join('. ')
}
