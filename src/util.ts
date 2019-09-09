/* 内部使用 */

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

function createAppRouterModuleTs(mainFile: FileInfo) {
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

/* 外部使用 */

export function ajaxGet(url: string) {
    return new Promise((resolve, reject) => {
        let httpRequest = new XMLHttpRequest();

        if (!httpRequest) {
            throw Error('Cannot create an XMLHTTP instance');
        }

        httpRequest.onreadystatechange = function () {
            if (httpRequest.readyState === XMLHttpRequest.DONE) {
                if (httpRequest.status === 200) {
                    resolve(httpRequest.responseText);
                } else {
                    reject(httpRequest);
                }
            }
        };

        httpRequest.open('GET', url);
        httpRequest.send();
    });
}

export function parseClassName2FileName(className: string) {
    return className.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/(^-)|(-$)/g, '');
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

export function createAllFiles(fileInfos: FileInfo[]) {
    // 找到 index.html，以其为根路径，移动所有文件
    let index = fileInfos.find(file => /index\.html$/i.test(file.fileName + file.ext));

    if (!index) {
        throw Error('No index.html provided');
    }

    let basePath = /^(.+)index$/i.exec(index.fileName) && RegExp.$1 !== './' ? RegExp.$1 : null;

    return fileInfos.reduce((prev, file) => {
        if (basePath && file.fileName.startsWith(basePath)) {
            prev[ file.fileName.replace(basePath, './') + file.ext ] = file.code;
        } else {
            // tslint:disable-next-line:no-console
            console.error(file.fileName + '：External files are not supported. '
                + 'Move external files to the directory where index.html is located');
        }

        return prev;
    }, {});
}

export const COMPONENT_CLASS_REG = /@Component\s*\(\s*\{(?:.|\n)+?\}\s*\)\s*export\s+class\s+(\w+)\s*{/;
export const DIRECTIVE_CLASS_REG = /@Directive\s*\(\s*\{(?:.|\n)+?\}\s*\)\s*export\s+class\s+(\w+)\s*{/;
export const PIPE_CLASS_REG = /@Pipe\s*\(\s*\{(?:.|\n)+?\}\s*\)\s*export\s+class\s+(\w+)\s*{/;

export function createFileInfo(content: string, path: string) {
    let info = new FileInfo();
    info.code = content;

    let filePath = path.trim();
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

export function getComponentUrlFiles(fileInfos: FileInfo[]) {
    return fileInfos.reduce((prev, fileInfo) => {
        if (fileInfo.type === FileType.COMPONENT) {
            let [ annotation ] = fileInfo.code.match(/@Component\s*\(\s*\{(?:.|\n)+?\}\s*\)/g);
            let files: string[] = [];

            if (/templateUrl\s*:\s*['"](.+?)['"]/.exec(annotation)) {
                files.push(RegExp.$1);
            }

            if (/styleUrls\s*:\s*\[((.|\n)+?)\]/.exec(annotation)) {
                files.push(
                    ...RegExp.$1.split(',').map(v => v.trim().replace(/(^['"])|(['"]$)/g, '')).filter(v => v)
                );
            }

            if (files.length) {
                if (fileInfo.fileName.includes('/')) {
                    let basePath = fileInfo.fileName.substring(0, fileInfo.fileName.lastIndexOf('/') + 1);

                    return prev.concat(files.map(file => basePath + file.replace(/^\.\//, '')));
                } else {
                    return prev.concat(files);
                }
            }
        }

        return prev;
    }, []);
}