import { EmbedOptions, Project } from '@stackblitz/sdk/typings/interfaces';

export interface DocsifyDemoBoxAngularConfig {

    project?: Partial<Project>;

    extraModules?: { [ k: string ]: string };

    embedOptions?: Partial<EmbedOptions>;
}