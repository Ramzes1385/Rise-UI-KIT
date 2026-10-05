import '@testing-library/jest-dom/vitest'
import BaseSkeleton from '../ui/BaseSkeleton.vue'
import { defineComponent, nextTick, ref } from 'vue'
import { render, screen, waitFor } from '@testing-library/vue'

const isLoading = ref(true)

const Recipe = defineComponent({
	components: { BaseSkeleton },
	setup: () => ({ isLoading }),
	template: `
		<Transition name="base-skeleton" mode="out-in">
			<div v-if="isLoading" key="loading"><BaseSkeleton shape="text" /></div>
			<p v-else key="content">Анна Смирнова</p>
		</Transition>
	`,
})

describe('BaseSkeleton: смена на содержимое', () => {
	beforeEach(() => {
		isLoading.value = true
	})

	it('рецепт Transition base-skeleton: скелетон уходит с классами перехода, содержимое появляется', async () => {
		const { container } = render(Recipe, { global: { stubs: { transition: false } } })
		isLoading.value = false
		await nextTick()

		expect(container.querySelector('.base-skeleton')?.parentElement).toHaveClass('base-skeleton-leave-active')
		await waitFor(() => expect(screen.getByText('Анна Смирнова')).toBeInTheDocument())
		expect(container.querySelector('.base-skeleton')).toBeNull()
	})

	it('без длительности перехода (reduce, пресет none) содержимое встаёт без ожидания transitionend', async () => {
		render(Recipe, { global: { stubs: { transition: false } } })
		isLoading.value = false

		await waitFor(() => expect(screen.getByText('Анна Смирнова')).toBeInTheDocument(), { timeout: 200 })
	})
})
