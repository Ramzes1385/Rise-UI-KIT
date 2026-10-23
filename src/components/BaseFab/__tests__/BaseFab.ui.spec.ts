import '@testing-library/jest-dom/vitest'
import BaseFab from '../ui/BaseFab.vue'
import { createUiKitPlugin } from '@/plugin'
import { render, screen } from '@testing-library/vue'

describe('BaseFab: проп ui', () => {
	it('без ui — только классы кита на всех частях', () => {
		render(BaseFab, { props: { label: 'Написать', isExtended: true } })
		const fab = screen.getByRole('button', { name: 'Написать' })

		expect(fab.className).toMatch(/^base-fab /)
		expect(fab.querySelector('.base-fab__icon')).toHaveClass('base-icon')
		expect(fab.querySelector('.base-fab__label')).toHaveAttribute('class', 'base-fab__label')
	})

	it('классы частей добавляются к классам кита, модификаторы и customClass сохраняются', () => {
		render(BaseFab, {
			props: {
				label: 'Написать',
				isExtended: true,
				variant: 'soft',
				customClass: { root: 'own-root', label: 'own-label' },
				ui: { root: 'u-root', icon: 'u-icon', label: 'u-label' },
			},
		})
		const fab = screen.getByRole('button', { name: 'Написать' })

		expect(fab).toHaveClass('base-fab', 'u-root', 'base-fab--soft', 'base-fab--extended', 'own-root')
		expect(fab.querySelector('.base-fab__icon')).toHaveClass('u-icon')
		expect(fab.querySelector('.base-fab__label')).toHaveClass('u-label', 'own-label')
	})

	it('ссылка получает те же классы частей', () => {
		render(BaseFab, { props: { label: 'Открыть', href: '/new', ui: { root: 'u-root', icon: 'u-icon' } } })
		const link = screen.getByRole('link', { name: 'Открыть' })

		expect(link).toHaveClass('base-fab', 'u-root')
		expect(link.querySelector('.base-fab__icon')).toHaveClass('u-icon')
	})

	it('классы из defaults.BaseFab.ui плагина склеиваются с классами экземпляра', () => {
		render(BaseFab, {
			props: { label: 'Написать', isExtended: true, ui: { label: 'own-label' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseFab: { ui: { root: 'app-root', label: 'app-label' } } } })] },
		})
		const fab = screen.getByRole('button', { name: 'Написать' })

		expect(fab).toHaveClass('base-fab', 'app-root')
		expect(fab.querySelector('.base-fab__label')).toHaveAttribute('class', 'base-fab__label app-label own-label')
	})
})
