import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseSeparator.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'
import BaseSeparator from '../../../ui/BaseSeparator.vue'
import { BaseAnimation } from '@components/BaseAnimation'

const motion = motionPresetsStory({
	item: `
		<BaseAnimation :key="replay" name="fade">
			<BaseSeparator v-bind="args" label="или" />
		</BaseAnimation>
	`,
	components: { BaseAnimation, BaseButton, BaseSeparator },
	imports: ['BaseAnimation', 'BaseSeparator'],
	slots: ['orientation', 'label', 'default'],
	omit: ['orientation', 'label', 'default'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['isDashed', 'thickness'] },
		docs: {
			description: {
				story: [
					'Своего движения у разделителя нет — в колонках четырёх пресетов движения он появляется через `BaseAnimation`',
					'(`fade`); «Повторить» монтирует его заново. Длительность и кривая — токены `--rise-duration*` и `--rise-ease*`,',
					"поэтому атрибут `data-rise-motion` меняет движение всей области. Выключить — `createUiKitPlugin({ motion: 'none' })`",
					"или `reducedMotion: 'always'`; системная настройка «уменьшить движение» действует всегда.",
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Повторить' }))
		await waitFor(() => expect(canvas.getAllByRole('separator', { name: 'или' })).toHaveLength(4))
		for (const separator of canvas.getAllByRole('separator', { name: 'или' })) await waitFor(() => expect(separator).toBeVisible())
	},
}
