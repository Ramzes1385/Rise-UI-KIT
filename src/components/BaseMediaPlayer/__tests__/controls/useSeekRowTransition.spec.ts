import { useSeekRowTransition } from '../../model/controls/useSeekRowTransition'

interface FakeAnimation {
	onfinish: (() => void) | null
	oncancel: (() => void) | null
}

function setup(): { row: HTMLElement; animate: ReturnType<typeof vi.fn>; animation: FakeAnimation } {
	const parent = document.createElement('div')
	parent.style.rowGap = '6px'
	const row = document.createElement('div')
	row.style.paddingTop = '6px'
	parent.append(row)
	document.body.append(parent)
	Object.defineProperty(row, 'offsetHeight', { configurable: true, value: 48 })
	const animation: FakeAnimation = { onfinish: null, oncancel: null }
	const animate = vi.fn(() => animation)
	row.animate = animate as unknown as HTMLElement['animate']
	return { row, animate, animation }
}

afterEach(() => {
	document.body.innerHTML = ''
	document.documentElement.removeAttribute('data-rise-motion')
})

describe('useSeekRowTransition: раскрытие второго ряда', () => {
	it('открытие: от свёрнутого кадра с отрицательным отступом к высоте ряда, завершение вызывает done', () => {
		const { row, animate, animation } = setup()
		const done = vi.fn()

		useSeekRowTransition().onSeekRowEnter(row, done)

		const [frames, options] = animate.mock.calls[0] as unknown as [Record<string, unknown>[], { duration: number }]
		expect(frames[0]).toEqual({ maxHeight: '0px', marginTop: '-6px', paddingTop: '0px', opacity: 0 })
		expect(frames[1]).toMatchObject({ maxHeight: '48px', marginTop: '0px', opacity: 1 })
		expect(options.duration).toBeGreaterThan(0)
		expect(done).not.toHaveBeenCalled()
		animation.onfinish?.()
		expect(done).toHaveBeenCalledTimes(1)
	})

	it('закрытие: кадры в обратном порядке, отмена анимации тоже вызывает done', () => {
		const { row, animate, animation } = setup()
		const done = vi.fn()

		useSeekRowTransition().onSeekRowLeave(row, done)

		const [frames] = animate.mock.calls[0] as unknown as [Record<string, unknown>[]]
		expect(frames[0]).toMatchObject({ maxHeight: '48px', opacity: 1 })
		expect(frames[1]).toMatchObject({ maxHeight: '0px', opacity: 0 })
		animation.oncancel?.()
		expect(done).toHaveBeenCalledTimes(1)
	})

	it('ряд без родителя: отступ между рядами считается нулевым', () => {
		const { row, animate } = setup()
		row.remove()

		useSeekRowTransition().onSeekRowEnter(row, vi.fn())

		expect((animate.mock.calls[0] as unknown as [Record<string, unknown>[]])[0][0]).toMatchObject({ marginTop: '0px' })
	})

	it('движение выключено (пресет none): сразу done, анимация не создаётся', () => {
		document.documentElement.setAttribute('data-rise-motion', 'none')
		const { row, animate } = setup()
		const done = vi.fn()

		useSeekRowTransition().onSeekRowEnter(row, done)

		expect(done).toHaveBeenCalledTimes(1)
		expect(animate).not.toHaveBeenCalled()
	})

	it('нет Web Animations API (jsdom, SSR-подобная среда): сразу done', () => {
		const row = document.createElement('div')
		document.body.append(row)
		const done = vi.fn()

		useSeekRowTransition().onSeekRowLeave(row, done)

		expect(done).toHaveBeenCalledTimes(1)
	})
})
