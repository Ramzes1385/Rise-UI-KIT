import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseMediaPlayer.stories'
import { motionPresetsStory } from '@/stories/helpers'
import { expect, waitFor, within } from 'storybook/test'
import BaseMediaPlayer from '../../../ui/BaseMediaPlayer.vue'

const motion = motionPresetsStory({
	item: `
		<BaseMediaPlayer :key="replay" v-bind="args" />
	`,
	components: { BaseMediaPlayer, BaseButton },
	imports: ['BaseMediaPlayer'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	args: { title: 'Анимации плеера', idleTimeout: 1500 },
	parameters: {
		a11y: { config: { rules: [{ id: 'landmark-unique', enabled: false }] } },
		maxWidth: 1400,
		controls: { include: ['idleTimeout', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Плеер в четырёх пресетах движения. Запустите ролик: через `idleTimeout` без движения мыши панель управления',
					'и название уходят (`opacity` и `transform`, `--rise-duration-slow`, кривая `--rise-ease-emphasized`), движение',
					'мыши возвращает их. Меню настроек раскрывается из кнопки (сдвиг и масштаб, `--rise-duration`), вложенный',
					'список въезжает сбоку, индикатор загрузки и кнопка «Пропустить» появляются миксинами `enter-fade` и',
					'`enter-slide`, боковые панели глав и серий — шторкой со ступенчатым появлением строк. Длительности плеера',
					'— кратные токенам `--rise-duration-*`, поэтому пресеты `subtle` и `expressive` ускоряют и замедляют всё сразу;',
					"«Повторить» монтирует плееры заново. Выключить движение в приложении — `createUiKitPlugin({ motion: 'none' })`",
					"или `reducedMotion: 'always'`; системная настройка «уменьшить движение» действует всегда, мини-плеер тогда",
					'возвращается к месту на странице без плавной прокрутки.',
					'Одинаковые экземпляры для сравнения — регионы с одним именем, поэтому правило axe `landmark-unique` у этой истории выключено.',
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, canvasElement, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Повторить' }))
		const players = await waitFor(() => {
			const found = [...canvasElement.querySelectorAll<HTMLElement>('.base-media-player')]
			expect(found).toHaveLength(4)
			return found
		})
		for (const player of players) await waitFor(() => expect(player.querySelector('.base-media-player__controls')).toBeVisible())

		const standard = within(players[2])
		await userEvent.click(standard.getByRole('button', { name: 'Скорость воспроизведения' }))
		await waitFor(() => expect(standard.getByRole('slider', { name: 'Скорость воспроизведения' })).toBeVisible())
	},
}
