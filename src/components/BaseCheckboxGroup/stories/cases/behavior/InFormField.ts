import { ref } from 'vue'
import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseCheckboxGroup.stories'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { BaseFormField } from '@components/BaseFormField'
import BaseCheckboxGroup from '../../../ui/BaseCheckboxGroup.vue'

export const InFormField: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Группа в BaseFormField: подпись обёртки — имя группы, описание и ошибка обёртки описывают группу.' },
		},
		controls: { include: ['variant', 'sizeScale', 'isVertical'] },
	},
	render: args => ({
		components: { BaseCheckboxGroup, BaseFormField },
		setup: () => ({ props: useArgsWithoutSlots(args, ['label', 'modelValue']), selected: ref<(string | number)[]>(['push']) }),
		template: `
			<BaseFormField label="Куда присылать отчёты" description="Отчёт приходит каждый понедельник">
				<BaseCheckboxGroup v-bind="props" v-model="selected" />
			</BaseFormField>
		`,
	}),
	play: async ({ canvas }) => {
		const group = canvas.getByRole('group', { name: 'Куда присылать отчёты' })
		await expect(group).toHaveAccessibleDescription('Отчёт приходит каждый понедельник')
		await expect(canvas.getByRole('checkbox', { name: 'Push-уведомления' })).toBeChecked()
	},
}
