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

> 注意此处是全局配置，对所有 demo 解析产生影响，如果需要针对某个demo 解析配置参数，请参考`示例`章节的`局部配置`

```js
{
    // 项目配置
    project?: {
        files?: { [path: string]: string };  // 定义额外的文件，全局配置通常不需要设置
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
        openFile?: string;            // 初始在代码窗口打开的文件。默认为 main.ts
        clickToLoad?: boolean;        // 点击窗口后才开始加载。默认 false
        view?: 'preview' | 'editor';  // preview - 预览模式，editor - 代码模式。默认 preview
        height?: number | string;     // 内嵌窗口高度。默认 480
        width?: number | string;      // 内嵌窗口宽度。默认 100%
        hideExplorer?: boolean;       // 是否隐藏文件浏览器，关闭后只能看到 openFile 指定的文件。默认 true
        hideNavigation?: boolean;     // 是否隐藏导航栏。默认 true
        hideDevTools?: boolean;       // 是否隐藏 console 控制台
        forceEmbedLayout?: boolean;   // 是否强制使用内嵌布局。默认 true
    },
    
    extraModules?: { [ k: string ]: string }  // 其他依赖的模块，key 为模块类名，value 为 npm 包名，与 project.dependencies 配合使用
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

## 🎨 示例

详情参见 [DEMO 示例](https://gitlab.com/zw277856645/docsify-demo-box-angular/raw/master/demo/demo.md)

#### 1.源码模式

```js
\`\`\`angular
{
  "project": {
    "dependencies": {
      "@demacia/ngx-list-filter": "0.0.1"
    }
  },
  "extraModules": {
    "ListFilterModule": "@demacia/ngx-list-filter"
  }
}

/* DemoComponent */

import { Component } from '@angular/core';

@Component({
    template: \`
        <h2>Hello，<span [innerHTML]="name | color:'red'"></span></h2>
        <span *ngFor="let rec of list | listFilter:{age:{$gte:2}}">{{ rec.age }} </span>
    \`
})
export class DemoComponent {
    name = 'xxx';
    list = [{age:1}, {age:2}, {age:3}];
}

/* ColorPipe */

import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
    name: 'color'
})
export class ColorPipe implements PipeTransform {

    constructor(private sanitizer: DomSanitizer) {
    }

    transform(value: string, color: string) {
        return this.sanitizer.bypassSecurityTrustHtml(\`<span style="color:${color}">${value}</span>\`);
    }
}
\`\`\`
```

注意要点：
- `局部配置`必须放在开头，前面不能有任何文本(包括注释)。`局部配置`优先级高于`全局配置`。注意是 json 字符串，不是 javascript 对象，请严格使用双引号
- 可以定义任意数量的`@Component`、`@Directive`、`@Pipe`，按从上到下顺序，`第一个 @Component 为路由出口组件`。只支持单路由，如果需要多出口路由，请使用「全量文件引入方式」
- `第一个 @Component 组件`会被设置为配置 embedOptions.openFile
- `@Component`的 html 模板和样式请使用内联方式 (template、styles)，不支持文件引入方式 (templateUrl、styleUrls)

#### 2.部分文件引入模式

```js
\`\`\`angular-files
{
  "project": {
    "dependencies": {
      "@demacia/ngx-list-filter": "0.0.1"
    }
  },
  "extraModules": {
    "ListFilterModule": "@demacia/ngx-list-filter"
  }
}

/* files path */

files/util.ts
files/main.component.html
files/main.component.css
files/main.component.ts
files/style.component.html
files/style.component.css
files/style.component.ts

[files/]test.txt
\`\`\`
```

注意要点：
- `局部配置`必须放在开头，前面不能有任何文本(包括注释)。`局部配置`优先级高于`全局配置`。注意是 json 字符串，不是 javascript 对象，请严格使用双引号
- 所有使用到的文件都要被引入，包括`@Component`中的 templateUrl 和 styleUrls
- 不能简写成引用目录下所有文件形式，比如：files/**。目录 (示例中的 files/) 是非必须的，但推荐使用目录隔离不同的 demo
- 按从上到下顺序，`第一个 @Component 为路由出口组件`，比如上面示例中的第一个`@Component`文件为 main.component.ts。只支持单路由，如果需要多出口路由，请使用「全量文件引入方式」
- `第一个 @Component 组件`会被设置为配置 embedOptions.openFile
- 路径中使用`[]`包围的部分会被忽略，可使用此方式`提升`生成文件的路径，比如示例中 [files/]test.txt，在生成 stackblitz 项目文件时，files 目录会被去除。注意某一文件目录提升时，与之相关的其他文件需要一并提升目录   

#### 3.全量文件引入方式

```js
\`\`\`angular-all-files
{
  "project": {
    "dependencies": {
      "@demacia/ngx-list-filter": "0.0.1"
    }
  },
  "embedOptions": {
    "clickToLoad": true
  }
}

[all-files/]app.component.ts
[all-files/]app.module.ts
[all-files/]app-router.module.ts
[all-files/]main.ts      (必须提供，且必须在根目录)                             
[all-files/]index.html   (必须提供，且必须在根目录)
[all-files/]polyfills.ts
[all-files/]main.component.html
[all-files/]main.component.css
[all-files/]main.component.ts
[all-files/]external/style.component.html
[all-files/]external/style.component.css
[all-files/]external/style.component.ts
\`\`\`
```

注意要点：
- `局部配置`必须放在开头，前面不能有任何文本(包括注释)。`局部配置`优先级高于`全局配置`。注意是 json 字符串，不是 javascript 对象，请严格使用双引号
- 所有使用到的文件都要被引入，包括`@Component`中的 templateUrl 和 styleUrls
- 不能简写成引用目录下所有文件形式，比如：all-files/**。目录 (示例中的 all-files/) 是非必须的，但推荐使用目录隔离不同的 demo
- 初始在代码窗口打开的文件 (embedOptions.openFile) 需要手动设定，默认为 main.ts
- index.html、main.ts 需要放在根目录才能被 stackblitz 识别，所以当 index.html、main.ts 前面有额外路径时，需使用`[]`提升目录
