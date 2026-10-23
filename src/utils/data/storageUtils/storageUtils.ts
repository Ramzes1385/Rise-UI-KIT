/** Утилиты: безопасная работа с localStorage — без падений при SSR, запрете доступа и переполнении */

export function readStorage(key: string): string | null {
	try {
		return localStorage.getItem(key)
	} catch {
		return null
	}
}

export function writeStorage(key: string, value: string): boolean {
	try {
		localStorage.setItem(key, value)
		return true
	} catch {
		return false
	}
}
