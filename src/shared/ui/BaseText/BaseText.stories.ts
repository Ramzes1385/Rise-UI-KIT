/**
 * Stories для компонента BaseText.
 * Демонстрирует все начертания, цвета, теги и комбинации.
 */

import type { Meta, StoryObj } from '@storybook/vue3'

import { buildArgTypes } from '@/shared/utils/storybookUtils'

import { TEXT_TAGS } from './BaseText.types'
import BaseText from './BaseText.vue'

const meta: Meta<typeof BaseText> = {
	title: 'UI/BaseText',
	component: BaseText,

	argTypes: buildArgTypes({
		props: {
			tag: {
				control: 'select',
				options: TEXT_TAGS,
			},
			sizeScale: {
				control: { type: 'range', min: 50, max: 200, step: 10 },
				description: 'Масштаб размера (100 = 100%, 150 = 150%, 75 = 75%)',
			},
			weight: {
				control: { type: 'range', min: 100, max: 900, step: 100 },
				description: 'Начертание (100–900)',
			},
			color: {
				control: 'object',
				description: 'Кастомный цвет { text: { base, hover... } }',
			},
			nowrap: { control: 'boolean' },
			truncate: { control: 'boolean' },
			maxLines: {
				control: { type: 'range', min: 1, max: 10, step: 1 },
				description: 'Количество строк перед обрезкой (только с truncate)',
			},
		},
	}),

	args: {
		tag: 'p',
		sizeScale: 100,
		weight: 400,
		nowrap: false,
		truncate: false,
		maxLines: 1,
	},
}

export default meta
type Story = StoryObj<typeof BaseText>

/** Базовый текст */
export const Default: Story = {
	args: {
		default: 'Текст компонента BaseText',
	},
}

/** Масштабирование размера */
export const SizeScale: Story = {
	render: args => ({
		components: { BaseText },
		setup() {
			return { args }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:8px;">
				<BaseText v-for="s in [50, 75, 100, 125, 150, 175, 200]"
					:key="s"
					v-bind="args"
					:size-scale="s"
				>
					SizeScale: {{ s }}%
				</BaseText>
			</div>
		`,
	}),
}

/** Все начертания */
export const Weights: Story = {
	render: args => ({
		components: { BaseText },
		setup() {
			return { args }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:8px;">
				<BaseText v-for="w in [100, 200, 300, 400, 500, 600, 700, 800, 900]"
					:key="w"
					v-bind="args"
					:weight="w"
				>
					Weight: {{ w }}
				</BaseText>
			</div>
		`,
	}),
}

/** Кастомные цвета */
export const CustomColors: Story = {
	render: () => ({
		components: { BaseText },
		template: `
			<div style="display:flex;flex-direction:column;gap:8px;">
				<BaseText :color="{ text: { base: '#ff4500' } }">Оранжевый текст</BaseText>
				<BaseText :color="{ text: { base: '#2563eb' } }">Синий текст</BaseText>
				<BaseText :color="{ text: { base: '#16a34a' } }">Зелёный текст</BaseText>
			</div>
		`,
	}),
}

/** Семантические теги */
export const Tags: Story = {
	render: args => ({
		components: { BaseText },
		setup() {
			return { args }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:8px;">
				<BaseText v-bind="args" tag="h1" :size-scale="188" :weight="700">Заголовок H1</BaseText>
				<BaseText v-bind="args" tag="h2" :size-scale="150" :weight="600">Заголовок H2</BaseText>
				<BaseText v-bind="args" tag="h3" :size-scale="125" :weight="500">Заголовок H3</BaseText>
				<BaseText v-bind="args" tag="h4" :size-scale="113" :weight="500">Заголовок H4</BaseText>
				<BaseText v-bind="args" tag="p">Параграф текста</BaseText>
				<BaseText v-bind="args" tag="small" :size-scale="75">Мелкий текст</BaseText>
				<BaseText v-bind="args" tag="strong" :weight="700">Жирный текст</BaseText>
				<BaseText v-bind="args" tag="em">Курсивный текст</BaseText>
				<BaseText v-bind="args" tag="label" :size-scale="75">Лейбл</BaseText>
			</div>
		`,
	}),
}

/** Масштаб + начертание — комбинации */
export const SizeScaleWeightCombinations: Story = {
	render: () => ({
		components: { BaseText },
		template: `
			<div style="display:flex;flex-direction:column;gap:12px;">
				<div v-for="s in [75, 100, 150]" :key="s" style="display:flex;gap:16px;align-items:baseline;">
					<BaseText v-for="w in [400, 500, 600, 700]" :key="w" :size-scale="s" :weight="w">
						{{ s }}/{{ w }}
					</BaseText>
				</div>
			</div>
		`,
	}),
}

/** Без переноса */
export const Nowrap: Story = {
	args: {
		nowrap: true,
	},
	render: args => ({
		components: { BaseText },
		setup() {
			return { args }
		},
		template: `
			<div style="max-width:200px;border:1px dashed var(--color-border);padding:8px;">
				<BaseText v-bind="args">Очень длинный текст без переноса на новую строку, который должен выходить за пределы контейнера</BaseText>
			</div>
		`,
	}),
}

/** Обрезка текста с многоточием (одна строка) */
export const Truncate: Story = {
	args: {
		truncate: true,
	},
	render: args => ({
		components: { BaseText },
		setup() {
			return { args }
		},
		template: `
			<div style="max-width:250px;border:1px dashed var(--color-border);padding:8px;">
				<BaseText v-bind="args">Очень длинный текст, который должен обрезаться и заканчиваться многоточием при переполнении контейнера</BaseText>
			</div>
		`,
	}),
}

/** Обрезка текста с многоточием (несколько строк) */
export const TruncateMaxLines: Story = {
	render: () => ({
		components: { BaseText },
		template: `
			<div style="display:flex;flex-direction:column;gap:16px;max-width:300px;">
				<div v-for="n in [1, 2, 3, 4]" :key="n" style="border:1px dashed var(--color-border);padding:8px;">
					<span style="font-size:12px;color:var(--color-text-muted);">maxLines: {{ n }}</span>
					<BaseText truncate :max-lines="n">
						Металлическая роза — уникальное изделие ручной ковки. Каждый лепесток выкован отдельно
						и собран в единую композицию. Высота изделия 45 см, вес — 1.2 кг. Покрытие — патина
						и защитный лак. Подходит для интерьера в стиле лофт или минимализм.
					</BaseText>
				</div>
			</div>
		`,
	}),
}

/** Многострочный текст */
export const Multiline: Story = {
	render: () => ({
		components: { BaseText },
		template: `
			<div style="max-width:400px;">
				<BaseText :size-scale="100">
					Металлическая роза — уникальное изделие ручной ковки. Каждый лепесток выкован отдельно
					и собран в единую композицию. Высота изделия 45 см, вес — 1.2 кг. Покрытие — патина
					и защитный лак.
				</BaseText>
			</div>
		`,
	}),
}

/** Тёмная тема */
export const DarkTheme: Story = {
	decorators: [
		() => ({
			template: '<div data-theme="dark" style="padding: 16px; background: var(--color-bg);"><story /></div>',
		}),
	],
	render: () => ({
		components: { BaseText },
		template: `
			<div style="display:flex;flex-direction:column;gap:8px;">
				<BaseText>Обычный текст</BaseText>
				<BaseText :weight="600">Полужирный текст</BaseText>
				<BaseText :size-scale="75">Мелкий текст</BaseText>
			</div>
		`,
	}),
}

/** Интерактивный */
export const Interactive: Story = {
	args: {
		default: 'Интерактивный текст',
	},
}
