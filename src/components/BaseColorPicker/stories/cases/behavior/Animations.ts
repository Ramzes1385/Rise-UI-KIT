import { docsFrame } from '../../shared'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseColorPicker.stories'
import { motionPresetsStory } from '@/stories/helpers'
import { expect, screen, waitFor } from 'storybook/test'
import BaseColorPicker from '../../../ui/BaseColorPicker.vue'

const motion = motionPresetsStory({
	item: `
		<BaseColorPicker v-bind="args" v-model="color" />
	`,
	components: { BaseColorPicker, BaseButton },
	imports: ['BaseColorPicker'],
	state: { color: '#ef4444', step: 0 },
	action: "step = (step + 1) % 4; color = ['#ef4444', '#22c55e80', '#3b82f6', '#a855f7cc'][step]",
	trigger: 'Сменить цвет',
	slots: ['modelValue', 'onUpdate:modelValue'],
	omit: ['modelValue', 'onUpdate:modelValue'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	args: { hasAlpha: true, isHexHidden: true, isPresetsHidden: true },
	parameters: {
		controls: { include: ['sizeScale', 'hasAlpha'] },
		docs: {
			...docsFrame(360),
			description: {
				story: [
					'Маркер области и бегунки тона и прозрачности в четырёх пресетах движения: `none`, `subtle`, `standard` (по умолчанию),',
					'`expressive`. Кнопка меняет `v-model` по кругу из четырёх цветов, и маркер с бегунками плавно едут к новому',
					'положению (`transform`, `--rise-duration`, `--rise-ease-out`) — так же при вводе HEX и выборе образца. Пока',
					'маркер или бегунок тащат указателем, перехода нет: они не отстают от курсора. Пресет области, где стоит образец,',
					'переносится на панель, хотя она открывается в `body`.',
					'Панели открываются с клавиатуры (Enter на образце) и остаются открытыми, пока нажимаете кнопку клавишей Enter;',
					"щелчок мышью вне панели закрывает её. Выключить движение — `createUiKitPlugin({ motion: 'none' })` или",
					"`reducedMotion: 'always'`; системная настройка «уменьшить движение» действует всегда — маркер и бегунки встают",
					'на место сразу.',
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		const swatches = canvas.getAllByRole('button', { name: /Выбранный цвет/ })
		const markers = (): HTMLElement[] => [...document.querySelectorAll<HTMLElement>('.base-color-picker__marker')]
		const openPanel = async (swatch: HTMLElement): Promise<void> => {
			swatch.focus()
			await userEvent.keyboard('{Enter}')
		}

		await expect(swatches).toHaveLength(4)
		await openPanel(swatches[0])
		await openPanel(swatches[1])
		await openPanel(swatches[2])
		await openPanel(swatches[3])
		await waitFor(() => expect(screen.getAllByRole('dialog')).toHaveLength(4))
		await expect(document.querySelector('.base-color-picker__panel[data-rise-motion="none"]')).toHaveClass(
			'base-color-picker__panel--instant',
		)

		const positions = (): string[] => markers().map(marker => marker.style.getPropertyValue('--picker-marker-x'))
		const before = positions()[0]

		canvas.getByRole('button', { name: 'Сменить цвет' }).focus()
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(new Set(positions())).toEqual(new Set([positions()[0]])))
		await expect(positions()[0]).not.toBe(before)
		await expect(canvas.getAllByRole('button', { name: /#22c55e80/ })).toHaveLength(4)
	},
}
