/**
 * BaseModal — stories.
 *
 * Разделы: Default (песочница: окно открывается кнопкой, isOpen синхронизирован с Controls) → внешний вид
 * (варианты, размеры, кастомный цвет — окна открыты внутри рамок через isContained) → открытое окно и длинный текст →
 * сценарии (окно в блоке, запрет закрытия по подложке, на весь экран, список в окне) → клавиатура.
 * Stories с окном, открытым поверх всей страницы, видны только в сайдбаре: в Docs они закрыли бы страницу.
 */

import { expect, fn, screen, waitFor, within } from 'storybook/test'
import { computed, ref } from 'vue'
import { ARG_GROUP, baseArgTypes, propGroup, SIZE_PRESETS, sizeLabel, slotArgType, tabTo, useArgsWithoutSlots, useModelArg } from '@/stories/helpers'
import { BaseButton } from '@components/BaseButton'
import { BaseInput } from '@components/BaseInput'
import { BaseSelect } from '@components/BaseSelect'
import { BaseText } from '@components/BaseText'
import { MODAL_VARIANTS } from '../model/BaseModal.types'
import BaseModal from '../ui/BaseModal.vue'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

/** Args, которые витрины задают сами: их нет в v-bind, чтобы не перебить значения примера. */
const SHOWCASE_OWN_ARGS = ['default', 'isOpen', 'title', 'isContained', 'onUpdate:isOpen'] as const

/** Цвет после подстановки CSS-переменных в текущей теме: так значение `var(--rise-…)` сравнивается с цветом элемента. */
function resolveColor(value: string): string {
	const probe = document.createElement('span')
	probe.style.color = value
	document.body.append(probe)
	const resolved = getComputedStyle(probe).color
	probe.remove()
	return resolved
}

/** Абзацы для примера с длинным текстом. */
const TERMS = [
	'Сервис предоставляет доступ к облачному хранилищу проектов, редактору субтитров и инструментам совместной работы.',
	'Учётная запись создаётся для одного человека. Передавать доступ третьим лицам нельзя, для команды есть общие проекты.',
	'Загруженные файлы остаются вашими: мы используем их только для работы сервиса и не передаём другим пользователям.',
	'Резервные копии проектов хранятся 30 дней. После удаления проекта восстановить его можно только из резервной копии.',
	'Бесплатный тариф ограничен тремя проектами и 5 ГБ хранилища. Лимиты платных тарифов указаны на странице цен.',
	'Оплата списывается в начале каждого периода. Отменить подписку можно в любой момент в настройках аккаунта.',
	'При нарушении правил доступ к проекту может быть ограничен. Мы сообщим о причине и сроках на почту аккаунта.',
	'О плановых работах мы предупреждаем за сутки. Во время работ проекты доступны только для чтения.',
	'Вопросы и претензии принимаются через форму обратной связи. Мы отвечаем в течение двух рабочих дней.',
	'Условия могут меняться. О существенных изменениях мы сообщим заранее, продолжение работы означает согласие.',
	'Вы можете выгрузить все данные аккаунта одним архивом: проекты, субтитры, комментарии и историю правок.',
	'Удаление аккаунта необратимо. Перед удалением мы отправим письмо с подтверждением на почту аккаунта.',
] as const

/** Строки субтитров для примера окна на весь экран. */
const SUBTITLES = [
	{ time: '00:00:01', text: 'Добро пожаловать в студию.' },
	{ time: '00:00:04', text: 'Сегодня мы запишем первую серию.' },
	{ time: '00:00:08', text: 'Проверьте микрофоны и наушники.' },
	{ time: '00:00:12', text: 'Начинаем по моему сигналу.' },
] as const

