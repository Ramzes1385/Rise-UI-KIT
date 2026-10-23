export function useChatFilePreview(emit: (event: 'remove', index: number) => void) {
	return {
		handleRemove: (index: number): void => emit('remove', index),
	}
}
