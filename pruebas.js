const createInput = (name, value) => {
    const input = document.createElement('input');
    input.name = name;
    input.className = 'form-control';
    input.value = value;
    return input;
};

const createInputPair = (service, config, container, local = '', remote = '') => {
    // create input group
    const inputGroup = document.createElement('div');
    inputGroup.className = 'input-group my-2';
    inputGroup.id = `${service}-${config}-pair-${container.children.length}`;
    const localInput = createInput(`${service}-${config}-local`, local);
    const remoteInput = createInput(`${service}-${config}-remote`, remote);
    localInput.setAttribute('data-pair', `${service}-${config}-remote`);
    remoteInput.setAttribute('data-pair', `${service}-${config}-local`);
    // create remove button to remove the pair
    const removeButton = createButton({ text: 'Eliminar', className: 'btn btn-danger', onClickHandler: () => {
        const parent = document.getElementById(inputGroup.id);
        parent.remove();
        }
    });
    inputGroup.appendChild(localInput);
    inputGroup.appendChild(remoteInput);
    inputGroup.appendChild(removeButton);
//    container.appendChild(localInput);
//    container.appendChild(remoteInput);
    container.appendChild(inputGroup);
//    container.appendChild(document.createElement('br'));
};

const createButton = ({ id, text, className, onClickHandler }) => {
    const button = document.createElement('button');
    if (id) button.id = id;
    button.type = 'button';
    // margin botton and top
    button.className = className ?? 'btn btn-primary d-block';
    button.textContent = text;
    button.onclick = onClickHandler;
    return button;
};

const createLabel = (text) => {
    const label = document.createElement('label');
    label.textContent = text;
    return label;
};

const createSelect = (name, options) => {
    const select = document.createElement('select');
    select.name = name;
    select.className = 'form-select';

    options.forEach(optionValue => {
        const option = document.createElement('option');
        option.value = optionValue;
        option.text = optionValue;
        select.appendChild(option);
    });

    return select;
};

const jsonToForm = (services) => {
    const serviceContainer = document.createElement('div');

    for (const service in services) {
        serviceContainer.id = `service-${service}`;
        for (const config in services[service]) {
            if (config === 'depends_on') {
                continue;
            }

            // create label for input block
            const label = createLabel(`${service} ${config}: `);
            if (config === 'image') {
                const select = createSelect(`${service}-image`, services[service][config]);
                serviceContainer.appendChild(label);
                serviceContainer.appendChild(select);
            } else if (config === 'ports' || config === 'volumes') {
                const inputContainer = document.createElement('div');
                inputContainer.id = `${service}-${config}`;

                serviceContainer.appendChild(label);
                serviceContainer.appendChild(inputContainer);

                for (const item of services[service][config]) {
                    const [local, remote] = item.split(':');
                    createInputPair(service, config, inputContainer, local, remote);
                }

                const addButton = createButton({ text: `Agregar ${config}`, onClickHandler: () => createInputPair(service, config, inputContainer) });
                serviceContainer.appendChild(addButton);
            } else if (config === 'environment') {
                const inputContainer = document.createElement('div');
                inputContainer.id = `${service}-${config}`;

                serviceContainer.appendChild(label);
                serviceContainer.appendChild(inputContainer);

                for (const key in services[service][config]) {
                    const value = services[service][config][key];
                    createInputPair(service, config, inputContainer, key, value);
                }

                const addButton = createButton({ text: `Agregar ${config}`, onClickHandler: () => createInputPair(service, config, inputContainer) });
                serviceContainer.appendChild(addButton);
            } else {
                const input = createInput(`${service}-${config}`);
                input.placeholder = `${service} ${config}`;
                serviceContainer.appendChild(label);
                serviceContainer.appendChild(input);
            }
        }
    }

    return serviceContainer;
};

const formToObject = (form) => {
    const obj = {};
    const formData = new FormData(form);

    for (const [key, value] of formData.entries()) {
        const keys = key.split('-');
        const service = keys[0];
        const config = keys[1];

        if (!obj[service]) {
            obj[service] = {};
        }

        if (config === 'image') {
            obj[service][config] = value;
        } else if (config === 'ports' || config === 'volumes' || config === 'environment') {
            if (!obj[service][config]) {
                if (config === 'environment') {
                    obj[service][config] = {};
                } else {
                    obj[service][config] = [];
                }
            }

            const pairKey = form.elements.namedItem(`${service}-${config}-pair-${formData.get(`${service}-${config}-index-${value}`)}`);

            if (pairKey) {
                if (config === 'environment') {
                    obj[service][config][value] = pairKey.value;
                } else {
                    obj[service][config].push(`${value}:${pairKey.value}`);
                }
            }
        } else {
            obj[service][config] = value;
        }
    }

    return obj;
};

function generateDockerCompose() {
    const form = document.getElementById('docker-compose-form');
    const dockerComposeObject = formToObject(form);
    const dockerComposeYaml = jsyaml.dump(dockerComposeObject);

    console.log(dockerComposeYaml);

    // Código para descargar el archivo docker-compose.yaml
   /*const blob = new Blob([dockerComposeYaml], { type: "text/yaml;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = 'docker-compose.yaml';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);*/
}


async function fetchJsonFromGithub(user, repo, path, branch) {
    const url = `https://api.github.com/repos/${user}/${repo}/contents/${path}?ref=${branch}`;
    const response = await fetch(url);
    const jsons = await response.json();
    jsons.sort((a, b) => a.path.localeCompare(b.path)); // ordenar alfabeticamente
    return jsons.map((json) => json.path);
}

async function fetchAndParseJson(user, repo, branch, path) {
    let timestamp = Date.now();
    const response = await fetch(`https://raw.githubusercontent.com/${user}/${repo}/${branch}/${path}?${timestamp}`); //,{ headers: { 'Cache-Control': 'no-cache' } }
    return response.json();
}

function createElement({ elementType, id, className, text, htmlFor, type }) {
    const element = document.createElement(elementType);
    if (id) element.id = id;
    if (className) element.className = className;
    if (text) element.innerText = text;
    if (htmlFor) element.htmlFor = htmlFor; 
    if (type) element.type = type;
    return element;
}

function createCheckbox(tabId) {
    const divHtml = createElement({ elementType: 'div', className: 'col-3 form-check form-switch form-switch-lg d-inline-flex align-items-center' })
    const inputHtml = createElement({ elementType: 'input', id: tabId, className: 'form-check-input me-2', type: 'checkbox' });
    const labelHtml = createElement({ elementType: 'label', className: 'form-check-label', htmlFor: tabId, text: tabId });

    inputHtml.dataset.label = tabId;

    divHtml.appendChild(inputHtml);
    divHtml.appendChild(labelHtml);

    document.querySelector('.checkboxes').appendChild(divHtml);
}

function setupCheckboxChangeListener() {
    $('.checkboxes input[type="checkbox"]').change(function () {
        if (!$('.checkboxes input[type="checkbox"]').is(':checked')) {
            $('#nav-' + this.id + '-tab').hide();
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

function handleJsonPaths(jsonPaths, user, repo, branch) {
    if (!jsonPaths.length) console.error('No hay jsons en la carpeta jsons')
    else {
        // filtrar solo mysql y wordpress
        jsonPaths = jsonPaths
            //.filter(path => path.includes('mysql') || path.includes('wordpress'))
            //jsonPaths.slice(0,3)
            .forEach(async (path) => {
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

                    const tabContent = jsonToForm(jsonForm);
                    document.getElementById(`nav-${tabId}-content`).appendChild(tabContent);
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
    handleJsonPaths(jsonPaths, user, repo, branch);
};