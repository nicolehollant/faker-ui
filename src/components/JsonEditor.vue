<template>
  <div class="grid gap-1">
    <!-- <pre><code>{{ {jsonKey, jsonValue, jsonValueType} }}</code></pre> -->
    <div v-if="!root" class="flex gap-0.5">
      <SenpTextInput
        v-if="jsonKey !== '__entries__'"
        class="h-max"
        :classes="{ input: { extend: 'rounded-r-none' } }"
        :model-value="jsonKey"
        @update:model-value="(v) => $emit('update:jsonKey', dotpath, v)"
      ></SenpTextInput>
      <SenpTextInput
        v-else
        disabled
        class="h-max pointer-events-none"
        :classes="{ input: { extend: '!text-gray-400 font-semibold cursor-not-allowed rounded-r-none' } }"
        :model-value="jsonKey"
      ></SenpTextInput>
      <select
        class="w-24 text-xs rounded-r-lg bg-neutral-800 p-2 font-medium text-neutral-50 border border-neutral-700"
        @change="(e: any) => updateJsonValueType(e.target.value as any)"
      >
        <option :selected="jsonValueType === 'string'" value="string">string</option>
        <option :selected="jsonValueType === 'number'" value="number">number</option>
        <option :selected="jsonValueType === 'object'" value="object">object</option>
        <option :selected="jsonValueType === 'null'" value="null">null</option>
        <option :selected="jsonValueType === 'boolean'" value="boolean">boolean</option>
        <option :selected="jsonValueType === 'array'" value="array">array</option>
        <option :selected="jsonValueType === 'any'" value="any">any</option>
      </select>
      <div
        class="ml-2 grid grid-flow-col auto-cols-max items-center gap-2 min-w-[6rem] max-w-[14rem] text-xs justify-end rounded-lg border border-blue-600 bg-blue-800/20"
        v-if="jsonValueType !== 'object' && jsonValueType !== 'array'"
      >
        <div class="px-1 w-full max-w-[10rem]" v-if="jsonValue">
          <div class="text-[9px]">{{ jsonValue }}</div>
          <div class="text-[11px] truncate w-full">{{ execFaker(jsonValue, jsonValueType as any) }}</div>
        </div>
        <SenpButton
          class="rounded-l-none h-full border-l border-blue-700 !bg-blue-800/40 hover:bg-blue-700"
          @click="modals.faker = true"
          >value</SenpButton
        >
      </div>
      <div class="ml-2" v-else-if="jsonValueType === 'array'">
        <SenpTextInput
          :classes="{
            wrapper: {
              base: 'max-w-[10rem] rounded-lg bg-green-800/40 overflow-hidden font-medium text-neutral-50 focus-within:ring-1 ring-blue-700 focus-within:border-blue-700 border-green-600 border flex flex-row-reverse items-center gap-1',
            },
            label: { extend: 'h-full border-l px-2 py-2.5 border-green-600' },
            input: { base: 'w-full bg-transparent px-2 border-none focus:outline-none focus:ring-0 py-2' },
          }"
          label="length"
          class="h-max"
          :model-value="arrLength + ''"
          @update:model-value="(v) => $emit('update:arrLength', dotpath, v)"
        ></SenpTextInput>
      </div>
    </div>
    <div class="pl-6 grid gap-1" v-if="jsonValueType === 'array'">
      <JsonEditor
        :dotpath="[...dotpath, 'entries']"
        :json-key="arrEntries.key"
        :json-value="arrEntries.value"
        :json-value-type="arrEntries.type"
        :arr-length="arrEntries.length"
        :arr-entries="arrEntries.entries"
        @update:json-key="(dotpath, val) => $emit('update:jsonKey', dotpath, val)"
        @update:json-value="(dotpath, val) => $emit('update:jsonValue', dotpath, val)"
        @update:json-type="(dotpath, val) => $emit('update:jsonType', dotpath, val)"
        @update:arr-entries="(dotpath, val) => $emit('update:arrEntries', dotpath, val)"
        @update:arr-length="(dotpath, val) => $emit('update:arrLength', dotpath, val)"
      ></JsonEditor>
    </div>
    <div class="grid gap-1" :class="{ 'pl-6': !root }" v-if="jsonValueType === 'object'">
      <JsonEditor
        :dotpath="root ? [...dotpath, i + ''] : [...dotpath, 'value', i + '']"
        v-for="(entry, i) in jsonValue"
        :json-key="jsonValue[i].key"
        :json-value="jsonValue[i].value"
        :json-value-type="jsonValue[i].type"
        :arr-length="jsonValue[i]?.length"
        :arr-entries="jsonValue[i]?.entries"
        @update:json-key="(dotpath, val) => $emit('update:jsonKey', dotpath, val)"
        @update:json-value="(dotpath, val) => $emit('update:jsonValue', dotpath, val)"
        @update:json-type="(dotpath, val) => $emit('update:jsonType', dotpath, val)"
        @update:arr-entries="(dotpath, val) => $emit('update:arrEntries', dotpath, val)"
        @update:arr-length="(dotpath, val) => $emit('update:arrLength', dotpath, val)"
      ></JsonEditor>
      <SenpButton
        @click="() => $emit('update:jsonValue', dotpath, [...(jsonValue as any), { key: 'prop', value: '', type: 'string'}])"
        >+ Add Property <span class="text-xs font-normal text-white/60">({{ jsonKey }})</span></SenpButton
      >
    </div>
    <FakerValue
      v-model:open="modals.faker"
      :model-value="jsonValue + ''"
      @update:model-value="(val) => $emit('update:jsonValue', dotpath, val)"
    ></FakerValue>
  </div>
