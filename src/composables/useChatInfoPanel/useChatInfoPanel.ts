import { ref } from 'vue'
import type { UseChatInfoPanelOptions } from './useChatInfoPanel.types'
import type { ChatInfoTab } from '@components/BaseChat/model/BaseChat.types'

function useChatInfoPanel(options: UseChatInfoPanelOptions) {
	const isInfoOpen = ref(false)
	const activeTab = ref<ChatInfoTab>('info')
	const selectedMemberId = ref<string | null>(null)

	function handleAvatarClick(senderId: string): void {
		selectedMemberId.value = senderId
		activeTab.value = 'profile'
		isInfoOpen.value = true
		options.onAvatarClick(senderId)
	}

	function handleInfoClick(): void {
		isInfoOpen.value = !isInfoOpen.value
		if (isInfoOpen.value) {
			activeTab.value = 'info'
			selectedMemberId.value = null
		}
		options.onInfoClick()
	}

	return {
		isInfoOpen,
		activeTab,
		selectedMemberId,
		handleAvatarClick,
		handleInfoClick,
	}
}

export { useChatInfoPanel }
