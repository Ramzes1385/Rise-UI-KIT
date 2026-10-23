import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import BaseCommandPalette from '../ui/BaseCommandPalette.vue'
import { fireEvent, render, screen } from '@testing-library/vue'

const commands = [
	{ id: 'a', label: 'Открыть файл' },
	{ id: 'b', label: 'Открыть папку' },
	{ id: 'c', label: 'Закрыть окно' },
]

let animate: ReturnType<typeof vi.fn>
let heights: number[]

function stubReducedMotion(matches: boolean): void {
	vi.stubGlobal(
		'matchMedia',
		vi.fn(() => ({ matches, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
	)
}

async function type(value: string): Promise<void> {
	const search = await screen.findByRole('combobox', { name: 'Поиск команды' })
	await fireEvent.update(search, value)
	await nextTick()
}

function renderPalette(preset?: string) {
	const props = { commands, isOpen: true }
	return preset
		? render({
				components: { BaseCommandPalette },
				template: `<div data-rise-motion="${preset}"><BaseCommandPalette v-bind="p" /></div>`,
				data: () => ({ p: props }),
			})
		: render(BaseCommandPalette, { props })
}

describe('BaseCommandPalette: высота при наборе', () => {
	beforeEach(() => {
		animate = vi.fn(() => ({ cancel: vi.fn() }))
		heights = [300, 120]
		stubReducedMotion(false)
		HTMLElement.prototype.animate = animate as unknown as HTMLElement['animate']
		vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(() => heights.shift() ?? 120)
	})

	afterEach(() => {
		vi.restoreAllMocks()
		vi.unstubAllGlobals()
		delete (HTMLElement.prototype as Partial<HTMLElement>).animate
		document.body.innerHTML = ''
	})

	it('высота тела окна плавно меняется: старая → новая, токены base и emphasized', async () => {
		renderPalette()
		await screen.findByRole('combobox')
		heights = [300, 120]
		await type('закр')

		expect(animate).toHaveBeenCalledOnce()
		const [frames, timing] = animate.mock.calls[0]
		expect(frames).toEqual([
			{ overflow: 'hidden', height: '300px' },
			{ overflow: 'hidden', height: '120px' },
		])
		expect(timing).toEqual({ duration: 200, easing: expect.stringContaining('cubic-bezier') })
		expect(animate.mock.contexts[0]).toHaveClass('base-command-palette__body')
	})

	it('пустое состояние не гасится прозрачностью: в кадрах только высота', async () => {
		renderPalette()
		await screen.findByRole('combobox')
		heights = [300, 90]
		await type('нет такой команды')

		expect(screen.getByText('Ничего не найдено')).toBeVisible()
		expect(JSON.stringify(animate.mock.calls[0][0])).not.toContain('opacity')
	})

	it('высота не изменилась — анимации нет', async () => {
		renderPalette()
		await screen.findByRole('combobox')
		heights = [300, 300]
		await type('открыть')

		expect(animate).not.toHaveBeenCalled()
	})

	it('пресет none — без анимации', async () => {
		renderPalette('none')
		await screen.findByRole('combobox')
		heights = [300, 120]
		await type('закр')

		expect(animate).not.toHaveBeenCalled()
	})

	it('«уменьшить движение» — без анимации', async () => {
		stubReducedMotion(true)
		renderPalette()
		await screen.findByRole('combobox')
		heights = [300, 120]
		await type('закр')

		expect(animate).not.toHaveBeenCalled()
	})

	it('следующий ввод отменяет незаконченную анимацию и стартует с текущей высоты', async () => {
		const cancel = vi.fn()
		animate.mockImplementation(() => ({ cancel }))
		renderPalette()
		await screen.findByRole('combobox')
		heights = [300, 200]
		await type('о')
		heights = [200, 120]
		await type('закр')

		expect(cancel).toHaveBeenCalledOnce()
		expect(animate).toHaveBeenCalledTimes(2)
		expect(animate.mock.calls[1][0][0]).toEqual({ overflow: 'hidden', height: '200px' })
	})

	it('без Element.animate не падает', async () => {
		delete (HTMLElement.prototype as Partial<HTMLElement>).animate
		renderPalette()
		await screen.findByRole('combobox')
		await type('закр')

		expect(screen.getByRole('option', { name: 'Закрыть окно' })).toBeVisible()
	})
})
