import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../BaseImageMapEditor.stories'
import { storySource, useStorySetup } from '@/stories/helpers'
import BaseImageMapEditor from '../../ui/BaseImageMapEditor.vue'

const models = { value: 'modelValue' }

const template = `<BaseImageMapEditor v-bind="args" v-model="value" />`

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Песочница: v-model связан с Controls — введённый текст появляется в панели.' },
			source: storySource({ template, imports: ['BaseImageMapEditor'], models }),
		},
	},
	render: args => ({
		components: { BaseImageMapEditor },
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
