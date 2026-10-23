import type meta from '../../BaseList.stories'
import BaseList from '../../../ui/BaseList.vue'
import { TASKS, listTitles } from '../../shared'
import { expect, waitFor } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'

const [design, api, tests, release] = TASKS

const frames = [
	[design, api, tests],
	[design, release, api, tests],
	[design, release, tests],
	[tests, design, release],
]

const motion = motionPresetsStory({
	item: `
		<BaseList v-bind="args" :items="frames[step]" />
	`,
	components: { BaseList, BaseButton },
	imports: ['BaseList'],
	steps: ['добавить «Выпуск 2.0»', 'удалить «Метод выгрузки»', 'перемешать'],
	state: { frames },
	omit: ['items'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	args: { selectionMode: 'none', isSortable: false, label: 'Задачи' },
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Строки в колонках четырёх пресетов движения. Кнопка по шагам добавляет строку «Выпуск 2.0», удаляет «Метод выгрузки»',
					'и перемешивает строки, «Повторить» возвращает список к началу. Новая строка проявляется с масштабом `--rise-motion-scale-from` за `--rise-duration`,',
					'удалённая гаснет на своём месте за `--rise-duration-fast` (уходит из потока — `position: absolute`), соседи',
					'сдвигаются через `transform` за `--rise-duration` с кривой `--rise-ease-emphasized` — так же едут строки при',
					'перестановке мышью и клавиатурой. В пресете `none` и при «уменьшить движение» — сразу конечное состояние.',
					'При `is-virtual` строки не анимируются: их положение задаёт замер высот. Выключить движение в приложении —',
					"`createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`.",
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, canvasElement, userEvent }) => {
		const next = canvas.getByRole('button', { name: /^(Следующий шаг|Повторить)/ })
		await expect(canvas.getAllByRole('listitem')).toHaveLength(12)

		await userEvent.click(next)
		await waitFor(() => expect(canvas.getAllByRole('listitem')).toHaveLength(16))
		for (const title of canvas.getAllByText('Выпуск 2.0')) await waitFor(() => expect(title).toBeVisible())

		await userEvent.click(next)
		await waitFor(() => expect(canvas.queryAllByText('Метод выгрузки')).toHaveLength(0))
		await expect(canvas.getAllByRole('listitem')).toHaveLength(12)

		await userEvent.click(next)
		await waitFor(() => expect(listTitles(canvasElement).slice(0, 3)).toEqual(['Тесты оплаты', 'Макет главной', 'Выпуск 2.0']))
	},
}
