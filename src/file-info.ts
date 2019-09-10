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