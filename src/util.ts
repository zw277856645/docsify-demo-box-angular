import { FileInfo, FileType } from './file-info';
import { COMPONENT_CLASS_REG, DIRECTIVE_CLASS_REG, PIPE_CLASS_REG } from './constants';

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

export function createAppRouterModuleTs(mainFile: FileInfo) {
    return `
        import { RouterModule, Routes } from '@angular/router';
        import { NgModule } from '@angular/core';
        import { ${mainFile.className} } from './${mainFile.virtualFileName}';
        
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

        httpRequest.open('GET', parseFilePath(url).srcPath);
        httpRequest.send();
    });
}

export function parseFilePath(path: string): { srcPath: string; virtualPath: string } {
    if (/(\[.*\])/.test(path)) {
        return {
            srcPath: path.replace(/[\[\]]/g, ''),
            virtualPath: path.replace(/(\[.*?\])/g, '')
        };
    } else {
        return { srcPath: path, virtualPath: path };
    }
}

export function createFileInfo(content: string, path: string) {
    let info = new FileInfo();
    let filePath = path.trim().replace(/^\.\//, '');

    info.code = content;
    info.fileName = filePath.substring(0, filePath.lastIndexOf('.'));
    info.ext = filePath.substring(filePath.lastIndexOf('.'));

    let { srcPath, virtualPath } = parseFilePath(info.fileName);

    info.fileName = srcPath;
    info.virtualFileName = virtualPath;

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

export function parseConfig(originCode: string): { config: any, code: string } {
    // 只识别开头的配置
    if (/^\s*\{/.test(originCode)) {
        let splits = originCode.split('\n');
        let configStr = '', config, code;

        for (let i = 0, len = splits.length; i < len; i++) {
            configStr += splits[ i ];

            try {
                config = JSON.parse(configStr);
                splits.splice(0, i + 1);
                code = splits.join('\n');
                break;
            } catch (e) {
            }
        }

        return { config, code };
    } else {
        return { config: null, code: originCode };
    }
}