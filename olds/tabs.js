function createElementWithClass(elementType, className) {
    const element = document.createElement(elementType);
    element.className = className;
    return element;
}

function createFormElementWithIdClassAndType(elementType, id, className, type) {
    const element = createElementWithClass(elementType, className);
    element.id = id;
    element.type = type;
    return element;
}

function createLabelWithForAndText(id, text) {
    const label = createElementWithClass('label', 'form-label');
    label.htmlFor = id;
    label.innerText = text;
    return label;
}

function createCheckbox(tabId) {
    const divHtml = createElementWithClass('div', 'col-3 form-check form-switch form-switch-lg d-inline-flex align-items-center');
    const inputHtml = createFormElementWithIdClassAndType('input', tabId, 'form-check-input me-2', 'checkbox');
    const labelHtml = createLabelWithForAndText(tabId, tabId);

    inputHtml.dataset.label = tabId;

    divHtml.appendChild(inputHtml);
    divHtml.appendChild(labelHtml);

    document.querySelector('.checkboxes').appendChild(divHtml);
}
/** */
function createFieldset(contentId, legendText) {
    const fieldsetId = `${contentId}-fieldset`;
    let fieldset = document.getElementById(fieldsetId);
    
    if (!fieldset) {
        fieldset = document.createElement('fieldset');
        fieldset.id = fieldsetId;
        fieldset.className = 'p-2 m-2 rounded';
        
        const legend = document.createElement('legend');
        legend.innerText = contentId;
        fieldset.appendChild(legend);
        const content = document.getElementById(contentId);

        content.appendChild(fieldset);
    }

    return fieldset;
}

function createFormGroup(id, contentId) {
    const formGroupId = `${id}-form-group`;
    let formGroup = document.getElementById(formGroupId);
    if (!formGroup) {
        formGroup = document.createElement('div');
        formGroup.id = formGroupId;
        formGroup.className = 'form-group';

        const content = document.getElementById(contentId);
        content.appendChild(formGroup);
    }
    return formGroup;
}
function createInput(id, key, value) {
    const inputId = `${id}-${key}`;
    const formGroup = document.createElement('div');
    formGroup.className = 'form-group';

    const label = document.createElement('label');
    label.htmlFor = inputId;
    label.className = 'form-label';
    label.innerText = key;

    const input = document.createElement('input');
    input.type = 'text';
    input.id = inputId;
    input.name = inputId;
    input.value = value;
    input.className = 'form-control';

    formGroup.appendChild(label);
    formGroup.appendChild(input);

    return formGroup;
}

function createSelect(id, key, options) {
    const selectId = `${id}-${key}`;
    const formGroup = document.createElement('div');
    formGroup.className = 'form-group';

    const label = document.createElement('label');
    label.htmlFor = selectId;
    label.className = 'form-label';
    label.innerText = key;

    const select = document.createElement('select');
    select.id = selectId;
    select.name = selectId;
    select.className = 'form-select';

    options.forEach((option) => {
        const optionHtml = document.createElement('option');
        optionHtml.value = option;
        optionHtml.innerText = option;
        select.appendChild(optionHtml);
    });

    formGroup.appendChild(label);
    formGroup.appendChild(select);

    return formGroup;
}

function createDisabled(id, key, value) {
    const inputId = `${id}-${key}`;
    const formGroup = createInput(id, key, value);
    const input = document.getElementById(inputId);
    if (input) {
        input.disabled = true;
    } else {
        console.error(`Input element '${inputId}' not found.`);
    }

    return formGroup;
}


function jsonToForm(json, tabContentId) {
    const fieldset = createFieldset(tabContentId);
    const formGroup = createFormGroup(tabContentId, fieldset.id);

    for (const [key, value] of Object.entries(json)) {
        if (typeof value === 'object' && value !== null) {
            jsonToForm(value, tabContentId);
        } else if (key.startsWith('$') && key.endsWith('$')) {
            const innerKey = key.substring(1, key.length - 1);
            if (creates[innerKey]) {
                const element = creates[innerKey](tabContentId, innerKey, value);
                formGroup.appendChild(element);
            } else {
                console.error(`Invalid special key '${key}'.`);
            }
        } else {
            const element = createInput(tabContentId, key, value);
            formGroup.appendChild(element);
        }
    }
}


/** */

const creates = {
    $select$: (...params) => createSelect(...params),
    $disabled$: (...params) => createDisabled(...params),
};


async function fetchJsonFromGithub(user, repo, path, branch) {
    const url = `https://api.github.com/repos/${user}/${repo}/contents/${path}?ref=${branch}`;
    const response = await fetch(url);
    const jsons = await response.json();
    return jsons.map((json) => json.path);
}

async function fetchAndParseJson(user, repo, branch, path) {
    const response = await fetch(`https://raw.githubusercontent.com/${user}/${repo}/${branch}/${path}`);
    return response.json();
}

function setupCheckboxChangeListener() {
    $('.checkboxes input[type="checkbox"]').change(function () {
        if (!$('.checkboxes input[type="checkbox"]').is(':checked')) {
            $('#tabContent').hide();
        } else {
            $('#tabContent').show();

            if ($(this).is(':checked')) {
                $('#nav-' + this.id + '-tab').show();
                $('#nav-' + this.id + '-tab').tab('show');
            } else {
                $('#nav-' + this.id + '-tab').hide();
                if ($('#nav-' + this.id + '-tab').hasClass('active')) {
                    $('#tabList button:visible:last').tab('show');
                }
            }
        }
    });
}

function createTabs(jsonPaths, user, repo, branch) {
    if (!jsonPaths.length) console.error('No hay jsons en la carpeta jsons')
    else {
        jsonPaths.slice(0,3).forEach(async (path) => {
            try {
                const jsonForm = await fetchAndParseJson(user, repo, branch, path);

                const tabId = path.split('/').pop().split('.')[0];

                createCheckbox(tabId);
                $('#tabList').append(`
                <button class="nav-link"
                id="nav-${tabId}-tab"
                data-bs-toggle="tab"
                data-bs-target="#nav-${tabId}-content"
                type="button" role="tab"
                aria-controls="nav-${tabId}-content" 
                style="display: none;"
                aria-selected="false"
                >${tabId}</button>
                `);
                $('#tabContent').append(`
                <div class="tab-pane fade" id="nav-${tabId}-content" role="tabpanel" aria-labelledby="nav-${tabId}-tab" tabindex="0"></div>
                `);

                jsonToForm(jsonForm, "nav-" + tabId + "-content");
            } catch (error) {
                console.log(`El archivo ${path} no es un json valido`, error);
            } finally {
                setupCheckboxChangeListener();
            }
        });
    }
}

window.onload = async () => {
    const user = 'pHachepe';
    const repo = 'dockerBach';
    const path = 'jsons';
    const branch = 'master';
    const jsonPaths = await fetchJsonFromGithub(user, repo, path, branch);
    createTabs(jsonPaths, user, repo, branch);
}
