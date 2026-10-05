import { REACTIONS } from '../../shared'
import { expect, waitFor } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseEmojiPicker.stories'
import { motionPresetsStory } from '@/stories/helpers'
import { BaseAnimation } from '@components/BaseAnimation'
import BaseEmojiPicker from '../../../ui/BaseEmojiPicker.vue'

const motion = motionPresetsStory({
	item: `
		<BaseAnimation :key="replay" name="scale">
			<BaseEmojiPicker v-bind="args" :emojis="reactions" :columns="4" :has-search="false" />
		</BaseAnimation>
	`,
	components: { BaseAnimation, BaseButton, BaseEmojiPicker },
	imports: ['BaseAnimation', 'BaseEmojiPicker'],
	state: { reactions: REACTIONS },
	omit: ['emojis', 'columns', 'hasSearch'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['variant', 'hasPreview', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Своё движение пикера — отклик ячеек: фон наведения (`--rise-emoji-picker-emoji-bg-hover`) и цвета вкладок сменяются',
					'за `--rise-duration-fast` на кривой `--rise-ease`, нажатая ячейка коротко сжимается (`transform`) на тех же токенах.',
					'Чтобы сравнить пресеты, наведите курсор на ячейки в колонках; «Повторить» заново показывает панели через',
					'`BaseAnimation` (`scale`) — так пикер появляется в поповере.',
					'В `none` и при «уменьшить движение» длительности почти нулевые — наведение и нажатие сразу в конечном виде, без сжатия.',
					"Выключить в приложении — `createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`.",
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, canvasElement, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Повторить' }))
		await waitFor(() => expect(canvasElement.querySelectorAll('.base-emoji-picker')).toHaveLength(4))
		for (const picker of canvasElement.querySelectorAll('.base-emoji-picker')) await waitFor(() => expect(picker).toBeVisible())
		await expect(canvas.getAllByRole('button', { name: 'нравится' })).toHaveLength(4)
	},
}
