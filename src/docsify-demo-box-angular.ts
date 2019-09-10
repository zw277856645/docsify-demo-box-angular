import { dealSourceCodeMode } from './source-mode';
import { dealPartFilesMode } from './part-files-mode';
import { dealAllFilesMode } from './all-files-mode';
import { DocsifyDemoBoxAngularConfig } from './config';

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
                    } else if (/^angular-all-files$/i.test(lang)) {
                        // 全量文件引入方式
                        return dealAllFilesMode(id, code, config);
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
