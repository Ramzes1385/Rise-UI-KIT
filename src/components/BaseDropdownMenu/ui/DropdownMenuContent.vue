<template>
	<!--
		Меню по образцу APG Menu: фокус переходит по пунктам стрелками (roving tabindex: tabindex="0" только у текущего
		пункта), Home/End — первый и последний, буквы — поиск по началу подписи, Enter/Space — выбор, стрелка вправо —
		подменю, влево — назад. Escape закрывает верхнее меню через стек слоёв.
	-->
	<div
		:id="id"
		ref="menuRef"
		class="base-dropdown-menu__content"
		role="menu"
		tabindex="-1"
		aria-orientation="vertical"
		:aria-labelledby="labelledBy"
		:aria-label="labelledBy ? undefined : ariaLabel"
		@keydown="handleKeydown"
		@contextmenu.prevent
		@pointerenter="emit('pointerenter')">
		<template v-for="(group, groupIndex) in groups" :key="groupIndex">
			<div v-if="groupIndex > 0" class="base-dropdown-menu__separator" :class="classes.separator" role="separator" />
			<div class="base-dropdown-menu__group" role="group" :aria-labelledby="groupLabelId(group, groupIndex)">
				<template v-for="(item, itemIndex) in group" :key="itemIndex">
					<div
						v-if="item.type === 'separator'"
						class="base-dropdown-menu__separator"
						:class="classes.separator"
						role="separator" />
					<div
						v-else-if="item.type === 'label'"
						:id="labelId(groupIndex, itemIndex)"
						class="base-dropdown-menu__label"
						:class="classes.label">
						{{ item.label }}
					</div>
					<!-- Пункт с подменю: подменю — вложенная панель, в стеке слоёв она выше меню -->
					<BaseDropdown
						v-else-if="item.children?.length"
						:is-open="openSubmenu === keyOf(groupIndex, itemIndex)"
						position="right-start"
						:gap="4"
						:variant="variant"
						:size-scale="sizeScale"
						:prevent-mousedown="false"
						panel-class="base-dropdown-menu__panel"
						:custom-class="{ root: 'base-dropdown-menu__submenu', panel: classes.panel }"
						@update:is-open="handleSubmenuUpdate">
						<div
							:id="itemId(groupIndex, itemIndex)"
							:ref="element => registerItem(keyOf(groupIndex, itemIndex), element)"
							class="base-dropdown-menu__item"
							:class="itemClasses(item)"
							role="menuitem"
							:tabindex="tabIndexOf(keyOf(groupIndex, itemIndex))"
							aria-haspopup="menu"
							:aria-expanded="openSubmenu === keyOf(groupIndex, itemIndex) ? 'true' : 'false'"
							:aria-disabled="item.isDisabled || undefined"
							@click="handleSubmenuClick(item, keyOf(groupIndex, itemIndex))"
							@focus="activeKey = keyOf(groupIndex, itemIndex)"
							@pointermove="handlePointerMove(item, keyOf(groupIndex, itemIndex), $event)">
							<span v-if="hasIndicators" class="base-dropdown-menu__indicator" aria-hidden="true" />
							<BaseIcon v-if="item.icon" class="base-dropdown-menu__icon" :name="item.icon" :size-scale="iconScale" />
							<span class="base-dropdown-menu__item-label">{{ item.label }}</span>
							<BaseIcon class="base-dropdown-menu__submenu-arrow" name="chevron-right" :size-scale="iconScale" />
						</div>
						<template #dropdown>
							<DropdownMenuContent
								:ref="content => registerSubmenu(keyOf(groupIndex, itemIndex), content)"
								:items="item.children"
								:labelled-by="itemId(groupIndex, itemIndex)"
								:variant="variant"
								:size-scale="sizeScale"
								:classes="classes"
								:level="level + 1"
								@select="handleNestedSelect"
								@back="closeSubmenu(true)"
								@pointerenter="clearPointerTimer" />
						</template>
					</BaseDropdown>
					<component
						:is="isLink(item) ? BaseLink : 'div'"
						v-else
						:id="itemId(groupIndex, itemIndex)"
						:ref="(element: unknown) => registerItem(keyOf(groupIndex, itemIndex), element)"
						v-bind="linkProps(item)"
						class="base-dropdown-menu__item"
						:class="itemClasses(item)"
						:role="itemRole(item)"
						:tabindex="tabIndexOf(keyOf(groupIndex, itemIndex))"
						:aria-checked="isCheckable(item) ? String(Boolean(item.isChecked)) : undefined"
						:aria-disabled="item.isDisabled || undefined"
						@click="handleItemClick(item, $event)"
						@focus="activeKey = keyOf(groupIndex, itemIndex)"
						@pointermove="handlePointerMove(item, keyOf(groupIndex, itemIndex), $event)">
						<span v-if="hasIndicators" class="base-dropdown-menu__indicator" aria-hidden="true">
							<BaseIcon v-if="item.type === 'checkbox' && item.isChecked" name="check" :size-scale="iconScale" />
							<span v-else-if="item.type === 'radio' && item.isChecked" class="base-dropdown-menu__dot" />
						</span>
						<BaseIcon v-if="item.icon" class="base-dropdown-menu__icon" :name="item.icon" :size-scale="iconScale" />
						<span class="base-dropdown-menu__item-label">{{ item.label }}</span>
						<span v-if="item.shortcut" class="base-dropdown-menu__shortcut" aria-hidden="true">{{ item.shortcut }}</span>
					</component>
				</template>
			</div>
		</template>
	</div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, useId } from 'vue'
