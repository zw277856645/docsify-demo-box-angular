window.$docsify = {
    homepage: 'demo.md',
    plugins: [
        DemoBoxAngular.create({
            project: {
                files: {
                    'style.css': createStyleCss()
                }
            }
        })
    ]
};

function createStyleCss() {
    return `
        h2 {
            color: blue;
        }
    `;
}