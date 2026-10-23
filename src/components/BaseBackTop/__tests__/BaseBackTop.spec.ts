import '@testing-library/jest-dom/vitest'
import BaseBackTop from '../ui/BaseBackTop.vue'
import { fireEvent, render, screen } from '@testing-library/vue'

function scrollWindow(y: number): void {
	Object.defineProperty(window, 'scrollY', { value: y, configurable: true })
	window.dispatchEvent(new Event('scroll'))
}

function makeContainer(scrollTop: number): HTMLElement {
	const element = document.createElement('div')
	element.id = 'list'
	element.scrollTop = scrollTop
	element.scrollTo = vi.fn()
	document.body.append(element)
	return element
}

describe('BaseBackTop unit', () => {
	let main: HTMLElement

	beforeEach(() => {
		window.scrollTo = vi.fn()
		main = document.createElement('main')
		document.body.append(main)
	})

	afterEach(() => {
		scrollWindow(0)
		document.body.innerHTML = ''
		vi.unstubAllGlobals()
	})

	it('появляется после прокрутки окна дальше visibilityHeight', async () => {
		render(BaseBackTop)
		expect(screen.queryByRole('button')).not.toBeInTheDocument()
		scrollWindow(401)
		await Promise.resolve()
		expect(await screen.findByRole('button', { name: 'Наверх' })).toBeInTheDocument()
	})

	it('клик прокручивает окно плавно, переносит фокус на <main> и отдаёт click', async () => {
		scrollWindow(1000)
		const { emitted } = render(BaseBackTop, { props: { label: 'К началу', isExtended: true, position: 'bottom-left' } })
		await fireEvent.click(await screen.findByRole('button', { name: 'К началу' }))
		expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
		expect(main).toHaveFocus()
		expect(main).toHaveAttribute('tabindex', '-1')
		expect(emitted().click).toHaveLength(1)
		main.blur()
		expect(main).not.toHaveAttribute('tabindex')
	})

	it('при prefers-reduced-motion прокрутка без анимации; без <main> фокус на body', async () => {
		vi.stubGlobal(
			'matchMedia',
			vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
		)
		main.remove()
		scrollWindow(1000)
		render(BaseBackTop)
		await fireEvent.click(await screen.findByRole('button', { name: 'Наверх' }))
		expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' })
		expect(document.body).toHaveFocus()
	})

	it('контейнер по селектору: следит за его прокруткой и возвращает фокус в него', async () => {
		const list = makeContainer(0)
		render(BaseBackTop, { props: { target: '#list', visibilityHeight: 100 } })
		list.scrollTop = 150
		await fireEvent.scroll(list)
		await fireEvent.click(await screen.findByRole('button', { name: 'Наверх' }))
		expect(list.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
		expect(list).toHaveFocus()
	})

	it('контейнер элементом, focusTarget и смена target', async () => {
		const list = makeContainer(500)
		const heading = document.createElement('button')
		heading.textContent = 'Заголовок'
		document.body.append(heading)
		const { rerender } = render(BaseBackTop, { props: { target: list, focusTarget: heading } })
		await fireEvent.click(await screen.findByRole('button', { name: 'Наверх' }))
		expect(heading).toHaveFocus()
		expect(heading).not.toHaveAttribute('tabindex')
		await rerender({ target: '#missing', focusTarget: '#missing' })
		expect(screen.queryByRole('button', { name: 'Наверх' })).not.toBeInTheDocument()
		scrollWindow(900)
		await fireEvent.click(await screen.findByRole('button', { name: 'Наверх' }))
		expect(window.scrollTo).toHaveBeenCalled()
		expect(heading).toHaveFocus()
	})

	it('после размонтирования прокрутка окна не отслеживается', () => {
		const spy = vi.spyOn(window, 'removeEventListener')
		const { unmount } = render(BaseBackTop)
		unmount()
		expect(spy).toHaveBeenCalledWith('scroll', expect.any(Function))
		spy.mockRestore()
	})
})
