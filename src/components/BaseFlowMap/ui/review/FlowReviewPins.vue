<template>
	<div class="base-flow-map__review-pins">
		<BasePopover
			v-for="pin in pins"
			:key="pin.thread.id"
			:is-open="isOpen(pin.thread)"
			position="bottom"
			:aria-label="threadLabel(pin.thread)"
			@update:is-open="setOpen(pin.thread, $event)">
			<template #trigger>
				<button
					type="button"
					class="base-flow-map__review-pin"
					:class="[
						pin.thread.isUnread && 'base-flow-map__review-pin--unread',
						pin.thread.isResolved && 'base-flow-map__review-pin--done',
					]"
					:style="{ insetInlineStart: `${pin.x}px`, insetBlockStart: `${pin.y}px` }"
					:aria-label="pin.label">
					<span class="base-flow-map__review-pin-initials" aria-hidden="true">{{ pin.initials }}</span>
					<span class="base-flow-map__review-pin-count" aria-hidden="true">
						<BaseIcon v-if="pin.thread.isResolved" name="check" />
						<template v-else>{{ pin.count }}</template>
					</span>
				</button>
			</template>
			<div class="base-flow-map__review-thread">
				<BaseCommentThread
					:comments="pin.thread.comments"
					:current-user="currentUser"
					:label="threadLabel(pin.thread)"
					@reply="reply(pin.thread, $event)" />
				<BaseButton variant="ghost" @click="toggleResolved(pin.thread)">{{ resolveLabel(pin.thread) }}</BaseButton>
			</div>
		</BasePopover>
	</div>
</template>

<script setup lang="ts">
import { BaseIcon } from '@components/BaseIcon'
import { BaseButton } from '@components/BaseButton'
import { BasePopover } from '@components/BasePopover'
import { BaseCommentThread } from '@components/BaseCommentThread'
import { useFlowReviewPins } from '../../model/review/bar/useFlowReviewPins'

const { pins, currentUser, isOpen, setOpen, reply, toggleResolved, resolveLabel, threadLabel } = useFlowReviewPins()
</script>
