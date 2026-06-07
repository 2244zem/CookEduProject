export type AiUsageAction = 'chat' | 'scan-fridge' | 'recipe-doctor' | 'meal-plan' | 'admin-draft' | 'recipe-fixer'

export type AiUsageEvent = {
  id: string
  action: AiUsageAction
  label: string
  createdAt: string
}

const labels: Record<AiUsageAction, string> = {
  chat: 'Chat',
  'scan-fridge': 'Scan Fridge',
  'recipe-doctor': 'Recipe Doctor',
  'meal-plan': 'Meal Plan',
  'admin-draft': 'Admin Draft',
  'recipe-fixer': 'Recipe Fixer',
}

function storageKey(userId?: string | number | null) {
  return `cookedu_ai_usage_${userId || 'guest'}`
}

export function readAiUsage(userId?: string | number | null): AiUsageEvent[] {
  try {
    const saved = localStorage.getItem(storageKey(userId))
    const parsed = saved ? JSON.parse(saved) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function trackAiUsage(action: AiUsageAction, userId?: string | number | null) {
  const events = readAiUsage(userId)
  const next = [
    {
      id: crypto.randomUUID(),
      action,
      label: labels[action],
      createdAt: new Date().toISOString(),
    },
    ...events,
  ].slice(0, 120)

  localStorage.setItem(storageKey(userId), JSON.stringify(next))
  return next
}

export function getAiUsageSummary(userId?: string | number | null) {
  const events = readAiUsage(userId)
  const counts = events.reduce<Record<AiUsageAction, number>>((acc, event) => {
    acc[event.action] = (acc[event.action] || 0) + 1
    return acc
  }, {
    chat: 0,
    'scan-fridge': 0,
    'recipe-doctor': 0,
    'meal-plan': 0,
    'admin-draft': 0,
    'recipe-fixer': 0,
  })

  return {
    total: events.length,
    counts,
    latest: events.slice(0, 8),
  }
}
