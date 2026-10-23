/** Composable: панель информации чата */
import { ref } from 'vue'
import type { ChatInfoTab } from '@components/BaseChat/types/BaseChat.types'
import type { UseChatInfoPanelOptions } from './types/useChatInfoPanel.types'

/** Composable для панели информации чата — открытие/закрытие, вкладки, выбранного участника. */
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

	/** Открыть вкладку «Информация» о чате (аватар в шапке): не переключает, а открывает */
	function openInfo(): void {
		isInfoOpen.value = true
		activeTab.value = 'info'
		selectedMemberId.value = null
		options.onInfoClick()
	}

	/** Закрыть панель и вернуть вкладку «Инфо» без выбранного участника (смена чата) */
	function closeInfo(): void {
		isInfoOpen.value = false
		activeTab.value = 'info'
		selectedMemberId.value = null
	}

	return {
		closeInfo,
		isInfoOpen,
		activeTab,
		selectedMemberId,
		handleAvatarClick,
		handleInfoClick,
		openInfo,
	}
}

export { useChatInfoPanel }
