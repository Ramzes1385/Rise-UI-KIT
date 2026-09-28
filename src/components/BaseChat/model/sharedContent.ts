import type { ChatMessage } from '../types/BaseChat.types'
import type { SharedLink } from '../types/ChatSlideoverLinks.types'
import type { SharedAttachment } from '../types/ChatSlideover.types'

function publishedLabel(message: ChatMessage): string {
	return message.date || message.time
}

export function collectAttachments(messages: ChatMessage[], type: 'file' | 'image'): SharedAttachment[] {
	const result: SharedAttachment[] = []
	for (const message of messages) {
		for (const attachment of message.attachments ?? []) {
			if (attachment.type === type) result.push({ ...attachment, publishedAt: publishedLabel(message) })
		}
	}
	return result
}

export function collectLinks(messages: ChatMessage[]): SharedLink[] {
	const result: SharedLink[] = []
	const seen = new Set<string>()
	const urlRegex = /(https?:\/\/[^\s]+)/gi
	for (const message of messages) {
		for (const url of message.text?.match(urlRegex) ?? []) {
			if (seen.has(url)) continue
			seen.add(url)
			result.push({ url, publishedAt: publishedLabel(message) })
		}
	}
	return result
}
