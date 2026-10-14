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

describe('BaseText: начертание', () => {
	it('явное начертание пишется inline числом', () => {
		render(BaseText, { props: { weight: 600 }, slots: { default: 'Текст' } })

		expect(screen.getByText('Текст').getAttribute('style') ?? '').toContain('font-weight: 600')
	})

	it('weight 400 тоже явный: пишется inline', () => {
		render(BaseText, { props: { weight: 400 }, slots: { default: 'Текст' } })

		expect(screen.getByText('Текст').getAttribute('style') ?? '').toContain('font-weight: 400')
	})

	it('без weight inline-веса нет, у strong и заголовка вес остаётся от тега', () => {
		render(BaseText, { props: { tag: 'strong' }, slots: { default: 'Жирный' } })

		expect(screen.getByText('Жирный').getAttribute('style') ?? '').not.toContain('font-weight')
	})

	it('defaults.BaseText.weight из плагина возвращает прежние 400', () => {
		render(BaseText, {
			slots: { default: 'Текст' },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseText: { weight: 400 } } })] },
		})

		expect(screen.getByText('Текст').getAttribute('style') ?? '').toContain('font-weight: 400')
	})
})
