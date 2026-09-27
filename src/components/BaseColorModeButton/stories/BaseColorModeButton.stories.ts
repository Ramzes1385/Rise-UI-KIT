/**
 * BaseColorModeButton — stories.
 *
 * Разделы: Default (песочница) → внешний вид (варианты, размеры, кастомный цвет) → состояния → сценарии.
 * Каждый пример переключает тему своей рамки (`createColorMode({ target })`), а не всей страницы Storybook:
 * тема страницы задаётся кнопкой «Тема» на панели инструментов.
 */

import { expect, fn, waitFor } from 'storybook/test'
import { onBeforeUnmount, ref } from 'vue'
import { ARG_GROUP, baseArgTypes, hiddenArgTypes, propGroup, SIZE_PRESETS, sizeLabel, tabTo, useArgsWithoutSlots } from '@/stories/helpers'
import { BUTTON_VARIANTS } from '@components/BaseButton/model/BaseButton.types'
import { BaseText } from '@components/BaseText'
import { createColorMode } from '@composables/useColorMode'
import BaseColorModeButton from '../ui/BaseColorModeButton.vue'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

/** Тема рамки примера: светлая при открытии, выбор не сохраняется */
function useFrameColorMode() {
	const frame = ref<HTMLElement | null>(null)
	const colorMode = createColorMode({ target: () => frame.value, storageKey: false, initialMode: 'light' })
	onBeforeUnmount(colorMode.stop)
	return { frame, colorMode }
}

const meta = {
	title: 'Element/BaseColorModeButton',
	component: BaseColorModeButton,
	parameters: {
		docs: {
			description: {
				component: [
					'Кнопка тёмной темы для шапки приложения: переключает светлую и тёмную тему и запоминает выбор.',
					'',
					'- Управляет темой приложения через `useColorMode()`: ставит `data-theme` на `<html>` и сохраняет выбор',
					'  в localStorage. Режим «как в системе» (`data-theme="system"`) — `useColorMode().mode.value = \'system\'`.',
					'- Кнопка-переключатель: имя «Тёмная тема» не меняется, нажатое состояние (`aria-pressed`) — тёмная тема.',
					'  Иконка показывает текущую тему: солнце или луна.',
					'- Квадратная кнопка-иконка 32 × 32px при `sizeScale` = 100, варианты — как у BaseButton, по умолчанию `ghost`.',
					'- `colorMode` — свой экземпляр из `createColorMode({ target })`, чтобы переключать тему части интерфейса.',
				].join('\n'),
			},
			source: { code: '<BaseColorModeButton />' },
		},
	},
	argTypes: {
		...baseArgTypes({ variants: BUTTON_VARIANTS }),
		...hiddenArgTypes('colorMode'),
		label: { control: 'text', table: propGroup(ARG_GROUP.content) },
		isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	},
	args: {
		label: 'Тёмная тема',
		isDisabled: false,
		variant: 'ghost',
		sizeScale: 100,
		onChange: fn(),
	},
	render: args => ({
		components: { BaseColorModeButton, BaseText },
		setup: () => ({ props: useArgsWithoutSlots(args, []), ...useFrameColorMode() }),
		template: `
			<div ref="frame" class="story-frame story-row" style="background: var(--rise-bg); color: var(--rise-text);">
				<BaseColorModeButton v-bind="props" :color-mode="colorMode" />
				<BaseText>Тема этой рамки — {{ colorMode.isDark.value ? 'тёмная' : 'светлая' }}</BaseText>
			</div>
		`,
	}),
} satisfies Meta<typeof BaseColorModeButton>

export default meta
type Story = StoryObj<typeof meta>

// ─── Default ───────────────────────────────────────────────────────────────────

/** Песочница: кнопка переключает тему рамки. Tab ставит на неё фокус, Enter и Space переключают. */
export const Default: Story = {
	play: async ({ canvas, canvasElement, userEvent, args }) => {
		const button = canvas.getByRole('button', { name: 'Тёмная тема' })
		const frame = canvasElement.querySelector('.story-frame') as HTMLElement
		await expect(button).toHaveAttribute('aria-pressed', 'false')

		await tabTo(button, userEvent)
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(frame).toHaveAttribute('data-theme', 'dark'))
		await expect(button).toHaveAttribute('aria-pressed', 'true')
		await expect(args.onChange).toHaveBeenCalledWith('dark')

		await userEvent.keyboard(' ')
		await waitFor(() => expect(frame).toHaveAttribute('data-theme', 'light'))
		await expect(args.onChange).toHaveBeenLastCalledWith('light')
	},
}

// ─── Внешний вид ───────────────────────────────────────────────────────────────

/** Варианты BaseButton: `ghost` (по умолчанию) — для шапки, остальные — рядом с кнопками того же варианта. */
export const Variants: Story = {
	parameters: { controls: { include: ['sizeScale'] } },
	render: args => ({
		components: { BaseColorModeButton },
		setup: () => ({ props: useArgsWithoutSlots(args, []), variants: BUTTON_VARIANTS, ...useFrameColorMode() }),
		template: `
			<div ref="frame" class="story-frame story-row" style="background: var(--rise-bg);">
				<BaseColorModeButton v-for="variant in variants" :key="variant" v-bind="props" :variant="variant" :label="'Тёмная тема: ' + variant" :color-mode="colorMode" />
			</div>
		`,
	}),
}

/** Размеры через `sizeScale`: 75 / 87.5 / 100 / 112.5 / 125. Кнопка остаётся квадратной. */
export const Sizes: Story = {
	parameters: { controls: { include: ['variant'] } },
	render: args => ({
		components: { BaseColorModeButton },
		setup: () => ({ props: useArgsWithoutSlots(args, []), presets: SIZE_PRESETS, sizeLabel, ...useFrameColorMode() }),
		template: `
			<div ref="frame" class="story-frame story-row" style="background: var(--rise-bg);">
				<BaseColorModeButton v-for="preset in presets" :key="preset.name" v-bind="props" :size-scale="preset.sizeScale" :label="'Тёмная тема, ' + sizeLabel(preset)" :color-mode="colorMode" />
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		for (const button of canvas.getAllByRole('button')) {
			const { width, height } = button.getBoundingClientRect()
			await expect(width).toBeCloseTo(height, 0)
		}
	},
}

/** Кастомный цвет через `color`, как у BaseButton. Для статусов берите токены ролей: `var(--rise-primary-soft)`. */
export const CustomColor: Story = {
	args: { variant: 'default', color: { bg: { base: 'var(--rise-primary-soft)', hover: 'var(--rise-primary-soft-hover)' }, text: { base: 'var(--rise-primary-text)' } } },
	play: async ({ canvas }) => {
		const button = canvas.getByRole('button', { name: 'Тёмная тема' })
		await expect(button.style.getPropertyValue('--custom-bg')).toBe('var(--rise-primary-soft)')
	},
}

// ─── Состояния ─────────────────────────────────────────────────────────────────

/** Отключённая кнопка: не получает фокус и не переключает тему. */
export const Disabled: Story = {
	args: { isDisabled: true },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('button', { name: 'Тёмная тема' })).toBeDisabled()
	},
}
