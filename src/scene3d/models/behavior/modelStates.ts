/** Утилиты: состояние 3D-модели узла и вид, в который оно переводится (кольца, светодиод, непрозрачность) — чистые данные */

import type { Model3DState, Model3DTone } from '../../types/model3d.types'
import type { Model3DLook, Model3DRing } from '../../types/internal/model3dInternal.types'

/** Цвета тонов статуса: токены кита */
export const MODEL3D_TONE_CSS: Readonly<Record<Model3DTone, string>> = {
	none: 'var(--rise-text-muted)',
	info: 'var(--rise-info)',
	success: 'var(--rise-success)',
	warning: 'var(--rise-warning)',
	danger: 'var(--rise-error)',
	muted: 'var(--rise-text-muted)',
}

const RING_CSS = {
	hover: 'var(--rise-border-accented)',
	select: 'var(--rise-primary)',
	active: 'var(--rise-scene3d-active, var(--rise-chart-2))',
	focus: 'var(--rise-focus-ring)',
	invalid: 'var(--rise-error)',
} as const

const HOVER_EMISSIVE = 0.08
const DIMMED_OPACITY = 0.35
const GHOST_OPACITY = 0.5

/** Покой: ничего не включено */
export function restState(): Model3DState {
	return {
		isHovered: false,
		isSelected: false,
		isActive: false,
		isDimmed: false,
		isFocused: false,
		tone: 'none',
		isDragging: false,
		isInvalid: false,
	}
}

/** Состояние поверх вычисленного компонентом */
export function mergeState(computed: Model3DState, override: Partial<Model3DState>): Model3DState {
	return { ...computed, ...override }
}

/** Ключ состояния: вид пересчитывается, только когда он изменился */
export function stateKey(state: Model3DState): string {
	return Object.values(state).join('|')
}

function ringsOf(state: Model3DState): Model3DRing[] {
	const rings: Model3DRing[] = []
	if (state.isSelected || state.isHovered)
		rings.push(state.isSelected ? { id: 'select', css: RING_CSS.select } : { id: 'hover', css: RING_CSS.hover })
	if (state.isActive) rings.push({ id: 'active', css: RING_CSS.active })
	if (state.isFocused) rings.push({ id: 'focus', css: RING_CSS.focus })
	if (state.tone === 'warning' || state.tone === 'danger') rings.push({ id: 'tone', css: MODEL3D_TONE_CSS[state.tone] })
	if (state.isInvalid) rings.push({ id: 'invalid', css: RING_CSS.invalid })
	return rings
}

function ledOf(state: Model3DState): Model3DLook['led'] {
	return state.tone === 'warning' || state.tone === 'danger' ? state.tone : null
}

function opacityOf(state: Model3DState): number {
	return Math.min(state.isDimmed ? DIMMED_OPACITY : 1, state.isDragging ? GHOST_OPACITY : 1)
}

/**
 * Общий вид состояния: наведение — подъём свечения и кольцо, выбор — кольцо primary, активный шаг — пульсирующее кольцо,
 * приглушён — прозрачность 0,35 и без частиц, фокус — кольцо фокуса, warning/danger — светодиод и кольцо тона
 * (статус дублируется текстом бирки и списка), muted — серый без частиц, правка: призрак 0,5 и кольцо ошибки
 */
export function describeLook(state: Model3DState): Model3DLook {
	const rings = ringsOf(state)
	const led = ledOf(state)
	const opacity = opacityOf(state)
	const emissive = state.isHovered ? HOVER_EMISSIVE : 0
	const isGray = state.tone === 'muted'
	return {
		emissive,
		opacity,
		isGray,
		rings,
		led,
		isPulsing: state.isActive && !state.isDimmed,
		hasParticles: !state.isDimmed && !isGray,
		isNeutral: !rings.length && !led && opacity === 1 && !isGray && emissive === 0,
	}
}
