import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseAiMessage.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'
import BaseAiMessage from '../../../ui/BaseAiMessage.vue'

const motion = motionPresetsStory({
	item: `
		<BaseAiMessage v-bind="args" content="Готово: пакет установлен, плагин подключён." :is-streaming="isStreaming" />
	`,
	components: { BaseAiMessage, BaseButton },
	imports: ['BaseAiMessage'],
	state: { isStreaming: true },
	action: 'isStreaming = !isStreaming',
	trigger: 'Сменить статус',
	slots: ['default', 'actions'],
	omit: ['content', 'isStreaming', 'default', 'actions'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Смена статуса ответа в четырёх пресетах движения: «Сменить статус» завершает поток или запускает его снова.',
					'Пока ответ идёт, в конце текста мигает курсор (`--rise-duration-loop`, BaseMarkdown). Когда ответ готов, действия',
					'появляются сдвигом на `--rise-motion-distance` и проявлением за `--rise-duration` на `--rise-ease-out`, уходят за',
					'`--rise-duration-fast`; так же появляется блок ошибки. Анимируются только `transform` и `opacity`.',
					"В `none` и при «уменьшить движение» действия появляются сразу. Выключить в приложении — `createUiKitPlugin({ motion: 'none' })`",
					"или `reducedMotion: 'always'`.",
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		await expect(canvas.queryAllByRole('button', { name: 'Копировать ответ' })).toHaveLength(0)
		await userEvent.click(canvas.getByRole('button', { name: 'Сменить статус' }))
		await waitFor(() => expect(canvas.getAllByRole('button', { name: 'Копировать ответ' })).toHaveLength(4))
		await waitFor(() => expect(canvas.getAllByRole('article').filter(article => article.hasAttribute('aria-busy'))).toHaveLength(0))
	},
}
