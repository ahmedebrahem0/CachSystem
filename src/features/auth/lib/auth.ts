export const AUTH_PHONE = "01226718724"
export const AUTH_PASSWORD = "01226718724"
export const AUTH_SESSION_KEY = "truck-expenses-authenticated"

export function isAuthenticated() {
  if (typeof window === "undefined") return false
  return sessionStorage.getItem(AUTH_SESSION_KEY) === "true"
}

export function login(phone: string, password: string) {
  const valid = phone.trim() === AUTH_PHONE && password === AUTH_PASSWORD
  if (valid) sessionStorage.setItem(AUTH_SESSION_KEY, "true")
  return valid
}

export function logout() {
  sessionStorage.removeItem(AUTH_SESSION_KEY)
}
