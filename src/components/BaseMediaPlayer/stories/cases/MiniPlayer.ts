import { expect } from 'storybook/test'
import type meta from '../BaseMediaPlayer.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import BaseMediaPlayer from '../../ui/BaseMediaPlayer.vue'

const PARAGRAPHS = Array.from({ length: 12 }, (_, index) => index + 1)

export const MiniPlayer: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			story: { inline: false, height: '560px' },
			description: {
				story: [
					'Мини-плеер (`has-mini-player`): запустите запись и прокрутите страницу вниз — плеер переедет в правый нижний угол окна',
					'и продолжит играть; на его месте останется подпись. «Вернуть плеер на место» прокручивает к плееру, «Закрыть мини-плеер»',
					'ставит запись на паузу. Когда место плеера снова видно, плеер возвращается сам. Мини-плеер работает через',
					'`position: fixed`: у предков плеера не должно быть `transform`, `filter` и `contain`, иначе угол считается от них.',
					'Здесь же — «Картинка в картинке» браузера (кнопка в панели), подсветка (кнопка «…» → «Подсветка») и поворот картинки',
					'(правый клик → «Повернуть картинку»).',
				].join('\n'),
			},
		},
	},
	args: { hasMiniPlayer: true },
	render: args => ({
		components: { BaseMediaPlayer },
		setup: () => ({ props: useArgsWithoutSlots(args), paragraphs: PARAGRAPHS }),
		template: `
			<div style="display: grid; gap: 16px; max-width: 720px; margin: 0 auto; padding: 16px 0 60vh; font: 15px/1.6 system-ui, sans-serif">
				<p>Запустите запись и прокрутите страницу: плеер переедет в угол окна.</p>
				<BaseMediaPlayer v-bind="props" />
				<p v-for="paragraph in paragraphs" :key="paragraph">
					Абзац {{ paragraph }}. Текст страницы вокруг плеера: статья, описание серии или комментарии.
					Пока место плеера прокручено выше края окна, запись играет в мини-плеере.
				</p>
			</div>`,
	}),
	play: async ({ canvasElement }) => {
		await expect(canvasElement.querySelector('.base-media-player')).not.toHaveClass('base-media-player--mini')
	},
}