import { BaseIcon } from '@components/BaseIcon'
import { BaseLink } from '@components/BaseLink'
import { calcIconScale } from '@utils/iconUtils'
import { BaseDropdown } from '@components/BaseDropdown'
import { SIZE_SCALE_DEFAULT } from '@composables/useBaseComponent'
import { findTypeaheadIndex, toMenuGroups } from '@utils/menuUtils'
import type { DropdownMenuItem, DropdownMenuItems, DropdownMenuVariant } from '../types/BaseDropdownMenu.types'

defineOptions({ name: 'DropdownMenuContent' })

const props = withDefaults(
	defineProps<{
		/** Пункты меню */
		items: DropdownMenuItems
		/** id меню (для aria-controls кнопки) */
		id?: string
		/** id элемента с именем меню: кнопка или пункт с подменю */
		labelledBy?: string
		/** Имя меню, если нет labelledBy */
		ariaLabel?: string
		variant?: DropdownMenuVariant
		sizeScale?: number
		/** Классы частей из customClass компонента */
		classes?: Partial<Record<'panel' | 'item' | 'label' | 'separator', string>>
		/** Уровень вложенности: 0 — меню, 1 и глубже — подменю */
		level?: number
	}>(),
	{
		id: undefined,
		labelledBy: undefined,
		ariaLabel: undefined,
		variant: 'default',
		sizeScale: SIZE_SCALE_DEFAULT,
		classes: () => ({}),
		level: 0,
	},
)

const emit = defineEmits<{
	/** Выбор пункта; `shouldClose` — закрыть меню (обычный пункт, Enter на флажке) */
	(event: 'select', item: DropdownMenuItem, e: Event, shouldClose: boolean): void
	/** Стрелка влево в подменю: вернуться к пункту меню */
	(event: 'back'): void
	/** Указатель вошёл в меню: подменю не должно закрываться по таймеру родителя */
	(event: 'pointerenter'): void
}>()

/** Задержка открытия подменю и переключения между подменю при наведении, мс */
const SUBMENU_HOVER_DELAY = 120
/** Пауза, после которой набранные буквы сбрасываются, мс */
const TYPEAHEAD_RESET = 500

const baseId = useId()
const menuRef = ref<HTMLElement | null>(null)
const groups = computed(() => toMenuGroups(props.items))
const iconScale = computed(() => calcIconScale('sm', props.sizeScale))
/** Колонка отметок нужна, если в меню есть флажок или переключатель: подписи пунктов выравниваются */
const hasIndicators = computed(() => groups.value.some(group => group.some(isCheckable)))

const openSubmenu = ref<string | null>(null)
/** Пункт с tabindex="0" (roving tabindex): последний с фокусом, иначе первый доступный. Остальные — -1 */
const activeKey = ref<string | null>(null)
const itemElements = new Map<string, HTMLElement>()
const submenuContents = new Map<string, { focusFirst: () => void }>()
let pointerTimer: ReturnType<typeof setTimeout> | null = null
let typeahead = ''
let typeaheadTimer: ReturnType<typeof setTimeout> | null = null
/** Клавиша, которой пункт выбран: Enter закрывает меню и на флажке, Space и клик — нет */
let activationKey: string | null = null

