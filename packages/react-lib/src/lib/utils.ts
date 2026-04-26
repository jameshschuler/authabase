import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs)
}

export function getPasswordStrength(password: string) {
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^a-zA-Z\d]/.test(password)) score++

  const strengthLevels = [
    { score: 0, text: 'Very Weak', color: 'bg-red-500' },
    { score: 1, text: 'Weak', color: 'bg-orange-500' },
    { score: 2, text: 'Fair', color: 'bg-yellow-500' },
    { score: 3, text: 'Good', color: 'bg-blue-500' },
    { score: 4, text: 'Strong', color: 'bg-green-500' },
  ]

  const level = strengthLevels[Math.min(score, 4)]
  return { text: level.text, color: level.color, score: Math.min(score, 4) }
}
