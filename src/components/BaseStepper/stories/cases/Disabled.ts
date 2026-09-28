import { STEPS } from '../shared'
import { expect } from 'storybook/test'
import type meta from '../BaseStepper.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import type { BaseStepperStep } from '../../types/BaseStepper.types'

const DISABLED_STEPS: BaseStepperStep[] = [STEPS[0], STEPS[1], { ...STEPS[2], isDisabled: true }, STEPS[3]]

export const Disabled: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Отключённый шаг приглушён, помечен `aria-disabled`, выведен из порядка Tab и не выбирается.' } },
	},
	args: { items: DISABLED_STEPS },
	play: async ({ canvas }) => {
		const disabled = canvas.getByRole('button', { name: /Оплата/ })
		await expect(disabled).toHaveAttribute('aria-disabled', 'true')
		await expect(disabled).toHaveAttribute('tabindex', '-1')
	},
}