</template>

<script setup lang="ts">
import { execFaker } from '../assets/faker-utils'

type JSONValue = string | number | boolean | null | { [x: string]: JSONValue } | Array<JSONValue>

const props = withDefaults(
  defineProps<{
    dotpath: string[]
    jsonKey: string
    jsonValue: any
    arrLength?: string | number
    arrEntries?: any
    root?: boolean
    jsonValueType: 'string' | 'number' | 'object' | 'null' | 'boolean' | 'array' | 'any'
  }>(),
  {
    root: false,
  }
)

const emit = defineEmits<{
  (event: 'update:jsonKey', dotpath: string[], value: string): void
  (event: 'update:jsonValue', dotpath: string[], value: any): void
  (event: 'update:jsonType', dotpath: string[], value: any): void
  (event: 'update:arrLength', dotpath: string[], value: string): void
  (event: 'update:arrEntries', dotpath: string[], value: number): void
}>()

const modals = reactive({
  faker: false,
  asdf: '',
})

const getJsonValueType = (value: any): 'string' | 'number' | 'object' | 'null' | 'boolean' | 'array' | 'any' => {
  if (typeof value === 'object' && !Array.isArray(value)) {
    return 'object'
  }
  if (typeof value === 'object' && Array.isArray(value)) {
    return 'array'
  }
  if (value == null) {
    return 'null'
  }
  if (['string', 'number', 'boolean'].includes(typeof value)) {
    return typeof value as any
  }
  return 'string'
}

const defaultValue = (t: string, key: string) =>
  ({
    any: { type: 'any', key, value: '' },
    string: { type: 'string', key, value: '' },
    number: { type: 'number', key, value: 0 },
    object: { type: 'object', key, value: [{ key: 'prop', type: 'string', value: '' }] },
    null: { type: 'null', key, value: null },
    boolean: { type: 'boolean', key, value: false },
    array: {
      type: 'array',
      key,
      value: [''],
      entries: { type: 'string', key: '__entries__', value: '' },
      length: '1',
    },
  }[t])

const toEditable = (obj: any): any[] => {
  const tObj = getJsonValueType(obj)
  if (tObj === 'object') {
    return Object.entries(obj).map(([key, val]: [string, any]) => {
      const tValue = getJsonValueType(val)
      const res = {
        key,
        value: tValue === 'object' ? toEditable(val) : val,
        type: tValue,
      }
      if (tValue === 'array') {
        const entryType =
          val.reduce((prev: any[], a: any) => {
            const currType = getJsonValueType(a)
            if (prev.includes(currType)) {
              return prev
            }
            return [...prev, currType]
          }, []).length === 1
            ? getJsonValueType(val[0])
            : 'any'
        ;(res as any).length = val.length + ''
        ;(res as any).entries = defaultValue(entryType, '__entries__')
        if (entryType === 'object') {
          res.value = val.map((a: any) => toEditable(a))
        }
      }
      return res
    })
  }
  return obj
}

const updateJsonValueType = (t: 'string' | 'number' | 'object' | 'null' | 'boolean' | 'array') => {
  emit('update:jsonType', props.dotpath, defaultValue(t, props.jsonKey))
}

const toEditableKeyValues = (obj: any): any[][] => {
  if (typeof obj === 'object' && !Array.isArray(obj)) {
    return Object.entries(obj)
  }
  return obj
}

// const addValue = () => {
//   state.json.push(['_prop', ''])
// }
</script>