function keyOf(groupIndex: number, itemIndex: number): string {
	return `${groupIndex}-${itemIndex}`
}

function itemId(groupIndex: number, itemIndex: number): string {
	return `${baseId}-item-${keyOf(groupIndex, itemIndex)}`
}

function labelId(groupIndex: number, itemIndex: number): string {
	return `${baseId}-label-${keyOf(groupIndex, itemIndex)}`
}

/** Группа называется подписью, если подпись идёт первой */
function groupLabelId(group: DropdownMenuItem[], groupIndex: number): string | undefined {
	return group[0]?.type === 'label' ? labelId(groupIndex, 0) : undefined
}

function isCheckable(item: DropdownMenuItem): boolean {
	return item.type === 'checkbox' || item.type === 'radio'
}

function isLink(item: DropdownMenuItem): boolean {
	return Boolean(item.to || item.href)
}

function itemRole(item: DropdownMenuItem): string {
	if (item.type === 'checkbox') return 'menuitemcheckbox'
	if (item.type === 'radio') return 'menuitemradio'
	return 'menuitem'
}

function itemClasses(item: DropdownMenuItem): (string | Record<string, boolean | undefined>)[] {
	return [
		{ 'base-dropdown-menu__item--disabled': item.isDisabled, 'base-dropdown-menu__item--danger': item.isDanger },
		props.classes.item ?? '',
	]
}

/** Props ссылки: BaseLink рендерит RouterLink приложения или `<a href>` */
function linkProps(item: DropdownMenuItem): Record<string, unknown> {
	if (!isLink(item)) return {}
	return { to: item.to, href: item.href, target: item.target, variant: 'ghost', isDisabled: item.isDisabled, sizeScale: props.sizeScale }
}

/** Элемент пункта: div или корень BaseLink */
function registerItem(key: string, element: unknown): void {
	const node = element && typeof element === 'object' && '$el' in element ? (element as { $el: unknown }).$el : element
	if (node instanceof HTMLElement) itemElements.set(key, node)
	else itemElements.delete(key)
}

function registerSubmenu(key: string, content: unknown): void {
	if (content) submenuContents.set(key, content as { focusFirst: () => void })
	else submenuContents.delete(key)
}

/** Пункты, по которым ходят стрелки: без подписей, разделителей и недоступных */
const navigable = computed(() =>
	groups.value.flatMap((group, groupIndex) =>
		group
			.map((item, itemIndex) => ({ item, key: keyOf(groupIndex, itemIndex) }))
			.filter(({ item }) => item.type !== 'label' && item.type !== 'separator' && !item.isDisabled),
	),
)

function tabIndexOf(key: string): number {
	return key === (activeKey.value ?? navigable.value[0]?.key) ? 0 : -1
}

function currentIndex(): number {
	return navigable.value.findIndex(({ key }) => itemElements.get(key) === document.activeElement)
}

function focusAt(index: number): void {
	const entry = navigable.value[index]
	if (entry) itemElements.get(entry.key)?.focus()
}

/** Первый пункт — при открытии с клавиатуры (Enter, Space, стрелка вниз) */
function focusFirst(): void {
	focusAt(0)
}

/** Последний пункт — при открытии стрелкой вверх */
function focusLast(): void {
	focusAt(navigable.value.length - 1)
}

/** Само меню — при открытии мышью: стрелки начнут с первого пункта */
function focusMenu(): void {
	menuRef.value?.focus()
}

function clearPointerTimer(): void {
	if (pointerTimer) clearTimeout(pointerTimer)
	pointerTimer = null
}

async function openSubmenuAt(key: string, shouldFocus: boolean): Promise<void> {
	clearPointerTimer()
	openSubmenu.value = key
	if (!shouldFocus) return
	await nextTick()
	submenuContents.get(key)?.focusFirst()
}

/** Закрыть подменю; `focusParent` — вернуть фокус на его пункт (стрелка влево) */
function closeSubmenu(focusParent: boolean): void {
	const key = openSubmenu.value
	openSubmenu.value = null
	if (focusParent && key) itemElements.get(key)?.focus()
}

/** Подменю закрылось само: Escape или нажатие вне */
function handleSubmenuUpdate(isOpen: boolean): void {
	if (!isOpen) closeSubmenu(false)
}

