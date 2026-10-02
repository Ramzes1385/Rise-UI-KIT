import { expect } from 'storybook/test'
import type meta from '../BaseTreeSelect.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseTreeSelect from '../../ui/BaseTreeSelect.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { value: 'modelValue' }

const template = `<BaseTreeSelect v-bind="args" v-model="value" />`

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Песочница: v-model связан с Controls — введённый текст появляется в панели.' },
			source: storySource({ template, imports: ['BaseTreeSelect'], models }),
		},
	},
	render: args => ({
		components: { BaseTreeSelect },
		setup: useStorySetup(args, { models }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const field = canvas.getByLabelText('Название')
		await userEvent.tab()
		await expect(field).toHaveFocus()
		await userEvent.type(field, 'Отчёт')
		await expect(field).toHaveValue('Отчёт')
	},
}
