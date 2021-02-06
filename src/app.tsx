import { defineComponent, reactive, ref, Ref, watchEffect } from 'vue'
import MonacoEditor from './components/MonacoEditor'
// 将主题和核心代码分离，主题从外部引入到app.tsx，依次传给SchemaForm ————> ArrayField/ObjectField —————> 将数据在该主题上渲染出来
import themeDefault from '../lib/theme-default'

import { createUseStyles } from 'vue-jss'

// 测试数据
import demos from './demos'

import SchemaForm, { ThemeProvider } from '../lib'

// TODO: 在lib中export
type Schema = any
type UISchema = any

function toJson(data: any) {
  return JSON.stringify(data, null, 2)
}

// css in js
const useStyles = createUseStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '1200px',
    margin: '0 auto',
  },
  menu: {
    marginBottom: 20,
  },
  code: {
    width: 700,
    flexShrink: 0,
  },
  codePanel: {
    minHeight: 400,
    marginBottom: 20,
  },
  uiAndValue: {
    display: 'flex',
    justifyContent: 'space-between',
    '& > *': {
      width: '46%',
    },
  },
  content: {
    display: 'flex',
  },
  form: {
    padding: '0 20px',
    flexGrow: 1,
  },
  menuButton: {
    appearance: 'none',
    borderWidth: 0,
    backgroundColor: 'transparent',
    cursor: 'pointer',
    display: 'inline-block',
    padding: 15,
    borderRadius: 5,
    '&:hover': {
      background: '#efefef',
    },
  },
  menuSelected: {
    background: '#337ab7',
    color: '#fff',
    '&:hover': {
      background: '#337ab7',
    },
  },
})

interface DemoType {
  schema: Schema | null
  data: any
  uiSchema: UISchema | null
  schemaCode: string
  dataCode: string
  uiSchemaCode: string
}

const App = defineComponent({
  setup() {
    const selectedRef: Ref<number> = ref(0)

    const demo: DemoType = reactive({
      schema: null,
      data: {},
      uiSchema: {},
      schemaCode: '',
      dataCode: '',
      uiSchemaCode: '',
    })

    // 数据监听，确定 demo 的当前值
    watchEffect(() => {
      const index = selectedRef.value
      // demos is test data provide by lib user
      const d: any = demos[index]
      demo.schema = d.schema
      demo.data = d.default
      demo.uiSchema = d.uiSchema
      demo.schemaCode = toJson(d.schema)
      demo.dataCode = toJson(d.default)
      demo.uiSchemaCode = toJson(d.uiSchema)
    })

    // const methodRef: Ref<any> = ref()
    const classesRef = useStyles()

    const handleChange = (v: any) => {
      // console.log('data', v, 'toJson(v)', toJson(v))
      demo.data = v
      demo.dataCode = toJson(v)
    }

    // closure 闭包 demo
    function handleCodeChange(
      field: 'schema' | 'data' | 'uiSchema',
      value: string,
    ) {
      try {
        const json = JSON.parse(value)
        demo[field] = json
        ;(demo as any)[`${field}Code`] = value
      } catch (err) {
        // some thing
      }
    }

    const handleSchemaChange = (v: string) => handleCodeChange('schema', v)
    const handleDataChange = (v: string) => handleCodeChange('data', v)
    const handleUISchemaChange = (v: string) => handleCodeChange('uiSchema', v)

    const contextRef = ref() // 进行验证用
    const formRef = ref()

    const validateForm = () => {
      console.log(contextRef.value.doValidate())
      // contextRef.value.doValidate().then((result: any) => {
      //   console.log(result, '............')
      // })
    }

    return () => {
      const classes = classesRef.value
      const selected = selectedRef.value
      return (
        <div class={classes.container}>
          <div class={classes.menu}>
            <h1>Vue3 JsonSchema Form</h1>
            <div>
              {demos.map((demo, index) => (
                <button
                  class={{
                    [classes.menuButton]: true,
                    [classes.menuSelected]: index === selected,
                  }}
                  onClick={() => (selectedRef.value = index)}
                >
                  {demo.name}
                </button>
              ))}
            </div>
          </div>{' '}
          {/* /.menu */}
          <div class={classes.content}>
            <div class={classes.code}>
              <MonacoEditor
                code={demo.schemaCode}
                class={classes.codePanel}
                onChange={handleSchemaChange}
                title="Schema"
              />
              <div class={classes.uiAndValue}>
                <MonacoEditor
                  code={demo.uiSchemaCode}
                  class={classes.codePanel}
                  onChange={handleUISchemaChange}
                  title="UISchema"
                />
                <MonacoEditor
                  code={demo.dataCode}
                  class={classes.codePanel}
                  onChange={handleDataChange}
                  title="Value"
                />
              </div>
              {/* /.uiAndValue */}
            </div>
            {/* /.code */}
            <div class={classes.form}>
              {/* 将主题与核心代码解耦，主题内部使用slots.default()来渲染它的子组件 */}
              <ThemeProvider theme={themeDefault}>
                <SchemaForm
                  schema={demo.schema}
                  onChange={handleChange}
                  value={demo.data}
                  contextRef={contextRef}
                  ref={formRef}
                />
              </ThemeProvider>
              <button onClick={validateForm}>校验</button>
              {/* <SchemaForm
                  schema={demo.schema}
                  value={demo.data}
                  onChange={handleChange}
                  contextRef={contextRef}
                  ref={nameRef}
                  customValidate={demo.customValidate}
                  uiSchema={demo.uiSchema || {}}
                  customFormats={customFormat}
                  customKeywords={customKeyword}
                />
                <button onClick={validateForm}>校验</button> */}
            </div>
          </div>
        </div>
      )
    }
  },
})

export default App
