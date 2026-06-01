import { computed, ref, type Ref } from 'vue'

interface UsePasswordVisibilityOptions {
	type: Ref<string>
}

/**
 * Composable для управления видимостью пароля в инпуте
 */
export function usePasswordVisibility(options: UsePasswordVisibilityOptions) {
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
