/**
 * BaseConfirm — stories.
 *
 * Разделы: Default (песочница: окно открывается кнопкой, isOpen синхронизирован с Controls) → открытое окно,
 * необратимое действие и длинный текст → вызов из кода (useConfirm) → клавиатура.
 * Stories с окном, открытым поверх всей страницы, видны только в сайдбаре: в Docs они закрыли бы страницу.
 */

import { defineComponent, ref } from 'vue'
import { expect, fn, screen, waitFor, within } from 'storybook/test'
import { BaseApp } from '@components/BaseApp'
import { BaseText } from '@components/BaseText'
import { BaseButton } from '@components/BaseButton'
import { MODAL_VARIANTS } from '@components/BaseModal/model/BaseModal.types'
import { ARG_GROUP, baseArgTypes, propGroup, tabTo, useArgsWithoutSlots, useModelArg } from '@/stories/helpers'
import { useConfirm } from '../useConfirm'
import BaseConfirm from '../ui/BaseConfirm.vue'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

const meta = {
	title: 'Overlay/BaseConfirm',
	component: BaseConfirm,
	parameters: {
		docs: {
			description: {
				component: [
					'Окно подтверждения: вопрос, последствия и две кнопки. Для действий, которые трудно отменить: удаление,',
					'публикация, выход без сохранения.',
					'',
					'- Из кода — `useConfirm()` внутри `<BaseApp>`: `if (await confirm({ title, description })) …`.',
					'  Промис получает `true` при подтверждении и `false` при отмене, Escape, крестике и клике по подложке.',
					'- В шаблоне — `v-model:is-open`, события `confirm` и `cancel`, `close(result)`.',
					'- `isDanger` — необратимое действие: кнопка подтверждения цвета ошибки, фокус при открытии на «Отмене»,',
					'  чтобы случайный Enter ничего не удалил. Без `isDanger` фокус на кнопке подтверждения.',
					'- Доступность: `role="alertdialog"`, имя — вопрос из `title`, описание — `description`: скринридер',
					'  читает их вместе. Фокус не выходит из окна и после закрытия возвращается на кнопку, которая его открыла.',
					'',
					'Окно с формой или своим содержимым — `BaseModal` (или `useOverlay()` для открытия из кода).',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...baseArgTypes({ variants: MODAL_VARIANTS }),
		title: { control: 'text', table: propGroup(ARG_GROUP.content) },
		description: { control: 'text', table: propGroup(ARG_GROUP.content) },
		confirmLabel: { control: 'text', table: propGroup(ARG_GROUP.content) },
		cancelLabel: { control: 'text', table: propGroup(ARG_GROUP.content) },
		isDanger: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
		isOpen: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	},
	args: {
		isOpen: false,
		title: 'Опубликовать серию?',
		description: 'Серия 3 станет доступна подписчикам сообщества, они получат уведомление.',
		confirmLabel: 'Опубликовать',
		cancelLabel: 'Отмена',
		isDanger: false,
		variant: 'default',
		sizeScale: 100,
		onClose: fn(),
		onConfirm: fn(),
		onCancel: fn(),
		'onUpdate:isOpen': fn(),
	},
	// isOpen хранится в args: кнопка открывает окно, закрытие окна обновляет Controls, а переключатель в Controls — окно.
	render: args => {
		const onUpdate = useModelArg('isOpen')
		return {
			components: { BaseConfirm, BaseButton },
			setup: () => ({ props: useArgsWithoutSlots(args), onUpdate }),
			template: `
				<BaseButton variant="outline" @click="onUpdate(true)">Опубликовать серию</BaseButton>
				<BaseConfirm v-bind="props" @update:is-open="onUpdate" />
			`,
		}
	},
} satisfies Meta<typeof BaseConfirm>

export default meta
type Story = StoryObj<typeof meta>

// ─── Default ───────────────────────────────────────────────────────────────────

/**
 * Песочница: кнопка открывает окно, `isOpen` синхронизирован с Controls. Результат — события `confirm`, `cancel`
 * и `close(result)` в панели Actions.
 */
export const Default: Story = {
	// Шпионы args здесь не проверяются: закрытие обновляет args (isOpen), Storybook перерисовывает story и сбрасывает их
	play: async ({ canvas, userEvent }) => {
		const trigger = canvas.getByRole('button', { name: 'Опубликовать серию' })
		await userEvent.click(trigger)
		const dialog = await screen.findByRole('alertdialog', { name: 'Опубликовать серию?' })
		await userEvent.click(within(dialog).getByRole('button', { name: 'Опубликовать' }))

		await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument())
		await expect(trigger).toHaveFocus()
	},
}

// ─── Состояния ─────────────────────────────────────────────────────────────────

/** Открытое окно: вопрос в заголовке, последствия под ним, фокус на кнопке подтверждения. */
export const Opened: Story = {
	tags: ['!autodocs'],
	args: { isOpen: true },
	play: async () => {
		const dialog = await screen.findByRole('alertdialog', { name: 'Опубликовать серию?' })
		await expect(dialog).toHaveAccessibleDescription('Серия 3 станет доступна подписчикам сообщества, они получат уведомление.')
		await waitFor(() => expect(within(dialog).getByRole('button', { name: 'Опубликовать' })).toHaveFocus())
	},
}

/**
 * Необратимое действие (`isDanger`): кнопка подтверждения цвета ошибки, фокус при открытии на «Отмене».
 * Подпись кнопки называет действие («Удалить»), а не «ОК».
 */
export const Danger: Story = {
	tags: ['!autodocs'],
	args: {
		isOpen: true,
		isDanger: true,
		title: 'Удалить проект «Сайт студии»?',
		description: 'Проект, 48 файлов и история правок удалятся без возможности восстановления.',
		confirmLabel: 'Удалить',
	},
	play: async () => {
		const dialog = await screen.findByRole('alertdialog', { name: 'Удалить проект «Сайт студии»?' })
		await waitFor(() => expect(within(dialog).getByRole('button', { name: 'Отмена' })).toHaveFocus())
		const remove = within(dialog).getByRole('button', { name: 'Удалить' })
		const probe = document.createElement('span')
		probe.style.color = 'var(--rise-error)'
		dialog.append(probe)
		await expect(getComputedStyle(remove).backgroundColor).toBe(getComputedStyle(probe).color)
		probe.remove()
	},
}

/** Длинный вопрос и пояснение переносятся по словам: окно не шире 400px, кнопки остаются в подвале. */
export const LongContent: Story = {
	tags: ['!autodocs'],
	args: {
		isOpen: true,
		isDanger: true,
		title: 'Отозвать доступ у всех участников проекта «Документальный сериал о реставрации усадьбы»?',
		description:
			'Двенадцать участников потеряют доступ к таймлайну, субтитрам и комментариям. Незавершённые правки в их черновиках ' +
			'не сохранятся, а ссылки-приглашения перестанут работать. Вернуть доступ можно будет только новыми приглашениями.',
		confirmLabel: 'Отозвать доступ',
		cancelLabel: 'Оставить как есть',
	},
	play: async () => {
		const dialog = await screen.findByRole('alertdialog')
		await expect(dialog.getBoundingClientRect().width).toBeLessThanOrEqual(400)
		const confirm = within(dialog).getByRole('button', { name: 'Отозвать доступ' })
		await expect(confirm.getBoundingClientRect().right).toBeLessThanOrEqual(dialog.getBoundingClientRect().right)
		await expect(confirm.getBoundingClientRect().bottom).toBeLessThanOrEqual(window.innerHeight)
	},
}

// ─── Сценарии ──────────────────────────────────────────────────────────────────

/** Кнопка удаления со своим подтверждением: так выглядит вызов `useConfirm()` в компоненте приложения. */
const DeleteProjectButton = defineComponent({
	components: { BaseButton, BaseText },
	setup() {
		const confirm = useConfirm()
		const status = ref('Проект на месте')
		async function remove() {
			const isConfirmed = await confirm({
				title: 'Удалить проект «Сайт студии»?',
				description: 'Проект, 48 файлов и история правок удалятся без возможности восстановления.',
				confirmLabel: 'Удалить',
				isDanger: true,
			})
			status.value = isConfirmed ? 'Проект удалён' : 'Удаление отменено'
		}
		return { remove, status }
	},
	template: `
		<div class="story-row">
			<BaseButton variant="outline" @click="remove">Удалить проект</BaseButton>
			<BaseText tag="span" role="status">{{ status }}</BaseText>
		</div>
	`,
})

/**
 * Вызов из кода: `useConfirm()` открывает окно через ближайший `<BaseApp>` и возвращает промис с ответом.
 * Шаблон окна в компоненте не нужен.
 */
export const FromCode: Story = {
	parameters: {
		controls: { disable: true },
		docs: {
			source: {
				code: [
					'const confirm = useConfirm()',
					'',
					'async function remove() {',
					'\tconst isConfirmed = await confirm({',
					"\t\ttitle: 'Удалить проект «Сайт студии»?',",
					"\t\tdescription: 'Проект, 48 файлов и история правок удалятся без возможности восстановления.',",
					"\t\tconfirmLabel: 'Удалить',",
					'\t\tisDanger: true,',
					'\t})',
					'\tif (isConfirmed) await api.deleteProject(id)',
					'}',
				].join('\n'),
			},
		},
	},
	render: () => ({
		components: { BaseApp, DeleteProjectButton },
		template: '<BaseApp><DeleteProjectButton /></BaseApp>',
	}),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Удалить проект' }))
		const dialog = await screen.findByRole('alertdialog', { name: 'Удалить проект «Сайт студии»?' })
		await userEvent.click(within(dialog).getByRole('button', { name: 'Отмена' }))
		await expect(await canvas.findByText('Удаление отменено')).toBeInTheDocument()

		await userEvent.click(canvas.getByRole('button', { name: 'Удалить проект' }))
		await userEvent.click(within(await screen.findByRole('alertdialog')).getByRole('button', { name: 'Удалить' }))
		await expect(await canvas.findByText('Проект удалён')).toBeInTheDocument()
	},
}

// ─── Доступность ───────────────────────────────────────────────────────────────

/**
 * Клавиатура: Enter на кнопке открывает окно с фокусом на «Отмене» (`isDanger`), Tab переходит к «Удалить»
 * и не уходит из окна, Escape отменяет и возвращает фокус на кнопку.
 */
export const Keyboard: Story = {
	tags: ['!autodocs'],
	args: {
		isDanger: true,
		title: 'Удалить проект «Сайт студии»?',
		description: 'Проект, 48 файлов и история правок удалятся без возможности восстановления.',
		confirmLabel: 'Удалить',
	},
	render: args => ({
		components: { BaseConfirm, BaseButton },
		setup: () => ({ props: useArgsWithoutSlots(args, ['isOpen', 'onUpdate:isOpen']), isOpen: ref(false) }),
		template: `
			<BaseButton variant="outline" @click="isOpen = true">Удалить проект</BaseButton>
			<BaseConfirm v-bind="props" v-model:is-open="isOpen" />
		`,
	}),
	play: async ({ canvas, userEvent, args }) => {
		const trigger = canvas.getByRole('button', { name: 'Удалить проект' })
		await tabTo(trigger, userEvent)
		await userEvent.keyboard('{Enter}')

		const dialog = await screen.findByRole('alertdialog', { name: 'Удалить проект «Сайт студии»?' })
		const cancel = within(dialog).getByRole('button', { name: 'Отмена' })
		await waitFor(() => expect(cancel).toHaveFocus())
		await expect(getComputedStyle(cancel).outlineStyle).toBe('solid')

		await userEvent.tab()
		await expect(within(dialog).getByRole('button', { name: 'Удалить' })).toHaveFocus()
		// С последней кнопки Tab возвращается на первую («Закрыть» в шапке), а не на страницу под подложкой
		await userEvent.tab()
		await expect(within(dialog).getByRole('button', { name: 'Закрыть' })).toHaveFocus()

		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument())
		await expect(trigger).toHaveFocus()
		await expect(args.onClose).toHaveBeenCalledWith(false)
		await expect(args.onCancel).toHaveBeenCalledOnce()
	},
}