function handleSubmenuClick(item: DropdownMenuItem, key: string): void {
	const byKeyboard = activationKey !== null
	activationKey = null
	if (item.isDisabled) return
	if (openSubmenu.value === key && !byKeyboard) closeSubmenu(false)
	else void openSubmenuAt(key, byKeyboard)
}

function handleItemClick(item: DropdownMenuItem, event: Event): void {
	const key = activationKey
	activationKey = null
	if (item.isDisabled) {
		event.preventDefault()
		return
	}
	if (item.type === 'checkbox') item.onUpdateChecked?.(!item.isChecked)
	else if (item.type === 'radio' && !item.isChecked) item.onUpdateChecked?.(true)
	item.onSelect?.(event)
	emit('select', item, event, !isCheckable(item) || key === 'Enter')
}

function handleNestedSelect(item: DropdownMenuItem, event: Event, shouldClose: boolean): void {
	if (shouldClose) closeSubmenu(false)
	emit('select', item, event, shouldClose)
}

/** Наведение мышью: пункт получает фокус (стрелки продолжат от него), подменю открывается с задержкой */
function handlePointerMove(item: DropdownMenuItem, key: string, event: PointerEvent): void {
	if (event.pointerType && event.pointerType !== 'mouse') return
	const element = itemElements.get(key)
	if (!item.isDisabled && element && document.activeElement !== element) element.focus({ preventScroll: true })

	const target = item.children?.length && !item.isDisabled ? key : null
	if (target === openSubmenu.value) {
		clearPointerTimer()
		return
	}
	clearPointerTimer()
	pointerTimer = setTimeout(() => {
		pointerTimer = null
		if (target) void openSubmenuAt(target, false)
		else closeSubmenu(false)
	}, SUBMENU_HOVER_DELAY)
}

/** Откуда отсчитывать сдвиг: от пункта в фокусе или, если его нет, из-за края списка */
function focusOrigin(offset: number, count: number): number {
	const index = currentIndex()
	if (index !== -1) return index
	return offset > 0 ? -1 : count
}

function moveFocus(offset: number): void {
	const count = navigable.value.length
	if (!count) return
	focusAt((focusOrigin(offset, count) + offset + count) % count)
}

function handleTypeahead(char: string): void {
	typeahead += char
	if (typeaheadTimer) clearTimeout(typeaheadTimer)
	typeaheadTimer = setTimeout(() => {
		typeahead = ''
		typeaheadTimer = null
	}, TYPEAHEAD_RESET)
	const labels = navigable.value.map(({ item }) => item.label ?? '')
	const index = findTypeaheadIndex(labels, typeahead, currentIndex())
	if (index !== -1) focusAt(index)
}

function activateCurrent(key: string): void {
	const entry = navigable.value[currentIndex()]
	if (!entry) return
	activationKey = key
	itemElements.get(entry.key)?.click()
	activationKey = null
}

function handleKeydown(event: KeyboardEvent): void {
	// Клавиши из поля ввода внутри пункта — не для меню
	if (event.defaultPrevented) return
	const entry = navigable.value[currentIndex()]

	switch (event.key) {
		case 'ArrowDown':
			moveFocus(1)
			break
		case 'ArrowUp':
			moveFocus(-1)
			break
		case 'Home':
		case 'PageUp':
			focusFirst()
			break
		case 'End':
		case 'PageDown':
			focusLast()
			break
		case 'ArrowRight':
			if (!entry?.item.children?.length) return
			void openSubmenuAt(entry.key, true)
			break
		case 'ArrowLeft':
			if (props.level === 0) return
			emit('back')
			break
		case 'Enter':
			activateCurrent('Enter')
			break
		case ' ':
			// Пробел внутри набираемого слова — часть поиска, иначе — выбор пункта
			if (typeahead) handleTypeahead(' ')
			else activateCurrent(' ')
			break
		case 'Tab':
			// Меню не входит в порядок Tab: фокус остаётся в меню до выбора или Escape
			break
		default:
			if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) return
			handleTypeahead(event.key)
	}
	event.preventDefault()
}

onBeforeUnmount(() => {
	clearPointerTimer()
	if (typeaheadTimer) clearTimeout(typeaheadTimer)
})

defineExpose({ focusFirst, focusLast, focusMenu })
</script>
