<template>
	<div class="base-flow-map__edit-inspector" role="tabpanel">
		<p class="base-flow-map__edit-hint">{{ hooks.intro }}</p>
		<ul class="base-flow-map__edit-hooks">
			<li v-for="item in hooks.items.value" :key="item.id" class="base-flow-map__edit-hook">
				<strong>{{ item.name }} <BaseBadge v-if="item.isCancellable" :label="hooks.cancellable" variant="soft" /></strong>
				<span>{{ hooks.handler(item) }} · {{ hooks.calls(item) }}</span>
				<span v-if="hooks.last(item)">{{ hooks.last(item) }}</span>
				<BaseSwitch
					:model-value="item.isEnabled"
					:aria-label="hooks.toggleLabel(item)"
					@update:model-value="hooks.toggle(item, $event)" />
			</li>
		</ul>
		<p v-if="hooks.items.value.length === 0" class="base-flow-map__edit-hint">{{ hooks.empty }}</p>
	</div>
</template>

<script setup lang="ts">
import { BaseBadge } from '@components/BaseBadge'
import { BaseSwitch } from '@components/BaseSwitch'
import { useFlowEditHooks } from '../../../model/edit/inspector/useFlowEditHooks'

const hooks = useFlowEditHooks()
</script>
