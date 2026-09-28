/** Подтверждение — в stories BaseConfirm; уведомления и окна телепортируются в body, play-функции ищут их через screen. */

import BaseApp from '../ui/BaseApp.vue'
import { defineComponent, ref } from 'vue'
import { BaseMenu } from '@components/BaseMenu'
import { BaseText } from '@components/BaseText'
import { useToast } from '@composables/useToast'
import { BaseInput } from '@components/BaseInput'
import { BaseModal } from '@components/BaseModal'
import { BaseButton } from '@components/BaseButton'
import { useOverlay } from '@composables/useOverlay'
import { BaseDropdown } from '@components/BaseDropdown'
import { ARG_GROUP, propGroup } from '@/stories/helpers'
import type { ToastOptions } from '@composables/useToast'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, screen, waitFor, within } from 'storybook/test'

const TOAST_EXAMPLES: { label: string; toast: ToastOptions }[] = [
	{ label: 'Успех', toast: { type: 'success', title: 'Серия опубликована', description: 'Серия 3 доступна подписчикам сообщества.' } },
	{ label: 'Ошибка', toast: { type: 'error', title: 'Не удалось загрузить видео', description: 'Файл больше 4 ГБ.' } },
	{ label: 'Предупреждение', toast: { type: 'warning', title: 'Заканчивается место', description: 'Занято 4,6 из 5 ГБ.' } },
	{ label: 'Информация', toast: { type: 'info', title: 'Доступно обновление', description: 'Новая версия редактора субтитров.' } },
]

const ToastButtons = defineComponent({
	components: { BaseButton },
	setup() {
		const toast = useToast()
		return { examples: TOAST_EXAMPLES, show: (options: ToastOptions) => toast.add(options), clear: () => toast.clear() }
	},
	template: `
		<div class="story-row">
			<BaseButton v-for="example in examples" :key="example.label" variant="outline" @click="show(example.toast)">
				{{ example.label }}
			</BaseButton>
			<BaseButton variant="ghost" @click="clear">Закрыть все</BaseButton>
		</div>
	`,
})

