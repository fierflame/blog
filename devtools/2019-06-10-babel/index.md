
## 什么是 `Babel`

`Babel` 是一个 `ECMAScript` 编译器，可以将新一代的 ES 语法转为旧一代的 ES 语法，甚至是转换 ES 的超集语言（如 `jsx`, `typescript` 等）为 `ECMAScript` 代码。

截止发稿日期，`Babel` 的版本号为 `7.4.x`。在没有特殊说明的情况下，我将在此版本上进行介绍。

目前，所有的 `Babel` 7.x 版本的官方 `npm` 包都在 `@babel` 命名空间下。

## 常用 `Babel` 包及说明

* `@babel/core` 
  `Babel` 的核心组件，只要使用 `Babel` 就必须要安装此 `npm` 包。
* `@babel/cli`  
  `Babel` 的终端命令，如果想在终端中调用 `babel` 命令，需要安装此 `npm` 包。
* `@babel/node`  
  `Babel` 的交互式解释器，此包中带有 `babel-node` 命令，此命令可以像 `node` 一样使用，但在实际使用前会先进行代码转换。  
  但是，在 `babel-node` 中不支持 `let` 和 `const`。
* `@babel/register`  
  在`node`中直接采用新的语法书写执行时，用于注册`Require hook`的 `npm` 包。
* `@babel/plugin-*`  
  `@babel/plugin-*` 为 `Babel` 的语法支持插件，主要包含下列三类：
  * `@babel/plugin-transform-*`
  * `@babel/plugin-proposal-*`
  * `@babel/plugin-syntax-*`

  三者的主要区别是:
  1. `@babel/plugin-syntax-*` 只提供给 `Babel` 的支持，但不提供转换，剩余两者都提供转换。
  2. `@babel/plugin-transform-*` 是对 `ECMAScript` 中已定义的语法及超集语言的转换，而 `@babel/plugin-proposal-*` 是对草案中提到的语法进行转换，换句话说，`@babel/plugin-proposal-*` 转换的语法，不能保证以后规则不会变。
  3. 但如果转换插件是在草案阶段实现的，且称为 `ECMAScript` 的标准语法后，实现没有改变，插件可能仍然保留 `@babel/plugin-proposal-*` 命名而不改变。
