<template>
	<div
		:class="[ui('root'), variantClass, `base-descriptions--${layout}`, classes.root]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<div v-if="title || $slots.title || $slots.extra" :class="[ui('header'), classes.header]">
			<div v-if="title || $slots.title" :class="ui('title')">
				<slot name="title">{{ title }}</slot>
			</div>
			<div v-if="$slots.extra" :class="ui('extra')">
				<slot name="extra" />
			</div>
		</div>
		<dl v-if="items.length" ref="listRef" :class="[ui('list'), classes.list]" :style="listStyle">
			<div v-for="(item, index) in items" :key="item.key" :class="ui('item')" :style="itemStyle(item)">
				<dt :class="ui('label')">
					<slot :name="`label-${item.key}`" :item="item" :index="index">
						<slot name="label" :item="item" :index="index">{{ item.label }}</slot>
					</slot>
				</dt>
				<dd :class="ui('value')">
					<span :class="ui('content')">
						<slot :name="`value-${item.key}`" :item="item" :index="index">
							<slot name="value" :item="item" :index="index">
								<span v-if="isEmptyValue(item.value)" :class="ui('empty-value')">{{ emptyValueText }}</span>
								<template v-else>{{ item.value }}</template>
							</slot>
						</slot>
					</span>
					<BaseButton
						v-if="canCopy(item)"
						variant="ghost"
						:class="ui('copy')"
						:size-scale="sizeScale"
						:padding="4"
						:aria-label="copyLabel(item)"
						@click="copy(item)">
						<Transition name="base-descriptions__copy-icon" mode="out-in">
							<BaseIcon :key="copyIcon(item)" :name="copyIcon(item)" />
						</Transition>
					</BaseButton>
				</dd>
			</div>
		</dl>
		<div v-else :class="ui('empty')">
			<slot name="empty">{{ emptyListText }}</slot>
		</div>
		<span class="base-descriptions__status" role="status">{{ status }}</span>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseDescriptions.style.scss'
import { BaseIcon } from '@components/BaseIcon'
import { BaseButton } from '@components/BaseButton'
import { kitDefaults } from '@composables/base/useDefaults'
import { useBaseDescriptions } from '../model/useBaseDescriptions'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseDescriptionsEmits, BaseDescriptionsProps, BaseDescriptionsSlots } from '../types/BaseDescriptions.types'

const props = withDefaults(
	defineProps<BaseDescriptionsProps>(),
	kitDefaults('BaseDescriptions', {
		variant: DEFAULT_VARIANT,
		items: () => [],
		columns: 3,
		minItemWidth: 240,
		layout: 'horizontal',
		isCopyable: false,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseDescriptionsEmits>()

defineSlots<BaseDescriptionsSlots>()

const {
	ui,
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	listRef,
	listStyle,
	emptyValueText,
	emptyListText,
	status,
	isEmptyValue,
	itemStyle,
	canCopy,
	copyIcon,
	copyLabel,
	copy,
} = useBaseDescriptions(props, emit)
</script>
