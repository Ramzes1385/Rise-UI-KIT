import type meta from '../../BaseQrCode.stories'
import { expect, waitFor } from 'storybook/test'
import BaseQrCode from '../../../ui/BaseQrCode.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'
import { BaseAnimation } from '@components/BaseAnimation'

const motion = motionPresetsStory({
	item: `
		<BaseAnimation :key="replay" name="scale">
			<BaseQrCode v-bind="args" label="QR-код сайта" />
		</BaseAnimation>
	`,
	components: { BaseAnimation, BaseButton, BaseQrCode },
	imports: ['BaseAnimation', 'BaseQrCode'],
	slots: ['label'],
	omit: ['label'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	args: { size: 120 },
	parameters: {
		controls: { include: ['value', 'variant', 'size'] },
		docs: {
			description: {
				story: [
					'Своего движения у QR-кода нет — в колонках четырёх пресетов движения он появляется через `BaseAnimation` (`scale`);',
					'«Повторить» монтирует его заново. Длительность и масштаб — токены `--rise-duration*` и `--rise-motion-scale-from`,',
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
		await waitFor(() => expect(canvas.getAllByRole('img', { name: 'QR-код сайта' })).toHaveLength(4))
		for (const code of canvas.getAllByRole('img', { name: 'QR-код сайта' })) await waitFor(() => expect(code).toBeVisible())
	},
}
