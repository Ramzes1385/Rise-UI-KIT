<template>
	<BaseSearch
		v-model="chrome.query"
		class="base-flow-map__search"
		:placeholder="UI_FLOW_MAP.SEARCH"
		:results="chrome.results"
		is-instant
		@select="chrome.choose(String($event.id))" />
</template>

<script setup lang="ts">
import { UI_FLOW_MAP } from '@/locales/messages'
import { BaseSearch } from '@components/BaseSearch'
import { useFlowChromeContext } from '../../model/context/flowContext'

const chrome = useFlowChromeContext()
</script>
