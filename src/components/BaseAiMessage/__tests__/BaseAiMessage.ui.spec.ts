import '@/styles/_motion.scss'
import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import BaseAiMessage from '../ui/BaseAiMessage.vue'
import { render, waitFor } from '@testing-library/vue'

const PARTS = ['avatar', 'body', 'header', 'name', 'time', 'content', 'error', 'actions'] as const

const part = (container: Element, name: string) => container.querySelector(`.base-ai-message__${name}`)

describe('BaseAiMessage: проп ui', () => {
	it('без ui — только классы кита', () => {
		const { container } = render(BaseAiMessage, { props: { content: 'Ответ', time: '12:04', error: 'Сбой' } })

		expect(part(container, 'avatar')?.parentElement).toHaveAttribute('class', 'base-ai-message base-ai-message--error')
		for (const name of ['avatar', 'body', 'header', 'name', 'time', 'error', 'actions']) {
			expect(part(container, name)).toHaveAttribute('class', `base-ai-message__${name}`)
		}
		expect(part(container, 'content')).toHaveClass('base-markdown', 'base-ai-message__content')
	})

	it('классы частей добавляются к классам кита, модификаторы и customClass сохраняются', () => {
		const ui = Object.fromEntries(['root', ...PARTS].map(name => [name, `u-${name}`]))
		const { container } = render(BaseAiMessage, {
			props: {
				content: 'Ответ',
				time: '12:04',
				error: 'Сбой',
				variant: 'soft',
				customClass: { root: 'own-root', body: 'own-body' },
				ui,
			},
		})

		expect(container.querySelector('article')).toHaveClass(
			'base-ai-message',
			'u-root',
			'base-ai-message--soft',
			'own-root',
			'base-ai-message--error',
		)
		for (const name of PARTS) expect(part(container, name)).toHaveClass(`base-ai-message__${name}`, `u-${name}`)
		expect(part(container, 'body')).toHaveClass('own-body')
	})

	it('классы из defaults.BaseAiMessage.ui плагина склеиваются с классами экземпляра', () => {
		const { container } = render(BaseAiMessage, {
			props: { content: 'Ответ', ui: { name: 'own-name' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseAiMessage: { ui: { root: 'app-root', name: 'app-name' } } } })] },
		})

		expect(container.querySelector('article')).toHaveClass('app-root')
		expect(part(container, 'name')).toHaveAttribute('class', 'base-ai-message__name app-name own-name')
	})
})

describe('BaseAiMessage: появление действий и ошибки', () => {
	const global = { stubs: { Transition: false } }

	afterEach(() => {
		document.documentElement.removeAttribute('data-rise-motion')
		document.documentElement.removeAttribute('data-rise-reduced-motion')
	})

	it('при первом показе готового ответа действия без анимации появления', () => {
		const { container } = render(BaseAiMessage, { props: { content: 'Ответ' }, global })

		expect(part(container, 'actions')).not.toHaveClass('base-ai-message-actions-enter-active')
	})

	it('конец потока: действия появляются переходом и остаются в конечном состоянии', async () => {
		const { container, rerender } = render(BaseAiMessage, { props: { content: 'Ответ', isStreaming: true }, global })
		expect(part(container, 'actions')).toBeNull()

		await rerender({ isStreaming: false })

		expect(part(container, 'actions')).toHaveClass('base-ai-message-actions-enter-active')
		await waitFor(() => expect(part(container, 'actions')).toHaveAttribute('class', 'base-ai-message__actions'))
	})

	it('ошибка появляется переходом, «Повторить» убирает её после ухода', async () => {
		const { container, rerender } = render(BaseAiMessage, { props: { content: 'Ответ' }, global })

		await rerender({ error: 'Сбой' })
		expect(part(container, 'error')).toHaveClass('base-ai-message-error-enter-active')

		await rerender({ error: undefined })
		await waitFor(() => expect(part(container, 'error')).toBeNull())
	})

	it.each([
		["reducedMotion: 'always'", () => document.documentElement.setAttribute('data-rise-reduced-motion', 'always')],
		['пресет none', () => document.documentElement.setAttribute('data-rise-motion', 'none')],
	])('%s — длительности переходов нулевые, действия сразу в конечном состоянии', (_, setup) => {
		setup()
		const { container } = render(BaseAiMessage, { props: { content: 'Ответ' }, global })
		const style = getComputedStyle(part(container, 'actions')!)

		expect(style.getPropertyValue('--rise-duration').trim()).toBe('0.01ms')
		expect(style.getPropertyValue('--rise-duration-fast').trim()).toBe('0.01ms')
		expect(style.getPropertyValue('--rise-motion-distance').trim()).toBe('0px')
	})

	it('без пресета — стандартные длительности', () => {
		const { container } = render(BaseAiMessage, { props: { content: 'Ответ' }, global })

		expect(getComputedStyle(part(container, 'actions')!).getPropertyValue('--rise-duration').trim()).toBe('200ms')
	})
})
