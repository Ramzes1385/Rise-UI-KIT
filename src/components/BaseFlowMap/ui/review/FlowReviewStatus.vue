<template>
	<div class="base-flow-map__review-status" role="status">
		<span
			>{{ UI_FLOW_REVIEW.STATUS_WAITING }}: <b>{{ counts.open }}</b></span
		>
		<span
			>{{ UI_FLOW_REVIEW.STATUS_ACCEPTED_SHORT }}: <b>{{ counts.accepted }}</b></span
		>
		<span
			>{{ UI_FLOW_REVIEW.STATUS_DECLINED_SHORT }}: <b>{{ counts.declined }}</b></span
		>
		<span
			>{{ UI_FLOW_REVIEW.STATUS_COMMENTS }}: <b>{{ commentCount }}</b> &middot; {{ unreadText }}</span
		>
		<BasePopover :is-open="isHooksOpen" position="top" :aria-label="UI_FLOW_REVIEW.HOOKS" @update:is-open="setHooksOpen">
			<template #trigger>
				<BaseButton variant="ghost" :aria-expanded="isHooksOpen" :title="hooksLabel">
					<BaseIcon name="code" />
					{{ UI_FLOW_REVIEW.HOOKS }}
					<span class="base-flow-map__review-count" aria-hidden="true">{{ bindings.length }}</span>
				</BaseButton>
			</template>
			<div class="base-flow-map__review-hooks">
				<p class="base-flow-map__review-hooks-title">{{ UI_FLOW_REVIEW.HOOKS_TITLE }}</p>
				<p v-if="bindings.length === 0" class="base-flow-map__review-hint">{{ UI_FLOW_REVIEW.HOOKS_EMPTY }}</p>
				<ul class="base-flow-map__review-items">
					<li v-for="binding in bindings" :key="binding.id" class="base-flow-map__review-hook">
						<code>{{ binding.name }}</code>
						<span class="base-flow-map__review-arrow" aria-hidden="true">&rarr;</span>
						<code>{{ binding.handler || UI_FLOW_REVIEW.HOOK_ANONYMOUS }}</code>
						<BaseBadge v-if="binding.isCancellable" :label="UI_FLOW_REVIEW.HOOK_CANCELLABLE" status="warning" variant="soft" />
						<span class="base-flow-map__review-card-time">{{ callsLabel(binding) }}</span>
						<BaseSwitch
							:model-value="binding.isEnabled"
							:aria-label="bindingLabel(binding)"
							@update:model-value="toggleBinding(binding, $event)" />
					</li>
				</ul>
			</div>
		</BasePopover>
	</div>
</template>

<script setup lang="ts">
import { BaseIcon } from '@components/BaseIcon'
import { BaseBadge } from '@components/BaseBadge'
import { UI_FLOW_REVIEW } from '@/locales/messages'
import { BaseButton } from '@components/BaseButton'
import { BaseSwitch } from '@components/BaseSwitch'
import { BasePopover } from '@components/BasePopover'
import { useFlowReviewStatus } from '../../model/review/bar/useFlowReviewStatus'

const { counts, commentCount, unreadText, isHooksOpen, bindings, hooksLabel, setHooksOpen, toggleBinding, bindingLabel, callsLabel } =
	useFlowReviewStatus()
</script>
