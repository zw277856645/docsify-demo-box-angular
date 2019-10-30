## 源代码模式

``` angular
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
    template: `
        <h2>Hello，<span [innerHTML]="name | color:'red'"></span></h2>
        <span *ngFor="let rec of list | listFilter:{age:{$gte:2}}">{{ rec.age }} </span>
    `
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
        return this.sanitizer.bypassSecurityTrustHtml(`<span style="color:${color}">${value}</span>`);
    }
}
```



## 部分文件引入模式

``` angular-files
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

files/util.ts
files/main.component.html
files/main.component.css
files/main.component.ts
files/style.component.html
files/style.component.css
files/style.component.ts

[files/]test.txt
```



## 全量文件引入方式

``` angular-all-files
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
[all-files/]main.ts
[all-files/]polyfills.ts
[all-files/]index.html
[all-files/]main.component.html
[all-files/]main.component.css
[all-files/]main.component.ts
[all-files/]external/style.component.html
[all-files/]external/style.component.css
[all-files/]external/style.component.ts
```

