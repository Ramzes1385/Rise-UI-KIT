import { ONBOARDING } from '../../shared'
import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseChecklist.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'
import BaseChecklist from '../../../ui/BaseChecklist.vue'

const phases = [
	{ items: ONBOARDING.slice(0, 3), completed: ['install'] },
	{ items: ONBOARDING, completed: ['install'] },
	{ items: ONBOARDING, completed: ['install', 'plugin'] },
]

const motion = motionPresetsStory({
	item: `
		<BaseChecklist v-bind="args" :items="phases[phase].items" :completed="phases[phase].completed" />
	`,
	components: { BaseChecklist, BaseButton },
	imports: ['BaseChecklist'],
	state: { phase: 0, phases },
	action: 'phase = (phase + 1) % phases.length',
	trigger: 'Добавить, отметить, убрать',
	omit: ['items', 'completed'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Шаги в колонках четырёх пресетов движения; кнопка по кругу добавляет шаг «Собрать первую форму», отмечает «Подключить',
					'плагин» и убирает добавленный шаг. Новый шаг проявляется со сдвигом `--rise-motion-distance` за `--rise-duration`,',
					'убранный гаснет на своём месте за `--rise-duration-fast`, соседи сдвигаются через `transform` (`<TransitionGroup>`) —',
					'без скачка раскладки. Отметка — как у BaseCheckbox: цвет названия и зачёркивание проявляются за `--rise-duration-fast`,',
					'подсветка следующего шага переходит плавно. «Всё готово» появляется со сдвигом. В пресете `none` и при «уменьшить',
					"движение» — сразу конечное состояние. Выключить движение в приложении — `createUiKitPlugin({ motion: 'none' })` или",
					"`reducedMotion: 'always'`.",
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		const next = canvas.getByRole('button', { name: 'Добавить, отметить, убрать' })
		await userEvent.click(next)
		await waitFor(() => expect(canvas.getAllByRole('checkbox', { name: 'Собрать первую форму' })).toHaveLength(4))
		await userEvent.click(next)
		for (const box of canvas.getAllByRole('checkbox', { name: 'Подключить плагин' })) await expect(box).toBeChecked()
		await userEvent.click(next)
		await waitFor(() => expect(canvas.queryAllByRole('checkbox', { name: 'Собрать первую форму' })).toHaveLength(0))
		for (const box of canvas.getAllByRole('checkbox', { name: 'Подключить плагин' })) await expect(box).not.toBeChecked()
	},
}
