import { cameraKeyAction, QUARTER_TURN, ROTATE_STEP } from '../../camera/cameraKeys'

const key = (name: string, init: KeyboardEventInit = {}) => new KeyboardEvent('keydown', { key: name, ...init })

describe('cameraKeyAction', () => {
	it('Shift + стрелки — поворот и наклон', () => {
		expect(cameraKeyAction(key('ArrowLeft', { shiftKey: true }))).toEqual({ type: 'rotate', degrees: -ROTATE_STEP })
		expect(cameraKeyAction(key('ArrowRight', { shiftKey: true }))).toEqual({ type: 'rotate', degrees: ROTATE_STEP })
		expect(cameraKeyAction(key('ArrowUp', { shiftKey: true }))).toEqual({ type: 'tilt', degrees: -10 })
		expect(cameraKeyAction(key('ArrowDown', { shiftKey: true }))).toEqual({ type: 'tilt', degrees: 10 })
	})

	it('масштаб и сброс', () => {
		for (const name of ['+', '=']) expect(cameraKeyAction(key(name))).toEqual({ type: 'zoom', direction: 1 })
		for (const name of ['-', '_']) expect(cameraKeyAction(key(name))).toEqual({ type: 'zoom', direction: -1 })
		expect(cameraKeyAction(key('0'))).toEqual({ type: 'reset' })
	})

	it('Q/E — поворот на 90° только с hasQuarterTurns, в любом регистре', () => {
		expect(cameraKeyAction(key('q'))).toBeNull()
		expect(cameraKeyAction(key('q'), {})).toBeNull()
		expect(cameraKeyAction(key('q'), { hasQuarterTurns: false })).toBeNull()
		const options = { hasQuarterTurns: true }
		expect(cameraKeyAction(key('q'), options)).toEqual({ type: 'rotate', degrees: -QUARTER_TURN })
		expect(cameraKeyAction(key('E'), options)).toEqual({ type: 'rotate', degrees: QUARTER_TURN })
		expect(cameraKeyAction(key('e', { shiftKey: true }), options)).toBeNull()
		expect(cameraKeyAction(key('x'), options)).toBeNull()
	})

	it('с Ctrl, Meta, Alt и неизвестные клавиши — ничего', () => {
		for (const modifier of ['ctrlKey', 'metaKey', 'altKey'] as const) expect(cameraKeyAction(key('+', { [modifier]: true }))).toBeNull()
		expect(cameraKeyAction(key('x'))).toBeNull()
		expect(cameraKeyAction(key('ArrowLeft'))).toBeNull()
		expect(cameraKeyAction(key('+', { shiftKey: true }))).toEqual({ type: 'zoom', direction: 1 })
	})
})
