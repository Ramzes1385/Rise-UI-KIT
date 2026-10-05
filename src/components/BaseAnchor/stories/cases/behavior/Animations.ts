import { items } from '../../shared'
import type meta from '../../BaseAnchor.stories'
import { expect, waitFor } from 'storybook/test'
import BaseAnchor from '../../../ui/BaseAnchor.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'

const motion = motionPresetsStory({
	item: `
		<BaseAnchor v-bind="args" v-model:active="active" :items="items" style="width: 180px" />
	`,
	components: { BaseAnchor, BaseButton },
	imports: ['BaseAnchor'],
	state: { active: 'overview', items },
	action: "active = active === 'overview' ? 'delivery' : 'overview'",
	trigger: 'Другой раздел',
	omit: ['active', 'items'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['variant', 'direction', 'sizeScale'] },
		a11y: { config: { rules: [{ id: 'landmark-unique', enabled: false }] } },
		docs: {
			description: {
				story: [
					'Отметка текущего раздела в четырёх пресетах движения: «Другой раздел» переключает текущий между «Обзором» и «Доставкой».',
					'Отметка одна на оглавление (линия у `default`, заливка у `soft`) и переезжает к новому пункту: `transform` и размер',
					'за `--rise-duration` на кривой `--rise-ease-spring`; цвет пунктов меняется за `--rise-duration-fast`. Первый показ — без анимации.',
					"В `none` и при «уменьшить движение» отметка сразу на месте. Выключить в приложении — `createUiKitPlugin({ motion: 'none' })`",
					"или `reducedMotion: 'always'`.",
					'В превью четыре оглавления с одним именем ориентира, поэтому правило axe `landmark-unique` у этой истории выключено.',
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, canvasElement, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Другой раздел' }))
		await waitFor(() => expect(canvas.getAllByRole('link', { name: 'Доставка', current: 'location' })).toHaveLength(4))
		await waitFor(() =>
			expect(canvasElement.querySelector('[data-rise-motion="none"] .base-anchor__indicator')).toHaveClass(
				'base-anchor__indicator--instant',
			),
		)
	},
}
