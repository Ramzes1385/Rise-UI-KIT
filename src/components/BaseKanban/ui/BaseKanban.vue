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
					:class="[
						classes.column,
						{
							'base-kanban__column--over': view.isOverLimit,
							'base-kanban__column--collapsed': view.isCollapsed,
							'base-kanban__column--colored': Boolean(view.column.color),
						},
					]"
					:style="view.column.color ? { '--kanban-column-color': view.column.color } : undefined"
					:data-column-id="view.column.id">
					<div class="base-kanban__header">
						<span v-if="view.column.color" class="base-kanban__dot" aria-hidden="true" />
						<span class="base-kanban__title">{{ view.column.title }}</span>
						<span class="base-kanban__count" aria-hidden="true">{{ view.count }}</span>
						<button
							v-if="isCollapsible"
							type="button"
							class="base-kanban__toggle"
							:aria-label="collapseLabel(view)"
							:aria-expanded="view.isCollapsed ? 'false' : 'true'"
							@click="toggleColumn(view.column.id)">
							<BaseIcon :name="view.isCollapsed ? 'chevron-right' : 'chevron-left'" />
						</button>
					</div>
					<template v-if="!view.isCollapsed">
						<ul class="base-kanban__list" :aria-label="view.label">
							<li v-for="card in view.cards" :key="card.id" class="base-kanban__item">
								<KanbanTextEditor
									v-if="card.id === renamingId"
									:value="card.title"
									:label="UI_KANBAN.RENAME_LABEL"
									:size-scale="sizeScale"
									@submit="saveRename(card, $event)"
									@cancel="cancelRename(card)"
									@leave="saveRename(card, $event, false)" />
								<div
									v-else
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
									:aria-describedby="cardDescribedBy(card)"
									:aria-pressed="card.id === grabbedId ? 'true' : undefined"
									:aria-disabled="isDisabled ? 'true' : undefined"
									:data-card-id="card.id"
									@pointerdown="handlePointerDown($event, card)"
									@click="handleCardClick(card)"
									@focus="handleCardFocus(card)"
									@keydown="handleCardKeydown($event, card)">
									<slot name="card" :card="card" :is-dragging="card.id === grabbedId || isPlaceholder(card)">
										<KanbanCardContent :card="card" :today="today" :is-done="isDoneColumn(card.columnId)" />
									</slot>
									<span :id="summaryId(card)" class="base-kanban__summary">{{ cardSummary(card) }}</span>
								</div>
							</li>
						</ul>
						<p v-if="view.cards.length === 0 && addingColumnId !== view.column.id" class="base-kanban__empty">
							{{ view.emptyText }}
						</p>
						<template v-if="isEditable && !isDisabled">
							<KanbanTextEditor
								v-if="addingColumnId === view.column.id"
								value=""
								:label="composerLabel(view.column)"
								:submit-label="UI_KANBAN.ADD"
								:size-scale="sizeScale"
								is-repeating
								@submit="addCard(view.column.id, $event)"
								@cancel="closeAdd"
								@leave="leaveAdd" />
							<button v-else type="button" class="base-kanban__add" @click="startAdd(view.column.id)">
								<BaseIcon name="plus" />
								{{ UI_KANBAN.ADD_CARD }}
							</button>
						</template>
						<slot name="column-footer" :column="view.column" :cards="view.cards" />
					</template>
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
						<KanbanCardContent :card="drag.card" :today="today" :is-done="isDoneColumn(drag.card.columnId)" />
					</slot>
				</div>
			</div>
		</Teleport>
		<span :id="hintId" class="base-kanban__hint">{{ isEditable && !isDisabled ? UI_KANBAN.HINT_EDITABLE : UI_KANBAN.HINT }}</span>
		<span class="base-kanban__status" role="status">{{ announcement }}</span>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseKanban.style.scss'
import { UI_KANBAN } from '@/locales/messages'
import { BaseIcon } from '@components/BaseIcon'
import KanbanTextEditor from './KanbanTextEditor.vue'
import { useBaseKanban } from '../model/useBaseKanban'
import KanbanCardContent from './KanbanCardContent.vue'
import { BaseContextMenu } from '@components/BaseContextMenu'
import { SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseKanbanEmits, BaseKanbanProps, BaseKanbanSlots } from '../types/BaseKanban.types'

const props = withDefaults(defineProps<BaseKanbanProps>(), {
	cards: () => [],
	canMove: undefined,
	cardActions: undefined,
	today: undefined,
	isEditable: false,
	filter: undefined,
	isCollapsible: false,
	collapsedColumns: undefined,
	createCardId: undefined,
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
	collapseLabel,
	toggleColumn,
	renamingId,
	saveRename,
	cancelRename,
	addingColumnId,
	composerLabel,
	startAdd,
	addCard,
	closeAdd,
	leaveAdd,
	activeId,
	grabbedId,
	drag,
	ghostStyle,
	hintId,
	today,
	isDoneColumn,
	summaryId,
	cardSummary,
	cardDescribedBy,
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
