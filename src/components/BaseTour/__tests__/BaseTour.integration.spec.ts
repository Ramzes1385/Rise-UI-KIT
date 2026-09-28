import '@testing-library/jest-dom/vitest'
import { defineComponent, ref } from 'vue'
import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '@testing-library/vue'
import BaseTour from '../ui/BaseTour.vue'
import type { TourStep } from '../types/BaseTour.types'

const STEPS: TourStep[] = [
	{ target: '#a', title: 'Первый', content: 'Контент 1' },
	{ target: '#b', title: 'Второй', content: 'Контент 2' },
]

function mountTargets(): void {
	document.body.innerHTML = '<div id="a">A</div><div id="b">B</div>'
}

const Host = defineComponent({
	components: { BaseTour },
	setup() {
		const open = ref(true)
		const step = ref(0)
		const steps = STEPS
		return { open, step, steps }
	},
	template: `
		<div>
			<span data-testid="open">{{ open }}</span>
			<span data-testid="step">{{ step }}</span>
			<BaseTour v-model:is-open="open" v-model:step="step" :steps="steps" />
		</div>
	`,
})

describe('BaseTour integration', () => {
	beforeEach(() => {
		mountTargets()
	})

	afterEach(() => {
		document.body.innerHTML = ''
	})

	it('синхронизирует step с родителем при нажатии «Далее»', async () => {
		render(Host)
		await screen.findByText('Первый')
		await userEvent.click(screen.getByText('Далее'))
		expect(await screen.findByText('Второй')).toBeInTheDocument()
		expect(screen.getByTestId('step')).toHaveTextContent('1')
	})

	it('закрывает тур у родителя при завершении', async () => {
		render(Host)
		await screen.findByText('Первый')
		await userEvent.click(screen.getByText('Далее'))
		await userEvent.click(await screen.findByText('Завершить'))
		expect(screen.getByTestId('open')).toHaveTextContent('false')
	})

	it('реагирует на внешнее изменение step', async () => {
		const Wrapper = defineComponent({
			components: { BaseTour },
			setup() {
				const step = ref(0)
				const setLast = (): void => {
					step.value = 1
				}
				return { step, setLast, steps: STEPS }
			},
			template: `
				<div>
					<button data-testid="jump" @click="setLast">jump</button>
					<BaseTour :is-open="true" :step="step" :steps="steps" />
				</div>
			`,
		})
		render(Wrapper)
		await screen.findByText('Первый')
		await userEvent.click(screen.getByTestId('jump'))
		expect(await screen.findByText('Второй')).toBeInTheDocument()
	})

	it('рендерит кастомное содержимое через default-слот', async () => {
		const Wrapper = defineComponent({
			components: { BaseTour },
			setup() {
				return { steps: STEPS }
			},
			template: `
				<BaseTour :is-open="true" :steps="steps">
					<template #default="{ step, index, total }">
						<div data-testid="custom">{{ step.title }} — {{ index + 1 }}/{{ total }}</div>
					</template>
				</BaseTour>
			`,
		})
		render(Wrapper)
		expect(await screen.findByTestId('custom')).toHaveTextContent('Первый — 1/2')
	})

	it('снимает блокировку прокрутки при размонтировании открытого тура', async () => {
		const Wrapper = defineComponent({
			components: { BaseTour },
			setup() {
				const isMounted = ref(true)
				return { isMounted, steps: STEPS }
			},
			template: `
				<div>
					<button data-testid="unmount" @click="isMounted = false">unmount</button>
					<BaseTour v-if="isMounted" :is-open="true" :steps="steps" />
				</div>
			`,
		})
		render(Wrapper)
		await screen.findByText('Первый')
		expect(document.body.style.overflow).toBe('hidden')

		// Например, смена маршрута при открытом туре
		await userEvent.click(screen.getByTestId('unmount'))

		expect(document.querySelector('.base-tour')).not.toBeInTheDocument()
		expect(document.body.style.overflow).toBe('')
	})

	describe('фокус с клавиатуры (модальный диалог)', () => {
		/** Страница с кнопкой запуска и туром через v-model */
		const Page = defineComponent({
			components: { BaseTour },
			setup() {
				const open = ref(false)
				return { open, steps: STEPS }
			},
			template: `
				<div>
					<button type="button" @click="open = true">Запустить тур</button>
					<BaseTour v-model:is-open="open" :steps="steps" />
				</div>
			`,
		})

		it('переводит фокус в карточку, удерживает Tab внутри и возвращает фокус на кнопку запуска', async () => {
			const user = userEvent.setup()
			render(Page)
			const start = screen.getByRole('button', { name: 'Запустить тур' })

			await user.click(start)
			const next = await screen.findByRole('button', { name: 'Далее' })
			await waitFor(() => expect(next).toHaveFocus())

			// С последней кнопки карточки Tab возвращается на первую, а не на страницу под затемнением
			await user.tab()
			expect(screen.getByRole('button', { name: 'Пропустить тур' })).toHaveFocus()

			await user.keyboard('{Escape}')
			expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
			expect(start).toHaveFocus()
		})

		it('«Далее» и «Завершить» — одна кнопка: на последнем шаге фокус не теряется', async () => {
			const user = userEvent.setup()
			render(Page)

			await user.click(screen.getByRole('button', { name: 'Запустить тур' }))
			const next = await screen.findByRole('button', { name: 'Далее' })
			await user.click(next)

			const finish = await screen.findByRole('button', { name: 'Завершить' })
			expect(finish).toBe(next)
		})
	})
})
