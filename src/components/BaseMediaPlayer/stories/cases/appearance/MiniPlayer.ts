import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseMediaPlayer.stories'
import BaseMediaPlayer from '../../../ui/BaseMediaPlayer.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const paragraphs = Array.from({ length: 12 }, (_, index) => index + 1)

const template = `
	<div style="display: grid; gap: 16px; max-width: 720px; margin: 0 auto; padding: 16px 0 60vh; font: 15px/1.6 var(--rise-font-sans)">
		<p>Запустите запись и прокрутите страницу: плеер переедет в угол окна.</p>
		<BaseMediaPlayer v-bind="args" />
		<p v-for="paragraph in paragraphs" :key="paragraph">
			Абзац {{ paragraph }}. Текст страницы вокруг плеера: статья, описание серии или комментарии.
			Пока место плеера прокручено выше края окна, запись играет в мини-плеере.
		</p>
	</div>
`

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
			source: storySource({
				template,
				imports: [],
				importsFrom: { '@ramzes1385/rise-ui-kit/media': ['BaseMediaPlayer'] },
				script: `const paragraphs = ${literal(paragraphs)}`,
			}),
		},
	},
	args: { hasMiniPlayer: true },
	render: args => ({
		components: { BaseMediaPlayer },
		setup: useStorySetup(args, { data: { paragraphs } }),
		template,
	}),
	play: async ({ canvasElement }) => {
		await expect(canvasElement.querySelector('.base-media-player')).not.toHaveClass('base-media-player--mini')
	},
}
