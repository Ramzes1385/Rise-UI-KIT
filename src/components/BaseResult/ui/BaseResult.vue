<template>
	<div
		:class="[ui('root'), `base-result--${resultRole}`, variantClass, classes.root]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		:role="liveRole">
		<div :class="[ui('icon-wrapper'), classes.iconWrapper]">
			<slot name="icon">
				<BaseText
					v-if="isCode"
					tag="span"
					aria-hidden="true"
					:size-scale="sizeScale"
					:class="ui('code')"
					:custom-class="classes.code">
					{{ status }}
				</BaseText>
				<BaseIcon v-else :name="resultIcon" :size-scale="calcIconScale('lg', sizeScale)" :custom-class="classes.icon" />
			</slot>
		</div>

		<div :class="[ui('content'), classes.content]">
			<BaseText
				:tag="titleTag"
				:weight="TEXT_WEIGHT.SEMIBOLD"
				:size-scale="sizeScale"
				:class="ui('title')"
				:custom-class="classes.title">
				<slot name="title">{{ resultTitle }}</slot>
			</BaseText>

			<BaseText
				v-if="resultDescription || $slots.description"
				tag="p"
				:size-scale="sizeScale"
				:class="ui('description')"
				:custom-class="classes.description">
				<slot name="description">{{ resultDescription }}</slot>
			</BaseText>
		</div>

		<div v-if="$slots.default" :class="[ui('body'), classes.body]">
			<slot />
		</div>

		<div v-if="$slots.extra" :class="[ui('extra'), classes.extra]">
			<slot name="extra" />
		</div>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseResult.style.scss'
import { BaseIcon } from '@components/BaseIcon'
import { useBaseResult } from '../model/useBaseResult'
import { calcIconScale } from '@utils/media/iconUtils'
import { kitDefaults } from '@composables/base/useDefaults'
import { BaseText, TEXT_WEIGHT } from '@components/BaseText'
import type { BaseResultProps, BaseResultSlots } from '../types/BaseResult.types'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'

const props = withDefaults(
	defineProps<BaseResultProps>(),
	kitDefaults('BaseResult', {
		variant: DEFAULT_VARIANT,
		status: 'info',
		titleTag: 'h2',
		isLive: false,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

defineSlots<BaseResultSlots>()

const {
	ui,
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	resultRole,
	liveRole,
	isCode,
	resultIcon,
	resultTitle,
	resultDescription,
} = useBaseResult(props)
</script>
