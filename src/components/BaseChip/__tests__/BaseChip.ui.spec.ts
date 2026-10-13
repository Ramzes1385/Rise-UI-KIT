import '@testing-library/jest-dom/vitest'
import BaseChip from '../ui/BaseChip.vue'
import { createUiKitPlugin } from '@/plugin'
import { render } from '@testing-library/vue'

const SLOTS = { default: '<button>Уведомления</button>' }

describe('BaseChip: проп ui', () => {
	it('без ui — только классы кита на всех частях', () => {
		const { container } = render(BaseChip, { props: { content: 3 }, slots: SLOTS })
		const root = container.querySelector('.base-chip')!

		expect(root.className).toMatch(/^base-chip( |$)/)
		expect(root.querySelector('.base-chip__badge')).toHaveAttribute(
			'class',
			'base-badge base-badge--round base-chip__badge base-chip__badge--top-right',
		)
	})

	it('классы частей добавляются к классам кита, модификаторы и customClass сохраняются', () => {
		const { container } = render(BaseChip, {
			props: {
				content: 3,
				variant: 'soft',
				placement: 'bottom-left',
				customClass: { root: 'own-root', badge: 'own-badge' },
				ui: { root: 'u-root', badge: 'u-badge' },
			},
			slots: SLOTS,
		})
		const root = container.querySelector('.base-chip')!

		expect(root).toHaveClass('base-chip', 'u-root', 'base-chip--soft', 'own-root')
		expect(root.querySelector('.base-chip__badge')).toHaveClass('u-badge', 'own-badge', 'base-chip__badge--bottom-left')
	})

	it('классы из defaults.BaseChip.ui плагина склеиваются с классами экземпляра', () => {
		const { container } = render(BaseChip, {
			props: { content: 3, ui: { badge: 'own-badge' } },
			slots: SLOTS,
			global: { plugins: [createUiKitPlugin({ defaults: { BaseChip: { ui: { root: 'app-root', badge: 'app-badge' } } } })] },
		})

		expect(container.querySelector('.base-chip')).toHaveClass('base-chip', 'app-root')
		expect(container.querySelector('.base-chip__badge')).toHaveAttribute(
			'class',
			'base-badge base-badge--round base-chip__badge app-badge own-badge base-chip__badge--top-right',
		)
	})
})
