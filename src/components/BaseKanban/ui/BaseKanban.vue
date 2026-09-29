<template>
	<div
		ref="rootRef"
		class="base-kanban"
		:class="[variantClass, classes.root, { 'base-kanban--disabled': isDisabled, 'base-kanban--dragging': Boolean(drag) }]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		role="group"
		:aria-label="UI_KANBAN.BOARD">
		<BaseContextMenu :items="menuItems" :is-disabled="isDisabled" :aria-label="UI_KANBAN.MENU" :size-scale="sizeScale">
			<div class="base-kanban__board" @contextmenu="handleBoardContextMenu">
				<div
					v-for="view in columnsView"
					:key="view.column.id"
					class="base-kanban__column"
					:class="[classes.column, { 'base-kanban__column--over': view.isOverLimit }]"
					:data-column-id="view.column.id">
					<div class="base-kanban__header">
						<span class="base-kanban__title">{{ view.column.title }}</span>
						<span class="base-kanban__count" aria-hidden="true">{{ view.count }}</span>
					</div>
					<ul class="base-kanban__list" :aria-label="view.label">
						<li v-for="card in view.cards" :key="card.id" class="base-kanban__item">
							<div
								class="base-kanban__card"
								:class="[
									classes.card,
									{
										'base-kanban__card--grabbed': card.id === grabbedId,
										'base-kanban__card--placeholder': isPlaceholder(card),
									},
								]"
								role="button"
								:tabindex="card.id === activeId ? 0 : -1"
								:aria-label="card.title"
								:aria-describedby="hintId"
								:aria-pressed="card.id === grabbedId ? 'true' : undefined"
								:aria-disabled="isDisabled ? 'true' : undefined"
								:data-card-id="card.id"
								@pointerdown="handlePointerDown($event, card)"
								@click="handleCardClick(card)"
								@focus="handleCardFocus(card)"
								@keydown="handleCardKeydown($event, card)">
								<slot name="card" :card="card" :is-dragging="card.id === grabbedId || isPlaceholder(card)">
									<KanbanCardContent :card="card" />
								</slot>
							</div>
						</li>
					</ul>
					<p v-if="view.cards.length === 0" class="base-kanban__empty">{{ UI_KANBAN.EMPTY }}</p>
					<slot name="column-footer" :column="view.column" :cards="view.cards" />
				</div>
			</div>
		</BaseContextMenu>
		<Teleport defer :to="teleportTarget">
			<div
				v-if="drag"
				ref="ghostRef"
				class="base-kanban__ghost"
				:style="[sizeScaleStyle, ghostStyle]"
				:data-theme="inheritedTheme"
				aria-hidden="true">
				<div class="base-kanban__ghost-card" :class="classes.card">
					<slot name="card" :card="drag.card" :is-dragging="true">
						<KanbanCardContent :card="drag.card" />
					</slot>
				</div>
			</div>
		</Teleport>
		<span :id="hintId" class="base-kanban__hint">{{ UI_KANBAN.HINT }}</span>
		<span class="base-kanban__status" role="status">{{ announcement }}</span>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseKanban.style.scss'
import { UI_KANBAN } from '@/locales/messages'
import { useBaseKanban } from '../model/useBaseKanban'
import KanbanCardContent from './KanbanCardContent.vue'
import { BaseContextMenu } from '@components/BaseContextMenu'
import { SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseKanbanEmits, BaseKanbanProps, BaseKanbanSlots } from '../types/BaseKanban.types'

const props = withDefaults(defineProps<BaseKanbanProps>(), {
	cards: () => [],
	canMove: undefined,
	cardActions: undefined,
	isDisabled: false,
	sizeScale: SIZE_SCALE_DEFAULT,
})

const emit = defineEmits<BaseKanbanEmits>()

defineSlots<BaseKanbanSlots>()

const {
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	rootRef,
	ghostRef,
	columnsView,
	activeId,
	grabbedId,
	drag,
	ghostStyle,
	hintId,
	announcement,
	menuItems,
	teleportTarget,
	inheritedTheme,
	isPlaceholder,
	handleBoardContextMenu,
	handlePointerDown,
	handleCardClick,
	handleCardFocus,
	handleCardKeydown,
} = useBaseKanban(props, emit)
</script>
