/** Composable: логика BaseMegaMenu — раскрытие колонок и пунктов по клику или наведению, переходы */
import { computed, ref } from 'vue'
import { calcIconScale } from '@utils/iconUtils'
import { navigateAndEmit } from '@utils/navigationUtils'
import { useBreakpoint } from '@composables/useBreakpoint'
import { useMegaMenuTreeProvider } from '@composables/useMegaMenuTree'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import { useHoverTimer } from './useHoverTimer'
import type { BaseMegaMenuEmits, MegaMenuItem, MegaMenuProps } from '../types/BaseMegaMenu.types'

const MEGA_MENU_ELEMENTS = ['root', 'container', 'column', 'title', 'list', 'nav', 'navItem', 'navLink', 'dropdown']

function hasChildren(item: MegaMenuItem): boolean {
	return Boolean(item.children && item.children.length > 0)
}

/** Общее для колонок и пунктов: режим наведения, мобильный экран и таймер закрытия */
function useMenuContext(props: MegaMenuProps) {
	const { isMobile } = useBreakpoint()
	// На мобильном hover недоступен — раскрытие всегда по клику
	const effectiveTrigger = computed(() => (isMobile.value ? 'click' : props.trigger))
	return { isMobile, effectiveTrigger, isHover: (): boolean => effectiveTrigger.value === 'hover', timer: useHoverTimer() }
}

/** Колонки (layout columns): на мобильном раскрываются по клику, на десктопе открыты всегда */
function useColumns(props: MegaMenuProps, emit: BaseMegaMenuEmits, context: ReturnType<typeof useMenuContext>) {
	const openColumns = ref<string[]>([])
	return {
		toggleColumn(title: string): void {
			if (context.isHover()) return
			const index = openColumns.value.indexOf(title)
			if (index > -1) openColumns.value.splice(index, 1)
			else openColumns.value.push(title)
			const column = props.columns?.find(c => c.title === title)
			/* istanbul ignore else -- defensive: title всегда соответствует существующей колонке */
			if (column) emit('column-click', column)
		},
		isColumnOpen: (title: string): boolean => openColumns.value.includes(title) || !context.isMobile.value,
		handleColumnEnter(title: string): void {
			if (!context.isHover()) return
			context.timer.clearTimer()
			if (!openColumns.value.includes(title)) openColumns.value.push(title)
		},
		handleColumnLeave(): void {
			/* istanbul ignore next -- defensive: handleColumnLeave вызывается только при trigger='hover' */
			if (!context.isHover()) return
			context.timer.later(() => {
				openColumns.value = []
			}, props.hoverDelay)
		},
	}
}

/** Пункты навигации (layout dropdown): раскрыт один пункт, лист без детей выполняет переход */
function useNavItems(props: MegaMenuProps, emit: BaseMegaMenuEmits, context: ReturnType<typeof useMenuContext>) {
	const openNavItems = ref<string[]>([])
	const navigate = (to?: string, href?: string, target?: '_blank' | '_self'): void => {
		navigateAndEmit({ to, href, target }, url => emit('navigate', url))
	}
	return {
		navigate,
		isNavOpen: (label: string): boolean => openNavItems.value.includes(label),
		handleNavClick(item: MegaMenuItem): void {
			/* istanbul ignore next -- defensive: disabled-элементы не вызывают click в template */
			if (item.isDisabled) return
			emit('item-click', item)
			if (hasChildren(item)) openNavItems.value = openNavItems.value.includes(item.label) ? [] : [item.label]
			else navigate(item.to, item.href, item.target)
		},
		handleNavEnter(item: MegaMenuItem): void {
			if (!context.isHover()) return
			context.timer.clearTimer()
			if (hasChildren(item) && !openNavItems.value.includes(item.label)) openNavItems.value = [item.label]
		},
		handleNavLeave(): void {
			/* istanbul ignore next -- defensive: handleNavLeave вызывается только при trigger='hover' */
			if (!context.isHover()) return
			context.timer.later(() => {
				openNavItems.value = []
			}, props.hoverDelay)
		},
	}
}

export function useBaseMegaMenu(props: MegaMenuProps, emit: BaseMegaMenuEmits) {
	const standard = useStandardBaseComponent('base-mega-menu', props, MEGA_MENU_ELEMENTS)
	// Реестр раскрытия дерева: гарантирует, что открыт только один узел на уровень
	useMegaMenuTreeProvider()
	const context = useMenuContext(props)

	return {
		...standard,
		isMobile: context.isMobile,
		effectiveTrigger: context.effectiveTrigger,
		// Единый масштаб иконки для корневого уровня
		iconScale: computed(() => calcIconScale('sm', props.sizeScale)),
		hasChildren,
		...useColumns(props, emit, context),
		...useNavItems(props, emit, context),
	}
}
