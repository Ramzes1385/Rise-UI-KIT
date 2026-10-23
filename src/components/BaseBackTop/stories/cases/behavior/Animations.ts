import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseBackTop.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseBackTop from '../../../ui/BaseBackTop.vue'
import { motionPresetsStory } from '@/stories/helpers'

const motion = motionPresetsStory({
	item: `
		<div class="story-frame" style="align-self: stretch; height: 120px;">
			<BaseBackTop v-bind="args" :visibility-height="isShown ? -1 : Infinity" />
		</div>
	`,
	state: { isShown: true },
	action: 'isShown = !isShown',
	trigger: 'Показать или скрыть',
	components: { BaseBackTop, BaseButton },
	imports: ['BaseBackTop'],
	omit: ['visibilityHeight'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['variant', 'isExtended'] },
		docs: {
			description: {
				story: [
					'Появление и уход кнопки в четырёх пресетах движения: прозрачность и масштаб (`--rise-duration`, `--rise-duration-fast`,',
					'`--rise-motion-scale-from`). В приложении кнопку показывает прокрутка, здесь — порог `visibilityHeight`',
					'(`-1` — видна без прокрутки, `Infinity` — скрыта). В `none` и при «уменьшить движение» кнопка появляется и уходит сразу,',
					"прокрутка к началу — без плавности. Выключить движение — `createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`.",
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		await waitFor(() => expect(canvas.getAllByRole('button', { name: 'Наверх' })).toHaveLength(4))
		await userEvent.click(canvas.getByRole('button', { name: 'Показать или скрыть' }))
		await waitFor(() => expect(canvas.queryAllByRole('button', { name: 'Наверх' })).toHaveLength(0))
		await userEvent.click(canvas.getByRole('button', { name: 'Показать или скрыть' }))
		await waitFor(() => expect(canvas.getAllByRole('button', { name: 'Наверх' })).toHaveLength(4))
	},
}
