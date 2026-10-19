<template>
	<BaseContextMenu :ref="menu.attach" class="base-flow-map__edit-anchor" :items="menu.items.value" :aria-label="menu.ariaLabel" />
</template>

<script setup lang="ts">
import { BaseContextMenu } from '@components/BaseContextMenu'
import { useFlowEditMenu } from '../../../model/edit/overlay/useFlowEditMenu'

const menu = useFlowEditMenu()
</script>
