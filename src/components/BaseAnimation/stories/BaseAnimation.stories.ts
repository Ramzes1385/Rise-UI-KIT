/**
 * BaseAnimation — stories.
 *
 * Разделы: Default (песочница с кнопкой «Скрыть/Показать») → все анимации (одна кнопка на все примеры) →
 * сценарии (список с добавлением и удалением, раскрывающийся блок).
 */

import { ref } from 'vue'
import { expect, fn, waitFor, within } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import { ARG_GROUP, hiddenArgTypes, propGroup, useArgsWithoutSlots, useModelArg } from '@/stories/helpers'
import BaseAnimation from '../ui/BaseAnimation.vue'
import { ANIMATION_MODES, ANIMATION_NAMES } from '../model/BaseAnimation.types'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

/** Анимации одиночного элемента; `list` — для списков (story List). */
const SINGLE_NAMES = ANIMATION_NAMES.filter(name => name !== 'list')

const meta = {
	title: 'Element/BaseAnimation',
	component: BaseAnimation,
	parameters: {
		docs: {
			description: {
				component: [
					'Обёртка над `<Transition>` с готовыми анимациями появления и исчезновения: сообщения об ошибке, подсказки,',
					'раскрывающиеся блоки, элементы списков.',
					'',
					'- `show` показывает и скрывает содержимое; `name` выбирает анимацию (`fade` по умолчанию).',
					'- `isGroup` — список (`<TransitionGroup>`): каждый дочерний элемент с `key` анимируется отдельно, соседи плавно сдвигаются.',
					'- Длительности и кривые — токены `--rise-duration*`/`--rise-ease*`; при системной настройке «уменьшить движение»',
					'  переходы мгновенные, а события `after-enter`/`after-leave` приходят как обычно.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...hiddenArgTypes('variant', 'sizeScale', 'color'),
		show: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
		name: { control: 'select', options: ANIMATION_NAMES, table: propGroup(ARG_GROUP.appearance) },
		mode: { control: 'inline-radio', options: ANIMATION_MODES, table: propGroup(ARG_GROUP.behavior) },
		isGroup: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
		tag: { control: 'text', table: propGroup(ARG_GROUP.behavior) },
		customClass: { control: 'object', table: propGroup(ARG_GROUP.appearance) },
		default: { control: false },
	},
	args: {
		show: true,
		name: 'fade',
		mode: 'out-in',
		isGroup: false,
		tag: 'div',
		'onAfter-enter': fn(),
		'onAfter-leave': fn(),
	},
} satisfies Meta<typeof BaseAnimation>

export default meta
type Story = StoryObj<typeof meta>

// ─── Default ───────────────────────────────────────────────────────────────────

/**
 * Песочница: кнопка переключает `show` (значение синхронизировано с Controls), в Controls выбирается анимация.
 * После завершения анимации приходят события `after-leave` и `after-enter`.
 */
export const Default: Story = {
	parameters: {
		controls: { exclude: ['isGroup', 'tag'] },
		docs: {
			source: {
				code: [
					'<BaseButton variant="outline" @click="isVisible = !isVisible">{{ isVisible ? \'Скрыть\' : \'Показать\' }}</BaseButton>',
					'<BaseAnimation :show="isVisible" name="slide-down">',
					'  <div class="banner">Отчёт за май готов</div>',
					'</BaseAnimation>',
				].join('\n'),
			},
		},
	},
	render: args => {
		const setShow = useModelArg('show')
		return {
			components: { BaseAnimation, BaseButton },
			setup: () => ({ props: useArgsWithoutSlots(args), args, toggle: () => setShow(!args.show) }),
			template: `
				<div class="story-col" style="min-height: 120px;">
					<BaseButton variant="outline" @click="toggle">{{ args.show ? 'Скрыть' : 'Показать' }}</BaseButton>
					<BaseAnimation v-bind="props">
						<div class="story-frame">Отчёт за май готов</div>
					</BaseAnimation>
				</div>
			`,
		}
	},
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Скрыть' }))
		await waitFor(() => expect(canvas.queryByText('Отчёт за май готов')).not.toBeInTheDocument())
		await waitFor(() => expect(args['onAfter-leave']).toHaveBeenCalled())
		await userEvent.click(canvas.getByRole('button', { name: 'Показать' }))
		// Во время анимации появления элемент прозрачен — ждём конца перехода
		await waitFor(() => expect(canvas.getByText('Отчёт за май готов')).toBeVisible())
		await waitFor(() => expect(args['onAfter-enter']).toHaveBeenCalled())
	},
}

// ─── Внешний вид ───────────────────────────────────────────────────────────────

/** Все анимации одиночного элемента: кнопка скрывает и показывает все примеры сразу. `list` — в story List. */
export const Names: Story = {
	parameters: {
		controls: { include: ['mode'] },
		docs: {
			source: { code: SINGLE_NAMES.map(name => `<BaseAnimation :show="isVisible" name="${name}">…</BaseAnimation>`).join('\n') },
		},
	},
	render: args => ({
		components: { BaseAnimation, BaseButton },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['default', 'show', 'name', 'isGroup', 'tag', 'onAfter-enter', 'onAfter-leave']),
			names: SINGLE_NAMES,
			isVisible: ref(true),
		}),
		template: `
			<div class="story-stack">
				<div>
					<BaseButton variant="outline" @click="isVisible = !isVisible">{{ isVisible ? 'Скрыть все' : 'Показать все' }}</BaseButton>
				</div>
				<div class="story-grid" style="--story-grid-min: 140px;">
					<div v-for="name in names" :key="name" style="min-height: 56px;">
						<BaseAnimation v-bind="props" :name="name" :show="isVisible">
							<div class="story-frame">{{ name }}</div>
						</BaseAnimation>
					</div>
				</div>
			</div>
		`,
	}),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Скрыть все' }))
		await waitFor(() => expect(canvas.queryByText('fade')).not.toBeInTheDocument())
		await waitFor(() => expect(canvas.queryByText('collapse')).not.toBeInTheDocument())
		await userEvent.click(canvas.getByRole('button', { name: 'Показать все' }))
		for (const name of SINGLE_NAMES) {
			await waitFor(() => expect(canvas.getByText(name)).toBeVisible())
		}
	},
}

