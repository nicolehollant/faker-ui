import fakerExamples from './faker-examples.json'
import { faker } from '@faker-js/faker'

const numbers = {
  float: {
    '0Digit': () => Number((Math.random() % 1).toFixed(4)),
    '1Digit': () => Number(((Math.random() * 10) % 10).toFixed(4)),
    '2Digit': () => Number(((Math.random() * 100) % 100).toFixed(4)),
    '3Digit': () => Number(((Math.random() * 1000) % 1000).toFixed(4)),
    '4Digit': () => Number(((Math.random() * 10000) % 10000).toFixed(4)),
    '5Digit': () => Number(((Math.random() * 100000) % 100000).toFixed(4)),
    '6Digit': () => Number(((Math.random() * 1000000) % 1000000).toFixed(4)),
    '7Digit': () => Number(((Math.random() * 10000000) % 10000000).toFixed(4)),
    '8Digit': () => Number(((Math.random() * 100000000) % 100000000).toFixed(4)),
    '9Digit': () => Number(((Math.random() * 1000000000) % 1000000000).toFixed(4)),
  },
  int: {
    '1Digit': () => Math.floor(Math.random() * 10) % 10,
    '2Digit': () => Math.floor(Math.random() * 100) % 100,
    '3Digit': () => Math.floor(Math.random() * 1000) % 1000,
    '4Digit': () => Math.floor(Math.random() * 10000) % 10000,
    '5Digit': () => Math.floor(Math.random() * 100000) % 100000,
    '6Digit': () => Math.floor(Math.random() * 1000000) % 1000000,
    '7Digit': () => Math.floor(Math.random() * 10000000) % 10000000,
    '8Digit': () => Math.floor(Math.random() * 100000000) % 100000000,
    '9Digit': () => Math.floor(Math.random() * 1000000000) % 1000000000,
    '10Digit': () => Math.floor(Math.random() * 10000000000) % 10000000000,
  },
}

export const fakerModules: {
  [k: string]: { name: string; example: string | number | boolean | null }[]
} = fakerExamples

export const execFaker = (
  dotpath: string,
  type: 'string' | 'number' | 'boolean' | 'any' | 'array' | 'object' = 'string'
) => {
  try {
    const [_module, method] = dotpath.split('.')
    if (_module === 'custom') {
      const { $state } = useNuxtApp()
      return $state.execCustomValue($state.customValues.value.findIndex((a) => a.name === method))
    }
    if (_module === 'float' || _module === 'int') {
      return (numbers[_module] as any)[method as any]()
    }
    const res = (faker as any)[_module as any][method as any]()
    if (res instanceof Date) {
      return res.toISOString()
    }
    return res
  } catch (error) {
    const defaults = {
      string: '',
      number: 1,
      boolean: Math.random() < 0.5,
      any: '',
      array: [],
      object: {},
    }
    return defaults[type]
  }
}
