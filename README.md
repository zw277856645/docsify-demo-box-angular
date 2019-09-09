# docsify-demo-box-angular

docsify 运行 angular demo 的插件

## 🔨 使用

#### 1.在 index.html 引入脚本

```html
<script src="https://unpkg.com/docsify-demo-box-angular@{version}/docsify-demo-box-angular.bundle.js"></script>
```

#### 2.在 docsify plugins 中引入插件

```js
window.$docsify = {
    ...
    plugins: [
        DemoBoxAngular.create(config)
    ]
}
```

DemoBoxAngular.create 配置依赖 stackblitz sdk，各参数作用请参见
[Stackblitz DOC](https://stackblitz.com/docs#generate-and-embed-new-projects)

```js
{
    // 项目配置
    project?: {
        files?: { [path: string]: string };  // 定义额外的文件
        title?: string;
        description?: string;
        template?: 'angular-cli' | 'create-react-app' | 'typescript' | 'javascript';  // 默认 angular-cli，请勿修改
        tags?: string[];
        dependencies?: { [name: string]: string };  // 如果依赖了插件未包含的npm包，需要在此指定
        settings?: {
            compile?: {
              trigger?: 'auto' | 'keystroke' | 'save';
              action?: 'hmr' | 'refresh';
              clearConsole?: boolean;
            };
        };
    },

    // 代码预览器配置
    embedOptions?: {
        openFile?: string;            // 初始在代码窗口打开的文件。默认为 markdown 中解析到的组件
        clickToLoad?: boolean;        // 点击窗口后才开始加载。默认 false
        view?: 'preview' | 'editor';  // preview - 预览模式，editor - 代码模式。默认 preview
        height?: number | string;     // 内嵌窗口高度。默认 400
        width?: number | string;      // 内嵌窗口宽度。默认 100%
        hideExplorer?: boolean;       // 是否隐藏文件浏览器，关闭后只能看到 openFile 指定的文件。默认 true
        hideNavigation?: boolean;     // 是否隐藏导航栏。默认 true
        forceEmbedLayout?: boolean;   // 是否强制使用内嵌布局。默认 true
    }
}
```

如果依赖了插件未包含的npm包，需要在配置的`dependencies`中指定。默认已依赖的包如下：
- @angular/animations: ^8.1.2
- @angular/common: ^8.1.2
- @angular/core: ^8.1.2
- @angular/router: ^8.1.2
- @angular/platform-browser: ^8.1.2
- @angular/platform-browser-dynamic: ^8.1.2
- rxjs: ^6.5.1
- zone.js: ^0.9.1
- core-js: ^2.5.7

#### 3.定义 angular 解析器

提供了3种方式：
- angular
源码模式，在文档中直接定义组件源码，适合简单/代码量小的组件使用。相关 angular 运行必备的环境文件由插件内置

- angular-files
部分文件引入模式，在文档中指定组件的路径，适合复杂/代码量大的组件使用。相关 angular 运行必备的环境文件由插件内置

- angular-all-files
全量文件引入方式，在文档中指定组件的路径，适合复杂/代码量大的组件使用。不提供任何内置文件，所有文件自定义，注意 index.html、main.ts 为
必须指定的文件

```js
\`\`\`angular
import { Component } from '@angular/core';

@Component({
    template: '<div>Hello {{ name }}</div>'
})
export class ExampleComponent {
    name = 'man'
}
\`\`\`
```



