import '@testing-library/jest-dom/vitest'
import BaseTour from '../ui/BaseTour.vue'
import { defineComponent, ref } from 'vue'
import userEvent from '@testing-library/user-event'
import type { TourStep } from '../types/BaseTour.types'
import { render, screen, waitFor } from '@testing-library/vue'

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

		await userEvent.click(screen.getByTestId('unmount'))

		expect(document.querySelector('.base-tour')).not.toBeInTheDocument()
		expect(document.body.style.overflow).toBe('')
	})

	describe('фокус с клавиатуры (модальный диалог)', () => {
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

describe('BaseTour: цель шага (TOUR-2, TOUR-3)', () => {
	afterEach(() => {
		document.body.innerHTML = ''
	})

	function renderTour(steps: TourStep[], behavior: Record<string, boolean> = {}) {
		const Wrapper = defineComponent({
			components: { BaseTour },
			setup() {
				return { steps, behavior }
			},
			template: '<BaseTour :is-open="true" :steps="steps" :behavior="behavior" />',
		})
		return render(Wrapper)
	}

	it('по умолчанию подсвеченная цель доступна: в фоне дырка, окно не модальное', async () => {
		document.body.innerHTML = '<button id="a">Цель</button>'
		renderTour([{ target: '#a', title: 'Первый' }])
		await screen.findByText('Первый')
		expect(document.querySelector<HTMLElement>('.base-tour__overlay')?.style.clipPath).toContain('polygon(evenodd')
		expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'false')
	})

	it('allowTargetInteraction: false — цель закрыта, окно модальное', async () => {
		document.body.innerHTML = '<button id="a">Цель</button>'
		renderTour([{ target: '#a', title: 'Первый' }], { allowTargetInteraction: false })
		await screen.findByText('Первый')
		expect(document.querySelector<HTMLElement>('.base-tour__overlay')?.style.clipPath).toBe('')
		expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
	})

	it('isTargetInteractive шага важнее behavior', async () => {
		document.body.innerHTML = '<button id="a">Цель</button>'
		renderTour([{ target: '#a', title: 'Первый', isTargetInteractive: true }], { allowTargetInteraction: false })
		await screen.findByText('Первый')
		expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'false')
	})

	it('Tab из карточки доходит до цели и возвращается в карточку, Shift+Tab — обратно', async () => {
		document.body.innerHTML = '<button id="a">Цель</button>'
		renderTour([
			{ target: '#a', title: 'Первый' },
			{ target: '#a', title: 'Второй' },
		])
		await screen.findByText('Первый')
		await waitFor(() => expect(screen.getByRole('button', { name: 'Далее' })).toHaveFocus())
		await userEvent.tab()
		expect(screen.getByRole('button', { name: 'Цель' })).toHaveFocus()
		await userEvent.tab()
		expect(screen.getByRole('button', { name: 'Пропустить тур' })).toHaveFocus()
		await userEvent.tab({ shift: true })
		expect(screen.getByRole('button', { name: 'Цель' })).toHaveFocus()
	})

	it('клик по доступной цели не закрывает тур', async () => {
		document.body.innerHTML = '<button id="a">Цель</button>'
		const onClick = vi.fn()
		document.querySelector('#a')?.addEventListener('click', onClick)
		renderTour([{ target: '#a', title: 'Первый' }])
		await screen.findByText('Первый')
		await userEvent.click(screen.getByRole('button', { name: 'Цель' }))
		expect(onClick).toHaveBeenCalledTimes(1)
		expect(screen.getByRole('dialog')).toBeInTheDocument()
	})

	it.each([
		['без цели', { title: 'Центр' }],
		['цели нет на странице', { target: '#missing', title: 'Центр' }],
		['неверный селектор', { target: '###', title: 'Центр' }],
	])('%s — карточка по центру, фон затемнён целиком', async (_, step) => {
		renderTour([step])
		await screen.findByText('Центр')
		expect(document.querySelector('.base-tour__card--center')).toBeInTheDocument()
		expect(document.querySelector('.base-tour__overlay--dim')).toBeInTheDocument()
		expect(document.querySelector('.base-tour__spotlight')).not.toBeInTheDocument()
		expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
	})

	it('цель, появившаяся позже, подсвечивается; исчезнувшая — карточка снова по центру', async () => {
		renderTour([{ target: '#late', title: 'Поздняя' }])
		await screen.findByText('Поздняя')
		expect(document.querySelector('.base-tour__card--center')).toBeInTheDocument()

		const late = document.createElement('div')
		late.id = 'late'
		document.body.prepend(late)
		await waitFor(() => expect(document.querySelector('.base-tour__spotlight')).toBeInTheDocument())
		expect(document.querySelector('.base-tour__card--center')).not.toBeInTheDocument()

		late.remove()
		await waitFor(() => expect(document.querySelector('.base-tour__card--center')).toBeInTheDocument())
	})
})

describe('BaseTour: имя, описание и объявление шага (TOUR-4)', () => {
	beforeEach(() => {
		mountTargets()
	})

	afterEach(() => {
		document.body.innerHTML = ''
	})

	it('окно названо заголовком и описано текстом шага', async () => {
		render(Host)
		await screen.findByText('Первый')
		const dialog = screen.getByRole('dialog')
		expect(dialog).not.toHaveAttribute('aria-label')
		expect(dialog).toHaveAccessibleName('Первый')
		expect(dialog).toHaveAccessibleDescription('Контент 1')
	})

	it('смена шага объявляется: «Шаг N из M: заголовок»', async () => {
		render(Host)
		await screen.findByText('Первый')
		await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Шаг 1 из 2: Первый'))
		await userEvent.click(screen.getByText('Далее'))
		await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Шаг 2 из 2: Второй'))
	})

	it('шаг без заголовка: объявление без него, имя окна — общее', async () => {
		const Wrapper = defineComponent({
			components: { BaseTour },
			setup() {
				return { steps: [{ target: '#a', content: 'Текст' }] }
			},
			template: '<BaseTour :is-open="true" :steps="steps" />',
		})
		render(Wrapper)
		await screen.findByText('Текст')
		await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Шаг 1 из 1'))
		expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', 'Тур по интерфейсу')
	})

	it('свои слоты: ссылок на чужую разметку нет, имя — заголовок шага', async () => {
		const Wrapper = defineComponent({
			components: { BaseTour },
			setup() {
				return { steps: STEPS }
			},
			template: `
				<BaseTour :is-open="true" :steps="steps">
					<template #title="{ step }"><strong>{{ step.title }}!</strong></template>
					<template #content>Своё</template>
				</BaseTour>
			`,
		})
		render(Wrapper)
		await screen.findByText('Своё')
		const dialog = screen.getByRole('dialog')
		expect(dialog).toHaveAttribute('aria-label', 'Первый')
		expect(dialog).not.toHaveAttribute('aria-labelledby')
		expect(dialog).not.toHaveAttribute('aria-describedby')
	})

	it('закрытый тур очищает объявление', async () => {
		render(Host)
		await screen.findByText('Первый')
		await userEvent.click(screen.getByText('Далее'))
		await userEvent.click(await screen.findByText('Завершить'))
		expect(screen.queryByRole('status')).not.toBeInTheDocument()
	})
})
