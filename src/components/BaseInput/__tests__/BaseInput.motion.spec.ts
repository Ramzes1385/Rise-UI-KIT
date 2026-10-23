import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import BaseInput from '../ui/BaseInput.vue'
import { render } from '@testing-library/vue'

const RULES = [{ key: 'len', label: 'От 8 символов', validate: (value: string) => value.length >= 8 }]

function renderRules(props: Record<string, unknown>) {
	return render(BaseInput, {
		props: { type: 'password', modelValue: 'a', ...props },
		global: { stubs: { transition: false } },
	})
}

function waitFrame(): Promise<void> {
	return new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve)))
}

describe('BaseInput: движение правил пароля', () => {
	afterEach(() => {
		document.documentElement.removeAttribute('data-rise-motion')
	})

	it('смена «выполнено/нет»: состояние правила сразу, значки сменяются переходом и остаётся один', async () => {
		const { container, rerender } = renderRules({ passwordRules: RULES })
		const rule = container.querySelector('.base-input__password-rule')!

		await rerender({ modelValue: 'abcdefgh' })

		expect(rule).toHaveClass('base-input__password-rule--valid')
		const icons = rule.querySelectorAll('.base-input__password-rule-icon > .base-icon')
		expect(icons).toHaveLength(2)
		expect(icons[0]).toHaveClass('base-input-rule-icon-leave-active')
		expect(icons[1]).toHaveClass('base-input-rule-icon-enter-active')

		await waitFrame()
		await waitFrame()
		expect(rule.querySelectorAll('.base-input__password-rule-icon > .base-icon')).toHaveLength(1)
	})

	it('появление списка правил — переход base-input-rules', async () => {
		const { container, rerender } = renderRules({ passwordRules: [] })
		expect(container.querySelector('.base-input__password-rules')).toBeNull()

		await rerender({ passwordRules: RULES })
		await nextTick()

		expect(container.querySelector('.base-input__password-rules')).toHaveClass('base-input-rules-enter-active')
	})

	it('пресет none: конечное состояние правила ставится сразу', async () => {
		document.documentElement.setAttribute('data-rise-motion', 'none')
		const { container, rerender } = renderRules({ passwordRules: RULES })

		await rerender({ modelValue: 'abcdefgh' })

		expect(container.querySelector('.base-input__password-rule')).toHaveClass('base-input__password-rule--valid')
		expect(container.querySelectorAll('.base-input__password-rule-icon .base-input-rule-icon-enter-active')).toHaveLength(1)
	})
})
