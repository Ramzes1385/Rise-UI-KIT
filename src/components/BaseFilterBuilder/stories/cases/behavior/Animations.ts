import { SAMPLE_FILTER } from '../../shared'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'
import type meta from '../../BaseFilterBuilder.stories'
import { expect, waitFor, within } from 'storybook/test'
import BaseFilterBuilder from '../../../ui/BaseFilterBuilder.vue'
import type { FilterBuilderGroup } from '../../../types/BaseFilterBuilder.types'

const URGENT = { id: 'sample-urgent', field: 'isUrgent', operator: 'isTrue', value: '' } as const

const phases: FilterBuilderGroup[] = [
	SAMPLE_FILTER,
	{ ...SAMPLE_FILTER, conditions: [...SAMPLE_FILTER.conditions, URGENT] },
	{ ...SAMPLE_FILTER, conditions: [...SAMPLE_FILTER.conditions.slice(1), URGENT] },
]

const motion = motionPresetsStory({
	item: `
		<BaseFilterBuilder v-bind="args" :model-value="phases[phase]" />
	`,
	components: { BaseFilterBuilder, BaseButton },
	imports: ['BaseFilterBuilder'],
	state: { phase: 0, phases },
	action: 'phase = (phase + 1) % phases.length',
	trigger: 'Добавить и удалить условие',
	omit: ['modelValue'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Фильтр в колонках четырёх пресетов движения; кнопка по кругу добавляет условие «Срочно», убирает первое условие и',
					'возвращает исходный фильтр. Новое условие проявляется со сдвигом `--rise-motion-distance` за `--rise-duration`,',
					'удалённое гаснет на своём месте за `--rise-duration-fast` (уходящая строка недоступна скринридеру и фокусу), соседи',
					'сдвигаются через `transform` (`<TransitionGroup>`, кривая `--rise-ease-emphasized`) — без скачка раскладки. В пресете',
					"`none` и при «уменьшить движение» — сразу конечное состояние. Выключить движение в приложении — `createUiKitPlugin({ motion: 'none' })`",
					"или `reducedMotion: 'always'`.",
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		const next = canvas.getByRole('button', { name: 'Добавить и удалить условие' })
		await userEvent.click(next)
		await waitFor(() => expect(canvas.getAllByRole('group', { name: 'Условие 3' })).toHaveLength(4))
		await userEvent.click(next)
		await waitFor(() => expect(canvas.queryAllByRole('group', { name: 'Условие 3' })).toHaveLength(0))
		await waitFor(() => expect(canvas.getAllByRole('group', { name: 'Условие 2' })).toHaveLength(4))
		await userEvent.click(next)
		for (const row of canvas.getAllByRole('group', { name: 'Условие 1' }))
			await expect(within(row).getByRole('combobox', { name: 'Поле' })).toHaveValue('status')
	},
}
