/** Большинство примеров — в режиме isContained: список уведомлений в потоке страницы, без телепорта. */

import { computed, onMounted, ref } from 'vue'
import { BaseButton } from '@components/BaseButton'
import BaseNotification from '../ui/BaseNotification.vue'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, fn, screen, waitFor, within } from 'storybook/test'
import type { BaseNotificationExpose, BaseNotificationProps } from '../types/BaseNotification.types'
import { ARG_GROUP, baseArgTypes, hiddenArgTypes, propGroup, tabTo, useArgsWithoutSlots } from '@/stories/helpers'
import { NOTIFICATION_POSITIONS, NOTIFICATION_TYPES, NOTIFICATION_VARIANTS } from '../types/BaseNotification.types'

/** Показ «надолго» для примеров: уведомление не исчезает, пока его смотрят (по умолчанию — 3 секунды). */
const STORY_DURATION = 600_000

/** Уведомления каждого типа — в том порядке, в котором они показываются сверху вниз. */
const TYPE_EXAMPLES: BaseNotificationProps[] = [
	{ type: 'success', title: 'Серия опубликована', description: 'Серия 3 доступна подписчикам сообщества.' },
	{ type: 'error', title: 'Не удалось загрузить видео', description: 'Файл больше 4 ГБ. Сожмите его или загрузите по частям.' },
	{ type: 'warning', title: 'Заканчивается место', description: 'Занято 4,6 из 5 ГБ хранилища.' },
	{ type: 'info', title: 'Доступно обновление', description: 'Новая версия редактора субтитров вышла сегодня.' },
]

const TYPE_LABELS: Record<(typeof NOTIFICATION_TYPES)[number], string> = {
	success: 'Успех',
	error: 'Ошибка',
	warning: 'Предупреждение',
	info: 'Информация',
}

/** Цвет после подстановки CSS-переменных в текущей теме: так значение `var(--rise-…)` сравнивается с цветом элемента. */
function resolveColor(value: string): string {
	const probe = document.createElement('span')
	probe.style.color = value
	document.body.append(probe)
	const resolved = getComputedStyle(probe).color
	probe.remove()
	return resolved
}

