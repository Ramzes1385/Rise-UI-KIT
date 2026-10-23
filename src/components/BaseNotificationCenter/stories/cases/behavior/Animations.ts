import type { StoryObj } from '@storybook/vue3-vite'
import { expect, waitFor, within } from 'storybook/test'
import { MOTION_PRESETS } from '@composables/app/useMotion'
import type meta from '../../BaseNotificationCenter.stories'
import { literal, storySource, useStorySetup } from '@/stories/helpers'
import BaseNotificationCenter from '../../../ui/BaseNotificationCenter.vue'

const presets = MOTION_PRESETS

const models = { items: 'items', filter: 'filter' }

const OWN_ARGS = ['title']

const template = `
	<div class="story-motion">
		<div class="story-motion__presets">
			<div v-for="preset in presets" :key="preset" class="story-motion__preset" :data-rise-motion="preset">
				<BaseNotificationCenter v-bind="args" v-model:items="items" v-model:filter="filter" :title="preset" />
			</div>
		</div>
	</div>
`

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['variant', 'maxHeight'] },
		docs: {
			description: {
				story: [
					'Фильтр, прочтение и возврат в четырёх пресетах движения (`data-rise-motion` колонки); панели связаны одним `v-model`.',
					'Пункты появляются и уходят прозрачностью, оставшиеся сдвигаются плавно (`transform`); уходящий пункт не занимает места.',
					'Точка «не прочитано» появляется с пружиной (`--rise-ease-spring`) и гаснет, фон непрочитанного пункта меняется плавно.',
					'В `none` и при «уменьшить движение» всё меняется сразу.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseNotificationCenter'],
				script: `const presets = ${literal(presets)}`,
				models,
				omit: OWN_ARGS,
			}),
		},
	},
	render: args => ({
		components: { BaseNotificationCenter },
		setup: useStorySetup(args, { models, data: { presets }, slots: OWN_ARGS }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const panels = canvas.getAllByRole('region')
		const [first] = panels
		const last = panels[panels.length - 1]

		await userEvent.click(within(first).getAllByRole('button', { name: 'Отметить прочитанным' })[0])
		await waitFor(() => expect(within(last).getAllByRole('status')[0]).toHaveTextContent('2 новых'))
		await userEvent.click(within(first).getByRole('radio', { name: /Непрочитанные/ }))
		await waitFor(() => expect(within(last).getAllByRole('listitem')).toHaveLength(2))
		await userEvent.click(within(first).getByRole('radio', { name: 'Все' }))
		await waitFor(() => expect(within(last).getAllByRole('listitem')).toHaveLength(5))
		await userEvent.click(within(first).getByRole('button', { name: 'Прочитать все' }))
		await waitFor(() => expect(last.querySelectorAll('.base-notification-center__dot')).toHaveLength(0))
	},
}
