import { expect, waitFor } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import { demoMicrophoneStream } from '../../micDemo'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'
import type meta from '../../BaseVoiceRecorder.stories'
import BaseVoiceRecorder from '../../../ui/BaseVoiceRecorder.vue'

const motion = motionPresetsStory({
	item: `
		<BaseVoiceRecorder :key="replay" v-bind="args" />
	`,
	components: { BaseVoiceRecorder, BaseButton },
	imports: ['BaseVoiceRecorder'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	args: { requestStream: demoMicrophoneStream },
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Диктофон в четырёх пресетах движения; вместо микрофона — звук из Web Audio (`requestStream`). Нажмите микрофон в',
					'колонке: столбики уровня меняют высоту через `transform: scaleY()` от середины (`--rise-duration-fast`,',
					'`--rise-ease-out`) — без пересчёта раскладки; точка записи мигает петлёй `--rise-duration-loop` (только при',
					'`prefers-reduced-motion: no-preference`). «Повторить» монтирует диктофоны заново. Выключить движение в приложении —',
					"`createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`: уровень меняется сразу, точка не мигает;",
					'системная настройка «уменьшить движение» действует всегда.',
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Повторить' }))
		for (const record of canvas.getAllByRole('button', { name: 'Записать голосовое сообщение' })) await userEvent.click(record)
		await waitFor(() => expect(canvas.getAllByRole('button', { name: 'Остановить запись' })).toHaveLength(4))
		for (const cancel of canvas.getAllByRole('button', { name: 'Отменить запись' })) await userEvent.click(cancel)
		await waitFor(() => expect(canvas.getAllByRole('button', { name: 'Записать голосовое сообщение' })).toHaveLength(4))
	},
}
