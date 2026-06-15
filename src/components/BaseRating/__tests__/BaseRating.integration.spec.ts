/**
 * Integration-тесты для BaseRating.
 * Проверяют двусторонний v-model через родителя, дробный выбор и реакцию
 * на внешнее изменение значения.
 */

import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { fireEvent, render, screen } from '@testing-library/vue'
import { defineComponent, ref } from 'vue'

import BaseRating from '../ui/BaseRating.vue'

function mockStarRect(star: HTMLElement, width = 20): void {
	star.getBoundingClientRect = () =>
		({ left: 0, width, top: 0, right: width, bottom: 0, height: 0, x: 0, y: 0, toJSON: () => ({}) }) as DOMRect
}

function stars(container: ParentNode): HTMLElement[] {
	return Array.from(container.querySelectorAll<HTMLElement>('.base-rating__star'))
}

describe('BaseRating integration', () => {
	it('должен обновлять внешнее значение через v-model при клике', async () => {
		const Host = defineComponent({
			components: { BaseRating },
			setup() {
				const rating = ref(0)
				return { rating }
			},
			template: `
				<BaseRating v-model="rating" />
				<span data-testid="value">{{ rating }}</span>
			`,
		})

		const { container } = render(Host)
		const star = stars(container)[3]
		mockStarRect(star)
		// clientX: 20 дает ratio = 1.0, что для 4-й звезды (index 3) дает значение 4
		await fireEvent.click(star, { clientX: 20 })

		expect(screen.getByTestId('value')).toHaveTextContent('4')
	})

	it('должен записывать значение по шагу через v-model при isHoverSmooth=false', async () => {
		const Host = defineComponent({
			components: { BaseRating },
			setup() {
				const rating = ref(0)
				return { rating }
			},
			template: `
				<BaseRating v-model="rating" :step="0.5" :is-hover-smooth="false" />
				<span data-testid="value">{{ rating }}</span>
			`,
		})

		const { container } = render(Host)

		const star = stars(container)[2]
		mockStarRect(star)
		await fireEvent.click(star, { clientX: 4 })

		expect(screen.getByTestId('value')).toHaveTextContent('2.5')
	})

	it('должен записывать точное значение позиции через v-model (точечный клик)', async () => {
		const Host = defineComponent({
			components: { BaseRating },
			setup() {
				const rating = ref(0)
				return { rating }
			},
			template: `
				<BaseRating v-model="rating" :step="1" />
				<span data-testid="value">{{ rating }}</span>
			`,
		})

		const { container } = render(Host)

		const star = stars(container)[2]
		mockStarRect(star)
		await fireEvent.click(star, { clientX: 13 })

		expect(screen.getByTestId('value')).toHaveTextContent('2.65')
	})

	it('должен отражать внешнее дробное значение в заливке звезды', async () => {
		const user = userEvent.setup()

		const Host = defineComponent({
			components: { BaseRating },
			setup() {
				const rating = ref(1)
				const setValue = (): void => {
					rating.value = 3.5
				}
				return { rating, setValue }
			},
			template: `
				<BaseRating v-model="rating" :step="0.5" />
				<button type="button" @click="setValue">Установить 3.5</button>
			`,
		})

		const { container } = render(Host)

		await user.click(screen.getByRole('button', { name: 'Установить 3.5' }))

		const fillWidths = stars(container).map(s => s.querySelector<HTMLElement>('.base-rating__star-fill')!.style.width)
		expect(fillWidths[2]).toBe('100%')
		expect(fillWidths[3]).toBe('50%')
	})
})
