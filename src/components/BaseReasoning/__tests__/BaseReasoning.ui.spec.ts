import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import { render } from '@testing-library/vue'
import BaseReasoning from '../ui/BaseReasoning.vue'

const PARTS = ['trigger', 'title', 'arrow', 'collapse', 'content'] as const

describe('BaseReasoning: проп ui', () => {
	it('без ui — только классы кита', () => {
		const { container } = render(BaseReasoning, { props: { content: 'Текст' } })

		expect(container.querySelector('.base-reasoning')).toHaveAttribute('class', 'base-reasoning')
		expect(container.querySelector('.base-reasoning__trigger')).toHaveAttribute('class', 'base-reasoning__trigger')
		expect(container.querySelector('.base-reasoning__title')).toHaveAttribute('class', 'base-reasoning__title')
		expect(container.querySelector('.base-reasoning__collapse')).toHaveAttribute('class', 'base-reasoning__collapse')
		expect(container.querySelector('.base-reasoning__content')).toHaveAttribute('class', 'base-reasoning__content')
	})

	it('классы частей добавляются к классам кита, модификаторы и customClass сохраняются', () => {
		const ui = Object.fromEntries([['root', 'u-root'], ...PARTS.map(part => [part, `u-${part}`])])
		const { container } = render(BaseReasoning, {
			props: {
				content: 'Текст',
				variant: 'soft',
				isOpen: true,
				customClass: { root: 'own-root', trigger: 'own-trigger', content: 'own-content' },
				ui,
			},
		})

		expect(container.querySelector('.base-reasoning')).toHaveClass('u-root', 'base-reasoning--soft', 'base-reasoning--open', 'own-root')
		for (const part of PARTS) expect(container.querySelector(`.base-reasoning__${part}`)).toHaveClass(`u-${part}`)
		expect(container.querySelector('.base-reasoning__trigger')).toHaveClass('own-trigger')
		expect(container.querySelector('.base-reasoning__content')).toHaveClass('own-content')
	})

	it('классы из defaults.BaseReasoning.ui плагина склеиваются с классами экземпляра', () => {
		const { container } = render(BaseReasoning, {
			props: { content: 'Текст', ui: { trigger: 'own-trigger' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseReasoning: { ui: { root: 'app-root', trigger: 'app-trigger' } } } })] },
		})

		expect(container.querySelector('.base-reasoning')).toHaveClass('app-root')
		expect(container.querySelector('.base-reasoning__trigger')).toHaveAttribute(
			'class',
			'base-reasoning__trigger app-trigger own-trigger',
		)
	})

	it('умолчания пропсов берутся из defaults.BaseReasoning плагина', () => {
		const { container } = render(BaseReasoning, {
			props: { content: 'Текст', isStreaming: true },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseReasoning: { hasAutoToggle: false } } })] },
		})

		expect(container.querySelector('.base-reasoning')).toHaveClass('base-reasoning--streaming')
		expect(container.querySelector('.base-reasoning')).not.toHaveClass('base-reasoning--open')
	})
})
