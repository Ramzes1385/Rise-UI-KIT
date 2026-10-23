import { expect } from 'storybook/test'
import type meta from '../../BaseFormField.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseFormField from '../../../ui/BaseFormField.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const state = { volume: 60 }

const template = `
	<div class="story-narrow">
		<BaseFormField v-bind="args">
			<input id="notification-volume" v-model.number="volume" type="range" min="0" max="100" style="width: 100%; accent-color: var(--rise-primary);" />
		</BaseFormField>
	</div>
`

export const LabelFor: StoryObj<typeof meta> = {
	args: {
		label: 'Громкость уведомлений',
		description: 'От 0 до 100%',
		for: 'notification-volume',
	},
	parameters: {
		docs: {
			description: {
				story: [
					'Связь подписи с полем через `for`: значение — `id` поля внутри обёртки. Клик по подписи ставит фокус в поле,',
					'а подпись становится его доступным именем. Здесь — нативный ползунок.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseFormField'], state }),
		},
		controls: { include: ['variant', 'sizeScale', 'error', 'isRequired'] },
	},
	render: args => ({
		components: { BaseFormField },
		setup: useStorySetup(args, { state }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const slider = canvas.getByRole('slider', { name: 'Громкость уведомлений' })
		await userEvent.click(canvas.getByText('Громкость уведомлений'))
		await expect(slider).toHaveFocus()
		await expect(canvas.queryByRole('group')).toBeNull()
	},
}
