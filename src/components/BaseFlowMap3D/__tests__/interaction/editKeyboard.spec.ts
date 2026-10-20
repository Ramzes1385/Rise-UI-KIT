import { ref } from 'vue'
import { useEdit3DKeyboard } from '../../model/edit/useEdit3DKeyboard'

interface Options {
	tool?: 'select' | 'link'
	targets?: string[]
	selection?: string[]
	isOpen?: boolean
	isCancelled?: boolean
	spots?: Array<[string, { x: number; y: number; isVisible: boolean }]>
	layout?: { gridSize?: number }
	notation?: { gridSize?: number }
	target?: string | null
	isTyping?: boolean
}

function setup(options: Options = {}) {
	const host = document.createElement('div')
	const actions = { nudge: vi.fn(), rotate: vi.fn(), remove: vi.fn(), undo: vi.fn(), redo: vi.fn() }
	const connect = { target: ref(options.target ?? null), aim: vi.fn(), commit: vi.fn() }
	const parts = {
		model: {
			data: ref({ layout: options.layout }),
			notation: ref({ layout: options.notation }),
			selection: ref(options.selection ?? []),
		},
		camera: { azimuth: () => 0 },
		isActive: ref(true),
		labels: { spots: new Map(options.spots ?? []) },
		actions,
		drag: { cancel: vi.fn(() => options.isCancelled ?? false) },
		connect,
		tool: ref(options.tool ?? 'select'),
		palette: { isOpen: ref(options.isOpen ?? false), close: vi.fn() },
		targets: () => options.targets ?? [],
		isTyping: () => options.isTyping ?? false,
		setTool: vi.fn(),
		openInspector: vi.fn(),
	}
	const handler = useEdit3DKeyboard(parts as never)
	const press = (key: string, init: KeyboardEventInit = {}, hit = true): boolean => {
		let result = false
		host.addEventListener('keydown', event => void (result = handler(event)), { once: true })
		host.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: !hit, cancelable: true, ...init }))
		return result
	}
	return { parts, actions, connect, press, host, handler }
}

