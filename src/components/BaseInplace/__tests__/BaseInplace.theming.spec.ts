import '@testing-library/jest-dom/vitest'
import { ref } from 'vue'
import BaseInplace from '../ui/BaseInplace.vue'
import userEvent from '@testing-library/user-event'
import { INPLACE_PARTS } from '../types/BaseInplace.types'
import { DEFAULTS_KEY } from '@composables/base/useDefaults'
import { render, screen, waitFor } from '@testing-library/vue'

describe('BaseInplace: проп ui', () => {
	it('классы частей добавляются к БЭМ-классам кита в просмотре и в правке, customClass сохраняется', async () => {
		const user = userEvent.setup()
		const ui = Object.fromEntries([['root', 'u-root'], ...INPLACE_PARTS.map(part => [part, `u-${part}`])])
		const { container } = render(BaseInplace, {
			props: {
				modelValue: 'Альфа',
				label: 'Проект',
				variant: 'ghost',
				customClass: { root: 'own-root', display: 'own-display' },
				ui,
			},
		})
		const root = container.querySelector('.base-inplace')!

		expect(root).toHaveClass('u-root', 'base-inplace--ghost', 'own-root')
		expect(root.querySelector('.base-inplace__display')).toHaveClass('u-display', 'own-display')
		await user.click(screen.getByRole('button', { name: 'Проект: Альфа' }))
		expect(root.querySelector('.base-inplace__field')).toHaveClass('u-field')
	})

	it('без ui — только классы кита; классы плагина и экземпляра склеиваются', () => {
		const { container } = render(BaseInplace, {
			props: { modelValue: 'Альфа', label: 'Проект', ui: { display: 'own' } },
			global: { provide: { [DEFAULTS_KEY]: { BaseInplace: { ui: { display: 'app', root: 'app-root' } } } } },
		})
		const root = container.querySelector('.base-inplace')!

		expect(root).toHaveClass('base-inplace', 'app-root')
		expect(root.querySelector('.base-inplace__display')).toHaveAttribute('class', 'base-inplace__display app own')
	})
})

describe('BaseInplace: смена режимов переходом', () => {
	function renderInMotionNone() {
		const host = document.createElement('div')
		host.setAttribute('data-rise-motion', 'none')
		document.body.append(host)
		const model = ref('Альфа')
		render(
			{
				components: { BaseInplace },
				setup: () => ({ model }),
				template: '<BaseInplace v-model="model" label="Проект" />',
			},
			{ container: host, global: { stubs: { transition: false } } },
		)
		return { host, model }
	}

	it('фокус сразу в поле и обратно на кнопку, хотя прежний режим ещё уходит; в пресете none уход заканчивается сразу', async () => {
		const user = userEvent.setup()
		const { host, model } = renderInMotionNone()

		await user.click(screen.getByRole('button', { name: 'Проект: Альфа' }))
		expect(screen.getByRole('textbox', { name: 'Проект' })).toHaveFocus()
		await waitFor(() => expect(host.querySelector('.base-inplace__display')).not.toBeInTheDocument())
		await user.keyboard('Бета{Enter}')
		expect(model.value).toBe('Бета')
		await waitFor(() => expect(screen.getByRole('button', { name: 'Проект: Бета' })).toHaveFocus())
		await waitFor(() => expect(host.querySelector('.base-inplace__field')).not.toBeInTheDocument())
		expect(host.querySelector('.base-inplace-mode-leave-active')).not.toBeInTheDocument()
		host.remove()
	})
})
