/** Панель результатов и окна modal/sidebar телепортируются в body, поэтому в Docs такие примеры показываются в отдельном фрейме. */

import { ref } from 'vue'
import { expect, fn, screen, waitFor } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import {
	ARG_GROUP,
	baseArgTypes,
	placeholderImage,
	propGroup,
	SIZE_PRESETS,
	sizeLabel,
	tabTo,
	useArgsWithoutSlots,
	useModelArg,
} from '@/stories/helpers'
import BaseSearch from '../ui/BaseSearch.vue'
import { SEARCH_VARIANTS } from '../types/BaseSearch.types'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { SearchResult } from '../types/BaseSearch.types'

/** Материалы проекта студии: иконка — тип файла, категория — справа. */
const FILES: SearchResult[] = [
	{ id: 1, title: 'Закат в горах', description: 'Документальный фильм · 52 мин', icon: 'video', category: 'Видео' },
	{ id: 2, title: 'Запись голоса — сцена 12', description: 'WAV · 3 мин 40 с', icon: 'mic', category: 'Аудио' },
	{ id: 3, title: 'Сценарий «Лисья тропа»', description: 'Серия 3 · 24 страницы', icon: 'file', category: 'Документ' },
	{ id: 4, title: 'Раскадровка «Лисья тропа»', description: 'PNG · 18 кадров', icon: 'image', category: 'Изображение' },
	{ id: 5, title: 'Субтитры «Северный ветер»', description: 'SRT · серия 1', icon: 'file', category: 'Документ' },
	{ id: 6, title: 'Архив озвучки 2024', description: '128 файлов', icon: 'folder', category: 'Папка' },
	{ id: 7, title: 'Календарь записей', description: 'Май 2025', icon: 'calendar', category: 'План' },
]

/** Картины с превью: изображения генерируются локально, без сети. */
const ARTWORKS: SearchResult[] = [
	{
		id: 1,
		title: 'Закат в горах',
		description: 'Масло, холст · 80×60 см',
		image: placeholderImage({ width: 80, height: 80, hue: 24 }),
		category: 'Пейзаж',
	},
	{
		id: 2,
		title: 'Горы в тумане',
		description: 'Масло, холст · 70×50 см',
		image: placeholderImage({ width: 80, height: 80, hue: 200 }),
		category: 'Пейзаж',
	},
	{
		id: 3,
		title: 'Зелёная долина',
		description: 'Акрил, холст · 100×80 см',
		image: placeholderImage({ width: 80, height: 80, hue: 150 }),
		category: 'Пейзаж',
	},
	{
		id: 4,
		title: 'Горы в сумерках',
		description: 'Масло, холст · 60×40 см',
		image: placeholderImage({ width: 80, height: 80, hue: 270 }),
		category: 'Пейзаж',
	},
]

const LONG_RESULTS: SearchResult[] = [
	{
		id: 1,
		title: 'Сериал «Северный ветер», сезон 2, серии 1–12 — финальный монтаж с русским дубляжом и субтитрами',
		description: 'Обновлено вчера · 48 файлов, 312 ГБ · ответственный — звукорежиссёр проекта',
		icon: 'folder',
		category: 'Папка',
	},
	{
		id: 2,
		title: 'Сериал «Северный ветер» — сводная таблица реплик и таймкодов для всех актёров озвучки',
		description: 'Таблица · 1 840 строк · последнее изменение 12 мая',
		icon: 'file',
		category: 'Документ',
	},
]

/** Ответ сервера на запрос латиницей «zakat»: второй результат не содержит подстроки запроса. */
const REMOTE_RESULTS: SearchResult[] = [
	{ id: 1, title: 'Закат в горах', description: 'Найдено по транслиту', icon: 'video' },
	{ id: 2, title: 'Вечер у моря', description: 'Совпадение по тегу «закаты»', icon: 'image', category: 'Закаты' },
]

/**
 * Args stories — props и события BaseSearch без слотов. Тип Storybook по умолчанию объединяет props со слотами,
 * а слот `results` совпадает по имени с пропом `results` (массив): пересечение их типов не принимает массив.
 */
