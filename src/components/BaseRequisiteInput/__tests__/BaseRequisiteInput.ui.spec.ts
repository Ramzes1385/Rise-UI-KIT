import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import { render } from '@testing-library/vue'
import BaseRequisiteInput from '../ui/BaseRequisiteInput.vue'
import { REQUISITE_INPUT_PARTS } from '../types/BaseRequisiteInput.types'

describe('BaseRequisiteInput: проп ui', () => {
	it('классы частей передаются частям внутреннего BaseInput', () => {
		const ui = Object.fromEntries([['root', 'u-root'], ...REQUISITE_INPUT_PARTS.map(part => [part, `u-${part}`])])
		const { container } = render(BaseRequisiteInput, { props: { kind: 'inn', isRequired: true, error: 'Ошибка', ui } })
		const root = container.querySelector('.base-requisite-input')!

		expect(root).toHaveClass('u-root', 'base-input')
		for (const part of REQUISITE_INPUT_PARTS) expect(root.querySelector(`.base-input__${part}`), part).toHaveClass(`u-${part}`)
	})

	it('без ui — только классы кита; классы плагина и экземпляра склеиваются', () => {
		const { container } = render(BaseRequisiteInput, {
			props: { kind: 'inn', ui: { field: 'own' } },
			global: {
				plugins: [createUiKitPlugin({ defaults: { BaseRequisiteInput: { ui: { field: 'app', wrapper: 'app-wrapper' } } } })],
			},
		})

		expect(container.querySelector('.base-requisite-input')!.className).not.toMatch(/app|own/)
		expect(container.querySelector('.base-input__label')!.className).not.toMatch(/app|own/)
		expect(container.querySelector('.base-input__wrapper')).toHaveClass('app-wrapper')
		expect(container.querySelector('.base-input__field')).toHaveAttribute('class', 'base-input__field app own')
	})
})
