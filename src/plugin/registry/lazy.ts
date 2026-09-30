/** Тяжёлые компоненты: плагин регистрирует их через `defineAsyncComponent`. */

import type { Component } from 'vue'
import { defineAsyncComponent } from 'vue'

export const LAZY_COMPONENTS: Record<string, Component> = {
	BaseCalendar: defineAsyncComponent(() => import('../../components/BaseCalendar/ui/BaseCalendar.vue')),
	BaseChat: defineAsyncComponent(() => import('../../components/BaseChat/ui/BaseChat.vue')),
	BaseDatePicker: defineAsyncComponent(() => import('../../components/BaseDatePicker/ui/BaseDatePicker.vue')),
	BaseEditor: defineAsyncComponent(() => import('../../components/BaseEditor/ui/BaseEditor.vue')),
	BaseFileUpload: defineAsyncComponent(() => import('../../components/BaseFileUpload/ui/BaseFileUpload.vue')),
	BaseTable: defineAsyncComponent(() => import('../../components/BaseTable/ui/BaseTable.vue')),
}
