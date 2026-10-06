import type meta from '../BaseWaveform.stories'
import { expect, waitFor } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import BaseWaveform from '../../ui/BaseWaveform.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'

const motion = motionPresetsStory({
	item: `
		<BaseWaveform v-bind="args" :peaks="replay % 2 ? loud : quiet" :current-time="replay % 2 ? 50 : 15" />
	`,
	components: { BaseWaveform, BaseButton },
	imports: ['BaseWaveform'],
	state: {
		quiet: [0.2, 0.3, 0.25, 0.4, 0.35, 0.3, 0.2, 0.25, 0.3, 0.2, 0.15, 0.25, 0.3, 0.2, 0.25, 0.2],
		loud: [0.6, 0.9, 1, 0.8, 0.7, 0.95, 0.85, 0.6, 0.75, 1, 0.9, 0.7, 0.65, 0.8, 0.9, 0.7],
	},
	trigger: 'Сменить запись',
	omit: ['peaks', 'currentTime'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		maxWidth: 1200,
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Волна в четырёх пресетах движения: «Сменить запись» меняет амплитуды и позицию. Столбики меняют высоту через',
					'`transform: scaleY()` от середины (`--rise-duration`, `--rise-ease-out`) — раскладка не пересчитывается; сыгранная часть',
					'перекрашивается (`background-color`, `--rise-duration`), ширина и положение столбиков не меняются. Выключить движение',
					"в приложении — `createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`: высота и цвет меняются сразу;",
					'системная настройка «уменьшить движение» действует всегда.',
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Сменить запись' }))
		for (const waveform of canvas.getAllByRole('slider', { name: 'Перемотка' }))
			await waitFor(() => expect(waveform).toHaveAttribute('aria-valuetext', '0:50 из 1:05'))
	},
}
