<template>
	<BaseDrawer
		v-if="isCompact"
		:ui="{ panel: 'base-flow-map__sheet' }"
		direction="bottom"
		:is-open="isSheetOpen"
		:title="labels.title"
		has-handle
		is-draggable
		:has-overlay="false"
		close-on-escape
		@update:is-open="onSheetChange">
		<FlowDetailsBody v-if="view" :view="view" :labels="labels" />
	</BaseDrawer>
	<section v-else-if="view" class="base-flow-map__details" :aria-label="labels.title" @keydown="onKeydown">
		<FlowDetailsBody :view="view" :labels="labels" has-close @close="close" />
	</section>
</template>

<script setup lang="ts">
import FlowDetailsBody from './FlowDetailsBody.vue'
import { BaseDrawer } from '@components/BaseDrawer'
import { useFlowDetails } from '../../model/panels/useFlowDetails'

const { view, isCompact, isSheetOpen, labels, close, onKeydown, onSheetChange } = useFlowDetails()
</script>
