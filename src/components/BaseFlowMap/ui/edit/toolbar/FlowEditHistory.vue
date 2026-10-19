<template>
	<ol class="base-flow-map__edit-history" :aria-label="history.title">
		<li v-for="item in history.items.value" :key="item.key" :data-undone="item.isUndone">
			{{ item.label }} · {{ item.time }}<template v-if="item.isUndone"> · {{ history.undone }}</template>
		</li>
		<li v-if="history.items.value.length === 0">{{ history.empty }}</li>
	</ol>
</template>

<script setup lang="ts">
import { useFlowEditHistory } from '../../../model/edit/toolbar/useFlowEditHistory'

const history = useFlowEditHistory()
</script>
