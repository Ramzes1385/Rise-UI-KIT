import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import { render } from '@testing-library/vue'
import BaseToolCall from '../ui/BaseToolCall.vue'

const PARTS = ['trigger', 'status', 'title', 'name', 'state', 'arrow', 'collapse', 'content', 'code', 'error'] as const
const FULL = { name: 'search_docs', title: 'Поиск', status: 'error', args: { q: 'тема' }, error: 'Таймаут' } as const

describe('BaseToolCall: проп ui', () => {
	it('без ui — только классы кита', () => {
		const { container } = render(BaseToolCall, { props: FULL })

		expect(container.querySelector('.base-tool-call')).toHaveAttribute('class', 'base-tool-call base-tool-call--error')
		for (const part of PARTS) {
			const element = container.querySelector(`.base-tool-call__${part}`)
			expect(
				element
					?.getAttribute('class')
					?.split(' ')
					.filter(name => !name.startsWith('base-')),
			).toEqual([])
		}
		expect(container.querySelector('.base-tool-call__trigger')).toHaveAttribute('class', 'base-tool-call__trigger')
		expect(container.querySelector('.base-tool-call__code')).toHaveAttribute('class', 'base-tool-call__code')
	})

	it('классы частей добавляются к классам кита, модификаторы и customClass сохраняются', () => {
		const ui = Object.fromEntries([['root', 'u-root'], ...PARTS.map(part => [part, `u-${part}`])])
		const { container } = render(BaseToolCall, {
			props: {
				...FULL,
				variant: 'soft',
				isOpen: true,
				customClass: { root: 'own-root', trigger: 'own-trigger', content: 'own-content' },
				ui,
			},
		})

		expect(container.querySelector('.base-tool-call')).toHaveClass(
			'u-root',
			'base-tool-call--soft',
			'base-tool-call--error',
			'base-tool-call--open',
			'own-root',
		)
		for (const part of PARTS) expect(container.querySelector(`.base-tool-call__${part}`)).toHaveClass(`u-${part}`)
		expect(container.querySelector('.base-tool-call__trigger')).toHaveClass('own-trigger')
		expect(container.querySelector('.base-tool-call__content')).toHaveClass('own-content')
	})

	it('классы из defaults.BaseToolCall.ui плагина склеиваются с классами экземпляра', () => {
		const { container } = render(BaseToolCall, {
			props: { name: 'ping', ui: { trigger: 'own-trigger' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseToolCall: { ui: { root: 'app-root', trigger: 'app-trigger' } } } })] },
		})

		expect(container.querySelector('.base-tool-call')).toHaveClass('app-root')
		expect(container.querySelector('.base-tool-call__trigger')).toHaveAttribute(
			'class',
			'base-tool-call__trigger app-trigger own-trigger',
		)
	})

	it('умолчания пропсов берутся из defaults.BaseToolCall плагина', () => {
		const { container } = render(BaseToolCall, {
			props: { name: 'ping' },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseToolCall: { status: 'success', isOpen: true } } })] },
		})

		expect(container.querySelector('.base-tool-call')).toHaveClass('base-tool-call--success', 'base-tool-call--open')
	})
})
