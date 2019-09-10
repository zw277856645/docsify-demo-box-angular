import { ajaxGet, createFileInfo, getComponentUrlFiles, parseConfig } from './util';
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
                        files: createAllFiles(fileInfos.concat(extraFileInfos)),
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
    });

    return `<div id="${id}"></div>`;
}

// 辅助工具

function createAllFiles(fileInfos: FileInfo[]) {
    // 找到 index.html，以其为根路径，移动所有文件
    let index = fileInfos.find(file => /index\.html$/i.test(file.fileName + file.ext));

    if (!index) {
        throw Error('No index.html provided');
    }

    let basePath = /^(.+)index$/i.exec(index.fileName) ? RegExp.$1 : null;

    return fileInfos.reduce((prev, file) => {
        if (basePath && file.fileName.startsWith(basePath)) {
            prev[ file.fileName.replace(basePath, '') + file.ext ] = file.code;
        } else {
            // tslint:disable-next-line:no-console
            console.error(file.fileName + '：External files are not supported. '
                + 'Move external files to the directory where index.html is located');
        }

        return prev;
    }, {});
}