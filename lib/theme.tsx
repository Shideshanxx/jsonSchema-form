import {
  defineComponent,
  PropType,
  computed,
  ComputedRef,
  provide,
  inject,
} from 'vue'
import { Theme } from './types'

const THEME_PROVIDER_KEY = Symbol()

const ThemeProvider = defineComponent({
  name: 'VJSFThemeProvider',
  props: {
    theme: {
      type: Object as PropType<Theme>,
      required: true,
    },
  },
  setup(props, { slots }) {
    // 对context进行响应式处理(computed返回的是ComputedRef类型)
    const context = computed(() => props.theme)
    provide(THEME_PROVIDER_KEY, context)

    return () => slots.default && slots.default()
  },
})

export function getWidget(name: keyof Theme['widgets']) {
  const context = inject<ComputedRef<Theme>>(THEME_PROVIDER_KEY)

  if (!context) throw Error('vjsf theme required')

  return computed(() => context.value.widgets[name])
}

export default ThemeProvider
