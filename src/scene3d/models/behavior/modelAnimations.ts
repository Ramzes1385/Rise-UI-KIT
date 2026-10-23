/** Composable: анимации 3D-модели узла — запуск, повтор, остановка, «уменьшить движение», клипы GLB */

import { MODEL3D_PRESETS, isModel3DPreset } from '../presets'
import type { Model3DScope } from '../../types/internal/model3dRuntime.types'
import type { Model3DHooks, Model3DEntry, Model3DRun } from '../../types/internal/model3dInternal.types'

/** Длительность по умолчанию, мс: `--rise-duration-xslow` × 3, если токена нет — 900 */
export const DEFAULT_ANIMATION_MS = 900
const DURATION_FACTOR = 3
const PULSE_GAIN = 0.06

/** Длительность CSS (`300ms`, `0.3s`) в миллисекундах; не длительность — `null` */
export function parseDuration(css: string): number | null {
	const match = /^\s*(-?\d*\.?\d+)\s*(ms|s)\s*$/.exec(css)
	if (!match) return null
	return Number(match[1]) * (match[2] === 's' ? 1000 : 1)
}

/** Длительность анимации модели по умолчанию из токена темы области */
export function defaultAnimationDuration(host: HTMLElement | null): number {
	if (!host) return DEFAULT_ANIMATION_MS
	const token = parseDuration(getComputedStyle(host).getPropertyValue('--rise-duration-xslow'))
	return token ? token * DURATION_FACTOR : DEFAULT_ANIMATION_MS
}

/** Название анимации по умолчанию для узла: поле `animation` определения или таблица встроенных */
export function defaultAnimationName(entry: Model3DEntry): string {
	const { definition, key } = entry.resolution
	const preset = 'preset' in definition ? definition.preset : key
	return definition.animation ?? (isModel3DPreset(preset) ? MODEL3D_PRESETS[preset].animation : 'pulse')
}

function pulseStep(entry: Model3DEntry): (progress: number) => void {
	return progress => entry.body.scale.setScalar(entry.baseScale * entry.scale * (1 + PULSE_GAIN * Math.sin(Math.PI * progress)))
}

function clipStep(entry: Model3DEntry, name: string): ((progress: number) => void) | null {
	const clip = entry.clips.get(name)
	if (!clip || !entry.mixer) return null
	const action = entry.mixer.clipAction(clip)
	action.play()
	action.paused = true
	return progress => {
		action.time = progress * clip.duration
		entry.mixer?.update(0)
	}
}

function stepOf(entry: Model3DEntry, name: string): ((progress: number) => void) | null {
	return entry.instance?.animations?.[name] ?? clipStep(entry, name) ?? (name === 'pulse' ? pulseStep(entry) : null)
}

/**
 * Играть анимацию: своя или пресета (`instance.animations`), клип GLB (`clips`), иначе `pulse`.
 * «Уменьшить движение» — сразу последний кадр. Несколько разных анимаций узла идут параллельно, повторный запуск той же перезапускает
 */
export function playAnimation(
	view: { entry: Model3DEntry; scope: Model3DScope; hooks: Model3DHooks },
	name: string,
	options: { duration?: number; repeat?: number | 'loop' } = {},
): Promise<void> {
	const { entry, scope, hooks } = view
	const step = stepOf(entry, name)
	if (!step) {
		scope.options.warn?.(`У 3D-модели «${entry.id}» нет анимации «${name}»`)
		return Promise.resolve()
	}
	stopAnimation(entry, name)
	if (scope.options.isReducedMotion?.()) {
		step(1)
		return Promise.resolve()
	}
	return new Promise<void>(done => {
		const duration = options.duration ?? scope.options.getDuration?.() ?? DEFAULT_ANIMATION_MS
		const run: Model3DRun = { name, elapsed: 0, duration: Math.max(duration, 1), repeat: options.repeat ?? 1, step, done, action: null }
		entry.runs.set(name, run)
		hooks.detach(entry)
		hooks.wake()
	})
}

/** Остановить анимацию (или все): поза покоя, обещание решается */
export function stopAnimation(entry: Model3DEntry, name?: string): void {
	const runs = name === undefined ? [...entry.runs.values()] : [entry.runs.get(name)].filter((run): run is Model3DRun => !!run)
	runs.forEach(run => {
		entry.runs.delete(run.name)
		run.step(0)
		run.done()
	})
}

function advance(entry: Model3DEntry, run: Model3DRun, delta: number): void {
	run.elapsed += delta * 1000
	const cycles = run.elapsed / run.duration
	if (run.repeat !== 'loop' && cycles >= run.repeat) {
		entry.runs.delete(run.name)
		run.step(1)
		run.done()
		return
	}
	run.step(cycles % 1)
}

/** Шаг кадра: двигает идущие анимации узла; `true`, пока хоть одна идёт */
export function stepAnimations(entry: Model3DEntry, delta: number): boolean {
	;[...entry.runs.values()].forEach(run => advance(entry, run, delta))
	return entry.runs.size > 0
}
