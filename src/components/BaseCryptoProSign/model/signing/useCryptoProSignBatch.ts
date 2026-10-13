import { formatMessage } from '@/locales/state'
import { UI_CRYPTOPRO } from '@/locales/messages'
import { computed, shallowRef, watch } from 'vue'
import { guarded } from '../useCryptoProSignActions'
import { downloadSignature, ensureReady, pluginError, signWith } from './cryptoProSignJob'
import type {
	CryptoProBatchItem,
	BatchFileSetup,
	CryptoProBatchList,
	CryptoProBatchControl,
	CryptoProSignResult,
	CryptoProBatchResult,
	BaseCryptoProSignEmits,
	BaseCryptoProSignProps,
	CryptoProSignActionState,
	CryptoProSignBatchContext,
	CryptoProSignActionContext,
} from '../../types/BaseCryptoProSign.types'

class BatchCancelled extends Error {}

function initialItems(files: File[], threshold: number): CryptoProBatchItem[] {
	return files.map((file, index) => ({
		id: index + 1,
		name: file.name,
		size: file.size,
		isHash: file.size > threshold,
		status: 'pending',
		progress: 0,
		result: null,
		error: null,
	}))
}

function summarize(items: CryptoProBatchItem[]): CryptoProBatchResult {
	const count = (status: CryptoProBatchItem['status']): number => items.filter(item => item.status === status).length
	return { items, signedCount: count('signed'), failedCount: count('failed'), cancelledCount: count('cancelled') }
}

function useBatchItems(): CryptoProBatchList {
	const items = shallowRef<CryptoProBatchItem[]>([])
	return {
		items,
		set: (value: CryptoProBatchItem[]): void => {
			items.value = value
		},
		patch: (index: number, change: Partial<CryptoProBatchItem>): void => {
			items.value = items.value.map((item, position) => (position === index ? { ...item, ...change } : item))
		},
		cancelPending: (): void => {
			items.value = items.value.map(item => (item.status === 'pending' ? { ...item, status: 'cancelled' } : item))
		},
	}
}

async function signFile(file: File, index: number, setup: BatchFileSetup): Promise<void> {
	const { props, emit, context, list, control } = setup
	list.patch(index, { status: 'signing' })
	const isHash = list.items.value[index]?.isHash ?? false
	const onProgress = (progress: number): void => {
		if (control.isCancelRequested) throw new BatchCancelled()
		list.patch(index, { progress })
	}
	try {
		const job = { data: file, fileName: file.name, isHash, detached: isHash || context.isDetached.value, onProgress }
		const result = await signWith(props, context, job)
		list.patch(index, { status: 'signed', progress: 1, result })
		emit('signed', result)
	} catch (error) {
		if (error instanceof BatchCancelled) return list.patch(index, { status: 'cancelled' })
		const failure = pluginError(error)
		list.patch(index, { status: 'failed', error: failure })
		emit('error', failure)
	}
}

function useBatchQueue(setup: Omit<BatchFileSetup, 'control'>) {
	const control: CryptoProBatchControl = { isCancelRequested: false }
	const isRunning = shallowRef(false)
	const isCancelling = shallowRef(false)
	return {
		isRunning,
		isCancelling,
		requestCancel: (): void => {
			if (!isRunning.value) return
			control.isCancelRequested = true
			isCancelling.value = true
		},
		async run(files: File[]): Promise<void> {
			control.isCancelRequested = false
			isRunning.value = true
			setup.list.set(initialItems(files, setup.props.hashThreshold ?? Infinity))
			try {
				for (const [index, file] of files.entries()) {
					if (control.isCancelRequested) return setup.list.cancelPending()
					await signFile(file, index, { ...setup, control })
				}
			} finally {
				isRunning.value = false
				isCancelling.value = false
			}
		},
	}
}

export function useCryptoProSignBatch(
	props: BaseCryptoProSignProps,
	emit: BaseCryptoProSignEmits,
	setup: { context: CryptoProSignActionContext; batch: CryptoProSignBatchContext; state: CryptoProSignActionState },
) {
	const { context, batch, state } = setup
	const list = useBatchItems()
	const queue = useBatchQueue({ props, emit, context, list })

	const signAll = (): Promise<CryptoProBatchResult | null> =>
		guarded(state, async () => {
			const files = batch.files.value
			if (!files.length || !context.certificate.value || !(await ensureReady(context))) return null
			await queue.run(files)
			const result = summarize(list.items.value)
			state.announcement.value = formatMessage(UI_CRYPTOPRO.BATCH_SUMMARY, {
				signed: result.signedCount,
				total: result.items.length,
				failed: result.failedCount,
				cancelled: result.cancelledCount,
			})
			emit('signed-all', result)
			return result
		})

	watch(batch.files, () => {
		if (!queue.isRunning.value) list.set([])
	})

	const done = computed(() => list.items.value.filter(item => item.status !== 'pending' && item.status !== 'signing').length)
	const downloadable = computed(() =>
		list.items.value.map(item => item.result).filter((item): item is CryptoProSignResult => item !== null),
	)
	return {
		batchItems: list.items,
		isRunning: queue.isRunning,
		isCancelling: queue.isCancelling,
		signAll,
		cancel: queue.requestCancel,
		batchPercent: computed(() => Math.round((done.value / Math.max(list.items.value.length, 1)) * 100)),
		hasBatchDownload: computed(() => downloadable.value.length > 0),
		downloadItem: (id: number): void => downloadSignature(list.items.value.find(item => item.id === id)?.result ?? null),
		downloadAll: (): void => downloadable.value.forEach(downloadSignature),
	}
}
