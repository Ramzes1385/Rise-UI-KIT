import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import BaseSplitter from '../ui/BaseSplitter.vue'
import { render, screen } from '@testing-library/vue'

const SLOTS = { start: 'Письма', end: 'Письмо' }

const parts = (name: string) => [...document.querySelectorAll(`.base-splitter__${name}`)]

describe('BaseSplitter: проп ui', () => {
	it('без ui — только классы кита на частях', () => {
		render(BaseSplitter, { slots: SLOTS })

		expect(screen.getByRole('separator')).toHaveAttribute('class', 'base-splitter__separator')
		expect(parts('handle')[0]).toHaveAttribute('class', 'base-splitter__handle')
		expect(parts('pane')[0]).toHaveAttribute('class', 'base-splitter__pane base-splitter__pane--start')
	})

	it('классы частей добавляются к классам кита, модификаторы и customClass сохраняются', () => {
		const ui = { root: 'u-root', pane: 'u-pane', separator: 'u-separator', handle: 'u-handle' }
		const { container } = render(BaseSplitter, {
			props: { variant: 'ghost', customClass: { root: 'own-root', pane: 'own-pane', separator: 'own-separator' }, ui },
			slots: SLOTS,
		})

		expect(container.firstElementChild).toHaveClass(
			'base-splitter',
			'u-root',
			'base-splitter--ghost',
			'base-splitter--horizontal',
			'own-root',
		)
		for (const pane of parts('pane')) expect(pane).toHaveClass('base-splitter__pane', 'u-pane', 'own-pane')
		expect(parts('pane')[1]).toHaveClass('base-splitter__pane--end')
		expect(screen.getByRole('separator')).toHaveClass('base-splitter__separator', 'u-separator', 'own-separator')
		expect(parts('handle')[0]).toHaveClass('base-splitter__handle', 'u-handle')
	})

	it('классы из defaults.BaseSplitter.ui плагина склеиваются с классами экземпляра', () => {
		render(BaseSplitter, {
			props: { ui: { handle: 'own-handle' } },
			slots: SLOTS,
			global: { plugins: [createUiKitPlugin({ defaults: { BaseSplitter: { ui: { handle: 'app-handle' } } } })] },
		})

		expect(parts('handle')[0]).toHaveAttribute('class', 'base-splitter__handle app-handle own-handle')
	})
})
