import type meta from '../../BaseImage.stories'
import { expect, waitFor } from 'storybook/test'
import BaseImage from '../../../ui/BaseImage.vue'
import { expectImagesVisible } from '../../shared'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'

const motion = motionPresetsStory({
	item: `
		<BaseImage :key="replay" v-bind="args" :zoom-config="{ hasZoom: true }" />
	`,
	components: { BaseButton, BaseImage },
	imports: ['BaseImage'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	args: { width: 180, height: 120 },
	parameters: {
		controls: { include: ['src', 'hasPlaceholder', 'fit'] },
		docs: {
			description: {
				story: [
					'Загрузка в колонках четырёх пресетов движения; «Повторить» загружает изображения заново. Плейсхолдер уходит',
					'перекрёстным затуханием поверх уже показанной картинки — без провала к фону (`--rise-duration`, `--rise-ease`);',
					'без плейсхолдера картинка проявляется сама. Клик открывает окно просмотра: оверлей появляется и уходит через',
					'`<Transition>` (`--rise-duration`, уход — `--rise-duration-fast`); поворот и масштаб внутри — `--rise-duration-slow`',
					"и `--rise-ease-emphasized`. Выключить движение — `createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`;",
					'системная настройка «уменьшить движение» действует всегда. Мерцание плейсхолдера — декоративная петля',
					'(`--rise-duration-loop`), при «уменьшить движение» его нет.',
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, canvasElement, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Повторить' }))
		await expectImagesVisible(canvasElement, 4)
		await waitFor(() => expect(canvasElement.querySelectorAll('.base-image__placeholder')).toHaveLength(0))
	},
}
