const createElement = ({ elementType, id, className, text, htmlFor, type }) => {
    const element = document.createElement(elementType);
    if (id) element.id = id;
    if (className) element.className = className;
    if (text) element.innerText = text;
    if (htmlFor) element.htmlFor = htmlFor;
    if (type) element.type = type;
    return element;
}

const createInputGroup = ({ service, config, container }) => {
    const inputGroup = document.createElement('div');
    inputGroup.className = 'input-group my-2';
    inputGroup.id = `${service}-${config}-pair-${container.children.length}`;
    return inputGroup;
};

const createInput = (name, value) => {
    const input = document.createElement('input');
    input.name = name;
    input.className = 'form-control';
    input.value = value;
    return input;
};

const createInputPair = (service, config, container, local = '', remote = '') => {
    const inputGroup = createInputGroup({ service, config, container, type: 'pair' });
    const localInput = createInput(`${service}-${config}-local`, local);
    const remoteInput = createInput(`${service}-${config}-remote`, remote);
    localInput.setAttribute('data-pair', `${service}-${config}-remote`);
    remoteInput.setAttribute('data-pair', `${service}-${config}-local`);

    const removeButton = createButton({
        text: 'Eliminar', className: 'btn btn-danger', onClickHandler: () => {
            const parent = document.getElementById(inputGroup.id);
            parent.remove();
        }
    });

    inputGroup.appendChild(localInput);
    inputGroup.appendChild(remoteInput);
    inputGroup.appendChild(removeButton);

    container.appendChild(inputGroup);
};

const createLabel = (text) => {
    const label = document.createElement('label');
    label.textContent = text;
    return label;
};

const createButton = ({ id, text, className, onClickHandler }) => {
    const button = document.createElement('button');
    if (id) button.id = id;
    button.type = 'button';
    button.className = className ?? 'btn btn-primary d-block';
    button.textContent = text;
    button.onclick = onClickHandler;
    return button;
};

const createSwitch = (tabId) => {
    const divHtml = createElement({ elementType: 'div', className: 'col-3 form-check form-switch form-switch-lg d-inline-flex align-items-center' })
    const inputHtml = createElement({ elementType: 'input', id: tabId, className: 'form-check-input me-2 col-6', type: 'checkbox' });
    const labelHtml = createElement({ elementType: 'label', className: 'form-check-label', htmlFor: tabId, text: tabId });

    inputHtml.dataset.label = tabId;

    divHtml.appendChild(inputHtml);
    divHtml.appendChild(labelHtml);

    document.querySelector('.checkboxes').appendChild(divHtml);
}

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
