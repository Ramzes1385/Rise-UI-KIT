import { ref } from 'vue'
import { expect } from 'storybook/test'
import { BaseBadge } from '@components/BaseBadge'
import { BaseInput } from '@components/BaseInput'
import { BaseButton } from '@components/BaseButton'
import { BaseSelect } from '@components/BaseSelect'
import { BaseSwitch } from '@components/BaseSwitch'
import { BaseCheckbox } from '@components/BaseCheckbox'
import { SIZE_PRESETS, sizeLabel } from '@/stories/helpers'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import './foundations.scss'

const meta = {
	title: 'Foundations/Sizing',
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				component: [
					'Размер любого компонента задаёт одно число — `sizeScale` в процентах. 100 — базовый размер: высота контролов 32px, кегль 14/20.',
					'Все длины в стилях умножаются на `--size-scale` функцией `sz()`, поэтому компонент масштабируется целиком: отступы, шрифт, иконки, радиусы.',
					'',
					'Пресеты xs–xl повторяют шкалу Nuxt UI. Кнопки, поля, селекты и переключатели одного `sizeScale` одной высоты — их можно ставить в один ряд.',
					'Плотность всего интерфейса меняют токены `--rise-control-padding-y/x` — без пропов у каждого компонента.',
				].join('\n'),
			},
		},
	},
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const OPTIONS = [
	{ value: 'ru', label: 'Русский' },
	{ value: 'en', label: 'English' },
]

/** Пресеты sizeScale: одна строка — один размер. Кнопка, поле, селект, бейдж и переключатели масштабируются вместе. */
export const Presets: Story = {
	render: () => ({
		components: { BaseBadge, BaseButton, BaseCheckbox, BaseInput, BaseSelect, BaseSwitch },
		setup: () => ({
			presets: SIZE_PRESETS,
			sizeLabel,
			options: OPTIONS,
			text: ref(''),
			lang: ref('ru'),
			on: ref(true),
			checked: ref(true),
		}),
		template: `
			<div class="story-stack">
				<div v-for="preset in presets" :key="preset.name" class="story-row" style="flex-wrap: nowrap;">
					<span class="story-label">{{ sizeLabel(preset) }}<br />{{ preset.control }}</span>
					<BaseButton :size-scale="preset.sizeScale">Сохранить</BaseButton>
					<div style="width: 150px;"><BaseInput v-model="text" placeholder="Поле ввода" :size-scale="preset.sizeScale" /></div>
					<div style="width: 140px;"><BaseSelect v-model="lang" :options="options" :size-scale="preset.sizeScale" /></div>
					<BaseBadge label="Новый" variant="soft" :size-scale="preset.sizeScale" />
					<BaseSwitch v-model="on" label="Звук" :size-scale="preset.sizeScale" />
					<BaseCheckbox v-model="checked" label="Флажок" :size-scale="preset.sizeScale" />
				</div>
			</div>
		`,
	}),
}

/**
 * Выравнивание: при одинаковом sizeScale кнопка, поле и селект одной высоты (32px при 100).
 * Play-функция сверяет высоты — если стили компонента разойдутся со шкалой, проверка упадёт.
 */
export const Alignment: Story = {
	render: () => ({
		components: { BaseButton, BaseInput, BaseSelect },
		setup: () => ({ options: OPTIONS, text: ref(''), lang: ref('ru') }),
		template: `
			<div class="story-row" style="flex-wrap: nowrap; align-items: flex-start;">
				<div style="width: 220px;"><BaseInput v-model="text" placeholder="Название проекта" /></div>
				<div style="width: 160px;"><BaseSelect v-model="lang" :options="options" /></div>
				<BaseButton variant="outline">Отмена</BaseButton>
				<BaseButton>Создать</BaseButton>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const height = (selector: string) =>
			Math.round((canvasElement.querySelector(selector) as HTMLElement).getBoundingClientRect().height)
		const button = height('.base-button')
		await expect(button).toBe(32)
		await expect(height('.base-input__wrapper')).toBe(button)
		await expect(height('.base-select__trigger')).toBe(button)
	},
}

/**
 * Плотность интерфейса без пропов: токены `--rise-control-padding-y/x`, заданные на контейнере (или на `:root`),
 * меняют высоту всех контролов внутри. Слева — по умолчанию (32px), справа — `--rise-control-padding-y: 7px` (36px).
 */
export const Density: Story = {
	parameters: {
		docs: {
			source: {
				code: [
					'/* весь интерфейс просторнее: контролы 36px */',
					':root {',
					'  --rise-control-padding-y: 7px;',
					'  --rise-control-padding-x: 12px;',
					'}',
				].join('\n'),
			},
		},
	},
	render: () => ({
		components: { BaseButton, BaseInput },
		setup: () => ({ text: ref(''), spacious: ref('') }),
		template: `
			<div class="story-grid" style="--story-grid-min: 280px;">
				<div class="story-frame story-col">
					<span class="story-label">По умолчанию</span>
					<BaseInput v-model="text" placeholder="Поле ввода" />
					<BaseButton>Сохранить</BaseButton>
				</div>
				<div class="story-frame story-col" style="--rise-control-padding-y: 7px; --rise-control-padding-x: 12px;">
					<span class="story-label">--rise-control-padding-y: 7px</span>
					<BaseInput v-model="spacious" placeholder="Поле ввода" />
					<BaseButton>Сохранить</BaseButton>
				</div>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const [compact, spacious] = [...canvasElement.querySelectorAll('.base-button')].map(el =>
			Math.round(el.getBoundingClientRect().height),
		)
		await expect(compact).toBe(32)
		await expect(spacious).toBe(36)
	},
}
