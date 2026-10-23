import { expect } from 'storybook/test'
import { storySource } from '@/stories/helpers'
import type meta from '../../BaseFormWizard.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { type WizardCaseOptions, wizardRender, wizardSource } from '../../shared'

const options: WizardCaseOptions = { template: '<BaseFormWizard v-bind="args" :steps="[]" />', script: '' }
const source = storySource(wizardSource(options))

export const Empty: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Пустой список `steps`: вместо степпера и кнопок — пустое состояние. Шаги можно подгрузить позже, мастер сразу откроет первый.',
			},
			source: source,
		},
	},
	render: wizardRender(options),
	play: async ({ canvas }) => {
		await expect(canvas.getByText('Шаги не заданы')).toBeVisible()
		await expect(canvas.queryByRole('button')).not.toBeInTheDocument()
	},
}
