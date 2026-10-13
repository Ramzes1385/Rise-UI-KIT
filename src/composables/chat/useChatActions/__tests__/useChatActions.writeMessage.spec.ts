import { render } from '@testing-library/vue'
import { ref, defineComponent, h } from 'vue'
import { formatMessage } from '@/locales/state'
import { UI_WARNINGS } from '@/locales/messages'
import { useChatActions } from '../useChatActions'
import type { ChatMessage } from '@components/BaseChat/types/BaseChat.types'
import type { MessageListExposed, UseChatActionsOptions } from '../types/useChatActions.types'

function createOptions(emit: ReturnType<typeof vi.fn>): UseChatActionsOptions {
	return {
		emit: emit as unknown as UseChatActionsOptions['emit'],
		replyingTo: ref<ChatMessage | null>(null),
		getAvatar: () => undefined,
		messageListRef: ref<MessageListExposed | null>(null),
		handleAvatarClick: vi.fn(),
		handleCancelReply: vi.fn(),
		editingMessage: ref<ChatMessage | null>(null),
		handleCancelEdit: vi.fn(),
		isAutoDownload: () => true,
	}
}

function mountActions(emit: ReturnType<typeof vi.fn>, listeners: Record<string, () => void>) {
	let actions!: ReturnType<typeof useChatActions>
	const Host = defineComponent({
		emits: ['avatar-click', 'write-message'],
		setup() {
			actions = useChatActions(createOptions(emit))
			return () => h('div')
		},
	})
	render(Host, { props: listeners })
	return actions
}

describe('useChatActions: write-message', () => {
	afterEach(() => {
		vi.restoreAllMocks()
	})

	it('вне компонента эмитит write-message и avatar-click без предупреждения', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		const emit = vi.fn()
		const actions = useChatActions(createOptions(emit))

		actions.handleWriteMessage('u1')

		expect(emit.mock.calls).toEqual([
			['write-message', 'u1'],
			['avatar-click', 'u1'],
		])
		expect(warn).not.toHaveBeenCalled()
	})

	it('в компоненте без слушателя avatar-click предупреждения нет', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		const emit = vi.fn()
		const actions = mountActions(emit, { onWriteMessage: vi.fn() })

		actions.handleWriteMessage('u1')

		expect(emit).toHaveBeenCalledWith('write-message', 'u1')
		expect(emit).toHaveBeenCalledWith('avatar-click', 'u1')
		expect(warn).not.toHaveBeenCalled()
	})

	it('со слушателем avatar-click предупреждает об устаревании и эмитит оба события', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		const emit = vi.fn()
		const actions = mountActions(emit, { onAvatarClick: vi.fn() })

		actions.handleWriteMessage('u1')

		expect(warn).toHaveBeenCalledExactlyOnceWith(`[rise-ui-kit] ${formatMessage(UI_WARNINGS.CHAT_WRITE_MESSAGE_AVATAR_CLICK, {})}`)
		expect(emit.mock.calls).toEqual([
			['write-message', 'u1'],
			['avatar-click', 'u1'],
		])
	})
})
