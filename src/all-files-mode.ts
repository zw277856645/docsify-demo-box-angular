import { ajaxGet, createFileInfo, parseConfig } from './util';
import sdk from '@stackblitz/sdk';
import { deepExtend } from 'cmjs-lib';
import { DocsifyDemoBoxAngularConfig } from './config';
import { DEFAULT_DEPENDENCIES, DEFAULT_EMBED_CONFIG, FILE_MODE_REG } from './constants';
import { FileInfo } from './file-info';

export function dealAllFilesMode(id: string, originCode: string, globalConfig: DocsifyDemoBoxAngularConfig) {
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

        sdk.embedProject(
            id,
            deepExtend(
                {
                    files: createAllFiles(fileInfos),
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
                DEFAULT_EMBED_CONFIG,
                globalConfig && globalConfig.embedOptions,
                innerConfig && innerConfig.embedOptions
            )
        );
    });

    return `<div id="${id}"></div>`;
}

// 辅助工具

function createAllFiles(fileInfos: FileInfo[]) {
    // 找到 index.html，如果其前面有其他路径，提示错误
    let index = fileInfos.find(file => /index\.html$/i.test(file.virtualFileName + file.ext));

    if (!index) {
        throw Error('No index.html provided');
    }
    if (/^(.+)index$/i.exec(index.virtualFileName)) {
        throw Error('Make sure that index.html is in the root directory. '
            + 'If you have a directory prefix (e.g. "xxx/index.html"), '
            + 'use a virtual path (e.g. "[xxx/]index.html")');
    }

    return fileInfos.reduce((prev, file) => {
        prev[ file.virtualFileName + file.ext ] = file.code;

        return prev;
    }, {});
}