export function createIndexHtml() {
    return `
        <!DOCTYPE html>
        <html>
            <head>
                <title></title>
                <base href="/">
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <meta http-equiv="pragma" content="no-cache">
                <meta http-equiv="cache-control" content="no-cache">
                <meta http-equiv="expires" content="0">
            </head>
            <body>
                <my-app>加载中...</my-app>
            </body>
        </html>
    `;
}

export function createMainTs() {
    return `
        import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
        import { AppModule } from './app.module';
        
        platformBrowserDynamic().bootstrapModule(AppModule, { preserveWhitespaces: false });
    `;
}

export function createPolyfills() {
    return `
        import 'core-js/es6/reflect';
        import 'core-js/es7/reflect';
        import 'zone.js/dist/zone';
    `;
}

export function createAppModuleTs(files: FileInfo[]) {
    return `
        import { NgModule } from '@angular/core';
        import { CommonModule } from '@angular/common';
        import { BrowserModule } from '@angular/platform-browser';
        import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
        import { AppRouterModule } from './app-router.module';
        import { AppComponent } from './app.component';
        ${files.map(file => `import { ${file.className} } from '${file.fileName}';`).join('')}
        
        @NgModule({
            imports: [
                CommonModule,
                BrowserModule,
                BrowserAnimationsModule,
                AppRouterModule
            ],
            declarations: [ 
                AppComponent,
                ${files.map(file => file.className).join(',')}
            ],
            bootstrap: [ AppComponent ]
        })
        export class AppModule {
        }
    `;
}

export function createAppRouterModuleTs(mainFile: FileInfo) {
    return `
        import { RouterModule, Routes } from '@angular/router';
        import { NgModule } from '@angular/core';
        import { ${mainFile.className} } from '${mainFile.fileName}';
        
        const routes: Routes = [
            {
                path: '',
                component: ${mainFile.className}
            }
        ];
        
        @NgModule({
            imports: [ RouterModule.forRoot(routes, { useHash: true }) ],
            exports: [ RouterModule ]
        })
        export class AppRouterModule {
        }
    `;
}

export function createAppComponentTs() {
    return `
        import { Component } from '@angular/core';
        
        @Component({
            selector: 'my-app',
            template: '<router-outlet></router-outlet>'
        })
        export class AppComponent {
        }
    `;
}

export function parseClassName2FileName(className: string) {
    return className.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/(^-)|(-$)/, '');
}

export class FileInfo {

    className?: string;

    fileName: string;

    type: FileType;

    ext: string;

    code: string;

    mainComponent?: boolean;
}

export enum FileType {
    COMPONENT = 'COMPONENT', DIRECTIVE = 'DIRECTIVE', PIPE = 'PIPE', OTHER = 'OTHER'
}

export function createDefaultFiles(fileInfos: FileInfo[]) {
    if (!fileInfos || !fileInfos.length) {
        return {};
    }

    // 需要在 module 中声明的文件
    let needDeclareFiles = fileInfos.filter(file => {
        return [ FileType.COMPONENT, FileType.DIRECTIVE, FileType.PIPE ].indexOf(file.type) >= 0;
    });

    // 主组件
    let mainComponent = needDeclareFiles.find(file => file.mainComponent);

    let files = {
        'index.html': createIndexHtml(),
        'main.ts': createMainTs(),
        'polyfills.ts': createPolyfills(),
        'app.component.ts': createAppComponentTs(),
        'app.module.ts': createAppModuleTs(needDeclareFiles),
        'app-router.module.ts': createAppRouterModuleTs(mainComponent)
    };

    fileInfos.forEach(file => files[ file.fileName + file.ext ] = file.code);

    return files;
}