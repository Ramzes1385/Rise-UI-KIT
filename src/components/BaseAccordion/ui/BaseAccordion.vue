<template>
	<div
		class="base-accordion"
		:class="[variantClass, classes.root]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<div
			v-for="(item, index) in items"
			:key="index"
			class="base-accordion__item"
			:class="[
				{
					'base-accordion__item--open': isOpen(index),
					'base-accordion__item--disabled': item.isDisabled,
				},
				classes.item,
			]">
			<div
				:id="getHeaderId(index)"
				class="base-accordion__header"
				:class="classes.header"
				role="button"
				tabindex="0"
				:aria-expanded="isOpen(index)"
				:aria-controls="getPanelId(index)"
				:aria-disabled="item.isDisabled || undefined"
				@click="toggleItem(index)"
				@keydown.enter.prevent="toggleItem(index)"
				@keydown.space.prevent="toggleItem(index)">
				<BaseIcon
					v-if="item.icon"
					:name="item.icon"
					:size-scale="calcIconScale('sm', sizeScale)"
					class="base-accordion__icon"
					:custom-class="classes.icon" />
				<span class="base-accordion__label" :class="classes.label">{{ item.label }}</span>
				<span class="base-accordion__arrow" :class="classes.arrow">
					<BaseIcon
						name="chevron-down"
						:size-scale="calcIconScale('md', sizeScale)"
						:custom-class="classes.arrowIcon" />
				</span>
			</div>

			<!--
				Закрытая панель схлопнута только визуально (grid 0fr + opacity), поэтому inert убирает её из фокуса
				и дерева доступности; атрибуты меняются сразу и не мешают CSS-анимации.
				undefined вместо false: там, где у элемента нет DOM-свойства inert, Vue записал бы атрибут inert="false".
			-->
			<div
				:id="getPanelId(index)"
				class="base-accordion__collapse"
				:class="[{ 'base-accordion__collapse--open': isOpen(index) }, classes.collapse]"
				role="region"
				:aria-labelledby="getHeaderId(index)"
				:aria-hidden="isOpen(index) ? undefined : true"
				:inert="isOpen(index) ? undefined : true">
				<div class="base-accordion__content" :class="classes.content">
					<slot :name="item.slot || 'default'" :item="item">
						<p class="base-accordion__text" :class="classes.contentText">{{ item.content }}</p>
					</slot>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { onMounted, ref, useId } from 'vue'
import { BaseIcon } from '@components/BaseIcon'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import { kitDefaults } from '@composables/useDefaults'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@constants'
import { calcIconScale } from '@utils/iconUtils'
import '../styles/BaseAccordion.style.scss'
import type { BaseAccordionEmits, BaseAccordionProps, BaseAccordionSlots } from '../model/BaseAccordion.types'

const props = withDefaults(defineProps<BaseAccordionProps>(), kitDefaults('BaseAccordion', {
	variant: DEFAULT_VARIANT,
	isMultiple: false,
	sizeScale: SIZE_SCALE_DEFAULT,
}))

const emit = defineEmits<BaseAccordionEmits>()
defineSlots<BaseAccordionSlots>()

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useStandardBaseComponent('base-accordion', props, ['root', 'item', 'header', 'icon', 'label', 'arrow', 'arrowIcon', 'collapse', 'content', 'contentText'])

const openIndexes = ref<number[]>([])

/** Префикс id экземпляра: связывает заголовок и панель через aria-controls/aria-labelledby без коллизий между аккордеонами */
const baseId = useId()

function getHeaderId(index: number): string {
	return `${baseId}-header-${index}`
}

function getPanelId(index: number): string {
	return `${baseId}-panel-${index}`
}

function isOpen(index: number): boolean {
	return openIndexes.value.includes(index)
}

onMounted(() => {
	props.items.forEach((item, index) => {
		if (item.defaultOpen) {
			openIndexes.value.push(index)
		}
	})
})

function toggleItem(index: number): void {
	if (props.items[index].isDisabled) return

	const pos = openIndexes.value.indexOf(index)
	if (pos > -1) {
		openIndexes.value.splice(pos, 1)
		emit('toggle', index, false)
	} else {
		if (props.isMultiple) {
			openIndexes.value.push(index)
		} else {
			openIndexes.value = [index]
		}
		emit('toggle', index, true)
	}
}
</script>
