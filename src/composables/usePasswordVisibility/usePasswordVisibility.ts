/** Composable: управление видимостью пароля в инпуте */
import { computed, ref } from 'vue'
import type { UsePasswordVisibilityOptions } from './usePasswordVisibility.types'

/**
 * Composable для управления видимостью пароля в инпуте
 */
function usePasswordVisibility(options: UsePasswordVisibilityOptions) {
	const isPasswordVisible = ref(false)

	const inputType = computed(() => {
		if (options.type.value === 'password' && isPasswordVisible.value) {
			return 'text'
		}
		return options.type.value
	})

	function togglePasswordVisibility(): void {
		isPasswordVisible.value = !isPasswordVisible.value
	}

	return {
		isPasswordVisible,
		inputType,
		togglePasswordVisibility,
	}
}

export { usePasswordVisibility }
