/** Composable: логика ChatFilePreview — удаление вложения из сообщения до отправки */
export function useChatFilePreview(emit: (event: 'remove', index: number) => void) {
	return {
		handleRemove: (index: number): void => emit('remove', index),
	}
}
