import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import { render } from '@testing-library/vue'
import BaseInputTags from '../ui/BaseInputTags.vue'
import { INPUT_TAGS_PARTS } from '../types/BaseInputTags.types'

describe('BaseInputTags: проп ui', () => {
	it('классы частей добавляются к БЭМ-классам кита', () => {
		const ui = Object.fromEntries([['root', 'u-root'], ...INPUT_TAGS_PARTS.map(part => [part, `u-${part}`])])
		const { container } = render(BaseInputTags, { props: { modelValue: ['Vue', 'Vite'], ariaLabel: 'Навыки', ui } })
		const root = container.querySelector('.base-input-tags')!

		expect(root).toHaveClass('u-root', 'base-input-tags--has-tags')
		for (const part of INPUT_TAGS_PARTS) expect(root.querySelector(`.base-input-tags__${part}`), part).toHaveClass(`u-${part}`)
		for (const tag of root.querySelectorAll('.base-input-tags__tag')) expect(tag).toHaveClass('u-tag')
	})

	it('без ui — только класс кита; классы плагина и экземпляра склеиваются', () => {
		const { container } = render(BaseInputTags, {
			props: { modelValue: ['Vue'], ariaLabel: 'Навыки', ui: { tag: 'own' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseInputTags: { ui: { tag: 'app', list: 'app-list' } } } })] },
		})

		expect(container.querySelector('.base-input-tags')!.className).not.toMatch(/app|own/)
		expect(container.querySelector('.base-input-tags__list')).toHaveClass('app-list')
		expect(container.querySelector('.base-input-tags__tag')).toHaveAttribute('class', 'base-input-tags__tag app own')
	})
})
