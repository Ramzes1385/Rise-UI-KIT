import { expect, waitFor } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseCommentThread.stories'
import BaseCommentThread from '../../../ui/BaseCommentThread.vue'
import { motionPresetsStory, STORY_USERS, storyDate } from '@/stories/helpers'

const [anna, ivan, maria] = STORY_USERS.map(user => ({ name: user.name, avatar: user.avatar }))

const question = { id: 'q', author: anna, text: 'Переносим релиз на пятницу?', date: storyDate(0, 9, 0) }

const answers = [
	{ id: 'a1', author: ivan, text: 'Да, тесты оплаты ещё идут.', date: storyDate(0, 9, 20) },
	{ id: 'a2', author: maria, text: 'Предупрежу заказчика.', date: storyDate(0, 9, 40) },
	{ id: 'a3', author: anna, text: 'Решено: пятница, 10:00.', date: storyDate(0, 10, 0) },
]

const motion = motionPresetsStory({
	item: `
		<BaseCommentThread v-bind="args" :comments="[{ ...question, replies: answers.slice(0, count) }]" is-readonly />
	`,
	components: { BaseCommentThread, BaseButton },
	imports: ['BaseCommentThread'],
	state: { question, answers, count: 1 },
	action: 'count = count === answers.length ? 1 : count + 1',
	trigger: 'Новый ответ',
	slots: [],
	omit: ['comments', 'isReadonly', 'currentUser'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Новые ответы в четырёх пресетах движения: «Новый ответ» добавляет ответ, после третьего — снова один.',
					'Пришедший комментарий или ответ въезжает снизу на `--rise-motion-distance` с проявлением за `--rise-duration`',
					'(`--rise-ease-out`), соседи сдвигаются через `transform`; удалённый исчезает сразу, первая отрисовка — без анимации.',
					'«Скрыть ответы» сворачивает ветку по высоте (`grid-template-rows`) за `--rise-duration-slow` на `--rise-ease-emphasized`',
					'с угасанием за `--rise-duration`; «Показать» — обратно.',
					"В `none` и при «уменьшить движение» — сразу. Выключить в приложении — `createUiKitPlugin({ motion: 'none' })`",
					"или `reducedMotion: 'always'`.",
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Новый ответ' }))
		await waitFor(() => expect(canvas.getAllByText('Предупрежу заказчика.')).toHaveLength(4))
		await waitFor(() => expect(canvas.getAllByRole('article')).toHaveLength(12))
		await userEvent.click(canvas.getAllByRole('button', { name: 'Скрыть ответы' })[0])
		await waitFor(() => expect(canvas.getAllByRole('button', { name: 'Показать 2 ответа' })).toHaveLength(1))
	},
}
