<template>
  <SenpLayoutBasic
    fixed-header
    :classes="{
      header: {
        extend: 'text-2xl bg-neutral-900/60 backdrop-blur',
      },
      content: {
        extend: 'max-w-3xl w-full mx-auto !gap-12 !py-12',
      },
      footer: {
        extend: 'hidden',
      },
    }"
  >
    <template #header>
      <div class="px-4 font-medium flex items-center gap-3 max-w-3xl w-full m-auto">
        <div class="relative transform -scale-y-100">
          <p
            class="leading-none text-black/60 bg-clip-text bg-gradient-to-br from-blue-500 to-green-700 text-3xl z-10 relative -mt-4 shadow-lg"
          >
            🎩
          </p>
          <p
            class="leading-none absolute inset-0 text-3xl transform rotate-12 -translate-x-0.5 -scale-y-75 scale-x-75 translate-y-4 z-0"
          >
            🐰
          </p>
        </div>
        <p>FakerUI</p>
      </div>
    </template>

    <template #content>
      <div class="grid gap-2">
        <h3 class="text-xl">Model Object:</h3>
        <div class="grid gap-1">
          <JsonEditor
            :dotpath="['rootValue']"
            :json-key="state.rootKey"
            :json-value="state.rootValue"
            json-value-type="object"
            root
            @update:json-key="
              (dotpath, val) => {
                updateJson(dotpath, val, 'key')
              }
            "
            @update:json-value="
              (dotpath, val) => {
                updateJson(dotpath, val, 'value')
              }
            "
            @update:json-type="
              (dotpath, val) => {
                updateJson(dotpath, val, 'type')
              }
            "
            @update:arr-entries="
              (dotpath, val) => {
                set(state, [...dotpath, 'entries'], val)
              }
            "
            @update:arr-length="
              (dotpath, val) => {
                set(state, [...dotpath, 'length'], val)
              }
            "
          ></JsonEditor>
        </div>
      </div>
      <hr class="border-neutral-900" />
      <div class="grid gap-2">
        <div class="grid gap-2 sm:flex sm:items-end sm:justify-between">
          <h3 class="text-xl h-[42px] flex items-center">Example Value:</h3>

          <div class="flex items-end w-max gap-2">
            <SenpTextInput
              :classes="{ wrapper: { base: 'grid items-center gap-1 w-max' }, label: { extend: 'w-max shrink-0' } }"
              v-model="state.numElems"
              label="# Elements"
            ></SenpTextInput>
            <SenpButton class="p-3 border border-blue-500" @click="copy()">
              <Icon v-if="copied" name="mdi:clipboard-check"></Icon>
              <Icon v-else name="mdi:clipboard"></Icon>
            </SenpButton>
          </div>
        </div>
        <SenpCodeEditor
          theme="onedark"
          enter-action="default"
          :model-value="example.preview"
          language="json"
          disabled
        ></SenpCodeEditor>
        <!-- <pre><code>{{ state.rootValue }}</code></pre> -->
      </div>
    </template>
  </SenpLayoutBasic>
</template>

<script setup lang="ts">
import { execFaker } from '@/assets/faker-utils'
import objectPath from 'object-path'
import { useClipboard } from '@vueuse/core'
const { set } = objectPath

const state = reactive({
  numElems: '1',
  rootKey: 'root',
  rootValue: [{ key: 'prop', value: '', type: 'string' }],
})

const getArrLength = (v: string) => {
  try {
    if (v.toLowerCase().includes('rand')) {
      const randParams = v.toLowerCase().replace('rand', '').replace('(', '').replace(')', '')
      const [max, min] = randParams.split(',')
      const nMax = parseInt(max?.trim?.() ?? '1')
      if (min) {
        const nMin = parseInt(min.trim())
        return Math.floor(Math.random() * (nMax - nMin) + nMin)
      }
      return Math.floor(Math.random() * nMax)
    }
    return parseInt(v)
  } catch (error) {
    return 1
  }
}

const updateJson = (dotpath: string[], val: any, prop: 'key' | 'value' | 'type') => {
  console.log({ dotpath, val, prop })
  if (prop === 'type') {
    set(state, dotpath, val)
  } else if (prop === 'value' && dotpath.length === 1) {
    state.rootValue = val
  } else {
    set(state, [...dotpath, prop], val)
  }
}

const fromEditable = (value: any[]): any => {
  try {
    return Object.fromEntries(
      value.map((a) => {
        if (a.type === 'array') {
          return [
            a.key,
            Array.from({ length: getArrLength(a.length) }).map(() => {
              if (a.entries.type === 'array') {
                return Array.from({ length: getArrLength(a.entries.length) }).map(() =>
                  fromEditable(a.entries.entries.value)
                )
              }
              if (a.entries.type === 'object') {
                return fromEditable(a.entries.value)
              }
              return execFaker(a.entries.value, a.entries.type ?? 'string')
            }),
          ]
        }
        if (a.type === 'object') {
          return [a.key, fromEditable(a.value)]
        }
        return [a.key, execFaker(a.value, a.type ?? 'string')]
      })
    )
  } catch (error) {
    return value
  }
}

const example = computed(() => {
  return {
    preview: JSON.stringify(fromEditable(state.rootValue), null, 2),
    clipboard: JSON.stringify(
      Array.from({ length: getArrLength(state.numElems) }).map(() => fromEditable(state.rootValue)),
      null,
      2
    ),
  }
})

const { text, copy, copied, isSupported } = useClipboard({ source: () => example.value.clipboard, legacy: true })
</script>
