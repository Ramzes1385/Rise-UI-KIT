import { ref } from 'vue'

export function useFieldErrors() {
	const errors = ref<Record<string, string>>({})
	return {
		errors,
		clear(): void {
			errors.value = {}
		},
		check(key: string, error: string | undefined): boolean {
			errors.value = { ...errors.value, [key]: error ?? '' }
			return !error
		},
	}
}
