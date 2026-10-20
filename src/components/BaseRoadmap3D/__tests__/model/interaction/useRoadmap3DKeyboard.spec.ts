import { ref } from 'vue'
import { useRoadmap3DKeyboard } from '../../../model/interaction/useRoadmap3DKeyboard'
import type { Roadmap3DStageItem } from '../../../types/internal/roadmap3dInternal.types'
import type { Roadmap3DKeyboardOptions } from '../../../types/internal/roadmap3dCompose.types'

function stage(id: string, status: string): Roadmap3DStageItem {
	return { id, status } as Roadmap3DStageItem
}

function setup(
	options: {
		stages?: Roadmap3DStageItem[]
		isEditing?: boolean
		focused?: string | null
		cursor?: string | null
		selected?: string | null
	} = {},
) {
	const focus = {
		focused: ref(options.focused ?? null),
		cursor: ref(options.cursor ?? null),
		step: vi.fn(),
		first: vi.fn(),
		last: vi.fn(),
		focusStage: vi.fn(),
		overview: vi.fn(),
	}
	const model = { selectedId: ref(options.selected ?? null), selectTopic: vi.fn() }
	const camera = { rotate: vi.fn(), turn: vi.fn(), tilt: vi.fn(), zoomIn: vi.fn(), zoomOut: vi.fn(), home: vi.fn() }
	const tour = { stop: vi.fn() }
	const edit = { shift: vi.fn(() => Promise.resolve(true)) }
	const stages = options.stages ?? [stage('a', 'done'), stage('b', 'current'), stage('c', 'locked')]
	const keyboard = useRoadmap3DKeyboard({
		focus,
		tour,
		model,
		camera,
		edit,
		isEditing: () => options.isEditing ?? false,
		getStages: () => stages,
	} as unknown as Roadmap3DKeyboardOptions)
	const element = document.createElement('div')
	const child = element.appendChild(document.createElement('button'))
	element.addEventListener('keydown', keyboard.onKeydown)
	const press = (key: string, init: KeyboardEventInit = {}, target: HTMLElement = element): KeyboardEvent => {
		const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init })
		target.dispatchEvent(event)
		return event
	}
	return { focus, model, camera, tour, edit, press, child }
}

describe('useRoadmap3DKeyboard: путь', () => {
	it.each([
		['ArrowLeft', -1],
		['ArrowUp', -1],
		['ArrowRight', 1],
		['ArrowDown', 1],
	])('%s двигает курсор на %i', (key, delta) => {
		const { focus, press } = setup()
		expect(press(key).defaultPrevented).toBe(true)
		expect(focus.step).toHaveBeenCalledWith(delta)
	})

	it('Home и End — первый и последний этап', () => {
		const { focus, press } = setup()
		press('Home')
		press('End')
		expect(focus.first).toHaveBeenCalledOnce()
		expect(focus.last).toHaveBeenCalledOnce()
	})

	it('Enter и пробел открывают этап: курсор, иначе текущий, иначе первый', () => {
		const withCursor = setup({ cursor: 'c' })
		withCursor.press('Enter')
		expect(withCursor.focus.focusStage).toHaveBeenCalledWith('c')
		const current = setup()
		current.press(' ')
		expect(current.focus.focusStage).toHaveBeenCalledWith('b')
		const first = setup({ stages: [stage('a', 'available')] })
		first.press('Enter')
		expect(first.focus.focusStage).toHaveBeenCalledWith('a')
	})

	it('Enter без этапов ничего не открывает', () => {
		const { focus, press } = setup({ stages: [] })
		press('Enter')
		expect(focus.focusStage).not.toHaveBeenCalled()
	})

	it('Escape сначала закрывает тему, потом возвращает общий вид', () => {
		const withTopic = setup({ selected: 't' })
		withTopic.press('Escape')
		expect(withTopic.model.selectTopic).toHaveBeenCalledWith(null)
		expect(withTopic.focus.overview).not.toHaveBeenCalled()
		const plain = setup()
		plain.press('Escape')
		expect(plain.focus.overview).toHaveBeenCalledOnce()
	})

	it('любой ввод останавливает тур, но только на самой области, не на вложенных кнопках', () => {
		const { tour, press, child } = setup()
		press('x', {}, child)
		expect(tour.stop).not.toHaveBeenCalled()
		press('x')
		expect(tour.stop).toHaveBeenCalledOnce()
	})
})

describe('useRoadmap3DKeyboard: камера', () => {
	it('Q и E — четверть оборота, Shift+стрелки — оборот на 15° и наклон', () => {
		const { camera, press } = setup()
		press('q')
		press('E')
		expect(camera.rotate.mock.calls).toEqual([[-1], [1]])
		press('ArrowLeft', { shiftKey: true })
		press('ArrowRight', { shiftKey: true })
		expect(camera.turn.mock.calls).toEqual([[-15], [15]])
		press('ArrowUp', { shiftKey: true })
		expect(camera.tilt).toHaveBeenCalledWith(-10)
	})

	it('плюс, минус и ноль — масштаб и сброс', () => {
		const { camera, press } = setup()
		expect(press('+').defaultPrevented).toBe(true)
		press('-')
		press('0')
		expect(camera.zoomIn).toHaveBeenCalledOnce()
		expect(camera.zoomOut).toHaveBeenCalledOnce()
		expect(camera.home).toHaveBeenCalledOnce()
	})

	it('незнакомая клавиша и Ctrl+клавиша не перехватываются', () => {
		const { camera, focus, press } = setup()
		expect(press('x').defaultPrevented).toBe(false)
		expect(press('ArrowLeft', { ctrlKey: true }).defaultPrevented).toBe(false)
		expect(focus.step).not.toHaveBeenCalled()
		expect(camera.turn).not.toHaveBeenCalled()
	})
})

describe('useRoadmap3DKeyboard: правка порядка', () => {
	it('Alt+стрелки в режиме правки двигают этап в фокусе', () => {
		const { edit, press, focus } = setup({ isEditing: true, focused: 'b' })
		expect(press('ArrowLeft', { altKey: true }).defaultPrevented).toBe(true)
		press('ArrowRight', { altKey: true })
		expect(edit.shift.mock.calls).toEqual([
			['b', -1],
			['b', 1],
		])
		expect(focus.step).not.toHaveBeenCalled()
	})

	it('без правки, без фокуса, без Alt или с другой клавишей порядок не меняется', () => {
		const notEditing = setup({ focused: 'b' })
		notEditing.press('ArrowLeft', { altKey: true })
		const noFocus = setup({ isEditing: true })
		noFocus.press('ArrowLeft', { altKey: true })
		const other = setup({ isEditing: true, focused: 'b' })
		other.press('ArrowUp', { altKey: true })
		other.press('ArrowLeft')
		for (const item of [notEditing, noFocus, other]) expect(item.edit.shift).not.toHaveBeenCalled()
		expect(other.focus.step).toHaveBeenCalledWith(-1)
	})
})
