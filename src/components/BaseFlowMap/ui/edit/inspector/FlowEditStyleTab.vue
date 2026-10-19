<template>
	<div class="base-flow-map__edit-inspector" role="tabpanel">
		<div class="base-flow-map__edit-field">
			<span class="base-flow-map__edit-caption">{{ style.text.color }}</span>
			<div class="base-flow-map__edit-row">
				<button
					v-for="color in style.colors.value"
					:key="color.value"
					type="button"
					class="base-flow-map__edit-swatch"
					:style="{ background: color.value || 'transparent' }"
					:aria-label="color.name"
					:aria-pressed="color.isOn"
					@click="style.setColor(color.value)" />
			</div>
		</div>
		<BaseSegmented
			:model-value="style.appearance.value"
			:label="style.text.appearance"
			:options="style.appearances"
			@update:model-value="style.setAppearance" />
		<div class="base-flow-map__edit-field">
			<span class="base-flow-map__edit-caption">{{ style.text.icon }}</span>
			<div class="base-flow-map__edit-row">
				<BaseButton
					v-for="icon in style.icons"
					:key="icon.name"
					variant="ghost"
					:aria-label="icon.name"
					:aria-pressed="icon.isOn()"
					@click="style.setIcon(icon.name)">
					<BaseIcon :name="icon.name" />
				</BaseButton>
			</div>
		</div>
		<BaseSelect
			:model-value="style.modelValue.value"
			:label="style.text.model"
			:options="style.models.value"
			@change="style.setModel" />
		<BaseInput v-if="style.isCustom.value" :model-value="style.url.value" :label="style.text.url" @update:model-value="style.setUrl" />
		<p class="base-flow-map__edit-hint">{{ style.text.hint }}</p>
	</div>
</template>

<script setup lang="ts">
import { BaseIcon } from '@components/BaseIcon'
import { BaseInput } from '@components/BaseInput'
import { BaseButton } from '@components/BaseButton'
import { BaseSelect } from '@components/BaseSelect'
import { BaseSegmented } from '@components/BaseSegmented'
import { useFlowEditStyle } from '../../../model/edit/inspector/useFlowEditStyle'

const props = defineProps<{ id: string }>()

const style = useFlowEditStyle(props)
</script>
