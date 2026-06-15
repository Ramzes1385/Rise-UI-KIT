/**
 * Stories для компонента BasePagination.
 * Демонстрирует все варианты, многоточия и состояния.
 */

import type { Meta, StoryObj } from '@storybook/vue3'
import { expect, fn, userEvent } from 'storybook/test'
import { ref } from 'vue'

import { buildArgTypes } from '@utils/storybookUtils'
import { playShiftTab } from '@utils/storybookUtils/a11yHelpers'
import { PAGINATION_VARIANTS } from '../model/BasePagination.types'
import BasePagination from '../ui/BasePagination.vue'

const meta: Meta<typeof BasePagination> = {
	title: 'UI/BasePagination',
	component: BasePagination,

	argTypes: buildArgTypes({
		props: {
			total: { control: 'number' },
			pageSize: { control: 'number' },
			maxVisible: { control: 'number' },
			showLastPage: { control: 'boolean' },
			variant: {
				control: 'radio',
				options: PAGINATION_VARIANTS,
			},
			sizeScale: {
				control: { type: 'range', min: 50, max: 200, step: 10 },
			},
			modelValue: { table: { disable: true } },
			'onUpdate:modelValue': { table: { disable: true } },
			onChange: { table: { disable: true } },
		},
	}),

	args: {
		total: 100,
		pageSize: 10,
		maxVisible: 7,
		showLastPage: true,
		variant: 'default',
		sizeScale: 100,
	},
}

