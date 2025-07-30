import { execa, Result } from 'execa'

export async function use(phpVersion: string, options = {}): Promise<Result> {
  return execa('valet', ['use', phpVersion], options)
}
