import type meta from '../../BaseEditor.stories'
import { expect, waitFor } from 'storybook/test'
import BaseEditor from '../../../ui/BaseEditor.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'
import { BaseAnimation } from '@components/BaseAnimation'

const motion = motionPresetsStory({
	item: `
		<BaseAnimation :key="replay" name="slide-up">
			<BaseEditor v-bind="args" v-model="html" :has-toolbar="false" style="--editor-min-height: 72px" />
		</BaseAnimation>
	`,
	components: { BaseAnimation, BaseButton, BaseEditor },
	imports: ['BaseAnimation', 'BaseEditor'],
	state: { html: '<p>Заметка к задаче</p>' },
	slots: ['toolbar'],
	omit: ['toolbar', 'modelValue', 'hasToolbar', 'onUpdate:modelValue'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Своего движения у редактора почти нет: рамка и кольцо фокуса (`--rise-editor-border-focus`) и обводка медиа при наведении',
					'сменяются за `--rise-duration-fast` / `--rise-duration` на кривой `--rise-ease`. Поэтому в колонках четырёх пресетов',
					'поле появляется через `BaseAnimation` (`slide-up`); «Повторить» монтирует его заново, щелчок по тексту показывает смену',
					'рамки в фокусе. Длительность и сдвиг — токены `--rise-duration*` и `--rise-motion-distance`.',
					"В `none` и при «уменьшить движение» всё сразу в конечном виде. Выключить — `createUiKitPlugin({ motion: 'none' })`",
					"или `reducedMotion: 'always'`.",
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, canvasElement, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Повторить' }))
		await waitFor(() => expect(canvas.getAllByRole('textbox', { name: 'Текстовый редактор' })).toHaveLength(4))
		for (const editor of canvasElement.querySelectorAll('.base-editor')) await waitFor(() => expect(editor).toBeVisible())
		await userEvent.click(canvas.getAllByRole('textbox', { name: 'Текстовый редактор' })[0])
		await waitFor(() => expect(canvasElement.querySelector('.base-editor')).toHaveClass('base-editor--focused'))
	},
}
