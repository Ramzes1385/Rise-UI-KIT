<template>
	<div ref="paneRef" :tabindex="isScrollable ? 0 : undefined">
		<slot />
	</div>
</template>

<script setup lang="ts">
import { useBaseSplitterPane } from '../model/useBaseSplitterPane'
import type { BaseSplitterPaneSlots } from '../types/BaseSplitterPane.types'

defineSlots<BaseSplitterPaneSlots>()

const { paneRef, isScrollable } = useBaseSplitterPane()
</script>
