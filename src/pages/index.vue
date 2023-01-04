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
      <div class="sm:px-4 max-w-3xl w-full m-auto flex items-center justify-between">
        <div class="font-medium flex items-center gap-3 max-w-3xl w-full m-auto">
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

        <AccountButton></AccountButton>
      </div>
    </template>

    <template #content>
      <div class="grid gap-2">
        <div class="flex gap-2 items-end justify-between">
          <h3 class="text-xl h-[42px] flex items-center">Model Object:</h3>

          <div class="flex items-end w-max gap-2">
            <SenpButton class="text-xs p-3 border border-blue-500" @click="() => (modals.import = true)">
              <p>Import</p>
              <Icon class="text-base" name="mdi:import"></Icon>
            </SenpButton>
            <SenpButton class="text-xs p-3 border border-blue-500" @click="() => (modals.share = true)">
              <p>Export</p>
              <Icon class="text-base" name="mdi:export"></Icon>
            </SenpButton>
          </div>
        </div>

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
            @update:remove-property="
              (dotpath, val) => {
                removeProperty(dotpath, val)
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
      </div>
    </template>
  </SenpLayoutBasic>
  <SenpModal v-model:open="modals.share">
    <div class="grid gap-4">
      <h1 class="text-2xl">Sharing:</h1>
    </div>
    <div class="grid gap-2">
      <SenpTextInput v-model="state.name" label="Model Name"></SenpTextInput>
      <SenpButton class="!px-4 !py-2" @click="() => share()">
        <div class="flex items-center gap-2" v-if="shareClipboard.copied.value">
          <p>Copied</p>
          <Icon name="heroicons:check"></Icon>
        </div>
        <div class="flex items-center gap-2" v-else>
          <p>Share</p>
          <Icon name="heroicons:share"></Icon>
        </div>
      </SenpButton>
    </div>
  </SenpModal>
  <SenpModal v-model:open="modals.import">
    <div class="grid gap-4">
      <h1 class="text-2xl">Import Model:</h1>
    </div>
    <div class="grid gap-2">
      <p>Infer model from example JSON</p>
      <SenpCodeEditor v-model="state.import" theme="onedark" language="json"></SenpCodeEditor>
      <SenpButton class="!px-4 !py-2" @click="() => importJson()">
        <div class="flex items-center gap-2">
          <p>Import</p>
          <Icon name="mdi:import"></Icon>
        </div>
      </SenpButton>
    </div>
  </SenpModal>
</template>

<script setup lang="ts">
import { useQueryClient } from '@tanstack/vue-query'

import { execFaker } from '@/assets/faker-utils'
import objectPath from 'object-path'
import { useClipboard } from '@vueuse/core'
import { nanoid } from 'nanoid'
import { string } from 'zod'

definePageMeta({
  middleware: 'auth-optional',
})

const { set, get } = objectPath

const { $auth } = useNuxtApp()
const queryClient = useQueryClient()

const state = reactive({
  import: '',
  numElems: '1',
  name: '',
  rootKey: 'root',
  rootValue: [{ key: 'prop', value: '', type: 'string' }],
})

const { toEditable } = useProcessJson()

const modals = reactive({
  share: false,
  import: false,
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
  if (prop === 'type') {
    set(state, dotpath, val)
  } else if (prop === 'value' && dotpath.length === 1) {
    state.rootValue = val
  } else {
    set(state, [...dotpath, prop], val)
  }
}

const removeProperty = (dotpath: string[], val: string) => {
  const _field = dotpath.pop()
  const filtered = get(state, dotpath).filter((a: any) => a.key !== val)
  set(state, dotpath, filtered)
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

const share = async () => {
  try {
    const code = nanoid()
    const result = await api.create({
      code,
      model: state.rootValue,
      userID: $auth.account.value?.id ?? '',
      name: state.name,
    })
    console.log({ result })
    shareClipboard.copy(window.location.origin + `/?code=${code}`)
    queryClient.invalidateQueries({ queryKey: ['shared'] })
  } catch (error) {
    alert('failed to copy to clipboard')
  }
}

const { text, copy, copied, isSupported } = useClipboard({ source: () => example.value.clipboard, legacy: true })
const shareClipboard = useClipboard({ source: () => example.value.clipboard, legacy: true })
const route = useRoute()

const importJson = () => {
  try {
    const obj = JSON.parse(state.import)
    const model = toEditable(obj, true)
    state.rootValue = model
  } catch (error) {
    console.log(error)
  }
}

watch(
  () => route.query?.code,
  async () => {
    try {
      if (route.query?.code) {
        const [matching] = await api.match({ code: route.query.code })
        state.rootValue = matching.model
      }
    } catch (error) {
      console.log(error)
    }
  }
)

onMounted(async () => {
  try {
    if (route.query?.code) {
      const [matching] = await api.match({ code: route.query.code })
      state.rootValue = matching.model
    }
  } catch (error) {
    console.log(error)
  }
})
</script>
