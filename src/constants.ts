export const COMPONENT_CLASS_REG = /@Component\s*\(\s*\{(?:.|\n)+?\}\s*\)\s*export\s+class\s+(\w+)\s*/;
export const DIRECTIVE_CLASS_REG = /@Directive\s*\(\s*\{(?:.|\n)+?\}\s*\)\s*export\s+class\s+(\w+)\s*/;
export const PIPE_CLASS_REG = /@Pipe\s*\(\s*\{(?:.|\n)+?\}\s*\)\s*export\s+class\s+(\w+)\s*/;

export const FILE_MODE_REG = /^(?<!\/\/|\/\*|\/\*\*)\s*((\.\/|\[)?[\w$][\w$-/.\[\]]+)/mg;

export const DEFAULT_DEPENDENCIES = {
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

export const DEFAULT_EMBED_CONFIG = {
    height: 480,
    width: '100%',
    view: 'preview',
    hideExplorer: true,
    hideNavigation: true,
    forceEmbedLayout: true,
    clickToLoad: false
};