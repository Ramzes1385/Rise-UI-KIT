import '@testing-library/jest-dom/vitest'
import BaseCard from '../ui/BaseCard.vue'
import { createUiKitPlugin } from '@/plugin'
import { render } from '@testing-library/vue'

const PROPS = { title: 'Отчёт', subtitle: 'за неделю' }
const SLOTS = { default: 'Тело', actions: '<button>Действие</button>', footer: 'Подвал' }
const PARTS = ['header', 'header-text', 'title', 'subtitle', 'actions', 'body', 'footer'] as const

describe('BaseCard: проп ui', () => {
	it('классы частей добавляются к БЭМ-классам кита, customClass сохраняется', () => {
		const ui = Object.fromEntries([['root', 'u-root'], ...PARTS.map(part => [part, `u-${part}`])])
		const { container } = render(BaseCard, {
			props: { ...PROPS, variant: 'shadow', customClass: { root: 'own-root', body: 'own-body' }, ui },
			slots: SLOTS,
		})
		const root = container.querySelector('.base-card')!

		expect(root).toHaveClass('u-root', 'base-card--shadow', 'own-root')
		for (const part of PARTS) expect(root.querySelector(`.base-card__${part}`)).toHaveClass(`u-${part}`)
		expect(root.querySelector('.base-card__body')).toHaveClass('own-body')
	})

	it('без ui — только классы кита; классы плагина и экземпляра склеиваются', () => {
		const { container } = render(BaseCard, {
			props: { ...PROPS, ui: { body: 'own' } },
			slots: SLOTS,
			global: { plugins: [createUiKitPlugin({ defaults: { BaseCard: { ui: { body: 'app', root: 'app-root' } } } })] },
		})
		const root = container.querySelector('.base-card')!

		expect(root).toHaveClass('base-card', 'app-root')
		expect(root.querySelector('.base-card__header')).toHaveAttribute('class', 'base-card__header')
		expect(root.querySelector('.base-card__body')).toHaveAttribute('class', 'base-card__body app own')
	})
})
