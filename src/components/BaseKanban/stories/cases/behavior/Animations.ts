import type meta from '../../BaseKanban.stories'
import { expect, waitFor } from 'storybook/test'
import BaseKanban from '../../../ui/BaseKanban.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'
import type { KanbanCard, KanbanColumn } from '../../../types/BaseKanban.types'

const columns: KanbanColumn[] = [
	{ id: 'todo', title: 'План' },
	{ id: 'done', title: 'Готово', isDone: true },
]

const layout: KanbanCard = { id: 'layout', columnId: 'todo', title: 'Макет экрана' }
const copy: KanbanCard = { id: 'copy', columnId: 'todo', title: 'Тексты кнопок' }
const build: KanbanCard = { id: 'build', columnId: 'done', title: 'Сборка' }
const review: KanbanCard = { id: 'review', columnId: 'todo', title: 'Ревью' }

const phases: KanbanCard[][] = [
	[layout, copy, build],
	[layout, copy, review, build],
	[copy, review, { ...layout, columnId: 'done' }, build],
	[review, { ...layout, columnId: 'done' }, build],
]

const motion = motionPresetsStory({
	item: `
		<BaseKanban v-bind="args" :columns="columns" :cards="phases[step]" />
	`,
	components: { BaseKanban, BaseButton },
	imports: ['BaseKanban'],
	steps: ['добавить «Ревью»', 'перенести «Макет экрана»', 'удалить «Тексты кнопок»'],
	state: { phases, columns },
	omit: ['columns', 'cards'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	decorators: [() => ({ template: '<div style="--story-motion-min: 460px;"><story /></div>' })],
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Доска в колонках четырёх пресетов движения; кнопка по шагам добавляет карточку «Ревью», переносит «Макет экрана»',
					'в «Готово» и удаляет «Тексты кнопок», после последнего шага «Повторить» возвращает доску к началу. Новая карточка проявляется с масштаба `--rise-motion-scale-from` за `--rise-duration`,',
					'удалённая гаснет на своём месте за `--rise-duration-fast` (вне потока, скрыта от скринридера), соседи и перенесённая',
					'карточка едут на новое место через `transform` (FLIP на Web Animations API: длительность `--rise-duration`, кривая',
					'`--rise-ease-emphasized`). Высота колонок не анимируется — меняется сразу, без перерасчёта раскладки на каждом кадре.',
					'Перетаскивание мышью и с клавиатуры использует тот же FLIP. В пресете `none` и при «уменьшить движение» — сразу',
					"конечное состояние. Выключить движение в приложении — `createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`.",
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		const next = canvas.getByRole('button', { name: /^(Следующий шаг|Повторить)/ })
		const shown = (name: string) => canvas.queryAllByRole('button', { name })
		await userEvent.click(next)
		await waitFor(() => expect(shown('Ревью')).toHaveLength(4))
		await userEvent.click(next)
		await waitFor(() => {
			for (const list of canvas.getAllByRole('list', { name: /^Готово/ })) expect(list).toHaveTextContent('Макет экрана')
		})
		await userEvent.click(next)
		await waitFor(() => expect(shown('Тексты кнопок')).toHaveLength(0))
		await expect(next).toHaveAccessibleName('Повторить')
		await userEvent.click(next)
		await waitFor(() => expect(shown('Ревью')).toHaveLength(0))
		await expect(shown('Макет экрана')).toHaveLength(4)
		await expect(next).toHaveAccessibleName('Следующий шаг: добавить «Ревью»')
	},
}
