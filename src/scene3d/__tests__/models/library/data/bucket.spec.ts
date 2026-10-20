import { describeLibraryModel } from '../../libraryChecks'
import { buildBucket } from '../../../../models/library/data/bucket'

describeLibraryModel('bucket', buildBucket, { parts: ['body', 'accent', 'detail', 'metal', 'light'], animations: ['pulse'], anchorY: 1.24 })
