<template>
	<div v-if="pending.isPending.value" class="base-flow-map__edit-pending" :style="pending.style.value">
		<BaseLoader :label="pending.label" />
	</div>
</template>

<script setup lang="ts">
import { BaseLoader } from '@components/BaseLoader'
import { useFlowEditPending } from '../../../model/edit/overlay/useFlowEditPending'

const pending = useFlowEditPending()
</script>