export default meta
type Story = StoryObj<typeof BasePagination>
/** Базовая пагинация с многоточиями */
export const Default: Story = {
	render: args => ({
		components: { BasePagination },
		setup() {
			const page = ref(1)
			return { args, page }
		},
		template: '<BasePagination v-model="page" v-bind="args" />',
	}),
	args: {
		onChange: fn(),
	},
	play: async ({ args, canvasElement, step }) => {
		await step('Фокусировка пагинации по Tab', async () => {
			await userEvent.tab()
		})
		await step('Обратная фокусировка по Shift+Tab', async () => {
			await playShiftTab(canvasElement, { selector: '.base-pagination' })
		})

		await step('Клик по странице номер 3 (стр. 19, 80-82)', async () => {
			const pageButtons = canvasElement.querySelectorAll<HTMLButtonElement>('.base-pagination__pages button')
			const targetButton = Array.from(pageButtons).find(btn => btn.textContent?.trim() === '3')
			if (targetButton) await userEvent.click(targetButton)
		})

		await step('Клик по кнопке "Вперёд" (стр. 33)', async () => {
			const buttons = canvasElement.querySelectorAll<HTMLButtonElement>('.base-pagination > button')
			const nextBtn = buttons[buttons.length - 1]
			if (nextBtn && !nextBtn.disabled) await userEvent.click(nextBtn)
		})

		await step('Клик по кнопке "Назад" (стр. 8)', async () => {
			const buttons = canvasElement.querySelectorAll<HTMLButtonElement>('.base-pagination > button')
			const prevBtn = buttons[0]
			if (prevBtn && !prevBtn.disabled) await userEvent.click(prevBtn)
		})
	},
}
/** Вариант ghost */
export const Ghost: Story = {
	args: {
		variant: 'ghost',
	},
	render: args => ({
		components: { BasePagination },
		setup() {
			const page = ref(1)
			return { args, page }
		},
		template: '<BasePagination v-model="page" v-bind="args" />',
	}),
}
/** Вариант outline */
export const Outline: Story = {
	args: {
		variant: 'outline',
	},
	render: args => ({
		components: { BasePagination },
		setup() {
			const page = ref(1)
			return { args, page }
		},
		template: '<BasePagination v-model="page" v-bind="args" />',
	}),
}
/** Мало страниц — без многоточий */
export const FewPages: Story = {
	args: {
		total: 25,
		pageSize: 10,
	},
	render: args => ({
		components: { BasePagination },
		setup() {
			const page = ref(1)
			return { args, page }
		},
		template: '<BasePagination v-model="page" v-bind="args" />',
	}),
}
/** Много страниц — видны многоточия */
export const ManyPages: Story = {
	args: {
		total: 500,
		pageSize: 10,
		maxVisible: 7,
	},
	render: args => ({
		components: { BasePagination },
		setup() {
			const page = ref(25)
			return { args, page }
		},
		template: '<BasePagination v-model="page" v-bind="args" />',
	}),
}
/** Без последней страницы */
export const WithoutLastPage: Story = {
	args: {
		total: 200,
		pageSize: 10,
		showLastPage: false,
	},
	render: args => ({
		components: { BasePagination },
		setup() {
			const page = ref(10)
			return { args, page }
		},
		template: '<BasePagination v-model="page" v-bind="args" />',
	}),
}
/** Интерактивная */
export const Interactive: Story = {
	render: args => ({
		components: { BasePagination },
		setup() {
			const page = ref(1)
			return { args, page }
		},
		template: `
			<div>
				<BasePagination v-model="page" v-bind="args" />
				<p style="margin-top:8px;color:var(--color-text-muted);">Страница: {{ page }}</p>
			</div>
		`,
	}),
	args: {
		onChange: fn(),
	},
	play: async ({ args, canvasElement, step }) => {
		await step('переход на страницу 3 эмитит change', async () => {
			const pageButtons = canvasElement.querySelectorAll<HTMLButtonElement>('.base-pagination__pages button')
			const targetButton = Array.from(pageButtons).find(btn => btn.textContent?.trim() === '3')
			if (targetButton) await userEvent.click(targetButton)
			expect(args.onChange).toHaveBeenCalledWith(3)
		})

		await step('отображается обновлённый номер страницы', async () => {
			expect(canvasElement.textContent).toContain('Страница: 3')
		})
	},
}
/** Тёмная тема */
export const DarkTheme: Story = {
	parameters: {
		docs: {
			source: {
				code: '<BasePagination v-model="page" :total="100" :page-size="10" />',
			},
		},
	},
	render: args => ({
		components: { BasePagination },
		setup() {
			const page = ref(1)
			return { args, page }
		},
		template: `
			<div data-theme="dark" style="padding: 16px; background: var(--color-bg); border-radius: var(--border-radius-base);">
				<BasePagination v-model="page" v-bind="args" />
			</div>
		`,
	}),
}
/** Страница 1 из 20 — покрывает левое многоточие (start > 2) */
export const FirstPageMany: Story = {
	args: {
		total: 200,
		pageSize: 10,
		maxVisible: 7,
	},
	render: args => ({
		components: { BasePagination },
		setup() {
			const page = ref(1)
			return { args, page }
		},
		template: '<BasePagination v-model="page" v-bind="args" />',
	}),
}
/** Последняя страница — покрывает прижим к концу */
export const LastPageMany: Story = {
	args: {
		total: 200,
		pageSize: 10,
		maxVisible: 7,
	},
	render: args => ({
		components: { BasePagination },
		setup() {
			const page = ref(20)
			return { args, page }
		},
		template: '<BasePagination v-model="page" v-bind="args" />',
	}),
}
/** Без последней страницы, много страниц — покрывает showLastPage=false + правое многоточие */
export const WithoutLastManyPages: Story = {
	args: {
		total: 200,
		pageSize: 10,
		showLastPage: false,
		maxVisible: 7,
	},
	render: args => ({
		components: { BasePagination },
		setup() {
			const page = ref(5)
			return { args, page }
		},
		template: '<BasePagination v-model="page" v-bind="args" />',
	}),
}
/** Нулевой total — покрывает total <= 0 */
export const ZeroTotal: Story = {
	args: {
		total: 0,
		pageSize: 10,
	},
	render: args => ({
		components: { BasePagination },
		setup() {
			const page = ref(1)
			return { args, page }
		},
		template: '<BasePagination v-model="page" v-bind="args" />',
	}),
}
/** Кастомный maxVisible — покрывает нестандартный maxVisible */
export const CustomMaxVisible: Story = {
	args: {
		total: 500,
		pageSize: 10,
		maxVisible: 5,
	},
	render: args => ({
		components: { BasePagination },
		setup() {
			const page = ref(10)
			return { args, page }
		},
		template: '<BasePagination v-model="page" v-bind="args" />',
	}),
}
/** Кастомный цвет */
export const CustomColor: Story = {
	args: {
		total: 100,
		pageSize: 10,
		color: {
			bg: { base: '#e0f2fe', hover: '#bae6fd' },
			text: { base: '#0369a1', hover: '#0c4a6e' },
		},
	},
	render: args => ({
		components: { BasePagination },
		setup() {
			const page = ref(1)
			return { args, page }
		},
		template: '<BasePagination v-model="page" v-bind="args" />',
	}),
}
/** Масштаб размера */
export const SizeScaleLarge: Story = {
	args: {
		total: 100,
		pageSize: 10,
		sizeScale: 150,
	},
	render: args => ({
		components: { BasePagination },
		setup() {
			const page = ref(1)
			return { args, page }
		},
		template: '<BasePagination v-model="page" v-bind="args" />',
	}),
}
/** Пагинация с 0 элементами — покрывает пустое состояние */
export const Empty: Story = {
	args: {
		total: 0,
		pageSize: 10,
	},
	render: args => ({
		components: { BasePagination },
		setup() {
			const page = ref(1)
			return { args, page }
		},
		template: '<BasePagination v-model="page" v-bind="args" />',
	}),
}
/** Клик по «Вперёд» при отсутствии страниц — покрывает false-ветку if (page >= 1 && page <= totalPages.value) в changePage (стр. 80). При total=0 totalPages=0, modelValue=1 → кнопка next активна (modelValue !== totalPages), клик передаёт page=2, что > 0. */
export const OutOfRangePage: Story = {
	args: {
		total: 0,
		pageSize: 10,
	},
	render: args => ({
		components: { BasePagination },
		setup() {
			const page = ref(1)
			return { args, page }
		},
		template: '<BasePagination v-model="page" v-bind="args" />',
	}),
	play: async ({ canvasElement }) => {
		const buttons = canvasElement.querySelectorAll<HTMLButtonElement>('.base-pagination > button')
		const nextBtn = buttons[buttons.length - 1]
		if (nextBtn instanceof HTMLButtonElement && !nextBtn.disabled) {
			await userEvent.click(nextBtn)
		}
	},
}
