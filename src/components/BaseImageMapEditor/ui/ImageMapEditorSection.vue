<template>
	<section :class="ui('section')">
		<h3 :class="ui('heading')">
			<button
				v-if="isCollapsible"
				type="button"
				:class="[ui('toggle'), { 'base-image-map-editor__toggle--open': isOpen }]"
				:aria-expanded="isOpen"
				:aria-controls="isOpen ? bodyId : undefined"
				@click="toggle">
				<span class="base-image-map-editor__toggle-title">{{ title }}</span>
				<BaseIcon name="chevron-down" class="base-image-map-editor__toggle-icon" />
			</button>
			<template v-else>{{ title }}</template>
		</h3>
		<Transition :css="false" v-bind="hooks">
			<div v-if="isOpen" :id="bodyId" class="base-image-map-editor__section-body">
				<slot />
			</div>
		</Transition>
	</section>
</template>

<script setup lang="ts">
import { BaseIcon } from '@components/BaseIcon'
import { useEditorSection } from '../model/layout/useEditorSection'
import type { ImageMapEditorSectionProps } from '../types/ImageMapEditorLayout.types'

const props = defineProps<ImageMapEditorSectionProps>()

const { bodyId, isOpen, isCollapsible, hooks, toggle } = useEditorSection(props)
</script>
