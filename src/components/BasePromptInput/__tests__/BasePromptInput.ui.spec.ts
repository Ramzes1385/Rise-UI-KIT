import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import { render } from '@testing-library/vue'
import BasePromptInput from '../ui/BasePromptInput.vue'
import { PROMPT_INPUT_PARTS } from '../types/BasePromptInput.types'

const PROPS = { label: 'Запрос', error: 'Ошибка', modelValue: 'а' }
const SLOTS = { start: '<button type="button">Файл</button>' }

describe('BasePromptInput: проп ui', () => {
	it('без ui — только классы кита', () => {
		const { container } = render(BasePromptInput, { props: PROPS, slots: SLOTS })

		expect(container.querySelector('.base-prompt-input')).toHaveAttribute('class', 'base-prompt-input base-prompt-input--error')
		for (const part of PROMPT_INPUT_PARTS.filter(part => part !== 'button'))
			expect(container.querySelector(`.base-prompt-input__${part}`), part).toHaveAttribute('class', `base-prompt-input__${part}`)
	})

	it('классы частей добавляются к классам кита, модификаторы и customClass сохраняются', () => {
		const ui = Object.fromEntries([['root', 'u-root'], ...PROMPT_INPUT_PARTS.map(part => [part, `u-${part}`])])
		const { container } = render(BasePromptInput, {
			props: { ...PROPS, variant: 'soft', isGenerating: true, customClass: { root: 'own-root', box: 'own-box' }, ui },
			slots: SLOTS,
		})
		const root = container.querySelector('.base-prompt-input')!

		expect(root).toHaveClass('u-root', 'own-root', 'base-prompt-input--soft', 'base-prompt-input--error')
		expect(root.querySelector('.base-prompt-input__box')).toHaveClass('u-box', 'own-box')
		expect(root.querySelector('.base-prompt-input__button')).toHaveClass('u-button', 'base-prompt-input__button--stop', 'base-button')
		for (const part of PROMPT_INPUT_PARTS) expect(root.querySelector(`.base-prompt-input__${part}`), part).toHaveClass(`u-${part}`)
	})

	it('классы из defaults.BasePromptInput.ui плагина склеиваются с классами экземпляра', () => {
		const { container } = render(BasePromptInput, {
			props: { ui: { control: 'own' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BasePromptInput: { ui: { root: 'app-root', control: 'app' } } } })] },
		})

		expect(container.querySelector('.base-prompt-input')).toHaveClass('app-root')
		expect(container.querySelector('textarea')).toHaveAttribute('class', 'base-prompt-input__control app own')
	})
})
