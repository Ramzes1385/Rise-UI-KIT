<template>
	<div v-if="overlay.isActive.value && !overlay.isCompact.value" class="base-flow-map__edit-overlay">
		<FlowEditLabel />
		<FlowEditPending />
		<FlowEditConnect />
		<FlowEditMenu />
		<FlowEditNotices />
	</div>
</template>

<script setup lang="ts">
import FlowEditMenu from './overlay/FlowEditMenu.vue'
import FlowEditLabel from './overlay/FlowEditLabel.vue'
import FlowEditConnect from './overlay/FlowEditConnect.vue'
import FlowEditNotices from './overlay/FlowEditNotices.vue'
import FlowEditPending from './overlay/FlowEditPending.vue'
import { useFlowEditOverlay } from '../../model/edit/overlay/useFlowEditOverlay'

const overlay = useFlowEditOverlay()
</script>
