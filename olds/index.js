function printForm() {
    const form = document.getElementById('DockerBach');
    let formData = new FormData(form);
    for (let pair of formData.entries())
        console.log(pair[0] + ": " + pair[1]);
    console.log(Object.fromEntries(formData));
}

function createFieldset(key, idRoot) {
    const colHtml = document.createElement('div');
    colHtml.className = idRoot || 'col-md-6';
    const fieldset = document.createElement('fieldset');
    fieldset.id = idRoot ? idRoot + key : key;
    fieldset.className = idRoot || 'border p-2 mb-4 rounded border-secondary';
    const legend = document.createElement('legend');
    legend.innerText = key;
    colHtml.appendChild(fieldset);
    fieldset.appendChild(legend);
    idRoot ? document.getElementById(idRoot).appendChild(colHtml) : document.querySelector('form').appendChild(colHtml);

    return fieldset;
}

function createInput(el = { parent, key, value, root }) {
    let parentHtml;
    if (el.parent === el.root) {
        parentHtml = document.getElementById(el.root);
    } else {
        parentHtml = document.getElementById(el.root + el.parent);

        if (!parentHtml) {
            parentHtml = createFieldset(el.parent, el.root);
        }

        document.getElementById(el.root).appendChild(parentHtml);
    }

    const input = document.createElement('input');
    let inputValue, inputPlaceholder;
    inputValue = el.value;
    inputPlaceholder = el.value;
    //if (el.key !== el.value) {
    const formGroupHtml = document.createElement('div');
    formGroupHtml.className = 'form-group';
    const label = document.createElement('label');
    label.htmlFor = el.parent + el.key;
    label.className = 'form-label';
    label.innerText = el.key;
    formGroupHtml.appendChild(label);
    parentHtml.appendChild(formGroupHtml);
    parentHtml = formGroupHtml;
    //}

    input.type = 'text';
    input.id = el.parent + el.key;
    input.name = el.parent + el.key;
    input.value = inputValue;
    input.className = 'form-control';
    input.placeholder = inputPlaceholder;

    parentHtml.appendChild(input);
    parentHtml.appendChild(document.createElement('br'));

}

function createSelect(key, value, root) {
    const formGroupHtml = document.createElement('div');
    formGroupHtml.className = 'form-group';
    const label = document.createElement('label');
    label.htmlFor = root + key;
    label.className = 'form-label';
    label.innerText = key;
    formGroupHtml.appendChild(label);

    const select = document.createElement('select');
    select.id = root + key;
    select.name = key;
    select.className = 'form-select';
    formGroupHtml.appendChild(select);

    value.forEach((option) => {
        const optionHtml = document.createElement('option');
        optionHtml.value = option;
        optionHtml.innerText = option;
        select.appendChild(optionHtml);
    });
    root ? document.getElementById(root).appendChild(formGroupHtml) : document.querySelector('form').appendChild(formGroupHtmls);
}

function createDisabled(key, value, root) {
    createInput({ parent: root, key, value, root });
    const input = document.getElementById(root + key);
    input.disabled = true;
}

const creates = {
    $select$: (...params) => createSelect(...params),
    $disabled$: (...params) => createDisabled(...params),
};

function jsonToForm(json, parent = null, root) {
    for (const [key, value] of Object.entries(json)) {
        if (parent === null) {
            root = key;
            createFieldset(key);
        }
        if (typeof value === 'object' && value !== null) {
            if (Array.isArray(value)) {
                value.forEach((entry) => {
                    const [entryKey, entryValue] = entry.split(':');
                    createInput({ parent: key, key: entryKey, value: entryValue, root })
                });
            } else {
                const innerKey = Object.keys(value)[0];
                if (innerKey.startsWith('$') && innerKey.endsWith('$')) {
                    creates[innerKey](key, value[innerKey], root);
                } else {
                    jsonToForm(value, key, root);
                }
            }
        } else {
            createInput({ parent, key, value, root });
        }
    }
}

window.onload = async () => {
    const user = 'pHachepe';
    const repo = 'dockerBach';
    const path = 'jsons';
    const branch = 'master';
    const url = `https://api.github.com/repos/${user}/${repo}/contents/${path}?ref=${branch}`;
    // load all files json from jsons folder
    const response = await fetch(url);
    const jsons = await response.json();
    const jsonPath = jsons.map((json) => json.path);

    // jsonToForm a cada json
    if (!jsonPath.length) console.error('No hay jsons en la carpeta jsons')
    else {
        jsonPath.forEach(async (path) => {
            const response = await fetch(`https://raw.githubusercontent.com/${user}/${repo}/${branch}/${path}`);
            try {
                const jsonForm = await response.json();
                jsonToForm(jsonForm);
            } catch (error) {
                console.log(`El archivo ${path} no es un json valido`);
            }
        });
    }
}