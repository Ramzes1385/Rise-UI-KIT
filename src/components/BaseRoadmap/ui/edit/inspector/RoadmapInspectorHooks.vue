<template>
	<div class="base-roadmap__inspector-pane" role="tabpanel">
		<span class="base-roadmap__inspector-eyebrow">{{ UI_ROADMAP_EDIT.HOOKS_INTRO }}</span>
		<ul v-if="hooks.items.value.length" class="base-roadmap__inspector-list">
			<li v-for="item in hooks.items.value" :key="item.id" class="base-roadmap__hook" :class="{ 'is-off': !item.isEnabled }">
				<div class="base-roadmap__hook-top">
					<span class="base-roadmap__hook-event">{{ item.name }}</span>
					<span class="base-roadmap__hook-arrow" aria-hidden="true">→</span>
					<span class="base-roadmap__hook-fn">{{ hooks.handler(item) }}</span>
					<BaseBadge variant="soft">{{ UI_ROADMAP_EDIT.HOOK_CANCELLABLE }}</BaseBadge>
					<BaseSwitch
						class="base-roadmap__hook-switch"
						:model-value="item.isEnabled"
						:aria-label="hooks.toggleLabel(item)"
						:is-disabled="hooks.isDisabled()"
						@update:model-value="hooks.toggle(item, $event)" />
				</div>
				<span class="base-roadmap__hook-note">{{ hooks.describe(item) }}</span>
				<span class="base-roadmap__hook-note">{{ hooks.calls(item) }}</span>
				<span v-if="hooks.last(item)" class="base-roadmap__hook-note" role="status">{{ hooks.last(item) }}</span>
			</li>
		</ul>
		<p v-else class="base-roadmap__inspector-empty">{{ UI_ROADMAP_EDIT.HOOKS_EMPTY }}</p>
	</div>
</template>

<script setup lang="ts">
import { BaseBadge } from '@components/BaseBadge'
import { BaseSwitch } from '@components/BaseSwitch'
import { UI_ROADMAP_EDIT } from '@/locales/messages'
import { useRoadmapHooksTab } from '../../../model/edit/view/useRoadmapHooksTab'

const hooks = useRoadmapHooksTab()
</script>
