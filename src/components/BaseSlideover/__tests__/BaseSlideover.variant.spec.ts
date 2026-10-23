import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import { render } from '@testing-library/vue'
import BaseSlideover from '../ui/BaseSlideover.vue'
import { SLIDEOVER_VARIANTS } from '../types/BaseSlideover.types'

describe('BaseSlideover: variant (SLD-4)', () => {
	it.each(['shadow', 'ghost'] as const)('variant=%s ставит модификатор и --variant на корень', variant => {
		render(BaseSlideover, { props: { isOpen: true, title: 'Панель', variant } })

		const root = document.querySelector('.base-slideover') as HTMLElement
		expect(root).toHaveClass(`base-slideover--${variant}`)
		expect(root.style.getPropertyValue('--variant')).toBe(variant)
	})

	it('variant по умолчанию — default, без модификатора', () => {
		render(BaseSlideover, { props: { isOpen: true, title: 'Панель' } })

		const root = document.querySelector('.base-slideover') as HTMLElement
		expect(SLIDEOVER_VARIANTS.some(variant => root.classList.contains(`base-slideover--${variant}`))).toBe(false)
	})

	it('variant задаётся defaults плагина', () => {
		render(BaseSlideover, {
			props: { isOpen: true, title: 'Панель' },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseSlideover: { variant: 'shadow' } } })] },
		})

		expect(document.querySelector('.base-slideover')).toHaveClass('base-slideover--shadow')
	})
})
