/**
 * Интеграционные тесты для BaseTour.
 * Проверяют связку с v-model:isOpen / v-model:step и кастомным слотом в составе родителя.
 */

import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { defineComponent, ref } from 'vue'

import type { TourStep } from './BaseTour.types'
import BaseTour from './BaseTour.vue'

vi.mock('@composables/useScrollLock', () => ({
	useScrollLock: () => ({ lock: vi.fn(), unlock: vi.fn() }),
}))

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
})
