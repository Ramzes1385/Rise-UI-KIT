import '@testing-library/jest-dom/vitest'
import BaseText from '../ui/BaseText.vue'
import { createUiKitPlugin } from '@/plugin'
import { render, screen } from '@testing-library/vue'

describe('BaseText: проп ui', () => {
	it('без ui — только классы кита', () => {
		render(BaseText, { props: { truncate: true }, slots: { default: 'Текст' } })

		expect(screen.getByText('Текст')).toHaveAttribute('class', 'base-text base-text--truncate')
	})

	it('класс root добавляется к классам кита, модификаторы и customClass сохраняются', () => {
		render(BaseText, { props: { nowrap: true, customClass: 'own-root', ui: { root: 'u-root' } }, slots: { default: 'Текст' } })

		expect(screen.getByText('Текст')).toHaveAttribute('class', 'base-text u-root base-text--nowrap own-root')
	})

	it('классы из defaults.BaseText.ui плагина склеиваются с классами экземпляра', () => {
		render(BaseText, {
			props: { ui: { root: 'own-root' } },
			slots: { default: 'Текст' },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseText: { ui: { root: 'app-root' } } } })] },
		})

		expect(screen.getByText('Текст')).toHaveAttribute('class', 'base-text app-root own-root')
	})
})

describe('BaseText: начертание и токен', () => {
	it('явное начертание сильнее токена: инлайн-число вместо var(--text-weight)', () => {
		render(BaseText, { props: { weight: 600 }, slots: { default: 'Текст' } })

		const style = screen.getByText('Текст').getAttribute('style') ?? ''
		expect(style).toContain('font-weight: 600')
		expect(style).not.toContain('--text-weight')
	})
})
