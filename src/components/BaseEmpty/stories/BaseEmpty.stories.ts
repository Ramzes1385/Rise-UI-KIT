/**
 * BaseEmpty — stories.
 *
 * Разделы: Default (песочница) → внешний вид (варианты, размеры, кастомный цвет) →
 * содержимое (слоты icon, default, actions) → сценарии (пустой блок в карточке, поиск без результатов).
 */

import { expect } from 'storybook/test'
import { computed, ref } from 'vue'
import { ARG_GROUP, baseArgTypes, placeholderImage, propGroup, SIZE_PRESETS, sizeLabel, useArgsWithoutSlots } from '@/stories/helpers'
import { BaseButton } from '@components/BaseButton'
import { BaseCard } from '@components/BaseCard'
import { BaseIcon } from '@components/BaseIcon'
import { BaseInput } from '@components/BaseInput'
import { EMPTY_VARIANTS } from '../model/BaseEmpty.types'
import BaseEmpty from '../ui/BaseEmpty.vue'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

const PROJECTS = ['Ребрендинг', 'Мобильное приложение', 'Справочный центр', 'Интеграция с платёжным сервисом']

const meta = {
	title: 'Data/BaseEmpty',
	component: BaseEmpty,
	parameters: {
		docs: {
			description: {
				component: [
					'Пустое состояние: в списке ещё нет данных, поиск ничего не нашёл, раздел недоступен.',
					'Объясняет, почему пусто, и предлагает следующий шаг.',
					'',
					'- `title` и `description` — что случилось и что делать; `icon` — иконка из спрайта (по умолчанию `inbox`).',
					'- Слоты: `icon` — своя иллюстрация, по умолчанию — дополнительный текст, `actions` — кнопки.',
					'- Варианты: `default` — пунктирная рамка, `soft` — мягкий фон, `ghost` — без рамки и отступов,',
					'  для встраивания в карточку, таблицу или выпадающий список.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...baseArgTypes({ variants: EMPTY_VARIANTS }),
		title: { control: 'text', table: propGroup(ARG_GROUP.content) },
		description: { control: 'text', table: propGroup(ARG_GROUP.content) },
		icon: { control: 'text', table: propGroup(ARG_GROUP.content) },
		default: { control: false },
		actions: { control: false },
	},
	args: {
		title: 'Задач пока нет',
		description: 'Создайте первую задачу — она появится в этом списке.',
		icon: 'inbox',
		variant: 'default',
		sizeScale: 100,
	},
	render: args => ({
		components: { BaseEmpty },
		setup: () => ({ props: useArgsWithoutSlots(args) }),
		template: '<div class="story-medium"><BaseEmpty v-bind="props" /></div>',
	}),
} satisfies Meta<typeof BaseEmpty>

export default meta
type Story = StoryObj<typeof meta>

// ─── Default ───────────────────────────────────────────────────────────────────

/** Песочница: меняйте props в панели Controls. Иконка декоративная и скрыта от скринридера. */
export const Default: Story = {
	play: async ({ canvas, canvasElement }) => {
		const title = canvas.getByRole('heading', { level: 3, name: 'Задач пока нет' })
		await expect(getComputedStyle(title).fontWeight).toBe('500')
		await expect(canvasElement.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
	},
}

// ─── Внешний вид ───────────────────────────────────────────────────────────────

/** Три варианта: `default` — пунктирная рамка, `soft` — мягкий фон, `ghost` — без рамки и отступов. */
export const Variants: Story = {
	parameters: {
		controls: { include: ['sizeScale', 'icon'] },
		docs: {
			source: {
				code: ['default', 'soft', 'ghost']
					.map(variant => `<BaseEmpty variant="${variant}" title="${variant}" description="…" />`)
					.join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseEmpty },
		setup: () => ({ props: useArgsWithoutSlots(args, ['title']), variants: ['default', 'soft', 'ghost'] }),
		template: `
			<div class="story-grid" style="--story-grid-min: 240px; align-items: start;">
				<BaseEmpty v-for="variant in variants" :key="variant" v-bind="props" :variant="variant" :title="variant" />
			</div>
		`,
	}),
}

/** Размеры через `sizeScale`: отступы, иконка и текст масштабируются вместе. */
export const Sizes: Story = {
	parameters: {
		controls: { include: ['variant', 'icon'] },
		docs: {
			source: {
				code: SIZE_PRESETS.map(preset => `<BaseEmpty :size-scale="${preset.sizeScale}" title="${preset.name}" />`).join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseEmpty },
		setup: () => ({ props: useArgsWithoutSlots(args, ['title', 'description']), presets: SIZE_PRESETS, sizeLabel }),
		template: `
			<div class="story-grid" style="--story-grid-min: 220px; align-items: start;">
				<BaseEmpty
					v-for="preset in presets"
					:key="preset.name"
					v-bind="props"
					:size-scale="preset.sizeScale"
					:title="sizeLabel(preset)"
					description="Создайте первую задачу." />
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		const title = canvas.getByRole('heading', { name: 'xl · 125' })
		await expect(getComputedStyle(title).fontSize).toBe('17.5px')
		await expect(getComputedStyle(title.closest('.base-empty') as HTMLElement).padding).toBe('40px 30px')
	},
}

/** Кастомный цвет через `color`: фон и текст. Токены роли дают акцентный блок, который меняется вместе с темой. */
export const CustomColor: Story = {
	args: {
		title: 'Скоро здесь появятся отчёты',
		description: 'Первый отчёт соберётся в понедельник, 19 мая.',
		icon: 'calendar',
		variant: 'soft',
		color: { bg: { base: 'var(--rise-primary-soft)' }, text: { base: 'var(--rise-primary-text)' } },
	},
	play: async ({ canvas }) => {
		const root = canvas.getByRole('heading', { name: 'Скоро здесь появятся отчёты' }).closest('.base-empty') as HTMLElement
		await expect(root.style.getPropertyValue('--custom-bg')).toBe('var(--rise-primary-soft)')
		await expect(getComputedStyle(root).backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
	},
}

// ─── Содержимое ────────────────────────────────────────────────────────────────

/**
 * Слоты: `icon` — своя иллюстрация вместо иконки, по умолчанию — дополнительный текст под описанием,
 * `actions` — кнопки следующего шага.
 */
export const Slots: Story = {
	args: { title: 'Нет загруженных файлов', description: 'Перетащите файлы сюда или выберите их на компьютере.' },
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			source: {
				code: [
					'<BaseEmpty title="Нет загруженных файлов" description="…">',
					'  <template #icon><img :src="illustration" alt="" /></template>',
					'  Поддерживаются PDF, DOCX и XLSX до 20 МБ.',
					'  <template #actions>',
					'    <BaseButton>Выбрать файлы</BaseButton>',
					'    <BaseButton variant="outline">Создать папку</BaseButton>',
					'  </template>',
					'</BaseEmpty>',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseEmpty, BaseButton, BaseIcon },
		setup: () => ({ props: useArgsWithoutSlots(args), illustration: placeholderImage({ width: 160, height: 100, hue: 200 }) }),
		template: `
			<div class="story-medium">
				<BaseEmpty v-bind="props">
					<template #icon>
						<img :src="illustration" alt="" width="160" height="100" style="border-radius: var(--rise-radius-md);" />
					</template>
					Поддерживаются PDF, DOCX и XLSX до 20 МБ.
					<template #actions>
						<BaseButton><template #left><BaseIcon name="attach" /></template>Выбрать файлы</BaseButton>
						<BaseButton variant="outline">Создать папку</BaseButton>
					</template>
				</BaseEmpty>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByText('Поддерживаются PDF, DOCX и XLSX до 20 МБ.')).toBeVisible()
		const [primary, secondary] = canvas.getAllByRole('button')
		await expect(primary).toHaveAccessibleName('Выбрать файлы')
		await expect(secondary).toHaveAccessibleName('Создать папку')
	},
}

// ─── Сценарии ──────────────────────────────────────────────────────────────────

/** Внутри карточки — вариант `ghost`: без своей рамки и отступов, отступы даёт карточка. */
export const InCard: Story = {
	parameters: {
		controls: { include: ['sizeScale'] },
		docs: {
			source: {
				code: [
					'<BaseCard title="Комментарии">',
					'  <BaseEmpty variant="ghost" icon="smile" title="Комментариев пока нет" description="…" />',
					'</BaseCard>',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseEmpty, BaseCard },
		setup: () => ({ props: useArgsWithoutSlots(args, ['title', 'description', 'icon', 'variant']) }),
		template: `
			<div class="story-medium">
				<BaseCard title="Комментарии" subtitle="Задача «Макет главной страницы»">
					<BaseEmpty
						v-bind="props"
						variant="ghost"
						icon="smile"
						title="Комментариев пока нет"
						description="Напишите первым — участники получат уведомление." />
				</BaseCard>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		const empty = canvas.getByRole('heading', { name: 'Комментариев пока нет' }).closest('.base-empty') as HTMLElement
		await expect(getComputedStyle(empty).padding).toBe('0px')
		await expect(getComputedStyle(empty).borderTopColor).toBe('rgba(0, 0, 0, 0)')
	},
}

/** Поиск без результатов: пустое состояние объясняет причину и предлагает сбросить запрос. */
export const NoResults: Story = {
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			source: {
				code: [
					'<BaseEmpty v-if="!results.length" icon="search" title="Ничего не найдено" :description="`По запросу «${query}» проектов нет.`">',
					'  <template #actions><BaseButton variant="outline" @click="query = \'\'">Сбросить поиск</BaseButton></template>',
					'</BaseEmpty>',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseEmpty, BaseButton, BaseInput },
		setup: () => {
			const query = ref('Бюджет')
			const results = computed(() => PROJECTS.filter(project => project.toLowerCase().includes(query.value.trim().toLowerCase())))
			return { props: useArgsWithoutSlots(args, ['title', 'description', 'icon']), query, results }
		},
		template: `
			<div class="story-stack story-medium">
				<BaseInput v-model="query" label="Поиск проектов" placeholder="Название проекта" />
				<ul v-if="results.length" aria-label="Проекты" style="margin: 0; padding-left: 20px;">
					<li v-for="project in results" :key="project">{{ project }}</li>
				</ul>
				<BaseEmpty
					v-else
					v-bind="props"
					icon="search"
					title="Ничего не найдено"
					:description="'По запросу «' + query + '» проектов нет. Проверьте написание или сбросьте поиск.'">
					<template #actions>
						<BaseButton variant="outline" @click="query = ''">Сбросить поиск</BaseButton>
					</template>
				</BaseEmpty>
			</div>
		`,
	}),
	play: async ({ canvas, userEvent }) => {
		await expect(canvas.getByRole('heading', { name: 'Ничего не найдено' })).toBeVisible()
		await userEvent.click(canvas.getByRole('button', { name: 'Сбросить поиск' }))
		await expect(canvas.getByRole('list', { name: 'Проекты' }).children).toHaveLength(PROJECTS.length)
		await userEvent.type(canvas.getByLabelText('Поиск проектов'), 'моб')
		await expect(canvas.getByRole('list', { name: 'Проекты' })).toHaveTextContent('Мобильное приложение')
	},
}
