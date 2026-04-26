import { defineComponent, h, onErrorCaptured, ref } from 'vue'

export const ErrorBoundary = defineComponent({
	name: 'ErrorBoundary',
	setup(_, { slots }) {
		const error = ref<Error | null>(null)

		onErrorCaptured(err => {
			error.value = err as Error
			return false
		})

		return () => {
			if (error.value) {
				return h('div', { class: 'error-boundary' }, [
					h('h2', 'Что-то пошло не так'),
					h('p', error.value.message),
					h('button', { onClick: () => (error.value = null) }, 'Попробовать снова'),
				])
			}
			return slots.default?.()
		}
	},
})
