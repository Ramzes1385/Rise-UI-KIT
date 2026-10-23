import { UI_TRANSFER } from '@/locales/messages'
import type { ListItem } from '@components/BaseList'
import type { TransferProps, TransferSide } from '../types/BaseTransfer.types'

export const otherSide = (side: TransferSide): TransferSide => (side === 'source' ? 'target' : 'source')

export function titleOf<T extends ListItem>(props: TransferProps<T>, side: TransferSide): string {
	const index = side === 'source' ? 0 : 1
	return props.titles?.[index] ?? (side === 'source' ? UI_TRANSFER.SOURCE : UI_TRANSFER.TARGET)
}
