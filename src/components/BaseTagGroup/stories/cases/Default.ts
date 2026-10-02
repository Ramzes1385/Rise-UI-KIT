import { expect } from 'storybook/test'
import type meta from '../BaseTagGroup.stories'
import BaseTagGroup from '../../ui/BaseTagGroup.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'

const models = { selected: 'modelValue' }

const template = `<BaseTagGroup v-bind="args" v-model="selected" />`

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Несколько выбранных (`selectionMode="multiple"`): `v-model` — массив значений. Tab переходит между метками, Space и Enter переключают выбор.',
			},
			source: storySource({ template, imports: ['BaseTagGroup'], models, types: { selected: 'TagGroupModelValue' } }),
		},
	},
	render: args => ({
		components: { BaseTagGroup },
		setup: useStorySetup(args, { models, slots: ['tag'] }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const group = canvas.getByRole('group', { name: 'Технологии' })
		await expect(group).toBeVisible()
		const vue = canvas.getByRole('button', { name: 'Vue' })
		await expect(vue).toHaveAttribute('aria-pressed', 'true')
		await tabTo(vue, userEvent)
		await userEvent.tab()
		await userEvent.keyboard(' ')
		await expect(canvas.getByRole('button', { name: 'React' })).toHaveAttribute('aria-pressed', 'true')
		await expect(vue).toHaveAttribute('aria-pressed', 'true')
	},
}
