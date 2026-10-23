import { docsFrame, CENTERED } from '../../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseColorPicker.stories'
import BaseColorPicker from '../../../ui/BaseColorPicker.vue'
import { expect, screen, waitFor, within } from 'storybook/test'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const models = { color: 'modelValue' }

const state = { recent: ['#be123c', '#0f766e'] }

const centered = CENTERED

const template = `
	<div :style="centered">
		<BaseColorPicker v-bind="args" v-model="color" v-model:recent-colors="recent" />
	</div>
`

export const Palettes: StoryObj<typeof meta> = {
	args: {
		modelValue: '#1d4ed8',
		isPresetsHidden: true,
		palettes: [
			{ label: 'Фирменные', colors: ['#1d4ed8', '#0891b2', '#f97316', '#0f172a', '#f8fafc'] },
			{ label: 'Статусы', colors: ['#16a34a', '#ca8a04', '#dc2626', '#2563eb'] },
		],
	},
	parameters: {
		docs: {
			...docsFrame(460),
			description: {
				story: [
					'Палитры (`palettes`) — именованные группы цветов, например фирменные и статусные. Недавние цвета —',
					'`v-model:recent-colors`: выбранный цвет встаёт в начало списка, когда панель закрывается.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseColorPicker'],
				models,
				state,
				types: { recent: 'string[]' },
				omit: ['recentColors', 'onUpdate:recentColors'],
				script: `const centered = ${literal(centered)}`,
			}),
		},
	},
	render: args => ({
		components: { BaseColorPicker },
		setup: useStorySetup(args, { models, state, data: { centered }, slots: ['recentColors', 'onUpdate:recentColors'] }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const swatch = canvas.getByRole('button', { name: /Выбранный цвет/ })
		await userEvent.click(swatch)
		const statuses = within(await screen.findByRole('group', { name: 'Статусы' }))
		await userEvent.click(statuses.getByRole('button', { name: 'Пресет #16a34a' }))
		await waitFor(() => expect(swatch).toHaveAttribute('aria-expanded', 'false'))

		await userEvent.click(swatch)
		const recent = within(await screen.findByRole('group', { name: 'Недавние' }))
		await expect(recent.getAllByRole('button')[0]).toHaveAccessibleName('Пресет #16a34a')
		await expect(recent.getByRole('button', { name: 'Пресет #16a34a' })).toHaveAttribute('aria-pressed', 'true')
	},
}