type SearchArgs = InstanceType<typeof BaseSearch>['$props']

/** Элементы результатов без роли (div с обработчиками мыши) — ищем по классу. */
function resultTitles(): string[] {
	return Array.from(document.querySelectorAll('.base-search__result-title')).map(el => el.textContent?.trim() ?? '')
}

/**
 * Render с запросом в локальном ref, а не в args. Обновление args перерисовывает story, и Storybook при этом
 * сбрасывает шпионы событий (onSelect, onSearch) — stories, которые проверяют вызов события после ввода, используют его.
 */
function renderWithLocalQuery(args: SearchArgs) {
	return {
		components: { BaseSearch },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['modelValue', 'onUpdate:modelValue']),
			query: ref(String(args.modelValue ?? '')),
		}),
		template: '<div class="story-narrow"><BaseSearch v-bind="props" v-model="query" /></div>',
	}
}

/** Панель результатов и окна поиска телепортируются в body — в Docs пример показывается во фрейме. */
function docsFrame(height: number) {
	return { story: { inline: false, height: `${height}px` } }
}

const meta = {
	title: 'Form/BaseSearch',
	component: BaseSearch,
	parameters: {
		docs: {
			description: {
				component: [
					'Поле поиска с подсказками: результаты фильтруются по названию и описанию, совпадения выделены.',
					'',
					'- Режимы (`mode`): `default` — список под полем; `modal` — окно поиска по центру экрана;',
					'  `sidebar` — панель справа. В modal и sidebar поле на странице только открывает окно.',
					'- `isInstant` — искать при вводе (событие `search` с задержкой `debounceMs`), иначе — по Enter.',
					'- `isRemote` — результаты уже отфильтрованы сервером и показываются как есть (транслит, опечатки).',
					'- Клавиатура: стрелки подсвечивают результат, Enter выбирает его (или запускает поиск), Escape закрывает окно.',
					'',
					'Для выбора из фиксированного списка используйте `BaseSelect` с `isSearchable`.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...baseArgTypes({ variants: SEARCH_VARIANTS }),
		modelValue: { control: 'text', table: propGroup(ARG_GROUP.content) },
		results: { control: 'object', table: propGroup(ARG_GROUP.content) },
		placeholder: { control: 'text', table: propGroup(ARG_GROUP.content) },
		maxResults: { control: 'number', table: propGroup(ARG_GROUP.content) },
		hasIcon: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
		hasClear: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
		mode: { control: 'inline-radio', options: ['default', 'modal', 'sidebar'], table: propGroup(ARG_GROUP.behavior) },
		isInstant: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
		isRemote: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
		debounceMs: { control: 'number', table: propGroup(ARG_GROUP.behavior) },
		isAutofocus: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
		isLoading: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
		isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
		error: { control: 'text', table: propGroup(ARG_GROUP.state) },
	},
	args: {
		modelValue: '',
		results: FILES,
		placeholder: 'Поиск по проекту',
		variant: 'default',
		mode: 'default',
		sizeScale: 100,
		maxResults: 10,
		hasIcon: true,
		hasClear: true,
		isInstant: true,
		isRemote: false,
		debounceMs: 300,
		isAutofocus: false,
		isLoading: false,
		isDisabled: false,
		'onUpdate:modelValue': fn(),
		onSearch: fn(),
		onSelect: fn(),
		onClear: fn(),
	},
	// Запрос хранится в args: ввод в поле обновляет Controls, а изменение в Controls — поле.
	render: args => {
		const onUpdate = useModelArg()
		return {
			components: { BaseSearch },
			setup: () => ({ props: useArgsWithoutSlots(args, []), onUpdate }),
			template: '<div class="story-narrow"><BaseSearch v-bind="props" @update:model-value="onUpdate" /></div>',
		}
	},
} satisfies Meta<SearchArgs>

export default meta
type Story = StoryObj<SearchArgs>

// ─── Default ───────────────────────────────────────────────────────────────────

/** Песочница: введите «лис» или «запись» — появятся подсказки; props меняются в Controls. */
export const Default: Story = {}

// ─── Внешний вид ───────────────────────────────────────────────────────────────

/** Семь вариантов поля — как у `BaseInput`: `default`, `outline`, `soft`, `ghost`, `filled`, `underline`, `shadow`. */
export const Variants: Story = {
	parameters: {
		controls: { include: ['sizeScale', 'isDisabled', 'hasIcon'] },
		docs: {
			source: {
				code: SEARCH_VARIANTS.map(variant => `<BaseSearch v-model="query" :results="results" variant="${variant}" />`).join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseSearch },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['modelValue', 'variant', 'placeholder', 'onUpdate:modelValue']),
			variants: SEARCH_VARIANTS,
			values: ref<Record<string, string>>({ default: 'Лисья тропа' }),
		}),
		template: `
			<div class="story-grid" style="--story-grid-min: 240px;">
				<BaseSearch
					v-for="variant in variants"
					:key="variant"
					v-bind="props"
					v-model="values[variant]"
					:variant="variant"
					:placeholder="variant" />
			</div>
		`,
	}),
}

