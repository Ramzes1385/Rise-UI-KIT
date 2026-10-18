import { expect } from 'storybook/test'
import type meta from '../../BaseRoadmap.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseRoadmap from '../../../ui/BaseRoadmap.vue'
import { motionPresetsStory } from '@/stories/helpers'
import { miniProgress, miniRoadmap } from '../../demo/mini'

const motion = motionPresetsStory({
	item: '<BaseRoadmap :key="replay" v-bind="args" aria-label="Старт во Vue — %preset%" />',
	components: { BaseRoadmap, BaseButton },
	imports: ['BaseRoadmap'],
	slots: [],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'layout'] },
		docs: {
			description: {
				story: [
					'Раскрытие этапа в четырёх пресетах движения: «Повторить» собирает роадмап заново. Ветки от хребта к темам прорисовываются,',
					'карточки тем появляются со сдвигом `--rise-motion-stagger`, пройденный участок хребта сплошной, будущий — пунктир с',
					'бегущей точкой (`--rise-motion-loop-state`), у текущего этапа — пульс кольца «Вы здесь» в `motion-safe`.',
					'Раскрытие аккордеона в `list` — плавная высота. В `none` и при «уменьшить движение» всё появляется сразу.',
					"Выключить в приложении — `createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`.",
				].join('\n'),
			},
			source: motion.source,
		},
	},
	decorators: [() => ({ template: '<div style="--story-motion-min: 100%;"><story /></div>' })],
	args: { data: miniRoadmap, progress: miniProgress, layout: 'path', expanded: ['basics'], selected: null, hasLayoutSwitch: false },
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Повторить' }))
		await expect(await canvas.findAllByRole('button', { name: /^Шаблоны/ })).toHaveLength(4)
		await expect(canvas.getAllByRole('region', { name: /^Старт во Vue — / })).toHaveLength(4)
	},
}
