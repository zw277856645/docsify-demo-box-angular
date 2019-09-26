import {
    createAppComponentTs, createAppRouterModuleTs, createIndexHtml, createMainTs, createPolyfills, parseConfig
} from './util';
import sdk from '@stackblitz/sdk';
import { deepExtend } from 'cmjs-lib';
import { DocsifyDemoBoxAngularConfig } from './config';
import {
    COMPONENT_CLASS_REG, DEFAULT_DEPENDENCIES, DEFAULT_EMBED_CONFIG, DIRECTIVE_CLASS_REG, PIPE_CLASS_REG
} from './constants';
import { FileInfo, FileType } from './file-info';

export function dealSourceCodeMode(id: string, originCode: string, globalConfig: DocsifyDemoBoxAngularConfig) {
    Promise.resolve().then(() => {
        let { config: innerConfig, code } = parseConfig(originCode);

        if (!COMPONENT_CLASS_REG.exec(code)) {
            throw Error('No angular component definition');
        }

        // 找到第一个 component，以其为主组件，且文件名与其相关
        let className = RegExp.$1;
        let fileName = parseClassName2FileName(className);

        let fileInfo = new FileInfo();
        fileInfo.className = className;
        fileInfo.fileName = fileName;
        fileInfo.virtualFileName = fileName;
        fileInfo.code = code;
        fileInfo.ext = '.ts';
        fileInfo.type = FileType.COMPONENT;
        fileInfo.mainComponent = true;

        // 需要在 module 声明的组件
        let needDeclares = [];

        // 解析全部 component
        let componentReg = new RegExp(COMPONENT_CLASS_REG, 'g');
        while (componentReg.exec(code)) {
            needDeclares.push(RegExp.$1);
        }

        // 解析全部 directive
        let directivetReg = new RegExp(DIRECTIVE_CLASS_REG, 'g');
        while (directivetReg.exec(code)) {
            needDeclares.push(RegExp.$1);
        }

        // 解析全部 pipe
        let pipeReg = new RegExp(PIPE_CLASS_REG, 'g');
        while (pipeReg.exec(code)) {
            needDeclares.push(RegExp.$1);
        }

        // 需要在 module 导入的其他模块
        let needImports = deepExtend(
            {},
            globalConfig && globalConfig.extraModules,
            innerConfig && innerConfig.extraModules
        );

        sdk.embedProject(
            id,
            deepExtend(
                {
                    files: createDefaultFile(fileInfo, needDeclares, needImports),
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
                    openFile: `${fileName}.ts`
                },
                globalConfig && globalConfig.embedOptions,
                innerConfig && innerConfig.embedOptions
            )
        );
    });

    return `<div id="${id}"></div>`;
}

// 辅助工具

function parseClassName2FileName(className: string) {
    return className.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/(^-)|(-$)/g, '');
}

function createAppModuleTs(needDeclares: string[], fileName: string, needImports: { [ k: string ]: string }) {
    let modules = Object.keys(needImports).map(k => ({ name: k, package: needImports[ k ] }));

    return `
        import { NgModule } from '@angular/core';
        import { CommonModule } from '@angular/common';
        import { BrowserModule } from '@angular/platform-browser';
        import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
        import { AppRouterModule } from './app-router.module';
        import { AppComponent } from './app.component';
        import { ${needDeclares.join(', ')} } from './${fileName}';
        ${modules.map(module => `import { ${module.name} } from '${module.package}';`).join('')}
        
        @NgModule({
            imports: [
                CommonModule,
                BrowserModule,
                BrowserAnimationsModule,
                AppRouterModule,
                ${modules.map(module => module.name).join(',')}
            ],
            declarations: [ 
                AppComponent,
                ${needDeclares.join(',')}
            ],
            bootstrap: [ AppComponent ]
        })
        export class AppModule {
        }
    `;
}

function createDefaultFile(fileInfo: FileInfo, needDeclares: string[], needImports: { [ k: string ]: string }) {
    if (!fileInfo) {
        return {};
    }

    return {
        'index.html': createIndexHtml(),
        'main.ts': createMainTs(),
        'polyfills.ts': createPolyfills(),
        'app.component.ts': createAppComponentTs(),
        'app-router.module.ts': createAppRouterModuleTs(fileInfo),
        'app.module.ts': createAppModuleTs(needDeclares, fileInfo.virtualFileName, needImports),
        [ fileInfo.virtualFileName + fileInfo.ext ]: fileInfo.code
    };
}