/** Размеры через `sizeScale`: высота поля 24, 28, 32, 36 и 40px; иконка, кнопка очистки и список масштабируются вместе. */
export const Sizes: Story = {
	parameters: {
		controls: { include: ['variant'] },
		docs: {
			source: {
				code: SIZE_PRESETS.map(p => `<BaseSearch v-model="query" :results="results" :size-scale="${p.sizeScale}" />`).join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseSearch },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['modelValue', 'sizeScale', 'placeholder', 'onUpdate:modelValue']),
			presets: SIZE_PRESETS,
			sizeLabel,
			values: ref<Record<string, string>>({ md: 'Лисья тропа' }),
		}),
		template: `
			<div class="story-col story-narrow">
				<BaseSearch
					v-for="preset in presets"
					:key="preset.name"
					v-bind="props"
					v-model="values[preset.name]"
					:size-scale="preset.sizeScale"
					:placeholder="sizeLabel(preset)" />
			</div>
		`,
	}),
}

/**
 * Кастомный цвет фона и текста поля через `color`. Кнопка очистки внутри поля — вложенный компонент: цвет поиска
 * она не наследует.
 */
export const CustomColor: Story = {
	args: { modelValue: 'Лисья тропа', color: { bg: { base: '#eff6ff' }, text: { base: '#1e3a8a' } } },
	play: async ({ canvas }) => {
		const field = canvas.getByPlaceholderText('Поиск по проекту')
		await expect(getComputedStyle(field.closest('.base-input__wrapper') as HTMLElement).backgroundColor).toBe('rgb(239, 246, 255)')
		await expect(getComputedStyle(canvas.getByRole('button', { name: 'Очистить' })).backgroundColor).toBe('rgba(0, 0, 0, 0)')
	},
}

// ─── Состояния ─────────────────────────────────────────────────────────────────

/**
 * Загрузка (`isLoading`): спиннер в поле; пока ответа нет, в панели — строка «Загрузка...» (заменяется слотом `loading`).
 * Здесь — серверный поиск, ответ ещё не пришёл.
 */
export const Loading: Story = {
	args: { modelValue: 'Лисья', results: [], isRemote: true, isLoading: true },
	parameters: { docs: docsFrame(200) },
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByPlaceholderText('Поиск по проекту'))
		const status = await screen.findByText('Загрузка...')
		await waitFor(() => expect(status).toBeVisible())
		await expect(screen.getAllByRole('status').length).toBeGreaterThan(0)
	},
}

/** Ошибка: красная рамка и текст под полем; поле помечено `aria-invalid` и описано текстом ошибки. */
export const WithError: Story = {
	args: { modelValue: 'Лис', error: 'Сервис поиска недоступен, попробуйте позже' },
	play: async ({ canvas }) => {
		const field = canvas.getByPlaceholderText('Поиск по проекту')
		await expect(field).toHaveAttribute('aria-invalid', 'true')
		await expect(field).toHaveAccessibleDescription('Сервис поиска недоступен, попробуйте позже')
	},
}

