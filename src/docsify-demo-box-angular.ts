import { deepExtend } from 'cmjs-lib';
import sdk from '@stackblitz/sdk';

export function create() {
    const win = window as any;

    win.$docsify.markdown = win.$docsify.markdown || {};
    win.$docsify.markdown.renderer = win.$docsify.markdown.renderer || {};

    win.$docsify.markdown.renderer.code = (function (codeFn) {
        let count = 0;

        return function (code: string, lang: string) {
            if (/angular/i.test(lang)) {
                const id = `demo-box-angular-${++count}`;

                Promise.resolve().then(() => {
                    if (!/class\s+(\w+)\s*{/.exec(code)) {
                        throw Error('Invalid angular component definition');
                    }

                    const className = RegExp.$1;
                    const fileName = parseClassName2FileName(className);

                    // 合并外部配置(如果有)
                    const outerConfig = win.$docsify.angular || {};
                    const projectConfig = outerConfig.project || {};
                    const embedConfig = outerConfig.embed || {};

                    sdk.embedProject(
                        id,
                        deepExtend(
                            {
                                files: {
                                    'index.html': createIndexHtml(),
                                    'main.ts': createMainTs(),
                                    'polyfills.ts': createPolyfills(),
                                    'app.module.ts': createAppModuleTs(className, fileName),
                                    'app-router.module.ts': createAppRouterModuleTs(className, fileName),
                                    'app.component.ts': createAppComponentTs(),
                                    [ `${fileName}.ts` ]: code
                                },
                                template: 'angular-cli',
                                dependencies: {
                                    '@angular/animations': '^8.1.2',
                                    '@angular/common': '^8.1.2',
                                    '@angular/core': '^8.1.2',
                                    '@angular/router': '^8.1.2',
                                    '@angular/platform-browser': '^8.1.2',
                                    '@angular/platform-browser-dynamic': '^8.1.2',
                                    'rxjs': '^6.5.1',
                                    'zone.js': '^0.9.1',
                                    'core-js': '^2.5.7'
                                }
                            },
                            projectConfig
                        ),
                        deepExtend(
                            {
                                height: 400,
                                width: '100%',
                                view: 'preview',
                                hideExplorer: true,
                                hideNavigation: true,
                                forceEmbedLayout: true,
                                openFile: `${fileName}.ts`
                            },
                            embedConfig
                        )
                    );
                });

                return `<div id="${id}"></div>`;
            } else {
                if (codeFn) {
                    return codeFn.apply(this, arguments);
                } else {
                    return this.origin.code.apply(this, arguments);
                }
            }
        };
    })(win.$docsify.markdown.renderer.code);
}

function createIndexHtml() {
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

function createMainTs() {
    return `
        import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
        import { AppModule } from './app.module';
        
        platformBrowserDynamic().bootstrapModule(AppModule, { preserveWhitespaces: false });
    `;
}

function createPolyfills() {
    return `
        import 'core-js/es6/reflect';
        import 'core-js/es7/reflect';
        import 'zone.js/dist/zone';
    `;
}

function createAppModuleTs(className: string, fileName: string) {
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

function createAppRouterModuleTs(className: string, fileName: string) {
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

function createAppComponentTs() {
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

function parseClassName2FileName(className: string) {
    return className.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/(^-)|(-$)/, '');
}
