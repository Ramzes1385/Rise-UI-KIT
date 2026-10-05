import type meta from '../../BaseChat.stories'
import BaseChat from '../../../ui/BaseChat.vue'
import { SHOWCASE_MESSAGES } from '../../shared'
import { expect, waitFor } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'

const motion = motionPresetsStory({
	item: `
		<BaseChat v-bind="args" :messages="messages" height="360px" />
	`,
	components: { BaseChat, BaseButton },
	imports: ['BaseChat'],
	state: { messages: SHOWCASE_MESSAGES },
	action: "messages = [...messages, { id: 'new-' + messages.length, sender: 'me', text: 'Сообщение ' + messages.length, time: '10:30', status: 'sent' }]",
	trigger: 'Новое сообщение',
	slots: ['messages'],
	omit: ['messages', 'height'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	args: { quickReplies: [] },
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Новое сообщение в четырёх пресетах движения: «Новое сообщение» добавляет своё сообщение в конец ленты.',
					'Оно въезжает снизу с проявлением — сдвиг `--rise-motion-distance`, `--rise-duration`, `--rise-ease-out`, — а лента плавно',
					'докручивается до него (`scrollTo` с `behavior: smooth`). Удалённое гаснет за `--rise-duration-fast`, соседи сдвигаются',
					'(`transform`). Первый показ, подгрузка истории в начало и смена поиска — без анимации и с мгновенной прокруткой.',
					"В `none` и при «уменьшить движение» — сразу. Выключить в приложении — `createUiKitPlugin({ motion: 'none' })`",
					"или `reducedMotion: 'always'`.",
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, canvasElement, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Новое сообщение' }))
		await waitFor(() => expect(canvas.getAllByText('Сообщение 3')).toHaveLength(4))
		await waitFor(() => expect(canvasElement.querySelectorAll('.base-chat-message-enter-active')).toHaveLength(0))
	},
}