/** Отключённый поиск: поле приглушено и недоступно для ввода. */
export const Disabled: Story = {
	args: { modelValue: 'Лисья тропа', isDisabled: true },
	play: async ({ canvas }) => {
		await expect(canvas.getByPlaceholderText('Поиск по проекту')).toBeDisabled()
	},
}

/**
 * Ничего не найдено: в панели — текст из слота `empty` (по умолчанию «Ничего не найдено»). Скринридер слышит то же
 * из скрытой области `role="status"`.
 */
export const Empty: Story = {
	args: { modelValue: 'Трейлер' },
	parameters: { docs: docsFrame(200) },
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByPlaceholderText('Поиск по проекту'))
		const empty = await screen.findByText('Ничего не найдено', { ignore: 'script, style, [role="status"]' })
		await waitFor(() => expect(empty).toBeVisible())
		await expect(canvas.getByRole('status')).toHaveTextContent('Ничего не найдено')
	},
}

/** Длинные названия и описания обрезаются многоточием в одну строку и не растягивают панель. */
export const LongContent: Story = {
	args: { modelValue: 'Северный ветер', results: LONG_RESULTS },
	parameters: { docs: docsFrame(240) },
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByPlaceholderText('Поиск по проекту'))
		await waitFor(() => expect(resultTitles()).toHaveLength(2))
		const title = document.querySelector('.base-search__result-title') as HTMLElement
		await expect(title.scrollWidth).toBeGreaterThan(title.clientWidth)
	},
}

// ─── Содержимое ────────────────────────────────────────────────────────────────

/** Превью (`image`) вместо иконки; совпадения с запросом выделены и в описании. */
export const WithImages: Story = {
	args: { modelValue: 'холст', results: ARTWORKS, placeholder: 'Поиск картин' },
	parameters: { docs: docsFrame(320) },
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByPlaceholderText('Поиск картин'))
		await waitFor(() => expect(resultTitles()).toHaveLength(4))
		const preview = screen.getByRole('img', { name: 'Закат в горах' })
		await waitFor(() => expect(preview).toBeVisible())
		const marks = Array.from(document.querySelectorAll('.base-search__result mark')).map(mark => mark.textContent)
		await expect(marks).toEqual(['холст', 'холст', 'холст', 'холст'])
	},
}

/**
 * Слоты `result-before` и `result-after` — заголовок группы и действие под списком; `result` заменяет разметку
 * одного результата, `results` — весь список, `empty` и `loading` — состояния.
 */
export const Slots: Story = {
	args: { modelValue: 'Лис' },
	parameters: {
		docs: {
			...docsFrame(280),
			source: {
				code: [
					'<BaseSearch v-model="query" :results="results">',
					'  <template #result-before>Файлы проекта</template>',
					'  <template #result-after="{ query }"><BaseButton variant="ghost">Все результаты по запросу «{{ query }}»</BaseButton></template>',
					'</BaseSearch>',
				].join('\n'),
			},
		},
	},
	render: args => {
		const onUpdate = useModelArg()
		return {
			components: { BaseSearch, BaseButton },
			setup: () => ({ props: useArgsWithoutSlots(args, []), onUpdate }),
			template: `
				<div class="story-narrow">
					<BaseSearch v-bind="props" @update:model-value="onUpdate">
						<template #result-before>
							<div class="story-label" style="padding: 6px 8px 2px;">Файлы проекта</div>
						</template>
						<template #result-after="{ query }">
							<BaseButton variant="ghost" style="width: 100%;">Все результаты по запросу «{{ query }}»</BaseButton>
						</template>
					</BaseSearch>
				</div>
			`,
		}
	},
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByPlaceholderText('Поиск по проекту'))
		const action = await screen.findByRole('button', { name: 'Все результаты по запросу «Лис»' })
		await waitFor(() => expect(action).toBeVisible())
		await expect(screen.getByText('Файлы проекта')).toBeVisible()
	},
}

// ─── Сценарии ──────────────────────────────────────────────────────────────────

