import { computed } from 'vue'
import { formatMessage } from '@/locales/state'
import { UI_CRYPTOPRO } from '@/locales/messages'
import { formatFileSize } from '@utils/media/fileUtils'
import type { CryptoProBatchItem } from '../../types/BaseCryptoProSign.types'
import type { BaseCryptoProSignBatchProps, CryptoProBatchItemView } from '../../types/BaseCryptoProSignParts.types'

const ICONS: Record<CryptoProBatchItem['status'], string> = {
	pending: '',
	signing: '',
	signed: 'check-circle',
	failed: 'x-circle',
	cancelled: 'minus',
}

function statusText(status: CryptoProBatchItem['status']): string {
	if (status === 'pending') return UI_CRYPTOPRO.BATCH_PENDING
	if (status === 'signing') return UI_CRYPTOPRO.BATCH_SIGNING
	if (status === 'signed') return UI_CRYPTOPRO.BATCH_SIGNED
	return status === 'failed' ? UI_CRYPTOPRO.BATCH_FAILED : UI_CRYPTOPRO.BATCH_CANCELLED
}

function itemView(item: CryptoProBatchItem): CryptoProBatchItemView {
	return {
		id: item.id,
		name: item.name,
		status: item.status,
		meta: `${formatFileSize(item.size)} · ${statusText(item.status)}`,
		icon: ICONS[item.status],
		error: item.error ? [item.error.message, item.error.detail].filter(Boolean).join(': ') : '',
		percent: item.isHash && item.status === 'signing' ? Math.round(item.progress * 100) : null,
		canDownload: item.result !== null,
		downloadLabel: formatMessage(UI_CRYPTOPRO.BATCH_DOWNLOAD, { name: `${item.name}.sig` }),
	}
}

export function useBaseCryptoProSignBatch(props: BaseCryptoProSignBatchProps) {
	return { views: computed(() => props.items.map(itemView)) }
}
