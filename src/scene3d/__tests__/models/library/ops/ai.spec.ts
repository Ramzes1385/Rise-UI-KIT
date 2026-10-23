import { describeLibraryModel } from '../../libraryChecks'
import { buildAi } from '../../../../models/library/ops/ai'

describeLibraryModel('ai', buildAi, { parts: ['body', 'accent', 'detail', 'metal'], animations: ['think'], anchorY: 1.12 })