const meta = {
	title: 'Overlay/BaseNotification',
	component: BaseNotification,
	parameters: {
		docs: {
			description: {
				component: [
					'Всплывающие уведомления (toast) о результате действия: сохранено, ошибка загрузки, предупреждение.',
					'',
					'- В приложении уведомления показывает `useToast()` внутри `<BaseApp>` — отдельный BaseNotification не нужен.',
					'- Сам компонент: одно уведомление — из props (`title`, `description`, `type`), список — методом `add()`',
					'  через ref или управляемый `items` (закрытие — событие `remove(id)`). Каждое закрывается кнопкой',
					'  «Закрыть» и само — через `duration` мс (по умолчанию 3 секунды, полоса снизу показывает оставшееся время).',
					'- `isPersistent` — без автозакрытия (загрузка, нет сети); `actions` — кнопки вроде «Отменить».',
					'- Пока указатель над уведомлениями или фокус внутри, они не закрываются (WCAG 2.2.1).',
					'- `type` задаёт цвет иконки и полосы прогресса; `position` — угол или край экрана; `isContained` —',
					'  список в потоке страницы, без телепорта.',
					'- Доступность: контейнер — регион «Уведомления», ошибка объявляется сразу (`role="alert"`),',
					'  остальные типы — вежливо (`role="status"`).',
					'',
					'Сообщение, которое остаётся на странице, — `BaseAlert`.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...baseArgTypes({ variants: NOTIFICATION_VARIANTS }),
		...hiddenArgTypes('notificationKey', 'default', 'items'),
		title: { control: 'text', table: propGroup(ARG_GROUP.content) },
		description: { control: 'text', table: propGroup(ARG_GROUP.content) },
		actions: { control: 'object', table: propGroup(ARG_GROUP.content) },
		type: { control: 'inline-radio', options: NOTIFICATION_TYPES, table: propGroup(ARG_GROUP.appearance) },
		position: { control: 'select', options: NOTIFICATION_POSITIONS, table: propGroup(ARG_GROUP.appearance) },
		duration: { control: { type: 'number', min: 0, step: 1000 }, table: propGroup(ARG_GROUP.behavior) },
		isPersistent: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
		isContained: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	},
	args: {
		title: 'Изменения сохранены',
		description: 'Проект «Сайт студии» обновлён.',
		type: 'success',
		variant: 'default',
		position: 'top-right',
		duration: STORY_DURATION,
		sizeScale: 100,
		isPersistent: false,
		isContained: true,
		onClose: fn(),
		onRemove: fn(),
	},
	// Уведомление из props создаётся при монтировании: смена args в Controls пересоздаёт компонент (key).
	render: args => ({
		components: { BaseNotification },
		setup: () => {
			const props = useArgsWithoutSlots(args, [])
			const key = computed(() => JSON.stringify(Object.entries(args).filter(([, value]) => typeof value !== 'function')))
			return { props, key }
		},
		template: '<BaseNotification :key="key" v-bind="props" />',
	}),
} satisfies Meta<typeof BaseNotification>

export default meta
type Story = StoryObj<typeof meta>

/** Пример со списком: уведомления добавляются методом add() после монтирования. */
function listRender(items: BaseNotificationProps[]): Story['render'] {
	return args => ({
		components: { BaseNotification },
		setup: () => {
			const list = ref<BaseNotificationExpose | null>(null)
			// add() показывает новое уведомление сверху — добавляем с конца, чтобы порядок совпал с массивом
			onMounted(() => [...items].reverse().forEach(item => list.value?.add({ duration: STORY_DURATION, ...item })))
			return { props: useArgsWithoutSlots(args, ['title', 'description', 'type']), list }
		},
		template: '<BaseNotification ref="list" v-bind="props" />',
	})
}

// ─── Default ───────────────────────────────────────────────────────────────────

/**
 * Песочница: уведомление из props. Здесь `duration` — 10 минут, чтобы уведомление не исчезало, и `isContained`,
 * чтобы оно было в потоке страницы. Без play-функции: story открывают e2e-тесты.
 */
export const Default: Story = {}

// ─── Внешний вид ───────────────────────────────────────────────────────────────

/** Четыре типа: цвет иконки и полосы прогресса. Ошибка объявляется скринридером сразу (`alert`), остальные — `status`. */
export const Types: Story = {
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: { source: { code: NOTIFICATION_TYPES.map(type => `notifications.value.add({ type: '${type}', title: '…' })`).join('\n') } },
	},
	render: listRender(TYPE_EXAMPLES),
	play: async ({ canvas }) => {
		await expect(await canvas.findByRole('alert')).toHaveTextContent('Не удалось загрузить видео')
		await expect(canvas.getAllByRole('status')).toHaveLength(3)
	},
}

/**
 * Пять вариантов. `default` — карточка с тенью; `soft` — мягкий фон цвета типа; `outline` — рамка цвета типа без тени;
 * `shadow` — только тень; `ghost` — без фона и рамки. Вариант задаётся пропом или для отдельного уведомления в `add()`.
 */
export const Variants: Story = {
	parameters: {
		controls: { include: ['sizeScale'] },
		docs: {
			source: {
				code: NOTIFICATION_VARIANTS.map(variant => `notifications.value.add({ variant: '${variant}', title: '…' })`).join('\n'),
			},
		},
	},
	render: listRender(
		NOTIFICATION_VARIANTS.map(variant => ({
			type: 'success',
			variant,
			title: `Вариант ${variant}`,
			description: 'Изменения сохранены.',
		})),
	),
}

/**
 * Кастомный цвет через `color`: фон и текст уведомления. Подойдёт любой CSS-цвет; токены `var(--rise-…)` сохраняют
 * контраст в обеих темах. Иконка и полоса прогресса сохраняют цвет типа.
 */
export const CustomColor: Story = {
	args: {
		type: 'info',
		title: 'Новый участник',
		description: 'Мария Кузнецова присоединилась к проекту.',
		color: {
			bg: { base: 'var(--rise-primary-soft)', hover: 'var(--rise-primary-soft-hover)' },
			text: { base: 'var(--rise-primary-text)' },
		},
	},
	parameters: { controls: { include: ['color', 'type', 'sizeScale'] } },
	play: async ({ canvas }) => {
		const item = await canvas.findByRole('status')
		await expect(getComputedStyle(item).backgroundColor).toBe(resolveColor('var(--rise-primary-soft)'))
		await expect(getComputedStyle(within(item).getByText('Новый участник')).color).toBe(resolveColor('var(--rise-primary-text)'))
	},
}

// ─── Содержимое ────────────────────────────────────────────────────────────────

/** Длинный текст переносится по словам: ширина уведомления не больше 360px, кнопка закрытия остаётся справа. */
export const LongContent: Story = {
	args: {
		type: 'warning',
		title: 'Серия отправлена на согласование с замечаниями по синхронизации',
		description:
			'В репликах 12–15 и 40–44 голос опережает видео на 0,3–0,5 секунды. Согласование продолжится, но перед публикацией ' +
			'эти фрагменты нужно перезаписать или сдвинуть в таймлайне.',
	},
	play: async ({ canvas }) => {
		const item = await canvas.findByRole('status')
		await expect(item.getBoundingClientRect().width).toBeLessThanOrEqual(360)
		const close = within(item).getByRole('button', { name: 'Закрыть' })
		await expect(close.getBoundingClientRect().right).toBeLessThanOrEqual(item.getBoundingClientRect().right)
	},
}

// ─── Сценарии ──────────────────────────────────────────────────────────────────

/**
 * Позиция на экране — `position` (без `isContained`): контейнер закреплён в углу или у края экрана с отступом 16px.
 * Меняйте значение в Controls; «Показать ещё» добавляет уведомление в стопку (исчезает через 3 секунды).
 */
export const Positions: Story = {
	args: { isContained: false, position: 'top-right' },
	parameters: {
		controls: { include: ['position', 'variant'] },
		docs: {
			story: { inline: false, height: '240px' },
			source: { code: '<BaseNotification position="top-right" type="success" title="Изменения сохранены" />' },
		},
	},
	render: args => ({
		components: { BaseNotification, BaseButton },
		setup: () => {
			const list = ref<BaseNotificationExpose | null>(null)
			const key = computed(() => `${args.position}-${args.variant}`)
			const showMore = () => list.value?.add({ type: 'info', title: 'Ещё одно уведомление', duration: 3000 })
			return { props: useArgsWithoutSlots(args, []), key, list, showMore }
		},
		template: `
			<BaseButton variant="outline" @click="showMore">Показать ещё</BaseButton>
			<BaseNotification ref="list" :key="key" v-bind="props" />
		`,
	}),
	play: async () => {
		const item = await screen.findByRole('status')
		await waitFor(() => expect(item.getBoundingClientRect().right).toBeCloseTo(document.documentElement.clientWidth - 16, 0))
		await expect(item.getBoundingClientRect().top).toBeCloseTo(16, 0)
	},
}

/**
 * Вызов из кода: `ref.add({ type, title, description, duration })` показывает уведомление, новое — сверху.
 * Уведомления закрываются кнопкой или сами через 3 секунды. Без play-функции: story открывают e2e-тесты.
 */
export const ShowFromCode: Story = {
	parameters: {
		controls: { include: ['variant', 'position', 'isContained'] },
		docs: {
			source: {
				code: [
					"<BaseButton @click=\"notifications.add({ type: 'success', title: 'Сохранено' })\">Показать</BaseButton>",
					'<BaseNotification ref="notifications" />',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseNotification, BaseButton },
		setup: () => {
			const list = ref<BaseNotificationExpose | null>(null)
			const show = (item: BaseNotificationProps) => list.value?.add(item)
			return {
				props: useArgsWithoutSlots(args, ['title', 'description', 'type', 'duration']),
				list,
				show,
				examples: TYPE_EXAMPLES,
				labels: TYPE_LABELS,
			}
		},
		template: `
			<div class="story-stack">
				<div class="story-row">
					<BaseButton v-for="item in examples" :key="item.type" variant="outline" @click="show(item)">
						{{ labels[item.type] }}
					</BaseButton>
				</div>
				<BaseNotification ref="list" v-bind="props" />
			</div>
		`,
	}),
}

/** Автозакрытие: уведомление исчезает через `duration` (здесь 1,5 с), после последнего — событие `close`. */
export const AutoClose: Story = {
	parameters: {
		controls: { include: ['variant'] },
		docs: {
			source: {
				code: [
					"<BaseButton @click=\"notifications.add({ type: 'success', title: 'Ссылка скопирована', duration: 1500 })\">",
					'\tСкопировать ссылку',
					'</BaseButton>',
					'<BaseNotification ref="notifications" @close="onAllClosed" />',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseNotification, BaseButton },
		setup: () => {
			const list = ref<BaseNotificationExpose | null>(null)
			const show = () => list.value?.add({ type: 'success', title: 'Ссылка скопирована', duration: 1500 })
			return { props: useArgsWithoutSlots(args, ['title', 'description', 'type', 'duration']), list, show }
		},
		template: `
			<div class="story-stack">
				<div><BaseButton variant="outline" @click="show">Скопировать ссылку</BaseButton></div>
				<BaseNotification ref="list" v-bind="props" />
			</div>
		`,
	}),
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Скопировать ссылку' }))
		await expect(await canvas.findByRole('status')).toHaveTextContent('Ссылка скопирована')
		await waitFor(() => expect(canvas.queryByRole('status')).not.toBeInTheDocument(), { timeout: 4000 })
		await expect(args.onClose).toHaveBeenCalledOnce()
	},
}

/**
 * Кнопки действий: `actions: [{ label, onClick }]` под текстом. Нажатие выполняет действие и закрывает уведомление
 * (событие `remove`). Подпись называет действие: «Отменить», «Повторить», «Открыть». Сценарий с нажатием —
 * в stories BaseApp (Actions).
 */
export const Actions: Story = {
	args: {
		type: 'info',
		title: 'Файл перемещён в корзину',
		description: '«Интервью, дубль 4.mov» можно восстановить в течение 30 дней.',
		actions: [{ label: 'Отменить', onClick: fn() }, { label: 'Открыть корзину' }],
	},
	parameters: { controls: { include: ['actions', 'variant', 'sizeScale'] } },
	play: async ({ canvas }) => {
		const item = await canvas.findByRole('status')
		const buttons = within(item).getAllByRole('button')
		await expect(buttons.map(button => button.textContent?.trim() || button.getAttribute('aria-label'))).toEqual([
			'Отменить',
			'Открыть корзину',
			'Закрыть',
		])
		const description = within(item).getByText(/можно восстановить/)
		await expect(buttons[0].getBoundingClientRect().top).toBeGreaterThanOrEqual(description.getBoundingClientRect().bottom)
	},
}

/**
 * Без автозакрытия: `isPersistent` — для состояния, которое длится (загрузка, нет сети). Полосы прогресса нет,
 * уведомление закрывает пользователь или код (`remove`, `update` с `isPersistent: false`).
 */
export const Persistent: Story = {
	args: {
		type: 'warning',
		title: 'Нет подключения к интернету',
		description: 'Изменения сохранятся на устройстве и отправятся, когда связь восстановится.',
		isPersistent: true,
	},
	parameters: { controls: { include: ['isPersistent', 'variant', 'sizeScale'] } },
	play: async ({ canvas }) => {
		const item = await canvas.findByRole('status')
		await expect(item.querySelector('.base-notification-item__progress')).toBeNull()
	},
}

/**
 * Пауза: пока указатель над уведомлениями или фокус на их кнопках, автозакрытие стоит и полоса прогресса
 * замирает — есть время дочитать и нажать действие (WCAG 2.2.1). Здесь `duration` — 2 секунды.
 */
export const PauseOnHover: Story = {
	args: { type: 'success', title: 'Ссылка скопирована', description: 'Отправьте её участникам проекта.', duration: 2000 },
	parameters: { controls: { include: ['variant', 'sizeScale'] } },
	play: async ({ canvas, userEvent, args }) => {
		const item = await canvas.findByRole('status')
		await userEvent.hover(item)
		await new Promise(resolve => setTimeout(resolve, 2500))
		await expect(item).toBeInTheDocument()
		await expect(getComputedStyle(item.querySelector('.base-notification-item__progress') as HTMLElement).animationPlayState).toBe(
			'paused',
		)

		await userEvent.unhover(item)
		await waitFor(() => expect(canvas.queryByRole('status')).not.toBeInTheDocument(), { timeout: 4000 })
		await expect(args.onClose).toHaveBeenCalledOnce()
	},
}

// ─── Доступность ───────────────────────────────────────────────────────────────

/** Клавиатура: Tab ставит фокус на кнопку «Закрыть» (видно кольцо фокуса), Enter закрывает уведомление. */
export const Keyboard: Story = {
	tags: ['!autodocs'],
	play: async ({ canvas, userEvent }) => {
		const item = await canvas.findByRole('status')
		const close = within(item).getByRole('button', { name: 'Закрыть' })
		await tabTo(close, userEvent)
		await expect(getComputedStyle(close).outlineStyle).toBe('solid')

		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(canvas.queryByRole('status')).not.toBeInTheDocument())
	},
}
