import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { createUiKitPlugin } from '@/plugin'
import BaseAnchor from '../ui/BaseAnchor.vue'
import type { AnchorItem } from '../types/BaseAnchor.types'
import { fireEvent, render, screen } from '@testing-library/vue'

type ObserverCallback = (entries: IntersectionObserverEntry[]) => void

class FakeObserver {
	static instances: FakeObserver[] = []
	readonly observed: Element[] = []
	readonly disconnect = vi.fn()

	readonly callback: ObserverCallback
	readonly options: IntersectionObserverInit

	constructor(callback: ObserverCallback, options: IntersectionObserverInit) {
		this.callback = callback
		this.options = options
		FakeObserver.instances.push(this)
	}

	observe(element: Element): void {
		this.observed.push(element)
	}

	fire(): void {
		this.callback([])
	}
}

const ITEMS: AnchorItem[] = [
	{ id: 'intro', label: 'Введение' },
	{ id: 'setup', label: 'Установка', children: [{ id: 'setup-npm', label: 'Через npm' }] },
	{ id: 'usage', label: 'Использование' },
]

function addSection(
	id: string,
	top: number,
	{ parent = document.body, tag = 'h2' }: { parent?: HTMLElement; tag?: string } = {},
): HTMLElement {
	const element = document.createElement(tag)
	element.id = id
	element.textContent = id
	element.getBoundingClientRect = () => ({ top }) as DOMRect
	parent.append(element)
	return element
}

function setTop(id: string, top: number): void {
	document.getElementById(id)!.getBoundingClientRect = () => ({ top }) as DOMRect
}

function lastObserver(): FakeObserver {
	return FakeObserver.instances.at(-1)!
}

function link(name: string): HTMLElement {
	return screen.getByRole('link', { name })
}

function linkTexts(): (string | null)[] {
	return screen.getAllByRole('link').map(element => element.textContent)
}