describe('useEdit3DKeyboard', () => {
	it('неактивная правка и событие не с самой области клавиш не обрабатываются', () => {
		const idle = setup({ targets: ['a'] })
		idle.parts.isActive.value = false
		expect(idle.press('r')).toBe(false)
		const child = document.createElement('span')
		const event = new KeyboardEvent('keydown', { key: 'r' })
		Object.defineProperty(event, 'target', { value: child })
		Object.defineProperty(event, 'currentTarget', { value: idle.host })
		idle.parts.isActive.value = true
		expect(idle.handler(event)).toBe(false)
	})

	it('стрелки без цели ничего не двигают; с целью шаг берётся из данных, нотации или по умолчанию', () => {
		expect(setup().press('ArrowLeft')).toBe(false)
		const fromData = setup({ targets: ['a'], layout: { gridSize: 5 } })
		expect(fromData.press('ArrowRight')).toBe(true)
		expect(fromData.actions.nudge).toHaveBeenCalledWith(['a'], { x: 5, y: expect.any(Number) })
		const fromNotation = setup({ targets: ['a'], notation: { gridSize: 3 } })
		fromNotation.press('ArrowRight')
		expect(fromNotation.actions.nudge).toHaveBeenCalledWith(['a'], { x: 3, y: expect.any(Number) })
		const fallback = setup({ targets: ['a'] })
		fallback.press('ArrowRight')
		expect(fallback.actions.nudge).toHaveBeenCalledWith(['a'], { x: 8, y: expect.any(Number) })
	})

	it('в режиме связи стрелки наводят на ближайший видимый узел; скрытые и отсутствие соседа пропускаются', () => {
		const run = setup({
			tool: 'link',
			targets: ['a'],
			spots: [
				['a', { x: 0, y: 0, isVisible: true }],
				['b', { x: 100, y: 0, isVisible: true }],
				['c', { x: 50, y: 0, isVisible: false }],
			],
		})
		expect(run.press('ArrowRight')).toBe(true)
		expect(run.connect.aim).toHaveBeenCalledWith('b')
		run.connect.aim.mockClear()
		run.press('ArrowLeft')
		expect(run.connect.aim).not.toHaveBeenCalled()
		const empty = setup({ tool: 'link' })
		expect(empty.press('ArrowUp')).toBe(true)
		expect(empty.connect.aim).not.toHaveBeenCalled()
		const aimed = setup({
			tool: 'link',
			target: 'b',
			spots: [
				['b', { x: 0, y: 0, isVisible: true }],
				['d', { x: 0, y: 100, isVisible: true }],
			],
		})
		aimed.press('ArrowDown')
		expect(aimed.connect.aim).toHaveBeenCalledWith('d')
	})

	it('Enter: подтверждает связь, открывает инспектор или пропускается без выбора', () => {
		const link = setup({ tool: 'link' })
		expect(link.press('Enter')).toBe(true)
		expect(link.connect.commit).toHaveBeenCalled()
		const selected = setup({ selection: ['a'] })
		expect(selected.press('Enter')).toBe(true)
		expect(selected.parts.openInspector).toHaveBeenCalled()
		expect(setup().press('Enter')).toBe(false)
	})

	it('R, C, Delete и Backspace работают по целям; без целей клавиши пропускаются', () => {
		const run = setup({ targets: ['a'] })
		run.press('r')
		expect(run.actions.rotate).toHaveBeenCalledWith(['a'])
		run.press('c')
		expect(run.parts.setTool).toHaveBeenCalledWith('link')
		run.parts.tool.value = 'link'
		run.press('c')
		expect(run.parts.setTool).toHaveBeenLastCalledWith('select')
		run.press('Delete')
		run.press('Backspace')
		expect(run.actions.remove).toHaveBeenCalledTimes(2)
		expect(setup().press('r')).toBe(false)
		expect(run.press('x')).toBe(false)
		expect(run.press('r', { shiftKey: true })).toBe(false)
		expect(run.press('ArrowLeft', { altKey: true })).toBe(false)
	})

	it('Escape: отмена переноса, выход из связи, закрытие палитры или пропуск', () => {
		expect(setup({ isCancelled: true }).press('Escape')).toBe(true)
		const link = setup({ tool: 'link' })
		expect(link.press('Escape')).toBe(true)
		expect(link.parts.setTool).toHaveBeenCalledWith('select')
		const palette = setup({ isOpen: true })
		expect(palette.press('Escape')).toBe(true)
		expect(palette.parts.palette.close).toHaveBeenCalled()
		expect(setup().press('Escape')).toBe(false)
	})

	it('Ctrl и Cmd: Z отменяет, Shift+Z и Y повторяют, прочее пропускается', () => {
		const run = setup()
		run.press('z', { ctrlKey: true })
		expect(run.actions.undo).toHaveBeenCalled()
		run.press('z', { metaKey: true, shiftKey: true })
		run.press('y', { ctrlKey: true })
		expect(run.actions.redo).toHaveBeenCalledTimes(2)
		expect(run.press('x', { ctrlKey: true })).toBe(false)
		expect(run.press('z', { ctrlKey: true, altKey: true })).toBe(false)
	})

	it('во время поиска по буквам R и C не команды, а Delete остаётся командой', () => {
		const run = setup({ targets: ['a'], isTyping: true })
		expect(run.press('r')).toBe(false)
		expect(run.press('c')).toBe(false)
		expect(run.actions.rotate).not.toHaveBeenCalled()
		expect(run.press('Delete')).toBe(true)
		expect(run.actions.remove).toHaveBeenCalledWith(['a'])
	})

	it('Enter в режиме связи возвращает «выбор» только после успешного подтверждения', async () => {
		const done = setup({ tool: 'link' })
		done.connect.commit.mockResolvedValue(true)
		done.press('Enter')
		await Promise.resolve()
		await Promise.resolve()
		expect(done.parts.setTool).toHaveBeenCalledWith('select')
		const refused = setup({ tool: 'link' })
		refused.connect.commit.mockResolvedValue(false)
		refused.press('Enter')
		await Promise.resolve()
		await Promise.resolve()
		expect(refused.parts.setTool).not.toHaveBeenCalled()
	})
})
