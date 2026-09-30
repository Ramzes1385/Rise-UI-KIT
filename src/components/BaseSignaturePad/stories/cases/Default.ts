import { expect } from 'storybook/test'
import type meta from '../BaseSignaturePad.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseSignaturePad from '../../ui/BaseSignaturePad.vue'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'

const models = { signature: 'modelValue' }

const template = `
	<BaseSignaturePad v-bind="args" v-model="signature" />
`

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Песочница: v-model связан с Controls — штрихи появляются в панели. Проверка рисует штрих и отменяет его с клавиатуры.',
			},
			source: storySource({ template, imports: ['BaseSignaturePad'], models }),
		},
	},
	render: args => ({
		components: { BaseSignaturePad },
		setup: useStorySetup(args, { models }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const surface = canvas.getByRole('img', { name: 'Подписи нет' })
		const { left, top } = surface.getBoundingClientRect()
		await userEvent.pointer([
			{ keys: '[MouseLeft>]', target: surface, coords: { clientX: left + 40, clientY: top + 100 } },
			{ coords: { clientX: left + 120, clientY: top + 60 } },
			{ coords: { clientX: left + 220, clientY: top + 110 } },
			{ keys: '[/MouseLeft]' },
		])
		await expect(canvas.getByRole('img', { name: 'Подпись: 1 штрих' })).toBeVisible()
		await tabTo(canvas.getByRole('button', { name: 'Отменить штрих' }), userEvent)
		await userEvent.keyboard('{Enter}')
		await expect(canvas.getByRole('img', { name: 'Подписи нет' })).toBeVisible()
	},
}