// ─── Сценарии ──────────────────────────────────────────────────────────────────

const TASKS = ['Подготовить отчёт за май', 'Созвониться с командой', 'Проверить макеты', 'Обновить документацию', 'Отправить счёт клиенту']

/**
 * Список (`isGroup`, `name="list"`): новые элементы въезжают справа, удалённые уходят вправо, остальные плавно
 * сдвигаются. У каждого элемента — `key`; элементы — прямые потомки тега `tag`.
 */
export const List: Story = {
	args: { isGroup: true, name: 'list', tag: 'ul' },
	parameters: {
		controls: { include: ['show'] },
		docs: {
			source: {
				code: [
					'<BaseAnimation is-group name="list" tag="ul">',
					'  <li v-for="task in tasks" :key="task">{{ task }}</li>',
					'</BaseAnimation>',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseAnimation, BaseButton },
		setup: () => {
			const tasks = ref(TASKS.slice(0, 3))
			const add = (): void => {
				const next = TASKS.find(task => !tasks.value.includes(task))
				if (next) tasks.value = [...tasks.value, next]
			}
			const removeFirst = (): void => {
				tasks.value = tasks.value.slice(1)
			}
			return { props: useArgsWithoutSlots(args), tasks, add, removeFirst }
		},
		template: `
			<div class="story-stack story-narrow">
				<div class="story-row">
					<BaseButton variant="outline" @click="add">Добавить задачу</BaseButton>
					<BaseButton variant="ghost" @click="removeFirst">Удалить первую</BaseButton>
				</div>
				<BaseAnimation v-bind="props" aria-label="Задачи" style="margin: 0; padding: 0; list-style: none;">
					<li v-for="task in tasks" :key="task" class="story-frame" style="margin-bottom: 8px;">{{ task }}</li>
				</BaseAnimation>
			</div>
		`,
	}),
	play: async ({ canvas, userEvent }) => {
		const list = canvas.getByRole('list', { name: 'Задачи' })
		await expect(within(list).getAllByRole('listitem')).toHaveLength(3)
		await userEvent.click(canvas.getByRole('button', { name: 'Добавить задачу' }))
		await waitFor(() => expect(canvas.getByText('Обновить документацию')).toBeVisible())
		await userEvent.click(canvas.getByRole('button', { name: 'Удалить первую' }))
		await waitFor(() => expect(canvas.queryByText('Подготовить отчёт за май')).not.toBeInTheDocument())
		await expect(within(list).getAllByRole('listitem')).toHaveLength(3)
	},
}

/**
 * Раскрывающийся блок (`name="collapse"`): высота плавно меняется от нуля до содержимого. Кнопка сообщает
 * состояние через `aria-expanded` и связана с блоком через `aria-controls`.
 */
export const Collapse: Story = {
	args: { name: 'collapse' },
	parameters: {
		controls: { include: ['mode'] },
		docs: {
			source: {
				code: [
					'<BaseButton variant="ghost" :aria-expanded="isOpen" aria-controls="delivery" @click="isOpen = !isOpen">Условия доставки</BaseButton>',
					'<BaseAnimation :show="isOpen" name="collapse">',
					'  <div id="delivery">…</div>',
					'</BaseAnimation>',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseAnimation, BaseButton },
		setup: () => ({ props: useArgsWithoutSlots(args, ['default', 'show', 'isGroup', 'tag']), isOpen: ref(false) }),
		template: `
			<div class="story-col story-narrow">
				<BaseButton variant="ghost" :aria-expanded="isOpen" aria-controls="delivery-details" @click="isOpen = !isOpen">
					Условия доставки
				</BaseButton>
				<BaseAnimation v-bind="props" :show="isOpen">
					<div id="delivery-details" class="story-frame">
						Доставим за 1–3 дня. Курьер позвонит за час; бесплатно при заказе от 3 000 ₽.
					</div>
				</BaseAnimation>
			</div>
		`,
	}),
	play: async ({ canvas, userEvent }) => {
		const toggle = canvas.getByRole('button', { name: 'Условия доставки' })
		await expect(toggle).toHaveAttribute('aria-expanded', 'false')
		await userEvent.click(toggle)
		await expect(toggle).toHaveAttribute('aria-expanded', 'true')
		await waitFor(() => expect(canvas.getByText(/Доставим за 1–3 дня/)).toBeVisible())
		await userEvent.click(toggle)
		await waitFor(() => expect(canvas.queryByText(/Доставим за 1–3 дня/)).not.toBeInTheDocument())
	},
}
