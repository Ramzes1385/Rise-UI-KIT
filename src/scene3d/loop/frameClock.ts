import type { Scene3DFrame } from '../types/internal/scene3dInternal.types'

/** Самый длинный шаг времени между кадрами, с: после паузы анимация идёт дальше без рывка */
export const MAX_FRAME_DELTA = 0.05

/** Часы кадров: шаг ограничен `MAX_FRAME_DELTA`, время копится только по кадрам анимации */
export function createFrameClock() {
	let last = 0
	let time = 0

	return {
		/** Кадр в момент `now` (мс, как у requestAnimationFrame): первый после сброса — шаг 0 */
		tick(now: number): Scene3DFrame {
			const delta = last ? Math.min(Math.max((now - last) / 1000, 0), MAX_FRAME_DELTA) : 0
			last = now
			time += delta
			return { delta, time }
		},
		/** Забыть предыдущий кадр: пауза, остановка анимаций */
		reset(): void {
			last = 0
		},
	}
}
