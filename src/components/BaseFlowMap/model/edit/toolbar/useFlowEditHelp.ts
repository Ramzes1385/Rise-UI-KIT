import { UI_FLOW_EDITOR } from '@/locales/messages'

export function useFlowEditHelp() {
	return {
		title: UI_FLOW_EDITOR.HELP_TITLE,
		rows: [
			{ keys: 'V H C N T G', text: UI_FLOW_EDITOR.HELP_TOOLS },
			{ keys: 'Delete', text: UI_FLOW_EDITOR.HELP_DELETE },
			{ keys: 'Ctrl+Z Ctrl+Shift+Z', text: UI_FLOW_EDITOR.HELP_UNDO },
			{ keys: 'Ctrl+C Ctrl+X Ctrl+V Ctrl+D', text: UI_FLOW_EDITOR.HELP_CLIPBOARD },
			{ keys: 'Shift+Arrows Shift+Alt+Arrows', text: UI_FLOW_EDITOR.HELP_NUDGE },
			{ keys: 'F2', text: UI_FLOW_EDITOR.HELP_RENAME },
			{ keys: 'Ctrl+A', text: UI_FLOW_EDITOR.HELP_SELECT_ALL },
			{ keys: 'C', text: UI_FLOW_EDITOR.HELP_CONNECT },
			{ keys: '+ − 0', text: UI_FLOW_EDITOR.HELP_ZOOM },
			{ keys: 'Space', text: UI_FLOW_EDITOR.HELP_SPACE },
			{ keys: 'Esc', text: UI_FLOW_EDITOR.HELP_ESCAPE },
		],
	}
}
