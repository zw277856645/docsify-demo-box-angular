## 源代码模式

``` angular
{
  "project": {
    "dependencies": {
      "ngx-list-filter": "0.0.11"
    }
  }
}

/* DemoComponent */

import { Component } from '@angular/core';

@Component({
    template: `
        <h2>Hello，<span [innerHTML]="name | color:'red'"></span></h2>
        <div>[{age:1,age:2,age:3}] | listFilter:{age:{$gte:2}} | json</div>
    `
})
export class DemoComponent {
    name = 'xxx';
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
        return this.sanitizer.bypassSecurityTrustHtml(`<span style="color:${color}">${value}</span>`);
    }
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
all-files/external/style.component.ts
```

