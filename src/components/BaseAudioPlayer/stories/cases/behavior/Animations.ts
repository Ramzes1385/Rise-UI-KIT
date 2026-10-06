import podcastVtt from '../../media/podcast.vtt'
import { expect, waitFor } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseAudioPlayer.stories'
import { motionPresetsStory } from '@/stories/helpers'
import BaseAudioPlayer from '../../../ui/BaseAudioPlayer.vue'
import { DEMO_TALK, DEMO_TALK_DURATION, DEMO_TALK_PEAKS } from '../../shared'

const motion = motionPresetsStory({
	item: `
		<BaseAudioPlayer :key="replay" v-bind="args" />
	`,
	components: { BaseAudioPlayer, BaseButton },
	imports: ['BaseAudioPlayer'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	args: {
		src: DEMO_TALK,
		title: 'Разговоры о звуке, выпуск 12',
		hasTitle: true,
		peaks: DEMO_TALK_PEAKS,
		bars: 64,
		duration: DEMO_TALK_DURATION,
		transcript: podcastVtt,
	},
	decorators: [() => ({ template: '<div style="--story-motion-min: 360px;"><story /></div>' })],
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Плеер в четырёх пресетах движения. Пуск и пауза: новый значок проявляется и вырастает (`opacity` и `transform: scale`,',
					'`--rise-duration`, `--rise-ease-spring`), прежний исчезает сразу — кнопка не меняет ширину. Кнопки и реплики меняют фон',
					'плавно (`--rise-duration-fast`, `--rise-ease`). Панель расшифровки (кнопка справа) выезжает сверху и проявляется',
					'(`transform` и `opacity`, `--rise-duration`), текущая реплика подсвечивается цветом. Прогресс на волне — цвет столбиков,',
					'без анимации ширины. «Повторить» монтирует плееры заново. Выключить движение в приложении —',
					"`createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`; системная настройка «уменьшить движение» действует всегда.",
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Повторить' }))
		const toggles = canvas.getAllByRole('button', { name: 'Расшифровка' })
		await expect(toggles).toHaveLength(4)
		for (const toggle of toggles) await userEvent.click(toggle)
		await waitFor(() => expect(canvas.getAllByRole('region', { name: 'Расшифровка' })).toHaveLength(4))
		for (const panel of canvas.getAllByRole('region', { name: 'Расшифровка' })) await waitFor(() => expect(panel).toBeVisible())
	},
}
