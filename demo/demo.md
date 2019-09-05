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

## 文件引入模式

``` angular-files
files/main.component.ts
files/main.component.css
./files/main.component.html
```

