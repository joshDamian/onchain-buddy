import React from 'react';
import { renderToString } from 'react-dom/server';

export const generateHtmlFromJsx = <Props extends Record<string, unknown>>(
    component: React.FC<Props>,
    props: Props,
    pageTitle = ''
) => {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${pageTitle ?? 'Document'}</title>
            <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body>
            ${renderToString(React.createElement(component, props))}
        </body>
        </html>
    `;
};
