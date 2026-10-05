import { computed, inject, onMounted, ref } from 'vue'
import { COMMENT_THREAD_KEY } from './thread/commentTree'
import type { CommentThreadContext } from '../types/BaseCommentThread.types'
import type { CommentComposerEmits, CommentComposerProps } from '../types/CommentComposer.types'

export function useCommentComposer(props: CommentComposerProps, emit: CommentComposerEmits) {
	const draft = ref('')
	const textareaRef = ref<{ focus: () => void } | null>(null)
	onMounted(() => {
		if (props.isReply) textareaRef.value?.focus()
	})
	const submit = (): void => {
		const text = draft.value.trim()
		if (!text) return
		emit('submit', text)
		draft.value = ''
	}
	return {
		ui: (inject(COMMENT_THREAD_KEY) as CommentThreadContext).ui,
		draft,
		textareaRef,
		canSend: computed(() => draft.value.trim().length > 0),
		submit,
		cancel: (): void => emit('cancel'),
		handleKeydown(event: KeyboardEvent): void {
			if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
				event.preventDefault()
				submit()
			} else if (event.key === 'Escape' && props.isReply) {
				event.preventDefault()
				emit('cancel')
			}
		},
	}
}
