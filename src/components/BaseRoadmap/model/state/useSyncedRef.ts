import type { ShallowRef } from 'vue'
import { shallowRef, watch } from 'vue'

export function useSyncedRef<T>(source: () => T): ShallowRef<T> {
	const state = shallowRef(source()) as ShallowRef<T>
	watch(source, value => {
		state.value = value
	})
	return state
}
