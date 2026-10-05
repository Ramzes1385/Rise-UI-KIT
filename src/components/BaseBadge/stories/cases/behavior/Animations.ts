import type meta from '../../BaseBadge.stories'
import { expect, waitFor } from 'storybook/test'
import BaseBadge from '../../../ui/BaseBadge.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'

const motion = motionPresetsStory({
	item: `
		<BaseBadge v-bind="args" :label="String(count)" />
	`,
	components: { BaseBadge, BaseButton },
	imports: ['BaseBadge'],
	state: { count: 3 },
	action: 'count++',
	trigger: 'Новое значение',
	slots: ['label', 'default'],
	omit: ['label', 'default'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Смена текста (счётчик, статус) в четырёх пресетах движения: «Новое значение» увеличивает число.',
					'Новое значение появляется с «pop» — масштаб от `--rise-motion-scale-from` на кривой `--rise-ease-spring` за `--rise-duration`,',
					'старое гаснет за `--rise-duration-fast` поверх него, без скачка ширины. Первый показ — без анимации.',
					"В `none` и при «уменьшить движение» текст меняется сразу. Выключить в приложении — `createUiKitPlugin({ motion: 'none' })`",
					"или `reducedMotion: 'always'`.",
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Новое значение' }))
		await waitFor(() => expect(canvas.getAllByText('4')).toHaveLength(4))
		await waitFor(() => expect(canvas.queryAllByText('3')).toHaveLength(0))
	},
}