const meta = {
	title: 'Overlay/BaseModal',
	component: BaseModal,
	parameters: {
		docs: {
			description: {
				component: [
					'Модальное окно — диалог поверх страницы: подтверждение действия, короткая форма, детали записи.',
					'',
					'- Открытие и закрытие — `v-model:is-open`. Окно закрывают кнопка «Закрыть» в шапке (есть при `title`),',
					'  Escape и клик по подложке (`closeOnOverlay`).',
					'- Доступность: `role="dialog"`, `aria-modal`, имя из `title`. При открытии фокус переходит в окно, Tab не выходит',
					'  за его пределы, после закрытия фокус возвращается на кнопку, которая открыла окно. Прокрутка страницы блокируется.',
					'- `isContained` — окно внутри блока (без телепорта, немодальное); `fullScreen` — на всю ширину, высоту или экран.',
					'- `color` красит окно; компоненты в теле и подвале сохраняют свои цвета.',
					'',
					'Панель у края экрана — `BaseSlideover`, подсказка с содержимым у элемента — `BasePopover`.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...baseArgTypes({ variants: MODAL_VARIANTS }),
		title: { control: 'text', table: propGroup(ARG_GROUP.content) },
		fullScreen: { control: 'select', options: ['width', 'height', 'both'], table: propGroup(ARG_GROUP.appearance) },
		hasOverlay: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
		isOpen: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
		closeOnOverlay: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
		isContained: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
		default: slotArgType('Текст в теле окна'),
		footer: { control: false },
	},
	args: {
		isOpen: false,
		title: 'Удалить проект?',
		default: 'Проект «Сайт студии» и все его файлы будут удалены. Это действие нельзя отменить.',
		variant: 'default',
		sizeScale: 100,
		hasOverlay: true,
		closeOnOverlay: true,
		isContained: false,
		onClose: fn(),
		'onUpdate:isOpen': fn(),
	},
	// isOpen хранится в args: кнопка открывает окно, закрытие окна обновляет Controls, а переключатель в Controls — окно.
	render: args => {
		const onUpdate = useModelArg('isOpen')
		return {
			components: { BaseModal, BaseButton, BaseText },
			setup: () => ({ props: useArgsWithoutSlots(args), text: computed(() => args.default), onUpdate }),
			template: `
				<BaseButton variant="outline" @click="onUpdate(true)">Открыть окно</BaseButton>
				<BaseModal v-bind="props" @update:is-open="onUpdate">
					<BaseText>{{ text }}</BaseText>
					<template #footer>
						<BaseButton variant="outline" @click="onUpdate(false)">Отмена</BaseButton>
						<BaseButton @click="onUpdate(false)">Удалить</BaseButton>
					</template>
				</BaseModal>
			`,
		}
	},
} satisfies Meta<typeof BaseModal>

export default meta
type Story = StoryObj<typeof meta>

// ─── Default ───────────────────────────────────────────────────────────────────

/**
 * Песочница: кнопка открывает окно, `isOpen` синхронизирован с Controls. Окно закрывают «Закрыть» в шапке,
 * Escape и клик по подложке; «Отмена» и «Удалить» в подвале закрывают его из кода примера.
 * Без play-функции: story открывают e2e-тесты, и автоматические клики мешали бы им (сценарии проверяют Opened и Keyboard).
 */
export const Default: Story = {}

// ─── Внешний вид ───────────────────────────────────────────────────────────────

/**
 * Три варианта. `default` — рамка и тень; `shadow` — только тень; `ghost` — без фона, рамки и тени,
 * когда оформление даёт содержимое (изображение, своя карточка). Окна открыты внутри рамок (`isContained`).
 */
export const Variants: Story = {
	parameters: {
		controls: { include: ['sizeScale', 'hasOverlay'] },
		docs: {
			source: {
				code: MODAL_VARIANTS.map(variant => `<BaseModal v-model:is-open="isOpen" variant="${variant}" title="${variant}">…</BaseModal>`).join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseModal, BaseText },
		setup: () => ({ props: useArgsWithoutSlots(args, [...SHOWCASE_OWN_ARGS, 'variant']), variants: MODAL_VARIANTS }),
		template: `
			<div class="story-grid" style="--story-grid-min: 240px;">
				<div v-for="variant in variants" :key="variant" class="story-frame" style="height: 240px;">
					<BaseModal v-bind="props" :is-open="true" is-contained :variant="variant" :title="variant">
						<BaseText>Окно открыто внутри рамки и не выходит за её границы.</BaseText>
					</BaseModal>
				</div>
			</div>
		`,
	}),
}

/**
 * Размеры задаются `sizeScale`: пропорционально меняются ширина окна (500px при 100), отступы, кегль,
 * кнопка закрытия и кнопки в подвале, если у них нет своего `sizeScale`.
 */
export const Sizes: Story = {
	parameters: {
		controls: { include: ['variant'] },
		docs: {
			source: {
				code: SIZE_PRESETS.map(preset => `<BaseModal v-model:is-open="isOpen" :size-scale="${preset.sizeScale}" title="${preset.name}">…</BaseModal>`).join(
					'\n',
				),
			},
		},
	},
	render: args => ({
		components: { BaseModal, BaseText },
		setup: () => ({ props: useArgsWithoutSlots(args, [...SHOWCASE_OWN_ARGS, 'sizeScale']), presets: SIZE_PRESETS, sizeLabel }),
		template: `
			<div class="story-grid" style="--story-grid-min: 300px;">
				<div v-for="preset in presets" :key="preset.name" class="story-frame" style="height: 200px;">
					<BaseModal v-bind="props" :is-open="true" is-contained :size-scale="preset.sizeScale" :title="sizeLabel(preset)">
						<BaseText>Текст в теле окна.</BaseText>
					</BaseModal>
				</div>
			</div>
		`,
	}),
}

/**
 * Кастомный цвет через `color`: фон и текст окна, фон кнопки закрытия при наведении (`bg.hover`). Подойдёт любой CSS-цвет;
 * токены `var(--rise-…)` сохраняют контраст в обеих темах. Компоненты в теле и подвале `color` не наследуют —
 * кнопка «Оформить» сохраняет свой цвет.
 */
export const CustomColor: Story = {
	args: {
		title: 'Годовая подписка',
		color: {
			bg: { base: 'var(--rise-primary-soft)', hover: 'var(--rise-primary-soft-hover)' },
			text: { base: 'var(--rise-primary-text)' },
		},
	},
	parameters: { controls: { include: ['color', 'variant', 'sizeScale'] } },
	render: args => ({
		components: { BaseModal, BaseButton },
		setup: () => ({ props: useArgsWithoutSlots(args, [...SHOWCASE_OWN_ARGS]) }),
		template: `
			<div class="story-frame story-medium" style="height: 280px;">
				<BaseModal v-bind="props" :is-open="true" is-contained title="Годовая подписка">
					Два месяца в подарок при оплате за год. Подписку можно отменить в любой момент.
					<template #footer>
						<BaseButton>Оформить</BaseButton>
					</template>
				</BaseModal>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		const dialog = canvas.getByRole('dialog', { name: 'Годовая подписка' })
		await expect(getComputedStyle(dialog).backgroundColor).toBe(resolveColor('var(--rise-primary-soft)'))
		await expect(getComputedStyle(dialog).color).toBe(resolveColor('var(--rise-primary-text)'))
		const action = within(dialog).getByRole('button', { name: 'Оформить' })
		await expect(getComputedStyle(action).backgroundColor).toBe(resolveColor('var(--rise-primary)'))
	},
}

// ─── Содержимое ────────────────────────────────────────────────────────────────

/**
 * Открытое окно поверх страницы: шапка с заголовком и кнопкой «Закрыть», тело, подвал с действиями
 * (главное — последним). Фокус сразу переходит в окно — на кнопку «Закрыть».
 */
export const Opened: Story = {
	tags: ['!autodocs'],
	args: { isOpen: true },
	play: async () => {
		const dialog = await screen.findByRole('dialog', { name: 'Удалить проект?' })
		await waitFor(() => expect(within(dialog).getByRole('button', { name: 'Закрыть' })).toHaveFocus())
		await expect(document.body.style.overflow).toBe('hidden')
	},
}

/** Длинный текст прокручивается внутри тела окна: шапка и подвал с действиями остаются на экране. */
export const LongContent: Story = {
	tags: ['!autodocs'],
	args: { isOpen: true, title: 'Условия использования' },
	render: args => {
		const onUpdate = useModelArg('isOpen')
		return {
			components: { BaseModal, BaseButton, BaseText },
			setup: () => ({ props: useArgsWithoutSlots(args), terms: TERMS, onUpdate }),
			template: `
				<BaseButton variant="outline" @click="onUpdate(true)">Открыть условия</BaseButton>
				<BaseModal v-bind="props" @update:is-open="onUpdate">
					<div class="story-stack">
						<BaseText v-for="(term, index) in terms" :key="index">{{ index + 1 }}. {{ term }}</BaseText>
					</div>
					<template #footer>
						<BaseButton @click="onUpdate(false)">Понятно</BaseButton>
					</template>
				</BaseModal>
			`,
		}
	},
	play: async () => {
		const dialog = await screen.findByRole('dialog', { name: 'Условия использования' })
		const accept = within(dialog).getByRole('button', { name: 'Понятно' })
		const body = within(dialog).getByText(/^1\. /).closest('.base-modal__body') as HTMLElement
		await expect(body.scrollHeight).toBeGreaterThan(body.clientHeight)
		await expect(accept.getBoundingClientRect().bottom).toBeLessThanOrEqual(window.innerHeight)
	},
}

// ─── Сценарии ──────────────────────────────────────────────────────────────────

/**
 * Окно внутри блока (`isContained`): рендерится на месте, перекрывает только родителя с `position: relative`
 * и не выходит за его границы. Диалог немодальный — остальная страница доступна, прокрутка не блокируется.
 */
export const Contained: Story = {
	parameters: { controls: { include: ['variant', 'sizeScale', 'closeOnOverlay'] } },
	render: args => ({
		components: { BaseModal, BaseButton, BaseText },
		setup: () => ({ props: useArgsWithoutSlots(args, [...SHOWCASE_OWN_ARGS]), isOpen: ref(false) }),
		template: `
			<div class="story-frame story-medium" style="height: 220px;">
				<BaseButton variant="outline" @click="isOpen = true">Открыть в блоке</BaseButton>
				<BaseModal v-bind="props" v-model:is-open="isOpen" is-contained title="Окно в блоке">
					<BaseText>Окно перекрывает только этот блок. Кнопки и поля за его пределами доступны.</BaseText>
				</BaseModal>
			</div>
		`,
	}),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Открыть в блоке' }))
		const dialog = await canvas.findByRole('dialog', { name: 'Окно в блоке' })
		await expect(dialog).not.toHaveAttribute('aria-modal')
		await expect(document.body.style.overflow).toBe('')

		// Окно появляется из 95%: границы проверяются после окончания анимации
		const frame = (dialog.closest('.story-frame') as HTMLElement).getBoundingClientRect()
		await waitFor(() => expect(getComputedStyle(dialog).transform).toBe('none'))
		const box = dialog.getBoundingClientRect()
		await expect(box.top).toBeGreaterThanOrEqual(frame.top)
		await expect(box.bottom).toBeLessThanOrEqual(frame.bottom)
	},
}

/**
 * Подтверждение, которое нельзя закрыть случайным кликом: `closeOnOverlay: false`. Клик по подложке окно не закрывает,
 * Escape и кнопка «Закрыть» — закрывают.
 */
export const NoOverlayClose: Story = {
	args: { closeOnOverlay: false, title: 'Отправить на согласование?' },
	parameters: { controls: { include: ['closeOnOverlay', 'hasOverlay'] } },
	render: args => ({
		components: { BaseModal, BaseButton, BaseText },
		setup: () => ({ props: useArgsWithoutSlots(args, ['default', 'isOpen', 'onUpdate:isOpen']), isOpen: ref(false) }),
		template: `
			<BaseButton variant="outline" @click="isOpen = true">Отправить на согласование</BaseButton>
			<BaseModal v-bind="props" v-model:is-open="isOpen">
				<BaseText>После отправки редактировать документ нельзя, пока согласование не завершится.</BaseText>
				<template #footer>
					<BaseButton variant="outline" @click="isOpen = false">Отмена</BaseButton>
					<BaseButton @click="isOpen = false">Отправить</BaseButton>
				</template>
			</BaseModal>
		`,
	}),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Отправить на согласование' }))
		const dialog = await screen.findByRole('dialog', { name: 'Отправить на согласование?' })

		await userEvent.click(dialog.parentElement as HTMLElement)
		await expect(dialog).toBeInTheDocument()

		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
	},
}

/** На весь экран: `fullScreen="both"` (или `width`, `height`) растягивает окно с отступом 16px от краёв. */
export const FullScreen: Story = {
	tags: ['!autodocs'],
	args: { isOpen: true, fullScreen: 'both', title: 'Предпросмотр субтитров' },
	render: args => {
		const onUpdate = useModelArg('isOpen')
		return {
			components: { BaseModal, BaseButton, BaseText },
			setup: () => ({ props: useArgsWithoutSlots(args), lines: SUBTITLES, onUpdate }),
			template: `
				<BaseButton variant="outline" @click="onUpdate(true)">Предпросмотр</BaseButton>
				<BaseModal v-bind="props" @update:is-open="onUpdate">
					<div class="story-stack">
						<BaseText v-for="line in lines" :key="line.time">{{ line.time }} — {{ line.text }}</BaseText>
					</div>
					<template #footer>
						<BaseButton variant="outline" @click="onUpdate(false)">Закрыть</BaseButton>
						<BaseButton @click="onUpdate(false)">Экспортировать</BaseButton>
					</template>
				</BaseModal>
			`,
		}
	},
	play: async () => {
		const dialog = await screen.findByRole('dialog', { name: 'Предпросмотр субтитров' })
		// Окно появляется из 95%: размеры проверяются после окончания анимации
		await waitFor(() => expect(getComputedStyle(dialog).transform).toBe('none'))
		const box = dialog.getBoundingClientRect()
		const viewport = document.documentElement
		await expect(box.width).toBeCloseTo(viewport.clientWidth - 32, 0)
		await expect(box.height).toBeCloseTo(viewport.clientHeight - 32, 0)
	},
}

/**
 * Список в окне: Escape сначала закрывает открытый список, следующее нажатие — окно. Список телепортирован в body,
 * и выбор пункта не считается кликом по подложке.
 */
export const WithList: Story = {
	tags: ['!autodocs'],
	render: args => ({
		components: { BaseModal, BaseButton, BaseSelect },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['default', 'isOpen', 'title', 'onUpdate:isOpen']),
			isOpen: ref(true),
			language: ref('ru'),
			languages: [
				{ value: 'ru', label: 'Русский' },
				{ value: 'en', label: 'Английский' },
				{ value: 'ja', label: 'Японский' },
			],
		}),
		template: `
			<BaseButton variant="outline" @click="isOpen = true">Настройки субтитров</BaseButton>
			<BaseModal v-bind="props" v-model:is-open="isOpen" title="Субтитры серии">
				<BaseSelect v-model="language" label="Язык субтитров" :options="languages" />
				<template #footer>
					<BaseButton variant="outline" @click="isOpen = false">Отмена</BaseButton>
					<BaseButton @click="isOpen = false">Сохранить</BaseButton>
				</template>
			</BaseModal>
		`,
	}),
	play: async ({ userEvent }) => {
		const dialog = await screen.findByRole('dialog', { name: 'Субтитры серии' })
		await userEvent.click(within(dialog).getByRole('combobox', { name: 'Язык субтитров' }))
		await userEvent.click(await screen.findByRole('option', { name: 'Японский' }))
		await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument())
		await expect(within(dialog).getByRole('combobox', { name: 'Язык субтитров' })).toHaveTextContent('Японский')

		await userEvent.click(within(dialog).getByRole('combobox', { name: 'Язык субтитров' }))
		await screen.findByRole('listbox')
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument())
		await expect(screen.getByRole('dialog', { name: 'Субтитры серии' })).toBeInTheDocument()

		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
	},
}

// ─── Доступность ───────────────────────────────────────────────────────────────

/**
 * Клавиатура: Enter на кнопке открывает окно и переводит фокус внутрь, Tab и Shift+Tab обходят элементы окна
 * по кругу и не уходят на страницу, Escape закрывает окно и возвращает фокус на кнопку.
 */
export const Keyboard: Story = {
	tags: ['!autodocs'],
	render: args => ({
		components: { BaseModal, BaseButton, BaseInput },
		setup: () => ({ props: useArgsWithoutSlots(args, ['default', 'isOpen', 'title', 'onUpdate:isOpen']), isOpen: ref(false), name: ref('Сайт студии') }),
		template: `
			<BaseButton variant="outline" @click="isOpen = true">Переименовать</BaseButton>
			<BaseModal v-bind="props" v-model:is-open="isOpen" title="Переименовать проект">
				<BaseInput v-model="name" label="Название" />
				<template #footer>
					<BaseButton variant="outline" @click="isOpen = false">Отмена</BaseButton>
					<BaseButton @click="isOpen = false">Сохранить</BaseButton>
				</template>
			</BaseModal>
		`,
	}),
	play: async ({ canvas, userEvent }) => {
		const trigger = canvas.getByRole('button', { name: 'Переименовать' })
		await tabTo(trigger, userEvent)
		await userEvent.keyboard('{Enter}')

		const dialog = await screen.findByRole('dialog', { name: 'Переименовать проект' })
		const close = within(dialog).getByRole('button', { name: 'Закрыть' })
		await waitFor(() => expect(close).toHaveFocus())

		await userEvent.tab()
		await expect(within(dialog).getByLabelText('Название')).toHaveFocus()
		await userEvent.tab()
		await userEvent.tab()
		await expect(within(dialog).getByRole('button', { name: 'Сохранить' })).toHaveFocus()
		// С последнего элемента Tab возвращается на первый, а не на страницу под подложкой
		await userEvent.tab()
		await expect(close).toHaveFocus()
		await userEvent.tab({ shift: true })
		await expect(within(dialog).getByRole('button', { name: 'Сохранить' })).toHaveFocus()

		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
		await expect(trigger).toHaveFocus()
	},
}
