<template>
	<Teleport defer :to="teleportTarget">
		<!-- Меню по образцу APG Menu: фокус на первом пункте, стрелки/Home/End — навигация, Escape и Tab — закрытие -->
		<div
			v-if="isOpen"
			ref="menuRef"
			class="base-chat-context-menu"
			role="menu"
			:aria-label="UI_CHAT_TEXT.MESSAGE_ACTIONS"
			:style="[menuStyle, layerStyle]"
			:data-theme="inheritedTheme"
			@keydown="handleKeydown">
			<div class="base-chat-context-menu__reactions" role="group" :aria-label="UI_CHAT_TEXT.REACTIONS_ARIA">
				<button
					v-for="emoji in popularEmojis"
					:key="emoji"
					type="button"
					role="menuitem"
					tabindex="-1"
					class="base-chat-context-menu__reaction-btn"
					:aria-label="`${UI_CHAT_TEXT.ADD_REACTION} ${emoji}`"
					@click="handleReaction(emoji)">
					{{ emoji }}
				</button>
			</div>
			<div class="base-chat-context-menu__divider" role="separator"></div>
			<button type="button" role="menuitem" tabindex="-1" class="base-chat-context-menu__item" @click="handleReply">
				<BaseIcon name="reply" :size-scale="sizeScale * CHAT_SCALE.SMALL" class="base-chat-context-menu__icon" />
				<span>{{ UI_CHAT_TEXT.REPLY }}</span>
			</button>
			<button type="button" role="menuitem" tabindex="-1" class="base-chat-context-menu__item" @click="handleSelect">
				<BaseIcon name="check" :size-scale="sizeScale * CHAT_SCALE.SMALL" class="base-chat-context-menu__icon" />
				<span>{{ UI_CHAT_TEXT.SELECT }}</span>
			</button>
			<button type="button" role="menuitem" tabindex="-1" class="base-chat-context-menu__item" @click="handleCopy">
				<BaseIcon name="copy" :size-scale="sizeScale * CHAT_SCALE.SMALL" class="base-chat-context-menu__icon" />
				<span>{{ UI_CHAT_TEXT.COPY }}</span>
			</button>
			<button
				v-if="currentUserRole === 'admin'"
				type="button"
				role="menuitem"
				tabindex="-1"
				class="base-chat-context-menu__item"
				@click="handlePin">
				<BaseIcon :name="message?.isPinned ? 'unpin' : 'pin'" :size-scale="sizeScale * CHAT_SCALE.SMALL" class="base-chat-context-menu__icon" />
				<span>{{ message?.isPinned ? UI_CHAT_TEXT.UNPIN : UI_CHAT_TEXT.PIN }}</span>
			</button>
			<button
				v-if="currentUserRole === 'admin' || message?.sender === 'me'"
				type="button"
				role="menuitem"
				tabindex="-1"
				class="base-chat-context-menu__item base-chat-context-menu__item--danger"
				@click="handleDelete">
				<BaseIcon name="trash" :size-scale="sizeScale * CHAT_SCALE.SMALL" class="base-chat-context-menu__icon" />
				<span>{{ UI_CHAT_TEXT.DELETE }}</span>
			</button>
		</div>
	</Teleport>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, nextTick, ref, watch } from 'vue'
import { UI_CHAT_TEXT } from '@/locales/messages'
import { BaseIcon } from '@components/BaseIcon'
import { SIZE_SCALE_DEFAULT } from '@composables/useBaseComponent'
import { useLayerIndex } from '@composables/useLayerStack'
import { useInheritedTheme, useTeleportTarget } from '@composables/useTeleportTarget'
import { CHAT_SCALE } from '../../../model/chatScale'
import type { ChatMessageContextMenuEmits, ChatMessageContextMenuProps } from '../model/ChatMessageContextMenu.types'

/** Куда телепортируются слои: body или контейнер из плагина и BaseApp (teleportTo) */
const teleportTarget = useTeleportTarget()

const props = withDefaults(defineProps<ChatMessageContextMenuProps>(), {
	popularEmojis: () => ['👍', '❤️', '🔥', '😂', '😮', '😢'],
})

const emit = defineEmits<ChatMessageContextMenuEmits>()

const menuRef = ref<HTMLElement | null>(null)

/**
 * Тема блока с чатом: меню в body иначе взяло бы тему страницы. Корень компонента — Teleport,
 * его метка остаётся в списке сообщений: от неё ищется ближайший `data-theme`
 */
const instance = getCurrentInstance()
const inheritedTheme = useInheritedTheme(() => (instance?.proxy?.$el as Node | null | undefined)?.parentElement, () => props.isOpen)
/** Место меню среди открытых слоёв: меню чата в окне — над окном */
const layerStyle = useLayerIndex(() => props.isOpen)

/** Меню телепортировано в body и не наследует --size-scale чата: масштаб передаётся явно */
const menuStyle = computed(() => ({
	top: `${props.y}px`,
	left: `${props.x}px`,
	'--size-scale': String(props.sizeScale / SIZE_SCALE_DEFAULT),
}))

function getItems(): HTMLElement[] {
	return Array.from(menuRef.value?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])
}

/** При открытии фокус переходит на первый пункт меню */
watch(
	() => props.isOpen,
	isOpen => {
		if (isOpen) nextTick(() => getItems()[0]?.focus())
	},
	{ immediate: true },
)

/**
 * Клавиатура меню: ↓/→ — следующий пункт, ↑/← — предыдущий (по кругу), Home/End — первый и последний.
 * Escape и Tab закрывают меню; фокус возвращает useChatMessageActions.
 */
function handleKeydown(event: KeyboardEvent): void {
	const items = getItems()
	const currentIndex = items.indexOf(document.activeElement as HTMLElement)
	const moves: Record<string, number> = {
		ArrowDown: currentIndex + 1,
		ArrowRight: currentIndex + 1,
		ArrowUp: currentIndex - 1,
		ArrowLeft: currentIndex - 1,
		Home: 0,
		End: items.length - 1,
	}
	if (event.key in moves) {
		event.preventDefault()
		const nextIndex = (moves[event.key] + items.length) % items.length
		items[nextIndex]?.focus()
		return
	}
	if (event.key === 'Escape' || event.key === 'Tab') {
		event.preventDefault()
		emit('close')
	}
}

function handleReaction(emoji: string): void {
	emit('reaction', emoji)
}

function handleReply(): void {
	emit('reply')
}

function handleSelect(): void {
	emit('select')
}

function handleCopy(): void {
	emit('copy')
}

function handlePin(): void {
	emit('pin')
}

function handleDelete(): void {
	emit('delete')
}

defineExpose({
	menuRef,
})
</script>
