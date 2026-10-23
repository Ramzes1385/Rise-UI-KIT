import '@testing-library/jest-dom/vitest'
import BaseEmpty from '../ui/BaseEmpty.vue'
import { createUiKitPlugin } from '@/plugin'
import { render } from '@testing-library/vue'
import { EMPTY_PARTS } from '../types/BaseEmpty.types'

const PROPS = { title: 'Пусто', description: 'Создайте первую задачу' }
const SLOTS = { default: 'Тело', actions: '<button>Создать</button>' }

describe('BaseEmpty: проп ui', () => {
	it('без ui — только классы кита', () => {
		const { container } = render(BaseEmpty, { props: PROPS, slots: SLOTS })
		const root = container.querySelector('.base-empty')!

		expect(root).toHaveAttribute('class', 'base-empty')
		for (const part of ['icon-wrapper', 'content', 'body', 'actions'])
			expect(root.querySelector(`.base-empty__${part}`)).toHaveAttribute('class', `base-empty__${part}`)
		expect(root.querySelector('.base-empty__title')).toHaveClass('base-text', 'base-empty__title')
	})

	it('классы частей добавляются к классам кита, модификаторы и customClass сохраняются', () => {
		const ui = Object.fromEntries([['root', 'u-root'], ...EMPTY_PARTS.map(part => [part, `u-${part}`])])
		const { container } = render(BaseEmpty, {
			props: { ...PROPS, variant: 'soft', customClass: { root: 'own-root', body: 'own-body' }, ui },
			slots: SLOTS,
		})
		const root = container.querySelector('.base-empty')!

		expect(root).toHaveClass('base-empty', 'u-root', 'base-empty--soft', 'own-root')
		for (const part of EMPTY_PARTS) expect(root.querySelector(`.base-empty__${part}`)).toHaveClass(`u-${part}`)
		expect(root.querySelector('.base-empty__body')).toHaveClass('own-body')
	})

	it('классы из defaults.BaseEmpty.ui плагина склеиваются с классами экземпляра', () => {
		const { container } = render(BaseEmpty, {
			props: { ...PROPS, ui: { content: 'own-content' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseEmpty: { ui: { root: 'app-root', content: 'app-content' } } } })] },
		})

		expect(container.querySelector('.base-empty')).toHaveClass('app-root')
		expect(container.querySelector('.base-empty__content')).toHaveAttribute('class', 'base-empty__content app-content own-content')
	})
})
