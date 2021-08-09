import { ModelId, modelIdService } from '@botpress/nlu-engine'
import { ResponseError } from '../api/errors'

export class ModelDoesNotExistError extends ResponseError {
  constructor(modelId: ModelId) {
    const stringId = modelIdService.toString(modelId)
    super(`modelId ${stringId} can't be found`, 404)
  }
}

export class TrainingNotFoundError extends ResponseError {
  constructor(modelId: ModelId) {
    const stringId = modelIdService.toString(modelId)
    super(`no current training for model: ${stringId}`, 404)
  }
}