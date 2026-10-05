import { PHOTOS } from '../../shared'
import type meta from '../../BaseSlider.stories'
import BaseSlider from '../../../ui/BaseSlider.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'
import { expect, userEvent, waitFor } from 'storybook/test'

const ROWS = 4
const PRESETS = 4

const motion = motionPresetsStory({
	item: `
		<div v-for="animation in ['slide', 'fade', 'cube', 'cards']" :key="animation" class="story-stack" style="width: 100%">
			<span class="story-label">{{ animation }}</span>
			<BaseSlider v-bind="args" :animation="animation" :label="'Карусель ' + animation" :initial-index="[0, 1, 2, 1][step % 4]" />
		</div>
	`,
	components: { BaseButton, BaseSlider },
	imports: ['BaseSlider'],
	state: { step: 0 },
	action: 'step++',
	trigger: 'Следующий кадр',
	omit: ['animation', 'label', 'initialIndex'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		maxWidth: 1400,
		controls: { include: ['isVertical', 'navigation', 'isLoop', 'sizeScale'] },
		a11y: { config: { rules: [{ id: 'landmark-unique', enabled: false }] } },
		docs: {
			description: {
				story: [
					'Смена кадра вперёд и назад: «Следующий кадр» ведёт все карусели по кругу 1 → 2 → 3 → 2 → 1, так что видно оба',
					'направления — лента едет в свою сторону, `cube` поворачивается и `cards` уводит карточку по знаку сдвига.',
					'Строки — эффекты `animation` (`slide`, `fade`, `cube`, `cards`), колонки — пресеты движения `data-rise-motion`.',
					'Точка текущего слайда вытягивается без перекладки ряда: соседи сдвигаются `transform`, сама точка раскрывается',
					'`clip-path` (`--rise-duration`, `--rise-ease`); слайды — `--rise-duration-slow`, `--rise-ease`.',
					'В пресете `none` и при «уменьшить движение» кадр меняется сразу. Выключить движение в приложении —',
					"`createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`.",
					'Карусели в колонках одинаковые, поэтому правило axe `landmark-unique` у этой истории выключено: в приложении',
					'у каждой карусели своё имя `label`.',
				].join('\n'),
			},
			source: motion.source,
		},
	},
	args: { items: PHOTOS.slice(0, 3), height: '120px', hasArrows: false },
	render: motion.render,
	play: async ({ canvas, canvasElement }) => {
		const current = (number: number) => canvas.getAllByRole('button', { name: `Слайд ${number} из 3`, current: true })
		const next = canvas.getByRole('button', { name: 'Следующий кадр' })
		await expect(canvasElement.querySelectorAll('.base-slider')).toHaveLength(ROWS * PRESETS)
		await expect(current(1)).toHaveLength(ROWS * PRESETS)

		await userEvent.click(next)
		await userEvent.click(next)
		await waitFor(() => expect(current(3)).toHaveLength(ROWS * PRESETS))

		next.focus()
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(current(2)).toHaveLength(ROWS * PRESETS))
		await expect(canvasElement.querySelectorAll('.base-slider__slide--active')).toHaveLength(ROWS * PRESETS)
	},
}
