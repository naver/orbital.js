const viewer = {
    "Class": function (model) {
        const template = `
            <ul>
                <li>${model.kindString}</li>
            </ul>
            <pre>
                ${JSON.stringify(model, null, 4)}
            </pre>
        `;
        return template;
    }
};

function getView(model) {
    let children = '';
    if (model.children && model.children.length) {
        children = model.children.map((child) => {
            return getView(child);
        }).join('');
    }
    const clone = JSON.parse(JSON.stringify(model));
    delete clone.children;
    let x;
    if (viewer[clone.kindString]) {
        x = viewer[clone.kindString](clone);
    } else {
        x = `
            <pre>
                ${JSON.stringify(clone, null, 4)}
            </pre>
        `;
    }
    const template = `
        <ul>
            <li>
                <h5>${model.name}</h5>
                ${x}
                ${children}
            </li>
        </ul>
    `;
    return template;
}

require(['json!docs.json'], function (docs) {
    console.log(docs);
    const root = document.getElementById('root');
    const main = root.querySelector('#main');
    main.innerHTML = getView(docs);
});
