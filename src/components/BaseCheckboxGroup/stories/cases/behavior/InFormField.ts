import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseCheckboxGroup.stories'
import { BaseFormField } from '@components/BaseFormField'
import { storySource, useStorySetup } from '@/stories/helpers'
import BaseCheckboxGroup from '../../../ui/BaseCheckboxGroup.vue'

const state = { selected: ['push'] }

const template = `
	<BaseFormField label="Куда присылать отчёты" description="Отчёт приходит каждый понедельник">
		<BaseCheckboxGroup v-bind="args" v-model="selected" />
	</BaseFormField>
`

export const InFormField: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Группа в BaseFormField: подпись обёртки — имя группы, описание и ошибка обёртки описывают группу.' },
			source: storySource({
				template,
				imports: ['BaseCheckboxGroup', 'BaseFormField'],
				state,
				types: { selected: '(string | number)[]' },
				omit: ['label', 'modelValue'],
			}),
		},
		controls: { include: ['variant', 'sizeScale', 'isVertical'] },
	},
	render: args => ({
		components: { BaseCheckboxGroup, BaseFormField },
		setup: useStorySetup(args, { state, slots: ['label', 'modelValue'] }),
		template,
	}),
	play: async ({ canvas }) => {
		const group = canvas.getByRole('group', { name: 'Куда присылать отчёты' })
		await expect(group).toHaveAccessibleDescription('Отчёт приходит каждый понедельник')
		await expect(canvas.getByRole('checkbox', { name: 'Push-уведомления' })).toBeChecked()
	},
}
