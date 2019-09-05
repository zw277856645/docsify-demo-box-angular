import { deepExtend } from 'cmjs-lib';
import sdk from '@stackblitz/sdk';
import * as $ from 'jquery';
import { EmbedOptions, Project } from '@stackblitz/sdk/typings/interfaces';
import { createDefaultFiles, FileInfo, FileType, parseClassName2FileName } from './util';

export interface DocsifyDemoBoxAngularConfig {

    project?: Partial<Project>;

    embedOptions?: Partial<EmbedOptions>;
}

const COMPONENT_CLASS_REG = /@Component\s*\(\s*\{(?:.|\n)+?\}\s*\)\s*export\s+class\s+(\w+)\s*{/;
const DIRECTIVE_CLASS_REG = /@Directive\s*\(\s*\{(?:.|\n)+?\}\s*\)\s*export\s+class\s+(\w+)\s*{/;
const PIPE_CLASS_REG = /@Pipe\s*\(\s*\{(?:.|\n)+?\}\s*\)\s*export\s+class\s+(\w+)\s*{/;

const defaultDependencies = {
    '@angular/animations': '^8.1.2',
    '@angular/common': '^8.1.2',
    '@angular/core': '^8.1.2',
    '@angular/router': '^8.1.2',
    '@angular/platform-browser': '^8.1.2',
    '@angular/platform-browser-dynamic': '^8.1.2',
    'rxjs': '^6.5.1',
    'zone.js': '^0.9.1',
    'core-js': '^2.5.7'
};

const defaultEmbedConfig = {
    height: 400,
    width: '100%',
    view: 'preview',
    hideExplorer: true,
    hideNavigation: true,
    forceEmbedLayout: true,
};

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
                    const id = `demo-box-angular-${++count}`;

                    if (/^angular$/i.test(lang)) {
                        // 源代码模式
                        return dealSourceCodeMode(id, code, config);
                    } else if (/^angular-files$/i.test(lang)) {
                        // 部分文件引入方式
                        return dealPartFilesMode(id, code, config);
                    } else if (/^angular-files-full$/i.test(lang)) {
                        // 全量文件引入方式
                        return dealFullFilesMode();
                    } else {
                        // 原始解析器
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

function dealSourceCodeMode(id: string, code: string, config: DocsifyDemoBoxAngularConfig) {
    Promise.resolve().then(() => {
        if (!COMPONENT_CLASS_REG.exec(code)) {
            throw Error('No angular component definition');
        }

        const className = RegExp.$1;
        const fileName = parseClassName2FileName(className);

        sdk.embedProject(
            id,
            deepExtend(
                {
                    files: createDefaultFiles([ {
                        className,
                        fileName,
                        code,
                        ext: '.ts',
                        type: FileType.COMPONENT,
                        mainComponent: true
                    } ]),
                    template: 'angular-cli',
                    dependencies: defaultDependencies,
                    settings: {
                        compile: {
                            clearConsole: false
                        }
                    }
                },
                config && config.project
            ),
            deepExtend(
                {
                    ...defaultEmbedConfig,
                    openFile: `${fileName}.ts`
                },
                config && config.embedOptions
            )
        );
    });

    return `<div id="${id}"></div>`;
}

function dealPartFilesMode(id: string, code: string, config: DocsifyDemoBoxAngularConfig) {
    let files = code.match(/^(?<!\/\/|\/\*|\/\*\*)\s*((\.\/)?[\w$][\w$/.]+)/mg);
    if (!files) {
        throw Error('No files provided');
    }

    // ajax 读取服务器下的本地文件
    Promise.all(
        files.map(file => $.get(file.trim()).catch(() => null))
    ).then(fileContents => {
        let fileInfos = fileContents.map((content, i) => {
            if (content) {
                let info = new FileInfo();
                info.code = content;

                let filePath = files[ i ].trim();
                if (!filePath.startsWith('./')) {
                    filePath = './' + filePath;
                }

                info.fileName = filePath.substring(0, filePath.lastIndexOf('.'));
                info.ext = filePath.substring(filePath.lastIndexOf('.'));

                if (/^.ts$/i.test(info.ext)) {
                    if (COMPONENT_CLASS_REG.exec(content)) {
                        info.className = RegExp.$1;
                        info.type = FileType.COMPONENT;
                    } else if (DIRECTIVE_CLASS_REG.exec(content)) {
                        info.className = RegExp.$1;
                        info.type = FileType.DIRECTIVE;
                    } else if (PIPE_CLASS_REG.exec(content)) {
                        info.className = RegExp.$1;
                        info.type = FileType.PIPE;
                    } else {
                        info.type = FileType.OTHER;
                    }
                } else {
                    info.type = FileType.OTHER;
                }

                return info;
            }

            return null;
        });

        // 设置第一个 component 为主组件
        let mainComponent = fileInfos.find(file => file.type === FileType.COMPONENT);

        if (!mainComponent) {
            throw Error('No main component provided');
        }

        mainComponent.mainComponent = true;

        sdk.embedProject(
            id,
            deepExtend(
                {
                    files: createDefaultFiles(fileInfos.filter(v => v)),
                    template: 'angular-cli',
                    dependencies: defaultDependencies,
                    settings: {
                        compile: {
                            clearConsole: false
                        }
                    }
                },
                config && config.project
            ),
            deepExtend(
                {
                    ...defaultEmbedConfig,
                    openFile: mainComponent.fileName + mainComponent.ext
                },
                config && config.embedOptions
            )
        );
    });

    return `<div id="${id}"></div>`;
}

function dealFullFilesMode() {

}
