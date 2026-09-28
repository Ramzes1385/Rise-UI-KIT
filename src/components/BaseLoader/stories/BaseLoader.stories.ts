/**
 * BaseLoader — stories.
 *
 * Разделы: Default (песочница) → внешний вид (виды, размеры, кастомный цвет) → содержимое (подпись) →
 * сценарии (оверлей над контейнером).
 */

import { expect } from 'storybook/test'
import { UI_TEXT } from '@/locales/messages'
import { ARG_GROUP, baseArgTypes, hiddenArgTypes, propGroup, SIZE_PRESETS, sizeLabel, useArgsWithoutSlots } from '@/stories/helpers'
import BaseLoader from '../ui/BaseLoader.vue'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { LoaderVariant } from '../model/BaseLoader.types'

const LOADER_VARIANTS: readonly LoaderVariant[] = ['spinner', 'dots', 'pulse', 'bars']

const meta = {
	title: 'Element/BaseLoader',
	component: BaseLoader,
	parameters: {
		docs: {
			description: {
				component: [
					'Индикатор загрузки неизвестной длительности: пока данные грузятся или сохраняются. Если прогресс известен — `BaseProgress`,',
					'если известна форма будущего содержимого — `BaseSkeleton`.',
					'',
					'- Виды: `spinner` (по умолчанию), `dots`, `pulse`, `bars`. Цвет — основной, `color.text` перекрашивает любой вид.',
					'- Спиннер крутится всегда; пульсация `dots`, `pulse`, `bars` отключается при системной настройке «уменьшить движение».',
					'- Компонент — `role="status"`: доступное имя берётся из `label`, даже если подпись скрыта (`hasLabel: false`).',
					'- `isOverlay` накрывает родительский контейнер подложкой; родителю нужен `position: relative`.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...baseArgTypes({ variants: LOADER_VARIANTS }),
		label: { control: 'text', table: propGroup(ARG_GROUP.content) },
		hasLabel: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
		isOverlay: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
		// Слот объявлен в типах, но компонент его не выводит — в песочнице не показываем.
		...hiddenArgTypes('default'),
	},
	args: {
		variant: 'spinner',
		label: UI_TEXT.LOADING,
		hasLabel: false,
		isOverlay: false,
		sizeScale: 100,
	},
} satisfies Meta<typeof BaseLoader>

export default meta
type Story = StoryObj<typeof meta>

// ─── Default ───────────────────────────────────────────────────────────────────

/** Песочница: меняйте props в панели Controls. Доступное имя статуса — текст `label` без многоточия. */
export const Default: Story = {
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('status', { name: 'Загрузка' })).toBeVisible()
	},
}

// ─── Внешний вид ───────────────────────────────────────────────────────────────

/** Четыре вида индикатора. Остальные props из Controls (размер, подпись, цвет) применяются ко всем. */
export const Variants: Story = {
	parameters: {
		controls: { include: ['sizeScale', 'hasLabel', 'label', 'color'] },
		docs: { source: { code: LOADER_VARIANTS.map(variant => `<BaseLoader variant="${variant}" />`).join('\n') } },
	},
	render: args => ({
		components: { BaseLoader },
		setup: () => ({ props: useArgsWithoutSlots(args), variants: LOADER_VARIANTS }),
		template: `
			<div class="story-row" style="align-items: flex-start; gap: 24px;">
				<div v-for="variant in variants" :key="variant" class="story-col" style="align-items: center; text-align: center;">
					<BaseLoader v-bind="props" :variant="variant" />
					<span class="story-label">{{ variant }}</span>
				</div>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getAllByRole('status', { name: 'Загрузка' })).toHaveLength(LOADER_VARIANTS.length)
	},
}

/** Размеры задаются `sizeScale`: при 100 индикатор 32 × 32px. Внутри поля или кнопки используйте 50–60. */
export const Sizes: Story = {
	parameters: {
		controls: { include: ['variant', 'hasLabel'] },
		docs: { source: { code: SIZE_PRESETS.map(preset => `<BaseLoader :size-scale="${preset.sizeScale}" />`).join('\n') } },
	},
	render: args => ({
		components: { BaseLoader },
		setup: () => ({ props: useArgsWithoutSlots(args), presets: SIZE_PRESETS, sizeLabel }),
		template: `
			<div class="story-row" style="align-items: flex-end; gap: 24px;">
				<div v-for="preset in presets" :key="preset.name" class="story-col" style="align-items: center; text-align: center;">
					<BaseLoader v-bind="props" :size-scale="preset.sizeScale" />
					<span class="story-label">{{ sizeLabel(preset) }}</span>
				</div>
			</div>
		`,
	}),
}

/** Кастомный цвет через `color.text`: перекрашивает любой вид индикатора, например под цвет раздела. */
export const CustomColor: Story = {
	args: { color: { text: { base: '#7c3aed' } } },
	parameters: { controls: { include: ['color', 'sizeScale'] } },
	render: args => ({
		components: { BaseLoader },
		setup: () => ({ props: useArgsWithoutSlots(args), variants: LOADER_VARIANTS }),
		template: `
			<div class="story-row" style="gap: 24px;">
				<BaseLoader v-for="variant in variants" :key="variant" v-bind="props" :variant="variant" />
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const arc = canvasElement.querySelector('.base-loader__spinner-fill') as SVGElement
		await expect(getComputedStyle(arc).stroke).toBe('rgb(124, 58, 237)')
		const dot = canvasElement.querySelector('.base-loader__dot') as HTMLElement
		await expect(getComputedStyle(dot).backgroundColor).toBe('rgb(124, 58, 237)')
	},
}

// ─── Содержимое ────────────────────────────────────────────────────────────────

/** Подпись под индикатором (`hasLabel`). Текст `label` — и подпись, и доступное имя статуса. */
export const WithLabel: Story = {
	args: { hasLabel: true, label: 'Сохранение…' },
	play: async ({ canvas }) => {
		const status = canvas.getByRole('status', { name: 'Сохранение' })
		await expect(status).toHaveTextContent('Сохранение…')
	},
}

// ─── Сценарии ──────────────────────────────────────────────────────────────────

/**
 * Оверлей: `isOverlay` накрывает родительский контейнер подложкой с индикатором по центру — например, пока
 * обновляется карточка или таблица. Родителю нужен `position: relative`.
 */
export const Overlay: Story = {
	args: { isOverlay: true, hasLabel: true, label: 'Обновление…' },
	parameters: {
		controls: { include: ['variant', 'hasLabel', 'label', 'sizeScale'] },
		docs: {
			source: {
				code: [
					'<div style="position: relative;">',
					'  <ReportCard />',
					'  <BaseLoader v-if="isRefreshing" is-overlay has-label label="Обновление…" />',
					'</div>',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseLoader },
		setup: () => ({ props: useArgsWithoutSlots(args) }),
		template: `
			<div class="story-frame story-narrow" data-testid="container">
				<div class="story-col">
					<strong>Отчёт за май</strong>
					<span>Выручка выросла на 12%, число заказов — на 8%. Данные обновляются раз в час.</span>
				</div>
				<BaseLoader v-bind="props" />
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		// Подложка занимает всю внутреннюю область контейнера (без его рамки)
		const container = canvas.getByTestId('container')
		const overlay = canvas.getByRole('status', { name: 'Обновление' }).getBoundingClientRect()
		await expect(overlay.width).toBeCloseTo(container.clientWidth, 0)
		await expect(overlay.height).toBeCloseTo(container.clientHeight, 0)
	},
}
