<script lang="ts">
/**
 * @deprecated Импортируйте компонент из `@components/BaseChat/ChatMessageList/ui/ChatMessageList.vue`
 * или из публичного индекса `@components/BaseChat/ChatMessageList`.
 * Этот файл оставлен для обратной совместимости.
 */
import { h, ref } from 'vue'
import ChatMessageList from './ui/ChatMessageList.vue'

export default {
	name: 'ChatMessageList',
	setup(_props: unknown, { attrs, slots, expose }: { attrs: Record<string, unknown>; slots: Record<string, unknown>; expose: (exposed: Record<string, unknown>) => void }) {
		const innerRef = ref<InstanceType<typeof ChatMessageList> | null>(null)

		expose({
			scrollToMessage: (messageId: string) => innerRef.value?.scrollToMessage(messageId),
		})

		return () =>
			h(
				ChatMessageList,
				{
					ref: innerRef as any,
					...attrs,
				} as any,
				slots as any,
			)
	},
}
</script>
