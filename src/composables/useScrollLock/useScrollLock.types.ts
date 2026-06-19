/**
 * Возвращаемое значение composable useScrollLock.
 */
export interface UseScrollLockReturn {
	/** Заблокировать скролл body */
	lock: () => void
	/** Разблокировать скролл body */
	unlock: () => void
}