/**
 * Серверный поиск (`isRemote`): результаты показываются как есть, без фильтрации по подстроке.
 * «Вечер у моря» не содержит «zakat» — без `isRemote` этот ответ сервера был бы скрыт.
 */
export const RemoteResults: Story = {
	args: { isRemote: true, modelValue: 'zakat', results: REMOTE_RESULTS },
	parameters: { docs: docsFrame(220) },
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByPlaceholderText('Поиск по проекту'))
		await waitFor(() => expect(resultTitles()).toEqual(['Закат в горах', 'Вечер у моря']))
	},
}

/** Поиск по Enter (`isInstant: false`): подсказки и событие `search` появляются только после нажатия Enter. */
export const SearchOnEnter: Story = {
	args: { isInstant: false },
	parameters: { docs: docsFrame(240) },
	render: renderWithLocalQuery,
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.type(canvas.getByPlaceholderText('Поиск по проекту'), 'Лис')
		await expect(resultTitles()).toHaveLength(0)
		await expect(args.onSearch).not.toHaveBeenCalled()

		await userEvent.keyboard('{Enter}')
		await expect(args.onSearch).toHaveBeenCalledWith('Лис')
		await waitFor(() => expect(resultTitles()).toEqual(['Сценарий «Лисья тропа»', 'Раскадровка «Лисья тропа»']))
	},
}

/**
 * Режим `modal`: поле на странице открывает окно поиска по центру. Окно закрывают Escape, клик по подложке и кнопка
 * «Закрыть»; запрос сохраняется до следующего открытия.
 */
export const ModalMode: Story = {
	args: { mode: 'modal', modelValue: 'Лис' },
	parameters: { docs: docsFrame(420) },
	play: async ({ canvas, userEvent }) => {
		const trigger = canvas.getByPlaceholderText('Поиск по проекту')
		await userEvent.click(trigger)
		const dialog = await screen.findByRole('dialog', { name: 'Поиск' })
		await waitFor(() => expect(dialog).toBeVisible())
		await expect(screen.getByRole('button', { name: 'Закрыть' })).toBeInTheDocument()

		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())

		await userEvent.click(trigger)
		await waitFor(() => expect(resultTitles()).toEqual(['Сценарий «Лисья тропа»', 'Раскадровка «Лисья тропа»']))
	},
}

/** Режим `sidebar`: окно поиска — панель у правого края экрана во всю высоту. */
export const SidebarMode: Story = {
	args: { mode: 'sidebar', modelValue: 'запис' },
	parameters: { docs: docsFrame(420) },
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.click(canvas.getByPlaceholderText('Поиск по проекту'))
		const dialog = await screen.findByRole('dialog', { name: 'Поиск' })
		await waitFor(() => expect(dialog).toBeVisible())
		await expect(resultTitles()).toEqual(['Запись голоса — сцена 12', 'Календарь записей'])
		await expect(args.onSelect).not.toHaveBeenCalled()
	},
}

// ─── Доступность ───────────────────────────────────────────────────────────────

/**
 * Клавиатура: Tab ставит фокус в поле, ввод показывает подсказки, стрелки подсвечивают результат,
 * Enter выбирает его — запрос заменяется названием результата.
 */
export const Keyboard: Story = {
	tags: ['!autodocs'],
	render: renderWithLocalQuery,
	play: async ({ canvas, userEvent, args }) => {
		const field = canvas.getByPlaceholderText('Поиск по проекту')
		await tabTo(field, userEvent)
		await userEvent.keyboard('Лис')
		await waitFor(() => expect(resultTitles()).toHaveLength(2))

		await userEvent.keyboard('{ArrowDown}{ArrowDown}')
		await expect(document.querySelector('.base-search__result--highlighted')).toHaveTextContent('Раскадровка «Лисья тропа»')
		await userEvent.keyboard('{Enter}')
		await expect(args.onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 4 }))
		await expect(field).toHaveValue('Раскадровка «Лисья тропа»')
		await waitFor(() => expect(resultTitles()).toHaveLength(0))
	},
}
