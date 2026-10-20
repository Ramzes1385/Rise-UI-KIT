import { describe, expect, it } from 'vitest'
import type { Model3DState } from '../../types/model3d.types'
import { MODEL3D_TONE_CSS, describeLook, mergeState, restState, stateKey } from '../../models/behavior/modelStates'

const look = (patch: Partial<Model3DState> = {}) => describeLook({ ...restState(), ...patch })
const ringIds = (patch: Partial<Model3DState>) => look(patch).rings.map(ring => ring.id)

describe('describeLook', () => {
	it('покой нейтрален: без колец, светодиода, затемнения и серого', () => {
		expect(look()).toEqual({
			emissive: 0,
			opacity: 1,
			isGray: false,
			rings: [],
			led: null,
			isPulsing: false,
			hasParticles: true,
			isNeutral: true,
		})
	})

	it('наведение: свечение 0,08 и кольцо hover', () => {
		const result = look({ isHovered: true })
		expect(result.emissive).toBe(0.08)
		expect(result.rings).toEqual([{ id: 'hover', css: 'var(--rise-border-accented)' }])
		expect(result.isNeutral).toBe(false)
	})

	it('выбор: кольцо primary вместо наведения', () => {
		const result = look({ isHovered: true, isSelected: true })
		expect(result.rings).toEqual([{ id: 'select', css: 'var(--rise-primary)' }])
		expect(result.emissive).toBe(0.08)
	})

	it('активный: кольцо и пульс; приглушённый активный не пульсирует', () => {
		const active = look({ isActive: true })
		expect(active.rings[0].id).toBe('active')
		expect(active.isPulsing).toBe(true)
		expect(look({ isActive: true, isDimmed: true }).isPulsing).toBe(false)
	})

	it('приглушён: прозрачность 0,35 и без частиц', () => {
		const result = look({ isDimmed: true })
		expect(result.opacity).toBe(0.35)
		expect(result.hasParticles).toBe(false)
		expect(result.isNeutral).toBe(false)
	})

	it('фокус: кольцо фокуса', () => {
		expect(ringIds({ isFocused: true })).toEqual(['focus'])
	})

	it('warning и danger: светодиод и кольцо тона', () => {
		expect(look({ tone: 'warning' })).toMatchObject({ led: 'warning', rings: [{ id: 'tone', css: MODEL3D_TONE_CSS.warning }] })
		expect(look({ tone: 'danger' })).toMatchObject({ led: 'danger', rings: [{ id: 'tone', css: 'var(--rise-error)' }] })
	})

	it('info и success не рисуют ни светодиода, ни кольца', () => {
		expect(look({ tone: 'info' }).isNeutral).toBe(true)
		expect(look({ tone: 'success' }).isNeutral).toBe(true)
	})

	it('muted: серый без частиц', () => {
		const result = look({ tone: 'muted' })
		expect(result.isGray).toBe(true)
		expect(result.hasParticles).toBe(false)
		expect(result.isNeutral).toBe(false)
	})

	it('isDragging: призрак 0,5; вместе с приглушением берётся меньшее', () => {
		expect(look({ isDragging: true }).opacity).toBe(0.5)
		expect(look({ isDragging: true, isDimmed: true }).opacity).toBe(0.35)
	})

	it('isInvalid: кольцо ошибки', () => {
		expect(look({ isInvalid: true }).rings).toEqual([{ id: 'invalid', css: 'var(--rise-error)' }])
	})

	it('кольца идут в порядке: выбор/наведение, активный, фокус, тон, ошибка', () => {
		expect(ringIds({ isSelected: true, isActive: true, isFocused: true, tone: 'danger', isInvalid: true })).toEqual([
			'select',
			'active',
			'focus',
			'tone',
			'invalid',
		])
	})
})

describe('mergeState и stateKey', () => {
	it('mergeState: поверх вычисленного, исходное не меняется', () => {
		const base = restState()
		const merged = mergeState(base, { isSelected: true, tone: 'info' })
		expect(merged).toMatchObject({ isSelected: true, tone: 'info', isHovered: false })
		expect(base.isSelected).toBe(false)
	})

	it('stateKey: одинаковое состояние — одинаковый ключ, любое отличие меняет', () => {
		expect(stateKey(restState())).toBe(stateKey(restState()))
		expect(stateKey(mergeState(restState(), { tone: 'danger' }))).not.toBe(stateKey(restState()))
		expect(stateKey(mergeState(restState(), { isInvalid: true }))).not.toBe(stateKey(restState()))
	})
})