* `@babel/preset-*`  
  `Babel` 的预置配置，不通的配置一般包含有不同的插件，并进行了适当地设置。
  `Babel` 的预置配置使用最多的是`@babel/preset-env`，有较多的配置项，，常用选项按照 `选项名: 类型 = 默认值` 的格式给出：
  * `targets`: `string | Array<string> | { [string]: string }` = `{}`  
    描述您为项目支持/定位的环境, 如： `"> 0.25%, not dead"`, `{ "chrome": "58", "ie": "11" }`， 默认情况下将转换所有ECMAScript 2015+代码
  * `modules`: `"amd" | "umd" | "systemjs" | "commonjs" | "cjs" | "auto" | false` = `"auto"`  
    启用将ES6模块语法转换为其他模块类型。 将此设置为false不会转换模块。 另请注意，这cjs只是一个别名commonjs。
  其余选项可参考[`@babel/preset-env` 的选项](https://babeljs.io/docs/en/babel-preset-env#options)

## 使用 `Babel`

### 配置及配置文件

配置为一个 object 对象，其主要有以下两个属性：
* `plugins`: 插件列表，Array 类型。
  每一项为一个插件，可以是以下几种格式
  * `'插件名称'`，直接为插件的名称，如 `@babel/plugin-transform-react-jsx`, 如果插件名称以 `babel-plugin-` 开头，可以将其省略，如 `babel-plugin-my-plugin` 可以省略为`my-plugin`
  * `['插件名称', { /* 选项 */ }]`，使用插件，并设置选项
  * `pluginObject`，使用插件对象，一般通过 `require` 导入的插件
  * `[pluginObject, { /* 选项 */ }]`，使用插件，并设置选项
  插件会按照在列表中的顺序，被依次应用
* `presets`: 预设列表，Array 类型。
  每一项为一个预设，可以是以下几种格式
  * `'预设名称'`，直接为预设的名称，如 `@babel/preset-transform-react-jsx`, 如果预设名称以 `babel-preset-` 开头，可以将其省略，如 `babel-preset-my-preset` 可以省略为`my-preset`
  * `['预设名称', { /* 选项 */ }]`，使用预设，并设置选项
  * `presetObject`，使用预设对象，一般通过 `require` 导入的预设
  * `[presetObject, { /* 选项 */ }]`，使用预设，并设置选项
  预设会按照在列表中的**反向**顺序，被依次应用。
  预设会在插件之后引用。

根据使用的场景不同，可能需要将配置单独写入到配置文件中

`Babel` 目前支持两种配置文件：
* `.babelrc` 其本质为 JSON5 文件，其内容作为配置
* `babel.config.js` 其本质为 nodejs 的 commonjs 模块文件，其导出作为配置

附 babel 配置举例

```JavaScript
module.exports = {
	plugins: [
		'@babel/plugin-proposal-async-generators',
		'@babel/plugin-proposal-async-to-generator',
		'@babel/plugin-proposal-class-properties',
		'@babel/plugin-proposal-do-expressions',
		'@babel/plugin-proposal-function-bind',
		'@babel/plugin-proposal-logical-assignment-operators',
		'@babel/plugin-proposal-numeric-separator',
		'@babel/plugin-proposal-object-rest-spread',
		'@babel/plugin-proposal-optional-catch-binding',
		'@babel/plugin-proposal-optional-chaining',
		'@babel/plugin-proposal-private-methods',
		'@babel/plugin-proposal-throw-expressions',
		['@babel/plugin-transform-typescript', {isTSX: true, jsxPragma: 'createElement'}],
		['@babel/plugin-transform-react-jsx', {pragma: 'createElement', throwIfNamespace: false}],
	]
};
```

### 在终端中进行编译

需要配置好配置文件，并安装以下两个必须的 `npm` 包及其他用到的插件及预置等：
* `@babel/core`  
* `@babel/cli`  


之后可以使用 `babel` 命令进行编译，我一般会在 package.json 中配置命令，如下：
`babel src --out-dir lib -x .ts,.tsx -s`
其中:
* `src` 为要编译的文件(或要编译文件所在的目录)
* `--out-dir lib` 为设置编译结果的输出目录，其中 lib 为输出目录。如果是编译一个文件怎用 `--out outFile` outFile 为输出文件
* `-x .ts,.tsx` 设置要编译的文件后缀，默认情况下只编译 `.es6`,`.js`,`.es`,`.jsx`,`.mjs` 五种后缀的文件，这里我还希望编译 `.ts`,`.tsx`,所以我还使用了此选项
* `-s` 选项表示生成独立的 `.map` 文件，便于后期调试

### 在终端中采用交互式执行

需要配置好配置文件，并安装以下两个必须的 `npm` 包及其他用到的插件及预置等：
* `@babel/core`  
* `@babel/node`  


之后可以使用 `babel-node` 命令交互式执行，如果需要支持 `.es6`,`.js`,`.es`,`.jsx`,`.mjs` 五种后缀以为的文件通过 require 导入，需要使用 `-x` 选项，使用方式同 `babel` 命令

### 在 node 上下文中使用

需要配置好配置文件，并安装以下两个必须的 `npm` 包及其他用到的插件及预置等：
* `@babel/core`  
* `@babel/register`  

之后在 node 的入口文件第一行前插入 `require('@babel/register');` 如果是采用 ES6 的 `import`， 则是 `import '@babel/register';`

### 在 node 中调用 babel 进行转换

只需要安装 `@babel/core`，之后按照如下格式执行即可：
`require('babel-core').transform('code', options);`
其中：
* `'code'` 是要转换的代码
* `options` 是要 babel 的配置


## 常用 `Babel` 语法转换插件

以下按照 `ES6+` 的常用特性及变成语言罗列，后面附相关插件，其中若未附带`@babel/plugin-syntax-*`且未特别说明则表示 `Babel` 默认支持此类语法的解析，部分后面附有常用选项，常用选项按照 `选项名: 类型 = 默认值` 的格式给出。
* 其他语言
  这一组插件，主要是将其他扩展于 `ECMAScript` 的语言转换成 `ECMAScript`。
  * `jsx`  
    [`@babel/plugin-syntax-jsx`](https://babeljs.io/docs/en/babel-plugin-syntax-jsx)  
    [`@babel/plugin-transform-react-jsx`](https://babeljs.io/docs/en/babel-plugin-transform-react-jsx)  
    常用选项：
      * `pragma`: `string` = `"React.createElement"` 编译 `JSX` 表达式时使用的渲染函数
      * `pragmaFrag`: `string` = `"React.Fragment"` 替换编译JSX片段时使用的组件
      * `useBuiltIns`: `boolean` = `false` 展开属性时，使用`Object.assign`，而不是使用 `Babel` 提供的函数
      * `throwIfNamespace`: `boolean` = `true` 使用`XML`命名空间标记名称时，是否抛出错误
  * `typescript`  
    Babel 只会移除 Typescript 中的类型和未使用的引入的包，所以不会加载 `tsconfig.json` 不支持 `namespace`、`const enum`、`export =`、`import =` 等，且不能生成 `.d.ts` 文件  
    [`@babel/plugin-syntax-typescript`](https://babeljs.io/docs/en/babel-plugin-syntax-typescript)  
    [`@babel/plugin-transform-typescript`](https://babeljs.io/docs/en/babel-plugin-transform-typescript)  
    常用选项：
      * `isTSX`: `boolean` = `false` 是否为 `TSX`，如果采用 `TSX` 则不支持`<type>variable` 形式的断言。如果未采用 `TSX` 则不能与 `TSX` 相关的插件共同使用
      * `jsxPragma`: `string` = `"React"` 编译 `TSX` 表达式时使用的渲染函数所属的变量。
* Module 转换
  这一组插件，主要用于将 `ECMAScript` 模块转换为其他类型的模块。
  * `amd`  
    [@babel/plugin-transform-modules-amd](https://babeljs.io/docs/en/babel-plugin-transform-modules-amd)
  * `commonjs`  
    [@babel/plugin-transform-modules-commonjs](https://babeljs.io/docs/en/babel-plugin-transform-modules-commonjs)
  * `systemjs`  
    [@babel/plugin-transform-modules-systemjs](https://babeljs.io/docs/en/babel-plugin-transform-modules-systemjs)
  * `umd`  
    [@babel/plugin-transform-modules-umd](https://babeljs.io/docs/en/babel-plugin-transform-modules-umd)
* 语法糖  
  这一组插件针对的特性，一般被称为语法糖，除非转换后的语法需要版本要求，一般可以放心使用。
  * `ES2015` 箭头函数 `p => r`  
    [`@babel/plugin-transform-arrow-functions`](https://babeljs.io/docs/en/babel-plugin-transform-arrow-functions)  
  * `ES2015` 块级作用域与 `let` / `const`  
    [`@babel/plugin-transform-block-scoping`](https://babeljs.io/docs/en/babel-plugin-transform-block-scoping)  
    常用选项  
    * `throwIfClosureRequired`: `boolean` = `false` 碰到无法转换的情况时抛出错误
  * `ES2015` 类 `class C{ /* ... */ }`  
    [`@babel/plugin-transform-classes`](https://babeljs.io/docs/en/babel-plugin-transform-classes)  
  * `ES2015` 解构 `var [, b, c, d , ...other] = array`, `var {a , b: c } = obj`  
    [`@babel/plugin-transform-destructuring`](https://babeljs.io/docs/en/babel-plugin-transform-destructuring)  
    常用选项：
      * `useBuiltIns`: `boolean` = `false` 展开属性时，使用`Object.assign`，而不是使用 `Babel` 提供的函数
  * `ES2015` 参数解构 `function({a, b: c}, [d, e, ...f],  ...g) { /* ... */ }`  
    [`@babel/plugin-transform-parameters`](https://babeljs.io/docs/en/babel-plugin-transform-parameters)  
  * `ES2015` 展开运算 `var a = [b, c, ...d, e]`, `f(b, c, ...d, e)`  
    [`@babel/plugin-transform-spread`](https://babeljs.io/docs/en/babel-plugin-transform-spread)  
    常用选项：
      * `loose`: `boolean` = `false` 是否将所有要类似数组展开的变量均按照普通数组方式展开
  * `ES2015` 简写属性 `var a = { b, c, d}`  
    [`@babel/plugin-transform-shorthand-properties`](https://babeljs.io/docs/en/babel-plugin-transform-shorthand-properties)  
  * `ES2015` 计算属性 `var a = {[x + y] : z}`  
    [`@babel/plugin-transform-computed-properties`](https://babeljs.io/docs/en/babel-plugin-transform-computed-properties)  
  * `ES2015` 模板字符串 `` `${a}+${b}=${a+b}` ``  
    [`@babel/plugin-transform-template-literals`](https://babeljs.io/docs/en/babel-plugin-transform-template-literals)  
  * `ES2015` 字面量 `0o23`, `0b101`, `0b101`, `'Hello\u{000A}\u{0009}!'`  
    [`@babel/plugin-transform-literals`](https://babeljs.io/docs/en/babel-plugin-transform-literals)  
  * `ES2015` 生成器函数 `function *f() { /* ... */ }`  
    [`@babel/plugin-transform-regenerator`](https://babeljs.io/docs/en/babel-plugin-transform-regenerator)  
  * `ES2016` 幂运算符 `a ** b`  
    [`@babel/plugin-syntax-exponentiation-operator`](https://babeljs.io/docs/en/babel-plugin-syntax-exponentiation-operator)  
    [`@babel/plugin-transform-exponentiation-operator`](https://babeljs.io/docs/en/babel-plugin-transform-exponentiation-operator)  
  * `ES2017` 异步函数 `async function f() { /* ... */ }`  
    [`@babel/plugin-syntax-async-functions`](https://babeljs.io/docs/en/babel-plugin-syntax-async-functions)  
    [`@babel/plugin-transform-async-to-generator`](https://babeljs.io/docs/en/babel-plugin-transform-async-to-generator)  
  * `ES2018` 异步生成器函数 `async function* f() { /* ... */ }`  
    [`@babel/plugin-syntax-async-generators`](https://babeljs.io/docs/en/babel-plugin-syntax-async-generators)  
    [`@babel/plugin-proposal-async-generator-functions`](https://babeljs.io/docs/en/babel-plugin-proposal-async-generator-functions)  
  * `ES2018` 可选 catch 绑定 `try { /* ... */ } catch { /* ... */ }`  
    [`@babel/plugin-syntax-optional-catch-binding`](https://babeljs.io/docs/en/babel-plugin-syntax-optional-catch-binding)  
    [`@babel/plugin-proposal-optional-catch-binding`](https://babeljs.io/docs/en/babel-plugin-proposal-optional-catch-binding)  
  * `ES2018` 对象解析赋值 `var { x, y, ...z } = obj`  
    [`@babel/plugin-syntax-object-rest-spread`](https://babeljs.io/docs/en/babel-plugin-syntax-object-rest-spread)  
    [`@babel/plugin-proposal-object-rest-spread`](https://babeljs.io/docs/en/babel-plugin-proposal-object-rest-spread)  
    常用选项：
      * `useBuiltIns`: `boolean` = `false` 展开属性时，使用 `Object.assign`，而不是使用 `Babel` 提供的函数
  * `草案` 类属性 `class { prop = 'value'; }`  
    [`@babel/plugin-syntax-class-properties`](https://babeljs.io/docs/en/babel-plugin-syntax-class-properties)  
    [`@babel/plugin-proposal-class-properties`](https://babeljs.io/docs/en/babel-plugin-proposal-class-properties)  
  * `草案` do 表达式 `do {/* ... */ }`  
    [`@babel/plugin-syntax-do-expressions`](https://babeljs.io/docs/en/babel-plugin-syntax-do-expressions)  
    [`@babel/plugin-proposal-do-expressions`](https://babeljs.io/docs/en/babel-plugin-proposal-do-expressions)  
  * `草案` export default from `export name from 'mod'`  
    [`@babel/plugin-syntax-export-default-from`](https://babeljs.io/docs/en/babel-plugin-syntax-export-default-from)  
    [`@babel/plugin-proposal-export-default-from`](https://babeljs.io/docs/en/babel-plugin-proposal-export-default-from)  
  * `草案` export namespace from `export * as name from 'mod'`  
    [`@babel/plugin-syntax-export-namespace-from`](https://babeljs.io/docs/en/babel-plugin-syntax-export-namespace-from)  
    [`@babel/plugin-proposal-export-namespace-from`](https://babeljs.io/docs/en/babel-plugin-proposal-export-namespace-from)  
  * `草案` 绑定运算符 `obj::func`, `obj::func()`, `::obj.func`, `::obj.func()`  
    [`@babel/plugin-syntax-function-bind`](https://babeljs.io/docs/en/babel-plugin-syntax-function-bind)  
    [`@babel/plugin-proposal-function-bind`](https://babeljs.io/docs/en/babel-plugin-proposal-function-bind)  
  * `草案` 逻辑赋值运算符 `a ||= b`, `a &&= b`  
    [`@babel/plugin-syntax-logical-assignment-operators`](https://babeljs.io/docs/en/babel-plugin-syntax-logical-assignment-operators)  
    [`@babel/plugin-proposal-logical-assignment-operators`](https://babeljs.io/docs/en/babel-plugin-proposal-logical-assignment-operators)  
  * `草案` 空结合运算符 `a ?? b`  
    [`@babel/plugin-syntax-nullish-coalescing-operator`](https://babeljs.io/docs/en/babel-plugin-syntax-nullish-coalescing-operator)  
    [`@babel/plugin-proposal-nullish-coalescing-operator`](https://babeljs.io/docs/en/babel-plugin-proposal-nullish-coalescing-operator)  
  * `草案` 数字分隔符 `12_3456_7890`  
    [`@babel/plugin-syntax-numeric-separator`](https://babeljs.io/docs/en/babel-plugin-syntax-numeric-separator)  
    [`@babel/plugin-proposal-numeric-separator`](https://babeljs.io/docs/en/babel-plugin-proposal-numeric-separator)  
  * `草案` 数字分隔符 `12_3456_7890`  
    [`@babel/plugin-syntax-numeric-separator`](https://babeljs.io/docs/en/babel-plugin-syntax-numeric-separator)  
    [`@babel/plugin-proposal-numeric-separator`](https://babeljs.io/docs/en/babel-plugin-proposal-numeric-separator)  
  * `草案` 可选链运算符 `a?.b`  
    [`@babel/plugin-syntax-optional-chaining`](https://babeljs.io/docs/en/babel-plugin-syntax-optional-chaining)  
    [`@babel/plugin-proposal-optional-chaining`](https://babeljs.io/docs/en/babel-plugin-proposal-optional-chaining)  
  * `草案` 局部应用 `f(?, p1, p2)`, `f(p0, ?, p2)`, `f(p0, p1, ?)`, `?.f(p0, p1, p2)`  
    [`@babel/plugin-syntax-partial-application`](https://babeljs.io/docs/en/babel-plugin-syntax-partial-application)  
    [`@babel/plugin-proposal-partial-application`](https://babeljs.io/docs/en/babel-plugin-proposal-partial-application)  
  * `草案` 管道运算符 `a |> f`  
    [`@babel/plugin-syntax-pipeline-operator`](https://babeljs.io/docs/en/babel-plugin-syntax-pipeline-operator)  
    [`@babel/plugin-proposal-pipeline-operator`](https://babeljs.io/docs/en/babel-plugin-proposal-pipeline-operator)  
  * `草案` 类的私有方法 `class C{ #method() { /* ... */ }}`  
    类的私有方法暂时单纯的私有方法  
    [`@babel/plugin-proposal-private-methods`](https://babeljs.io/docs/en/babel-plugin-proposal-private-methods)  
  * `草案` throw 表达式 ` throw error `  
    [`@babel/plugin-syntax-throw-expressions`](https://babeljs.io/docs/en/babel-plugin-syntax-throw-expressions)  
    [`@babel/plugin-proposal-throw-expressions`](https://babeljs.io/docs/en/babel-plugin-proposal-throw-expressions)  
* 底层实现  
  这一组插件，转换后可以运行在低版本平台上，但可能会丧失部分功能，如正则表达式的修饰符。
  * `ES2015` for-of 循环 `for (var val of variable) { /* ... */ }`  
    [`@babel/plugin-transform-for-of`](https://babeljs.io/docs/en/babel-plugin-transform-for-of)  
    常用选项：
      * `assumeArray`: `boolean` = `false` 是否假定所有被循环对象均为数组
  * `ES2015` typeof symbol `typeof variable === 'symbol'`  
    [`@babel/plugin-transform-typeof-symbol`](https://babeljs.io/docs/en/babel-plugin-transform-typeof-symbol)  
  * `ES2015` 正则表达式 Unicode 模式修饰符 `u`  
    [`@babel/plugin-transform-unicode-regex`](https://babeljs.io/docs/en/babel-plugin-transform-unicode-regex)  
  * `ES2018` 正则表达式 dotAll 模式修饰符 `s`  
    [`@babel/plugin-transform-dotall-regex`](https://babeljs.io/docs/en/babel-plugin-transform-dotall-regex)  
  * `ES2018` 正则表达式命名捕获组  
    [`@babel/plugin-transform-named-capturing-groups-regex`](https://babeljs.io/docs/en/babel-plugin-transform-named-capturing-groups-regex)  
  * `ES2018` 正则表达式 Unicode 特性项  
    [`@babel/plugin-proposal-unicode-property-regex`](https://babeljs.io/docs/en/babel-plugin-proposal-unicode-property-regex)  
    常用属性：
      * `runtime`: `boolean` = `true` 开启此选项时，将需要最低的 `ES2015` 的正则表达式支持；禁用此选项时，需要导入适当的 `polyfill`，但输出不仅支持捕获组命名。



