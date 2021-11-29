import decamelize from 'decamelize'
import yargs from 'yargs'
import yn from 'yn'
import { YargsSchema } from './yargs-utils'

const parseSingleEnv = <O extends yargs.Options>(
  yargSchema: O,
  envVarValue: string | undefined
): yargs.InferredOptionType<O> | undefined => {
  if (envVarValue === undefined) {
    return
  }

  if (yargSchema.type === 'string') {
    const parsed: string = envVarValue
    return parsed as any // typescript is dumb
  }
  if (yargSchema.type === 'number') {
    const parsed: number = parseFloat(envVarValue)
    if (isNaN(parsed)) {
      return
    }
    return parsed as any // typescript is dumb
  }

  if (yargSchema.type === 'boolean') {
    const parsed: boolean = !!yn(envVarValue)
    return parsed as any // typescript is dumb
  }
}

/**
 *
 * Fills the argv datastructure returned by yargs with value of environment variables.
 * For the CLI parameter --languageURL the expected environment variable is LANGUAGE_URL
 *
 * @param yargsSchema the yargs builder parameter that declares what named parameters are required
 * @param argv the filled argv datastructure returned by yargs
 */
export const parseEnv = <T extends YargsSchema>(yargsSchema: T): Partial<yargs.InferredOptionTypes<T>> => {
  const returned: Partial<yargs.InferredOptionTypes<T>> = {}
  for (const param in yargsSchema) {
    const envVarName = decamelize(param, { preserveConsecutiveUppercase: true, separator: '_' }).toUpperCase()
    const envVarValue = process.env[envVarName]
    const schema = yargsSchema[param]
    const parsedEnvValue = parseSingleEnv(schema, envVarValue)
    if (parsedEnvValue !== undefined) {
      returned[param] = parsedEnvValue
    }
  }
  return returned
}