describe('BaseAnchor', () => {
	beforeEach(() => {
		FakeObserver.instances = []
		vi.stubGlobal('IntersectionObserver', FakeObserver)
		window.scrollTo = vi.fn()
		history.replaceState(null, '', '/')
	})

	afterEach(() => {
		document.body.innerHTML = ''
		vi.unstubAllGlobals()
		vi.useRealTimers()
	})

	describe('пункты', () => {
		it('из items: <nav> с именем «Содержание», ссылки на #id, уровни вложенности', () => {
			render(BaseAnchor, { props: { items: ITEMS } })
			expect(screen.getByRole('navigation', { name: 'Содержание' })).toBeInTheDocument()
			expect(screen.getAllByRole('link')).toHaveLength(4)
			expect(link('Через npm')).toHaveAttribute('href', '#setup-npm')
			expect(link('Через npm').closest('li')!.style.getPropertyValue('--anchor-level')).toBe('1')
			expect(link('Введение').closest('li')!.style.getPropertyValue('--anchor-level')).toBe('0')
		})

		it('пустой items — ничего не рендерит', () => {
			const { container } = render(BaseAnchor, { props: { items: [] } })
			expect(container.querySelector('nav')).toBeNull()
		})

		it('без items собирает заголовки из <main>: уровни по тегу, id для заголовков без id, пустые пропускает', async () => {
			const main = document.createElement('main')
			document.body.append(main)
			addSection('a', 0, { parent: main, tag: 'h2' })
			addSection('b', 0, { parent: main, tag: 'h3' })
			const noId = addSection('', 0, { parent: main, tag: 'h2' })
			noId.textContent = 'Без id'
			addSection('', 0, { parent: main, tag: 'h3' }).textContent = '  '
			render(BaseAnchor, { props: { label: 'На странице' } })
			await nextTick()
			expect(screen.getByRole('navigation', { name: 'На странице' })).toBeInTheDocument()
			expect(linkTexts()).toEqual(['a', 'b', 'Без id'])
			expect(noId.id).toMatch(/^rise-anchor.+-2$/)
			expect(link('b').closest('li')!.style.getPropertyValue('--anchor-level')).toBe('1')
		})

		it('без <main> ищет в body; селектор headings — любой элемент получает уровень 0', async () => {
			const block = document.createElement('div')
			block.className = 'section-title'
			block.id = 'custom'
			block.textContent = 'Свой раздел'
			document.body.append(block)
			render(BaseAnchor, { props: { headings: '.section-title' } })
			await nextTick()
			expect(link('Свой раздел').closest('li')!.style.getPropertyValue('--anchor-level')).toBe('0')
		})

		it('content по селектору и target-элемент как источник заголовков', async () => {
			const article = document.createElement('article')
			article.id = 'doc'
			document.body.append(article)
			addSection('in-doc', 0, { parent: article })
			addSection('outside', 0)
			const { rerender } = render(BaseAnchor, { props: { content: '#doc' } })
			await nextTick()
			expect(linkTexts()).toEqual(['in-doc'])
			await rerender({ content: undefined, target: article })
			await nextTick()
			await nextTick()
			expect(linkTexts()).toEqual(['in-doc'])
			expect(lastObserver().options.root).toBe(article)
		})

		it('слот item получает пункт и признак текущего', async () => {
			addSection('intro', 0)
			render(BaseAnchor, {
				props: { items: [{ id: 'intro', label: 'Введение' }] },
				slots: { item: '<template #item="{ item, isActive }">{{ item.label }} {{ isActive ? "(тут)" : "" }}</template>' },
			})
			await nextTick()
			expect(link('Введение (тут)')).toBeInTheDocument()
		})

		it('вариант, направление, масштаб и customClass', () => {
			const { container } = render(BaseAnchor, {
				props: { items: ITEMS, variant: 'soft', direction: 'horizontal', sizeScale: 125, customClass: { root: 'r', link: 'l' } },
			})
			const root = container.querySelector('nav')!
			expect(root).toHaveClass('base-anchor--soft', 'base-anchor--horizontal', 'r')
			expect(root.style.getPropertyValue('--size-scale')).toBe('1.25')
			expect(link('Введение')).toHaveClass('l')
		})
	})

	describe('текущий раздел', () => {
		beforeEach(() => {
			addSection('intro', -500)
			addSection('setup', 300)
			addSection('setup-npm', 600)
			addSection('usage', 900)
		})

		it('наблюдает разделы через IntersectionObserver с отступом offset; текущий — последний выше линии', async () => {
			const { emitted } = render(BaseAnchor, { props: { items: ITEMS, offset: 64 } })
			await nextTick()
			const observer = lastObserver()
			expect(observer.options).toEqual({ root: null, rootMargin: '-64px 0px 0px 0px', threshold: [0, 1] })
			expect(observer.observed.map(element => element.id)).toEqual(['intro', 'setup', 'setup-npm', 'usage'])
			expect(link('Введение')).toHaveAttribute('aria-current', 'location')
			setTop('setup', 70)
			observer.fire()
			await nextTick()
			expect(link('Установка')).toHaveAttribute('aria-current', 'location')
			expect(link('Установка')).toHaveClass('base-anchor__link--active')
			expect(link('Введение')).not.toHaveAttribute('aria-current')
			expect(emitted()['update:active']).toEqual([['intro'], ['setup']])
		})

		it('выше первого раздела текущим считается первый; пункт без элемента пропускается', async () => {
			setTop('intro', 200)
			document.getElementById('usage')!.remove()
			render(BaseAnchor, { props: { items: ITEMS } })
			await nextTick()
			expect(lastObserver().observed).toHaveLength(3)
			expect(link('Введение')).toHaveAttribute('aria-current', 'location')
		})

		it('без IntersectionObserver текущий раздел считается один раз при монтировании', async () => {
			vi.stubGlobal('IntersectionObserver', undefined)
			render(BaseAnchor, { props: { items: ITEMS } })
			await nextTick()
			expect(link('Введение')).toHaveAttribute('aria-current', 'location')
		})

		it('v-model:active задаёт текущий снаружи', async () => {
			const { rerender } = render(BaseAnchor, { props: { items: ITEMS, active: 'usage' } })
			await rerender({ active: 'setup-npm' })
			expect(link('Через npm')).toHaveAttribute('aria-current', 'location')
		})

		it('смена items пересобирает пункты и наблюдение; размонтирование отключает наблюдатель', async () => {
			const { rerender, unmount } = render(BaseAnchor, { props: { items: ITEMS } })
			await nextTick()
			const first = lastObserver()
			await rerender({ items: [{ id: 'usage', label: 'Только это' }] })
			await nextTick()
			expect(first.disconnect).toHaveBeenCalled()
			expect(screen.getAllByRole('link')).toHaveLength(1)
			unmount()
			expect(lastObserver().disconnect).toHaveBeenCalled()
		})
	})

	describe('переход', () => {
		beforeEach(() => {
			addSection('intro', 0)
			addSection('setup', 400)
			addSection('setup-npm', 800)
			addSection('usage', 1200)
			Object.defineProperty(window, 'scrollY', { value: 100, configurable: true })
		})

		it('клик: плавная прокрутка с offset, фокус на разделе, #id в адресе, click и update:active', async () => {
			const { emitted } = render(BaseAnchor, { props: { items: ITEMS, offset: 50 } })
			await nextTick()
			await fireEvent.click(link('Использование'))
			expect(window.scrollTo).toHaveBeenCalledWith({ top: 1250, behavior: 'smooth' })
			const usage = document.getElementById('usage')!
			expect(usage).toHaveFocus()
			expect(usage).toHaveAttribute('tabindex', '-1')
			expect(location.hash).toBe('#usage')
			expect(emitted().click![0]).toEqual([{ id: 'usage', label: 'Использование', level: 0 }, expect.any(MouseEvent)])
			expect(emitted()['update:active']!.at(-1)).toEqual(['usage'])
			usage.blur()
			expect(usage).not.toHaveAttribute('tabindex')
		})

		it('пока идёт прокрутка, наблюдатель не меняет текущий; scrollend снимает блокировку', async () => {
			render(BaseAnchor, { props: { items: ITEMS } })
			await nextTick()
			await fireEvent.click(link('Использование'))
			lastObserver().fire()
			await nextTick()
			expect(link('Использование')).toHaveAttribute('aria-current', 'location')
			window.dispatchEvent(new Event('scrollend'))
			lastObserver().fire()
			await nextTick()
			expect(link('Введение')).toHaveAttribute('aria-current', 'location')
		})

		it('без scrollend блокировка снимается по таймеру; повторный клик перезапускает её', async () => {
			vi.useFakeTimers()
			render(BaseAnchor, { props: { items: ITEMS } })
			await nextTick()
			await fireEvent.click(link('Установка'))
			await fireEvent.click(link('Использование'))
			vi.advanceTimersByTime(999)
			lastObserver().fire()
			await nextTick()
			expect(link('Использование')).toHaveAttribute('aria-current', 'location')
			vi.advanceTimersByTime(1)
			lastObserver().fire()
			await nextTick()
			expect(link('Введение')).toHaveAttribute('aria-current', 'location')
		})

		it('prefers-reduced-motion — без анимации; isHashSynced=false — адрес не меняется; фокусируемый раздел без tabindex', async () => {
			vi.stubGlobal(
				'matchMedia',
				vi.fn(() => ({ matches: true })),
			)
			const button = document.createElement('button')
			button.id = 'action'
			button.getBoundingClientRect = () => ({ top: 10 }) as DOMRect
			document.body.append(button)
			render(BaseAnchor, { props: { items: [{ id: 'action', label: 'Кнопка' }], isHashSynced: false } })
			await nextTick()
			await fireEvent.click(link('Кнопка'))
			expect(window.scrollTo).toHaveBeenCalledWith({ top: 110, behavior: 'auto' })
			expect(button).toHaveFocus()
			expect(button).not.toHaveAttribute('tabindex')
			expect(location.hash).toBe('')
		})

		it('клик с модификатором или отменённый слушателем click не перехватывается', async () => {
			render(BaseAnchor, {
				props: { items: ITEMS, onClick: (_item: unknown, event: MouseEvent) => event.altKey && event.preventDefault() },
			})
			await nextTick()
			await fireEvent.click(link('Установка'), { ctrlKey: true })
			await fireEvent.click(link('Установка'), { metaKey: true })
			await fireEvent.click(link('Установка'), { shiftKey: true })
			await fireEvent.click(link('Установка'), { altKey: true })
			await fireEvent.click(link('Установка'), { button: 1 })
			expect(window.scrollTo).not.toHaveBeenCalled()
		})

		it('прокручиваемый контейнер: позиция от его верха, root наблюдателя — контейнер', async () => {
			const box = document.createElement('div')
			box.id = 'box'
			box.scrollTop = 30
			box.scrollTo = vi.fn()
			box.getBoundingClientRect = () => ({ top: 100 }) as DOMRect
			document.body.append(box)
			render(BaseAnchor, { props: { items: ITEMS, target: '#box' } })
			await nextTick()
			expect(lastObserver().options.root).toBe(box)
			await fireEvent.click(link('Установка'))
			expect(box.scrollTo).toHaveBeenCalledWith({ top: 330, behavior: 'smooth' })
		})

		it('scrollTo и refresh через ref; неизвестный id — ничего', async () => {
			let exposed: { scrollTo: (id: string) => void; refresh: () => void } | undefined
			render({
				components: { BaseAnchor },
				setup: () => ({ items: ITEMS, setRef: (value: typeof exposed) => (exposed = value) }),
				template: '<BaseAnchor :ref="setRef" :items="items" />',
			})
			await nextTick()
			exposed!.scrollTo('missing')
			expect(window.scrollTo).not.toHaveBeenCalled()
			exposed!.scrollTo('setup')
			expect(window.scrollTo).toHaveBeenCalledWith({ top: 500, behavior: 'smooth' })
			const count = FakeObserver.instances.length
			exposed!.refresh()
			expect(FakeObserver.instances).toHaveLength(count + 1)
		})
	})

	it('умолчания из createUiKitPlugin({ defaults })', async () => {
		addSection('only-h3', 0, { parent: document.body, tag: 'h3' })
		addSection('only-h2', 0, { parent: document.body, tag: 'h2' })
		render(BaseAnchor, { global: { plugins: [createUiKitPlugin({ defaults: { BaseAnchor: { headings: 'h3' } } })] } })
		await nextTick()
		expect(linkTexts()).toEqual(['only-h3'])
	})
})
