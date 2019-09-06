## 源代码模式

``` angular
import { Component } from '@angular/core';

@Component({
    template: `<h2>Hello，{{name}}</h2>`,
    styleUrls: [ 'style.css' ]
})
export class BounceDropComponent {
    name = 'xxx';
}
```

## 部分文件引入模式

``` angular-files
files/util.ts
files/main.component.ts
files/style.component.ts
```

## 全量文件引入方式

``` angular-all-files
all-files/app.component.ts
all-files/app.module.ts
all-files/app-router.module.ts
all-files/main.ts
all-files/polyfills.ts
all-files/index.html
all-files/main.component.ts

files/style.component.ts
```

