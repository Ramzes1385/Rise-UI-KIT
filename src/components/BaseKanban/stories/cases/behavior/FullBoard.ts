import { computed, ref } from 'vue'
import { CARDS, COLUMNS } from '../../shared'
import type meta from '../../BaseKanban.stories'
import { BaseInput } from '@components/BaseInput'
import BaseKanban from '../../../ui/BaseKanban.vue'
import { BaseSelect } from '@components/BaseSelect'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { BaseTextarea } from '@components/BaseTextarea'
import { BaseSlideover } from '@components/BaseSlideover'
import { BaseDatePicker } from '@components/BaseDatePicker'
import { expect, screen, waitFor, within } from 'storybook/test'
import type { KanbanCard, KanbanPriority } from '../../../types/BaseKanban.types'

const COLORS = ['var(--rise-info)', 'var(--rise-warning)', 'var(--rise-primary)', 'var(--rise-success)']

const PRIORITIES: { value: KanbanPriority; label: string }[] = [
	{ value: 'highest', label: 'Самый высокий' },
	{ value: 'high', label: 'Высокий' },
	{ value: 'medium', label: 'Средний' },
	{ value: 'low', label: 'Низкий' },
	{ value: 'lowest', label: 'Самый низкий' },
]

const DONE: KanbanCard[] = [
	{ id: 'c8', columnId: 'done', key: 'RISE-080', title: 'Токены отступов', labels: [{ text: 'дизайн', color: 'info' }], estimate: 2 },
	{ id: 'c9', columnId: 'done', key: 'RISE-084', title: 'Фокус-ловушка в BaseSlideover', priority: 'high', comments: 3 },
]

const toDate = (value: KanbanCard['dueDate']): Date | null => {
	if (!value) return null
	return value instanceof Date ? value : new Date(`${value}T00:00:00`)
}

export const FullBoard: StoryObj<typeof meta> = {
	args: {
		columns: COLUMNS.map((column, index) => ({ ...column, color: COLORS[index] })),
		isEditable: true,
		isCollapsible: true,
	},
	parameters: {
		docs: {
			description: {
				story: 'Рабочая доска: поиск через `filter`, «Добавить карточку», F2 и меню для переименования и удаления, свёртывание колонок и панель деталей по клику на карточку.',
			},
		},
	},
	render: args => ({
		components: { BaseKanban, BaseInput, BaseSelect, BaseTextarea, BaseSlideover, BaseDatePicker },
		setup() {
			const cards = ref<KanbanCard[]>([...CARDS, ...DONE])
			const collapsed = ref<string[]>([])
			const query = ref('')
			const openId = ref<string | null>(null)
			const current = computed(() => cards.value.find(card => card.id === openId.value))
			const filter = computed(() => {
				const text = query.value.trim().toLowerCase()
				return text ? (card: KanbanCard) => `${card.key ?? ''} ${card.title}`.toLowerCase().includes(text) : undefined
			})
			const update = (patch: Partial<KanbanCard>) => {
				cards.value = cards.value.map(card => (card.id === openId.value ? { ...card, ...patch } : card))
			}
			return {
				props: useArgsWithoutSlots(args),
				cards,
				collapsed,
				query,
				filter,
				current,
				update,
				dueDate: computed(() => toDate(current.value?.dueDate)),
				isOpen: computed({ get: () => Boolean(current.value), set: value => !value && (openId.value = null) }),
				open: (card: KanbanCard) => (openId.value = card.id),
				priorities: PRIORITIES,
			}
		},
		template: `
			<div style="display: flex; flex-direction: column; gap: 16px">
				<div style="max-width: 320px">
					<BaseInput v-model="query" label="Поиск по карточкам" placeholder="Название или номер задачи" />
				</div>
				<BaseKanban v-bind="props" v-model:cards="cards" v-model:collapsed-columns="collapsed" :filter="filter" @open="open" />
				<BaseSlideover v-model:is-open="isOpen" :title="current ? current.key ?? 'Карточка' : ''">
					<div v-if="current" style="display: flex; flex-direction: column; gap: 16px">
						<BaseInput :model-value="current.title" label="Название" @update:model-value="update({ title: String($event ?? '') })" />
						<BaseTextarea
							:model-value="current.description ?? ''"
							label="Описание"
							is-autosize
							@update:model-value="update({ description: $event })" />
						<BaseSelect :model-value="current.priority" label="Приоритет" :options="priorities" @update:model-value="update({ priority: $event })" />
						<BaseDatePicker :model-value="dueDate" label="Срок" @update:model-value="update({ dueDate: $event ?? undefined })" />
					</div>
				</BaseSlideover>
			</div>`,
	}),
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.click(canvas.getAllByRole('button', { name: 'Добавить карточку' })[0])
		await userEvent.keyboard('Макет доски{Enter}')
		await expect(args.onCreate).toHaveBeenCalledWith(expect.objectContaining({ columnId: 'todo', title: 'Макет доски' }))
		await expect(canvas.getByRole('textbox', { name: 'Название новой карточки в «К выполнению»' })).toHaveFocus()
		await userEvent.keyboard('{Escape}')
		await expect(canvas.getAllByRole('button', { name: 'Добавить карточку' })[0]).toHaveFocus()
		canvas.getByRole('button', { name: 'Макет доски' }).focus()
		await userEvent.keyboard('{F2}')
		await userEvent.keyboard('Макет канбан-доски{Enter}')
		await expect(canvas.getByRole('button', { name: 'Макет канбан-доски' })).toHaveFocus()
		await userEvent.type(canvas.getByRole('textbox', { name: 'Поиск по карточкам' }), 'эмодзи')
		await waitFor(() => expect(canvas.getAllByRole('button', { name: /эмодзи/ })).toHaveLength(1))
		await expect(canvas.getByRole('list', { name: /^К выполнению, 1 карточка/ })).toBeInTheDocument()
		await userEvent.clear(canvas.getByRole('textbox', { name: 'Поиск по карточкам' }))
		await userEvent.click(canvas.getByRole('button', { name: 'Свернуть колонку «Готово»' }))
		await expect(canvas.getByRole('button', { name: 'Развернуть колонку «Готово»' })).toHaveAttribute('aria-expanded', 'false')
		await expect(canvas.queryByRole('list', { name: /^Готово/ })).toBeNull()
		await userEvent.click(canvas.getByRole('button', { name: 'Макет канбан-доски' }))
		const panel = await screen.findByRole('dialog')
		await expect(within(panel).getByRole('textbox', { name: 'Название' })).toHaveValue('Макет канбан-доски')
	},
}
