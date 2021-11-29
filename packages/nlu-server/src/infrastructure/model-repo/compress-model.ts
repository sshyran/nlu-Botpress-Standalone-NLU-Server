import { Model } from '@botpress/nlu-engine'
import fse, { WriteStream } from 'fs-extra'
import _ from 'lodash'
import path from 'path'
import { Stream } from 'stream'
import tar from 'tar'
import tmp from 'tmp'

export const compressModel = async (model: Model): Promise<Buffer> => {
  const serialized = JSON.stringify(model)

  // TODO replace that logic with in-memory streams
  const tmpDir = tmp.dirSync({ unsafeCleanup: true })
  const tmpFileName = 'model'
  const tmpFilePath = path.join(tmpDir.name, tmpFileName)
  await fse.writeFile(tmpFilePath, serialized)
  const archiveName = 'archive'
  const archivePath = path.join(tmpDir.name, archiveName)
  await tar.create(
    {
      file: archivePath,
      cwd: tmpDir.name,
      portable: true,
      gzip: true
    },
    [tmpFileName]
  )
  const buffer = await fse.readFile(archivePath)
  tmpDir.removeCallback()
  return buffer
}

export const decompressModel = async (buffer: Buffer): Promise<Model> => {
  const buffStream = new Stream.PassThrough()
  buffStream.end(buffer)
  const tmpDir = tmp.dirSync({ unsafeCleanup: true })

  const tarFileName = 'model'
  const tarStream = tar.x({ cwd: tmpDir.name, strict: true }, [tarFileName]) as WriteStream
  buffStream.pipe(tarStream)
  await new Promise((resolve) => tarStream.on('close', resolve))

  const modelBuff = await fse.readFile(path.join(tmpDir.name, tarFileName))
  let mod
  try {
    mod = JSON.parse(modelBuff.toString())
  } finally {
    tmpDir.removeCallback()
    return mod
  }
}