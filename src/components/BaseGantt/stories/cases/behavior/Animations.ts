import type meta from '../../BaseGantt.stories'
import { expect, waitFor } from 'storybook/test'
import BaseGantt from '../../../ui/BaseGantt.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'

const motion = motionPresetsStory({
	item: `
		<BaseGantt v-bind="args" :collapsed-ids="collapsed" :height="260" />
	`,
	state: { collapsed: [] },
	action: "collapsed = collapsed.length ? [] : ['dev']",
	trigger: 'Свернуть или развернуть',
	components: { BaseGantt, BaseButton },
	imports: ['BaseGantt'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['variant', 'scale'] },
		docs: {
			description: {
				story: [
					'Сворачивание этапа «Разработка» кнопкой сверху (или клавишами Left, Right, Enter в списке) в четырёх пресетах движения: стрелка в строке названия',
					'поворачивается за `--rise-duration-slow`, дети исчезают сразу — строки виртуализируются. Полоса при перетаскивании следует за указателем без анимации.',
					"В `none` и при «уменьшить движение» стрелка переключается сразу. Выключить движение в приложении — `createUiKitPlugin({ motion: 'none' })`",
					"или `reducedMotion: 'always'`.",
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		await expect(canvas.getAllByText('Вёрстка')).toHaveLength(4)
		await userEvent.click(canvas.getByRole('button', { name: 'Свернуть или развернуть' }))
		await waitFor(() => expect(canvas.queryAllByText('Вёрстка')).toHaveLength(0))
		await userEvent.click(canvas.getByRole('button', { name: 'Свернуть или развернуть' }))
		await waitFor(() => expect(canvas.getAllByText('Вёрстка')).toHaveLength(4))
	},
}
