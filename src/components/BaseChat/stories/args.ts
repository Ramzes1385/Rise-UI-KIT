import { fn } from 'storybook/test'
import type BaseChat from '../ui/BaseChat.vue'
import type { Meta } from '@storybook/vue3-vite'
import { PRIVATE_CHAT, PRIVATE_MESSAGES } from './shared'

const QUICK_REPLIES = ['Спасибо!', 'Посмотрю сегодня', 'Созвонимся?']

export const args = {
	...PRIVATE_CHAT,
	messages: PRIVATE_MESSAGES,
	quickReplies: QUICK_REPLIES,
	variant: 'bubble',
	sizeScale: 100,
	height: '560px',
	isTyping: false,
	typingUsername: '',
	isGroup: false,
	currentUserRole: 'member',
	maxBadges: 3,
	onSend: fn(),
	onAttach: fn(),
	'onSend-voice': fn(),
	'onAvatar-click': fn(),
	'onMessage-select': fn(),
	'onInfo-click': fn(),
	'onMessage-reaction': fn(),
	'onQuick-reply': fn(),
	'onDownload-file': fn(),
	'onDelete-messages': fn(),
	'onForward-messages': fn(),
	'onPin-message': fn(),
	'onUnpin-message': fn(),
	'onKick-member': fn(),
	'onBan-member': fn(),
	'onUpdate-member-role': fn(),
	'onMention-click': fn(),
	'onCommand-click': fn(),
	onError: fn(),
} satisfies Meta<typeof BaseChat>['args']
