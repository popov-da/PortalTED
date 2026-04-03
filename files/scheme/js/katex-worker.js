
onmessage = (event) => {
    importScripts('https://cdn.jsdelivr.net/npm/katex@0.16.35/dist/katex.min.js');
    const html = katex.renderToString(event.data.expression, {
        throwOnError: false
    });
    postMessage(html);
};