const meta = {
	title: 'Overlay/BaseApp',
	component: BaseApp,
	parameters: {
		docs: {
			description: {
				component: [
					'Корень приложения: показывает уведомления и окна, которые вызывают из кода. Оборачивает приложение один раз',
					'и не добавляет разметки — только слот и слои поверх страницы.',
					'',
					'- `useToast()` — уведомления: `add`, `update`, `remove`, `clear`. Уведомление с тем же `id` заменяет',
					'  показанное, `isPersistent` не закрывается само, `actions` — кнопки вроде «Отменить».',
					'- `useOverlay()` — окна и панели из кода: `create(Component).open(props)` возвращает промис с результатом',
					"  из `emit('close', value)`. Закрытое окно удаляется после анимации.",
					'- `useConfirm()` — окно подтверждения, промис с `true` или `false` (см. BaseConfirm).',
					'- `toaster` — угол экрана, время показа, лимит, оформление и масштаб уведомлений.',
					'',
					'Вызовы вне дерева BaseApp (в сторе, роутере) идут в последний смонтированный BaseApp.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		toaster: { control: 'object', table: propGroup(ARG_GROUP.behavior) },
	},
	args: {
		toaster: { position: 'top-right', duration: 3000, max: 5, variant: 'default', sizeScale: 100 },
	},
	render: args => ({
		components: { BaseApp, ToastButtons },
		setup: () => ({ args }),
		template: '<BaseApp v-bind="args"><ToastButtons /></BaseApp>',
	}),
} satisfies Meta<typeof BaseApp>

export default meta
type Story = StoryObj<typeof meta>

// ─── Default ───────────────────────────────────────────────────────────────────

/**
 * Песочница: кнопки показывают уведомления через `useToast()`. В Controls — настройки `toaster`:
 * угол экрана, время показа, сколько уведомлений видно одновременно, оформление и масштаб.
 */
export const Default: Story = {
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Успех' }))
		await expect(await screen.findByRole('status')).toHaveTextContent('Серия опубликована')

		await userEvent.click(canvas.getByRole('button', { name: 'Закрыть все' }))
		await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument())
	},
}

/** Выгрузка отчёта: одно уведомление меняется на месте — «Готовим отчёт…» без автозакрытия, затем «Отчёт готов» */
const ReportExport = defineComponent({
	components: { BaseButton },
	setup() {
		const toast = useToast()
		function exportReport() {
			const id = toast.add({ title: 'Готовим отчёт…', description: 'Собираем просмотры за сентябрь.', isPersistent: true })
			setTimeout(() => {
				toast.update(id, {
					type: 'success',
					title: 'Отчёт готов',
					description: 'Файл «Просмотры, сентябрь.xlsx» в загрузках.',
					isPersistent: false,
				})
			}, 1200)
		}
		return { exportReport }
	},
	template: '<BaseButton variant="outline" @click="exportReport">Выгрузить отчёт</BaseButton>',
})

/**
 * Обновление на месте: `add({ isPersistent: true })` показывает уведомление без автозакрытия, `update(id, …)`
 * меняет его текст и тип. Автозакрытие начинается, когда `isPersistent` снят.
 */
export const UpdateInPlace: Story = {
	parameters: {
		controls: { include: ['toaster'] },
		docs: {
			source: {
				code: [
					'const toast = useToast()',
					"const id = toast.add({ title: 'Готовим отчёт…', isPersistent: true })",
					'await api.exportReport()',
					"toast.update(id, { type: 'success', title: 'Отчёт готов', isPersistent: false })",
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseApp, ReportExport },
		setup: () => ({ args }),
		template: '<BaseApp v-bind="args"><ReportExport /></BaseApp>',
	}),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Выгрузить отчёт' }))
		const item = await screen.findByRole('status')
		await expect(item).toHaveTextContent('Готовим отчёт…')
		await expect(item.querySelector('.base-notification-item__progress')).toBeNull()

		await waitFor(() => expect(item).toHaveTextContent('Отчёт готов'))
		await expect(screen.getAllByRole('status')).toHaveLength(1)
		await expect(item.querySelector('.base-notification-item__progress')).not.toBeNull()
	},
}

/** Комментарии с удалением и возвратом из уведомления */
const CommentList = defineComponent({
	components: { BaseButton, BaseText },
	setup() {
		const toast = useToast()
		const comments = ref(['Отличный кадр на 00:42', 'Звук в конце громче, чем в начале', 'Субтитры съезжают на 01:15'])
		function remove(comment: string) {
			const index = comments.value.indexOf(comment)
			comments.value.splice(index, 1)
			toast.add({
				title: 'Комментарий удалён',
				description: comment,
				duration: 6000,
				actions: [{ label: 'Вернуть', onClick: () => comments.value.splice(index, 0, comment) }],
			})
		}
		return { comments, remove }
	},
	template: `
		<ul class="story-stack" style="list-style: none; margin: 0; padding: 0;">
			<li v-for="comment in comments" :key="comment" class="story-row">
				<BaseText tag="span">{{ comment }}</BaseText>
				<BaseButton variant="ghost" :aria-label="'Удалить комментарий: ' + comment" @click="remove(comment)">Удалить</BaseButton>
			</li>
		</ul>
	`,
})

/**
 * Кнопки действий: `actions: [{ label, onClick }]`. Нажатие выполняет действие и закрывает уведомление.
 * Пока указатель над уведомлением или фокус на его кнопках, оно не закрывается.
 */
export const Actions: Story = {
	parameters: {
		controls: { include: ['toaster'] },
		docs: {
			source: {
				code: "toast.add({ title: 'Комментарий удалён', actions: [{ label: 'Вернуть', onClick: () => restore(comment) }] })",
			},
		},
	},
	render: args => ({
		components: { BaseApp, CommentList },
		setup: () => ({ args }),
		template: '<BaseApp v-bind="args"><CommentList /></BaseApp>',
	}),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Удалить комментарий: Звук в конце громче, чем в начале' }))
		await expect(canvas.queryByText('Звук в конце громче, чем в начале')).not.toBeInTheDocument()

		const item = await screen.findByRole('status')
		await userEvent.click(within(item).getByRole('button', { name: 'Вернуть' }))
		await expect(await canvas.findByText('Звук в конце громче, чем в начале')).toBeInTheDocument()
		await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument())
	},
}

/** Окно переименования: результат — новое название в `emit('close', name)`, отмена — `emit('close')` */
const RenameProjectModal = defineComponent({
	components: { BaseModal, BaseInput, BaseButton },
	props: { isOpen: { type: Boolean, default: false }, name: { type: String, required: true } },
	emits: ['close', 'after-leave'],
	setup(props, { emit }) {
		const value = ref(props.name)
		return { value, save: () => emit('close', value.value.trim()), cancel: () => emit('close') }
	},
	template: `
		<BaseModal :is-open="isOpen" title="Переименовать проект" @close="cancel" @after-leave="$emit('after-leave')">
			<BaseInput v-model="value" label="Название" />
			<template #footer>
				<BaseButton variant="outline" @click="cancel">Отмена</BaseButton>
				<BaseButton :disabled="!value.trim()" @click="save">Сохранить</BaseButton>
			</template>
		</BaseModal>
	`,
})

/** Шапка проекта: открывает окно переименования через useOverlay() и ждёт результат */
const ProjectHeader = defineComponent({
	components: { BaseButton, BaseText },
	setup() {
		const overlay = useOverlay()
		const rename = overlay.create<string>(RenameProjectModal)
		const name = ref('Сайт студии')
		async function open() {
			const result = await rename.open({ name: name.value })
			if (result) name.value = result
		}
		return { name, open }
	},
	template: `
		<div class="story-row">
			<BaseText tag="h3">{{ name }}</BaseText>
			<BaseButton variant="outline" @click="open">Переименовать</BaseButton>
		</div>
	`,
})

