<template>
	<div ref="bodyRef" :tabindex="isScrollable ? 0 : undefined">
		<slot />
	</div>
</template>

<script setup lang="ts">
import { useDashboardGridBody } from '../model/useDashboardGridBody'

const { bodyRef, isScrollable } = useDashboardGridBody()
</script>
