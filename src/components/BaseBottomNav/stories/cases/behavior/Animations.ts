import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseBottomNav.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'
import BaseBottomNav from '../../../ui/BaseBottomNav.vue'

const motion = motionPresetsStory({
	item: `
		<BaseBottomNav v-bind="args" v-model="active" />
	`,
	components: { BaseBottomNav, BaseButton },
	imports: ['BaseBottomNav'],
	state: { active: 'home' },
	action: "active = active === 'home' ? 'favorites' : 'home'",
	trigger: 'Другой пункт',
	omit: ['modelValue'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		a11y: { config: { rules: [{ id: 'landmark-unique', enabled: false }] } },
		docs: {
			description: {
				story: [
					'Индикатор выбранного пункта в четырёх пресетах движения: «Другой пункт» переключает выбор между «Главной» и «Избранным».',
					'Индикатор один на панель (в `default`, `soft`, `outline`, `ghost`, `notched` — «пилюля» под значком, в `floating` и `glass` —',
					'подложка ячейки) и переезжает к новому пункту: `transform` и размер за `--rise-duration` на кривой `--rise-ease-spring`.',
					'Прятанье панели (`hideOnScroll`) — `transform` за `--rise-duration` на `--rise-ease`. Первый показ — без анимации.',
					"В `none` и при «уменьшить движение» индикатор сразу на месте. Выключить в приложении — `createUiKitPlugin({ motion: 'none' })`",
					"или `reducedMotion: 'always'`.",
					'В превью четыре панели с одним именем ориентира, поэтому правило axe `landmark-unique` у этой истории выключено.',
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, canvasElement, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Другой пункт' }))
		await waitFor(() => expect(canvas.getAllByRole('button', { name: 'Избранное', current: 'page' })).toHaveLength(4))
		await waitFor(() =>
			expect(canvasElement.querySelector('[data-rise-motion="none"] .base-bottom-nav__indicator')).toHaveClass(
				'base-bottom-nav__indicator--instant',
			),
		)
	},
}