/**
 * Окно из кода: `useOverlay().create(Component)` и `await open(props)`. Компонент получает props и `isOpen`,
 * результат передаёт в `emit('close', value)`. Шаблон окна и флаг открытия в родителе не нужны.
 */
export const OverlayFromCode: Story = {
	parameters: {
		controls: { disable: true },
		docs: {
			source: {
				code: [
					'const overlay = useOverlay()',
					'const rename = overlay.create(RenameProjectModal)',
					'',
					'async function open() {',
					'\tconst result = await rename.open({ name: project.name })',
					'\tif (result) project.name = result',
					'}',
				].join('\n'),
			},
		},
	},
	render: () => ({
		components: { BaseApp, ProjectHeader },
		template: '<BaseApp><ProjectHeader /></BaseApp>',
	}),
	play: async ({ canvas, userEvent }) => {
		const trigger = canvas.getByRole('button', { name: 'Переименовать' })
		await userEvent.click(trigger)
		const dialog = await screen.findByRole('dialog', { name: 'Переименовать проект' })
		const input = within(dialog).getByLabelText('Название')
		await expect(input).toHaveValue('Сайт студии')

		await userEvent.clear(input)
		await userEvent.type(input, 'Сайт студии 2.0')
		await userEvent.click(within(dialog).getByRole('button', { name: 'Сохранить' }))

		await expect(await canvas.findByRole('heading', { name: 'Сайт студии 2.0' })).toBeInTheDocument()
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
		await expect(trigger).toHaveFocus()
	},
}

/** Плеер: меню качества открывается в контейнере слоёв внутри плеера */
const PlayerDemo = defineComponent({
	components: { BaseButton, BaseDropdown, BaseMenu, BaseText },
	setup() {
		const playerRef = ref<HTMLElement | null>(null)
		const isQualityOpen = ref(false)
		const quality = ref('720p')
		const qualities = [['1080p', '720p', '480p'].map(label => ({ label }))]
		function selectQuality(item: { label: string }): void {
			quality.value = item.label
			isQualityOpen.value = false
		}
		/** Полноэкранный режим — Fullscreen API; в среде без него (фрейм без allowfullscreen) кнопка ничего не делает */
		function toggleFullscreen(): void {
			if (document.fullscreenElement) void document.exitFullscreen()
			else void playerRef.value?.requestFullscreen?.().catch(() => undefined)
		}
		return { playerRef, isQualityOpen, quality, qualities, selectQuality, toggleFullscreen }
	},
	template: `
		<div
			ref="playerRef"
			data-theme="dark"
			class="story-stack"
			style="justify-content: flex-end; min-height: 240px; padding: 16px; border-radius: var(--rise-radius-lg); background: var(--rise-bg); color: var(--rise-text);">
			<BaseText>Серия 3 · 24:10</BaseText>
			<div class="story-row">
				<BaseDropdown v-model:is-open="isQualityOpen" position="top-start">
					<BaseButton variant="soft" @click="isQualityOpen = !isQualityOpen">Качество: {{ quality }}</BaseButton>
					<template #dropdown>
						<BaseMenu variant="ghost" :items="qualities" @select="selectQuality" />
					</template>
				</BaseDropdown>
				<BaseButton variant="soft" @click="toggleFullscreen">На весь экран</BaseButton>
			</div>
			<div id="player-layers" />
		</div>
	`,
})

/**
 * Контейнер слоёв (`teleport-to`): окна, панели и подсказки внутри BaseApp телепортируются не в body,
 * а в заданный элемент. Нужен в полноэкранном режиме — элемент, развёрнутый через Fullscreen API, показывает
 * только своё содержимое, и панель в body была бы не видна. Здесь меню качества открывается внутри плеера;
 * «На весь экран» разворачивает плеер, меню остаётся видимым. Контейнер может стоять в том же шаблоне, что и меню.
 */
export const LayerContainer: Story = {
	parameters: {
		controls: { disable: true },
		docs: {
			source: {
				code: '<BaseApp teleport-to="#player-layers">\n\t<Player /> <!-- внутри: <div id="player-layers" /> -->\n</BaseApp>',
			},
		},
	},
	render: () => ({
		components: { BaseApp, PlayerDemo },
		template: '<BaseApp teleport-to="#player-layers"><PlayerDemo /></BaseApp>',
	}),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: /Качество/ }))
		const option = await screen.findByRole('button', { name: '1080p' })
		await expect(option.closest('#player-layers')).not.toBeNull()
		await expect(option.closest('.base-dropdown__panel')).toHaveAttribute('data-theme', 'dark')

		await userEvent.click(option)
		await expect(canvas.getByRole('button', { name: 'Качество: 1080p' })).toBeInTheDocument()
	},
}
