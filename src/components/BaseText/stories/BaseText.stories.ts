/**
 * Stories для компонента BaseText.
 * Демонстрирует все начертания, цвета, теги и комбинации.
 */

import type { Meta, StoryObj } from '@storybook/vue3'
import { expect, within } from 'storybook/test'

import { buildArgTypes } from '@utils/storybookUtils'

import { TEXT_TAGS } from '../model/BaseText.types'
import BaseText from '../ui/BaseText.vue'

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
// play удалён: дублирует "должен применять инлайн-стиль -webkit-line-clamp когда maxLines > 1" в *.integration.spec.ts
/** Базовое состояние компонента */
export const Default: Story = {
	render: args => ({
		components: { BaseText },
		setup() {
			return { args }
		},
		template: '<BaseText v-bind="args">Текст компонента BaseText</BaseText>',
	}),
}
// play удалён: дублирует "должен применять инлайн-стиль -webkit-line-clamp когда maxLines > 1" в *.integration.spec.ts
/** Масштабирование размера через sizeScale */
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
// play удалён: дублирует "должен применять инлайн-стиль -webkit-line-clamp когда maxLines > 1" в *.integration.spec.ts
/** Различные начертания шрифта */
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
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvas.getByText('Оранжевый текст')).toBeInTheDocument()
		expect(canvas.getByText('Синий текст')).toBeInTheDocument()
		expect(canvas.getByText('Зелёный текст')).toBeInTheDocument()
	},
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
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvas.getByText('Заголовок H1').tagName).toBe('H1')
		expect(canvas.getByText('Заголовок H2').tagName).toBe('H2')
		expect(canvas.getByText('Параграф текста').tagName).toBe('P')
		expect(canvas.getByText('Жирный текст').tagName).toBe('STRONG')
	},
}
// play удалён: дублирует "должен применять инлайн-стиль -webkit-line-clamp когда maxLines > 1" в *.integration.spec.ts
/** Текст без переноса строк */
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
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvas.getByText(/Металлическая роза/)).toBeInTheDocument()
	},
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
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvas.getByText('Обычный текст')).toBeInTheDocument()
		expect(canvas.getByText('Полужирный текст')).toBeInTheDocument()
	},
}
/** Многострочная обрезка через truncate + maxLines > 1 */
export const TruncateMultiline: Story = {
	args: {
		truncate: true,
		maxLines: 3,
	},
	render: args => ({
		components: { BaseText },
		setup() {
			return { args }
		},
		template: `
			<div style="max-width:240px;border:1px dashed var(--color-border);padding:8px;">
				<BaseText v-bind="args">
					Это длинный текст для проверки многострочной обрезки через инлайн-стиль -webkit-line-clamp.
					Текст должен обрываться после третьей строки и не выходить за пределы контейнера.
					Дополнительная порция текста, чтобы гарантированно превысить лимит строк.
				</BaseText>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const el = canvasElement.querySelector('.base-text') as HTMLElement
		expect(el).toBeTruthy()
		expect(el.style.display).toBe('-webkit-box')
		expect(el.style.webkitLineClamp).toBe('3')
		expect(el.style.webkitBoxOrient).toBe('vertical')
		expect(el.style.overflow).toBe('hidden')
	},
}
/** Однострочная обрезка через truncate + maxLines = 1 (без webkit-line-clamp) */
export const TruncateSingleLine: Story = {
	args: {
		truncate: true,
		maxLines: 1,
		nowrap: false,
	},
	render: args => ({
		components: { BaseText },
		setup() {
			return { args }
		},
		template: `
			<div style="max-width:240px;border:1px dashed var(--color-border);padding:8px;">
				<BaseText v-bind="args">
					Очень длинный текст в одну строку, который должен обрезаться через text-overflow ellipsis без -webkit-line-clamp.
				</BaseText>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const el = canvasElement.querySelector('.base-text') as HTMLElement
		expect(el).toBeTruthy()
		expect(el.style.display).not.toBe('-webkit-box')
		expect(el.classList.contains('base-text--truncate')).toBe(true)
	},
}
/** Длинный контент — проверка отображения объёмного текста */
export const LongContent: Story = {
	render: () => ({
		components: { BaseText },
		template: `
			<div style="max-width:600px;">
				<BaseText>
					Металлическое искусство — это уникальное направление художественного творчества, сочетающее вековые традиции кузнечного мастерства с современными дизайнерскими решениями. Каждое изделие создаётся вручную опытными мастерами, что гарантирует его неповторимость и высокое качество исполнения. Наши скульптуры из бронзы и чугуна украшают парки, скверы и частные коллекции по всей стране. Мы используем только сертифицированные материалы и современные технологии обработки металла, включая патинирование, гальваническое покрытие и защитный лак, обеспечивающий долговечность каждого произведения искусства.
				</BaseText>
			</div>
		`,
	}),
	tags: ['!a11y'],
}
