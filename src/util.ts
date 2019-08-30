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

export function createAppModuleTs(className: string, fileName: string) {
    return `
        import { NgModule } from '@angular/core';
        import { CommonModule } from '@angular/common';
        import { BrowserModule } from '@angular/platform-browser';
        import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
        import { AppRouterModule } from './app-router.module';
        import { AppComponent } from './app.component';
        import { ${className} } from './${fileName}';
        
        @NgModule({
            imports: [
                CommonModule,
                BrowserModule,
                BrowserAnimationsModule,
                AppRouterModule
            ],
            declarations: [ 
                AppComponent,
                ${className}
            ],
            bootstrap: [ AppComponent ]
        })
        export class AppModule {
        }
    `;
}

export function createAppRouterModuleTs(className: string, fileName: string) {
    return `
        import { RouterModule, Routes } from '@angular/router';
        import { NgModule } from '@angular/core';
        import { ${className} } from './${fileName}';
        
        const routes: Routes = [
            {
                path: '',
                component: ${className}
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