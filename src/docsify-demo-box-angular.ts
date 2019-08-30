import { deepExtend } from 'cmjs-lib';
import sdk from '@stackblitz/sdk';
import { EmbedOptions, Project } from '@stackblitz/sdk/typings/interfaces';
import {
    createAppComponentTs,
    createAppModuleTs, createAppRouterModuleTs, createIndexHtml, createMainTs, createPolyfills, parseClassName2FileName
} from './util';

export interface DocsifyDemoBoxAngularConfig {

    project?: Partial<Project>;

    embedOptions?: Partial<EmbedOptions>;
}

export function create(config?: DocsifyDemoBoxAngularConfig) {
    return function (hook: any) {
        hook.init(function () {
            const win = window as any;

            win.$docsify = win.$docsify || {};
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
                                    config && config.project
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
                                    config && config.embedOptions
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
        });
    };
}
