<template>
	<aside v-if="palette.isVisible.value" class="base-flow-map__edit-palette" :aria-label="palette.title">
		<BaseInput
			v-model="palette.query.value"
			type="search"
			icon="search"
			:aria-label="palette.searchLabel"
			:placeholder="palette.searchLabel" />
		<section v-for="group in palette.groups.value" :key="group.id">
			<h3 class="base-flow-map__edit-caption">{{ group.title }}</h3>
			<div class="base-flow-map__edit-grid">
				<button
					v-for="item in group.items"
					:key="item.id"
					type="button"
					class="base-flow-map__edit-item"
					draggable="true"
					:aria-label="item.aria"
					@click="palette.add(item.id)"
					@dblclick="palette.place(item.id)"
					@dragstart="palette.drag(item.id, $event)">
					<BaseIcon v-if="item.icon" :name="item.icon" />
					<span>{{ item.label }}</span>
				</button>
			</div>
		</section>
		<p v-if="palette.groups.value.length === 0" class="base-flow-map__edit-hint">{{ palette.empty }}</p>
		<p class="base-flow-map__edit-hint">{{ palette.hint }}</p>
	</aside>
</template>

<script setup lang="ts">
import { BaseIcon } from '@components/BaseIcon'
import { BaseInput } from '@components/BaseInput'
import { useFlowEditPalette } from '../../model/edit/palette/useFlowEditPalette'

const palette = useFlowEditPalette()
</script>
