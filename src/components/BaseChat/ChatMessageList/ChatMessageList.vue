<script lang="ts">
/**
 * @deprecated Импортируйте компонент из `@components/BaseChat/ChatMessageList/ui/ChatMessageList.vue`
 * или из публичного индекса `@components/BaseChat/ChatMessageList`.
 * Этот файл оставлен для обратной совместимости.
 */
import { defineComponent, h, ref } from 'vue'

import ChatMessageList from './ui/ChatMessageList.vue'

export default defineComponent({
	name: 'ChatMessageList',
	setup(_props, { attrs, slots, expose }) {
		const innerRef = ref<InstanceType<typeof ChatMessageList> | null>(null)

		expose({
			scrollToMessage: (messageId: string) => innerRef.value?.scrollToMessage(messageId),
		})

		return () =>
			h(
				ChatMessageList,
				{ ref: innerRef, ...attrs } as InstanceType<typeof ChatMessageList>['$props'],
				slots,
			)
	},
})
</script>
