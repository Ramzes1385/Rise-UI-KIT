import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import { render } from '@testing-library/vue'
import BaseTextarea from '../ui/BaseTextarea.vue'
import { TEXTAREA_PARTS } from '../types/BaseTextarea.types'

const PROPS = { label: 'Отзыв', isRequired: true, error: 'Ошибка', modelValue: 'а', maxlength: 100 }

describe('BaseTextarea: проп ui', () => {
	it('классы частей добавляются к БЭМ-классам кита', () => {
		const ui = Object.fromEntries([['root', 'u-root'], ...TEXTAREA_PARTS.map(part => [part, `u-${part}`])])
		const { container } = render(BaseTextarea, { props: { ...PROPS, variant: 'soft', ui } })
		const root = container.querySelector('.base-textarea')!

		expect(root).toHaveClass('u-root', 'base-textarea--soft', 'base-textarea--error', 'base-textarea--has-counter')
		for (const part of TEXTAREA_PARTS) expect(root.querySelector(`.base-textarea__${part}`), part).toHaveClass(`u-${part}`)
	})

	it('без ui — только класс кита; классы плагина и экземпляра склеиваются', () => {
		const { container } = render(BaseTextarea, {
			props: { modelValue: '', label: 'Отзыв', ui: { field: 'own' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseTextarea: { ui: { field: 'app', root: 'app-root' } } } })] },
		})

		expect(container.querySelector('.base-textarea__label')!.className).not.toMatch(/app|own/)
		expect(container.querySelector('.base-textarea')).toHaveClass('app-root')
		expect(container.querySelector('.base-textarea__field')).toHaveAttribute('class', 'base-textarea__field app own')
	})
})
