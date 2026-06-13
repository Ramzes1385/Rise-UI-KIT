import { effectScope } from 'vue'

import { useChatInfoPanel } from './useChatInfoPanel'

function setup(): { panel: ReturnType<typeof useChatInfoPanel>; onAvatarClick: ReturnType<typeof vi.fn>; onInfoClick: ReturnType<typeof vi.fn> } {
	const onAvatarClick = vi.fn()
	const onInfoClick = vi.fn()
	const scope = effectScope()
	const panel = scope.run(() => useChatInfoPanel({ onAvatarClick, onInfoClick })) as ReturnType<
		typeof useChatInfoPanel
	>

	return { panel, onAvatarClick, onInfoClick }
}

describe('useChatInfoPanel unit', () => {
	it('opens profile tab and emits avatar click', () => {
		const { panel, onAvatarClick } = setup()

		panel.handleAvatarClick('user-1')

		expect(panel.selectedMemberId.value).toBe('user-1')
		expect(panel.activeTab.value).toBe('profile')
		expect(panel.isInfoOpen.value).toBe(true)
		expect(onAvatarClick).toHaveBeenCalledWith('user-1')
	})

	it('opens info tab and clears selected member', () => {
		const { panel, onInfoClick } = setup()
		panel.handleAvatarClick('user-1')

		panel.handleInfoClick()

		expect(panel.isInfoOpen.value).toBe(false)
		expect(panel.activeTab.value).toBe('profile')
		expect(panel.selectedMemberId.value).toBe('user-1')

		panel.handleInfoClick()

		expect(panel.isInfoOpen.value).toBe(true)
		expect(panel.activeTab.value).toBe('info')
		expect(panel.selectedMemberId.value).toBeNull()
		expect(onInfoClick).toHaveBeenCalledTimes(2)
	})
})
