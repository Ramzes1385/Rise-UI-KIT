import { expect, waitFor } from 'storybook/test'
import { IMAGE_MAP_FLOORS } from '../../fixtures'
import type meta from '../../BaseImageMap.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'
import BaseImageMap from '../../../ui/BaseImageMap.vue'

const motion = motionPresetsStory({
	item: `
		<BaseImageMap v-bind="args" :layer="replay % 2 ? 'floor-2' : 'floor-1'" />
	`,
	components: { BaseImageMap, BaseButton },
	imports: ['BaseImageMap'],
	trigger: 'Сменить этаж',
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	args: { data: IMAGE_MAP_FLOORS, hasFullscreen: false },
	decorators: [() => ({ template: '<div style="--story-motion-min: 320px;"><story /></div>' })],
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Карта этажей в четырёх пресетах движения. «Сменить этаж» переключает план: прежний план растворяется поверх нового',
					'(`opacity`, `--rise-duration-slow`, `--rise-ease`), масштаб и положение сохраняются, если размер плана тот же.',
					'Приближение — кнопками «+» и «−», к объекту (`hasZoomToActive`, `zoomToObject`) и сброс — плавно через `transform`',
					'(`--rise-duration-slow`, `--rise-ease`); жесты и колесо мыши двигают план без задержки. Точки и строки списка меняют цвет',
					"плавно (`--rise-duration-fast`). Выключить движение в приложении — `createUiKitPlugin({ motion: 'none' })` или",
					"`reducedMotion: 'always'`: этаж меняется сразу, без растворения; системная настройка «уменьшить движение» действует всегда.",
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		await expect(canvas.getAllByRole('radio', { name: '1' })).toHaveLength(4)
		await userEvent.click(canvas.getByRole('button', { name: 'Сменить этаж' }))
		await waitFor(() => expect(canvas.getAllByRole('radio', { name: '2', checked: true })).toHaveLength(4))
		for (const lift of await canvas.findAllByRole('button', { name: 'Лифт на этаж 3' })) await waitFor(() => expect(lift).toBeVisible())
	},
}
