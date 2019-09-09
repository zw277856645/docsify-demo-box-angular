import {
    ajaxGet, createAppComponentTs, createAppRouterModuleTs, createFileInfo, createIndexHtml, createMainTs,
    createPolyfills,
    DEFAULT_DEPENDENCIES,
    DEFAULT_EMBED_CONFIG,
    FILE_MODE_REG, FileInfo,
    FileType,
    getComponentUrlFiles, parseConfig
} from './util';
import sdk from '@stackblitz/sdk';
import { deepExtend } from 'cmjs-lib';
import { DocsifyDemoBoxAngularConfig } from './docsify-demo-box-angular';

export function dealPartFilesMode(id: string, originCode: string, globalConfig: DocsifyDemoBoxAngularConfig) {
    let { config: innerConfig, code } = parseConfig(originCode);

    let files = code.match(FILE_MODE_REG);
    if (!files) {
        throw Error('No files provided');
    }

    // ajax 读取服务器下的本地文件
    Promise.all(
        files.map(file => ajaxGet(file.trim()).catch(() => null))
    ).then(fileContents => {
        let fileInfos = fileContents
            .map((content, i) => content ? createFileInfo(content, files[ i ]) : null)
            .filter(v => v);

        // 设置第一个 component 为主组件
        let mainComponent = fileInfos.find(file => file.type === FileType.COMPONENT);

        if (!mainComponent) {
            throw Error('No main component provided');
        }

        mainComponent.mainComponent = true;

        // 获取 component 中 templateUrl、styleUrls文件
        let extraFiles = getComponentUrlFiles(fileInfos);

        Promise.all(
            extraFiles.map(file => ajaxGet(file.trim()).catch(() => null))
        ).then(extraFileContents => {
            let extraFileInfos = extraFileContents
                .map((content, i) => content ? createFileInfo(content, extraFiles[ i ]) : null)
                .filter(v => v);

            sdk.embedProject(
                id,
                deepExtend(
                    {
                        files: createDefaultFiles(fileInfos.concat(extraFileInfos)),
                        template: 'angular-cli',
                        dependencies: DEFAULT_DEPENDENCIES,
                        settings: {
                            compile: {
                                clearConsole: false
                            }
                        }
                    },
                    globalConfig && globalConfig.project,
                    innerConfig && innerConfig.project
                ),
                deepExtend(
                    {
                        ...DEFAULT_EMBED_CONFIG,
                        openFile: mainComponent.fileName + mainComponent.ext
                    },
                    globalConfig && globalConfig.embedOptions,
                    innerConfig && innerConfig.embedOptions
                )
            );
        });
    });

    return `<div id="${id}"></div>`;
}

// 辅助工具

function createAppModuleTs(files: FileInfo[]) {
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

function createDefaultFiles(fileInfos: FileInfo[]) {
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
        'app-router.module.ts': createAppRouterModuleTs(mainComponent),
        'app.module.ts': createAppModuleTs(needDeclareFiles)
    };

    fileInfos.forEach(file => files[ file.fileName.replace(/^\.\//, '') + file.ext ] = file.code);

    return files;
}