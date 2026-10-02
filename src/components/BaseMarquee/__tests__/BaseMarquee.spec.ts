import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { createUiKitPlugin } from '@/plugin'
import BaseMarquee from '../ui/BaseMarquee.vue'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'

type Size = { offset: number; client: number }

function stubSizes(width: Size, height: Size = { offset: 0, client: 0 }) {
	vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(width.offset)
	vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(width.client)
	vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(height.offset)
	vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(height.client)
}

function stubReducedMotion(matches: boolean) {
	const listeners: Array<(event: { matches: boolean }) => void> = []
	const query = {
		matches,
		addEventListener: vi.fn((_: string, listener: (event: { matches: boolean }) => void) => listeners.push(listener)),
		removeEventListener: vi.fn(),
	}
	vi.stubGlobal(
		'matchMedia',
		vi.fn(() => query),
	)
	return { query, change: (value: boolean) => listeners.forEach(listener => listener({ matches: value })) }
}

const root = () => screen.getByRole('marquee')
const groups = (container: Element) => container.querySelectorAll('.base-marquee__group')

describe('BaseMarquee', () => {
	afterEach(() => vi.unstubAllGlobals())

	it('лента с ролью marquee и именем по умолчанию, содержимое из слота default', () => {
		render(BaseMarquee, { slots: { default: 'Новости дня' } })
		expect(root()).toHaveAccessibleName('Бегущая строка')
		expect(screen.getAllByText('Новости дня')[0]).toBeVisible()
	})

	it('имя ленты — из label', () => {
		render(BaseMarquee, { props: { label: 'Курсы валют' } })
		expect(root()).toHaveAccessibleName('Курсы валют')
	})

	it('items — список, слоты item и separator; разделитель скрыт от скринридера', () => {
		const { container } = render(BaseMarquee, {
			props: { items: ['Первая', 'Вторая'] },
			slots: { item: '<b>{{ params.index }}: {{ params.item }}</b>', separator: '•' },
		})
		const [list] = screen.getAllByRole('list')
		expect(list.querySelectorAll('[role="listitem"]')).toHaveLength(2)
		expect(screen.getAllByText('1: Вторая')[0]).toBeInTheDocument()
		expect(container.querySelector('.base-marquee__separator')).toHaveAttribute('aria-hidden', 'true')
	})

	it('items без слотов — элемент текстом, без разделителя', () => {
		const { container } = render(BaseMarquee, { props: { items: ['Альфа'] } })
		expect(screen.getAllByText('Альфа')).toHaveLength(2)
		expect(container.querySelector('.base-marquee__separator')).toBeNull()
	})

	it('копии ленты скрыты от скринридера и выведены из Tab (inert)', () => {
		const { container } = render(BaseMarquee, { slots: { default: '<a href="#news">Читать</a>' } })
		const [first, copy] = groups(container)
		expect(first).not.toHaveAttribute('aria-hidden')
		expect(first).not.toHaveAttribute('inert')
		expect(copy).toHaveAttribute('aria-hidden', 'true')
		expect(copy).toHaveAttribute('inert')
		expect(screen.getAllByRole('link')).toHaveLength(1)
	})

	it('до измерения — одна копия, лента не движется', () => {
		stubSizes({ offset: 0, client: 300 })
		const { container } = render(BaseMarquee, { slots: { default: 'Текст' } })
		expect(groups(container)).toHaveLength(2)
		expect(root()).not.toHaveClass('base-marquee--running')
	})

	it('копий хватает на ширину области, длительность круга — размер / скорость', async () => {
		stubSizes({ offset: 100, client: 350 })
		const { container } = render(BaseMarquee, { props: { speed: 50, gap: 20, hasFade: true }, slots: { default: 'Текст' } })
		await nextTick()
		expect(groups(container)).toHaveLength(5)
		expect(root()).toHaveClass('base-marquee--running', 'base-marquee--left', 'base-marquee--fade')
		expect(root().style.getPropertyValue('--marquee-duration')).toBe('2s')
		expect(root().style.getPropertyValue('--marquee-gap')).toBe('20px')
	})

	it('содержимое шире области — одна копия', () => {
		stubSizes({ offset: 500, client: 300 })
		const { container } = render(BaseMarquee, { slots: { default: 'Текст' } })
		expect(groups(container)).toHaveLength(2)
	})

	it('скорость 0 — лента стоит', () => {
		stubSizes({ offset: 100, client: 300 })
		render(BaseMarquee, { props: { speed: 0 }, slots: { default: 'Текст' } })
		expect(root()).not.toHaveClass('base-marquee--running')
	})

	it('вертикальная лента меряется по высоте и перемеряется при смене направления', async () => {
		stubSizes({ offset: 100, client: 100 }, { offset: 40, client: 200 })
		const { container, rerender } = render(BaseMarquee, { props: { direction: 'up', speed: 20 }, slots: { default: 'Текст' } })
		await nextTick()
		expect(root()).toHaveClass('base-marquee--vertical', 'base-marquee--up')
		expect(groups(container)).toHaveLength(6)
		expect(root().style.getPropertyValue('--marquee-duration')).toBe('2s')
		await rerender({ direction: 'right' })
		await nextTick()
		await nextTick()
		expect(root()).not.toHaveClass('base-marquee--vertical')
		expect(groups(container)).toHaveLength(2)
		expect(root().style.getPropertyValue('--marquee-duration')).toBe('5s')
	})

	it('ResizeObserver перемеряет ленту и отключается при размонтировании', async () => {
		const callbacks: Array<() => void> = []
		const disconnect = vi.fn()
		vi.stubGlobal(
			'ResizeObserver',
			class {
				disconnect = disconnect
				constructor(callback: () => void) {
					callbacks.push(callback)
				}
				observe() {}
			},
		)
		stubSizes({ offset: 0, client: 300 })
		const { container, unmount } = render(BaseMarquee, { slots: { default: 'Текст' } })
		stubSizes({ offset: 100, client: 300 })
		callbacks.forEach(callback => callback())
		await nextTick()
		expect(groups(container)).toHaveLength(4)
		unmount()
		expect(disconnect).toHaveBeenCalled()
	})

	it('кнопка паузы останавливает и запускает ленту (клавиатура и мышь), сообщает v-model:is-paused', async () => {
		const user = userEvent.setup()
		const { emitted } = render(BaseMarquee, { slots: { default: 'Текст' } })
		await user.tab()
		expect(screen.getByRole('button', { name: 'Остановить бегущую строку' })).toHaveFocus()
		await user.keyboard('{Enter}')
		expect(root()).toHaveClass('base-marquee--paused')
		expect(screen.getByRole('button', { name: 'Запустить бегущую строку' })).toHaveFocus()
		await user.keyboard(' ')
		expect(root()).not.toHaveClass('base-marquee--paused')
		await user.click(screen.getByRole('button', { name: 'Остановить бегущую строку' }))
		expect(emitted('update:isPaused')).toEqual([[true], [false], [true]])
	})

	it('isPaused снаружи меняет состояние ленты и подпись кнопки', async () => {
		const { rerender } = render(BaseMarquee, { props: { isPaused: true }, slots: { default: 'Текст' } })
		expect(root()).toHaveClass('base-marquee--paused')
		expect(screen.getByRole('button', { name: 'Запустить бегущую строку' })).toBeInTheDocument()
		await rerender({ isPaused: false })
		expect(root()).not.toHaveClass('base-marquee--paused')
		expect(screen.getByRole('button', { name: 'Остановить бегущую строку' })).toBeInTheDocument()
	})

	it('hasPauseButton: false — без кнопки', () => {
		render(BaseMarquee, { props: { hasPauseButton: false }, slots: { default: 'Текст' } })
		expect(screen.queryByRole('button')).toBeNull()
	})

	it('prefers-reduced-motion — без копий, движения и кнопки; длинная лента прокручивается с клавиатуры', async () => {
		const { query, change } = stubReducedMotion(true)
		vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(800)
		stubSizes({ offset: 800, client: 300 })
		const { container, unmount } = render(BaseMarquee, { slots: { default: 'Длинный текст' } })
		await nextTick()
		const viewport = container.querySelector('.base-marquee__viewport')
		expect(groups(container)).toHaveLength(1)
		expect(root()).toHaveClass('base-marquee--static')
		expect(root()).not.toHaveClass('base-marquee--running')
		expect(screen.queryByRole('button')).toBeNull()
		expect(viewport).toHaveAttribute('tabindex', '0')
		change(false)
		await nextTick()
		expect(root()).toHaveClass('base-marquee--running')
		expect(viewport).not.toHaveAttribute('tabindex')
		unmount()
		expect(query.removeEventListener).toHaveBeenCalled()
	})

	it('без matchMedia (SSR, старые среды) лента движется', async () => {
		vi.stubGlobal('matchMedia', undefined)
		stubSizes({ offset: 100, client: 100 })
		render(BaseMarquee, { slots: { default: 'Текст' } })
		await nextTick()
		expect(root()).toHaveClass('base-marquee--running')
	})

	it('значения по умолчанию берутся из defaults плагина', async () => {
		stubSizes({ offset: 100, client: 100 })
		render(BaseMarquee, {
			slots: { default: 'Текст' },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseMarquee: { speed: 25, hasPauseButton: false } } })] },
		})
		await nextTick()
		expect(root().style.getPropertyValue('--marquee-duration')).toBe('4s')
		expect(screen.queryByRole('button')).toBeNull()
	})

	it('вариант, customClass и --size-scale', () => {
		const { container } = render(BaseMarquee, {
			props: {
				variant: 'soft',
				sizeScale: 125,
				items: ['A'],
				customClass: { root: 'my-root', viewport: 'my-viewport', item: 'my-item', button: 'my-button' },
			},
		})
		expect(root()).toHaveClass('base-marquee--soft', 'my-root')
		expect(root().style.getPropertyValue('--size-scale')).toBe('1.25')
		expect(container.querySelector('.base-marquee__viewport')).toHaveClass('my-viewport')
		expect(container.querySelector('.base-marquee__item')).toHaveClass('my-item')
		expect(screen.getByRole('button')).toHaveClass('my-button')
	})
})
