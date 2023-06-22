const jsonToForm = (services) => {
    const serviceContainer = document.createElement('div');

    for (const service in services) {
        serviceContainer.id = `service-${service}`;
        for (const config in services[service]) {
            if (config === 'depends_on') {
                continue;
            }

            // create label for input block
            const label = createLabel(`${config}:`);
            const inputContainer = document.createElement('div');
            inputContainer.id = `${service}-${config}`;
            inputContainer.className = 'input-container ';
            
            if (config === 'ports' || config === 'volumes') {
                serviceContainer.appendChild(label);
                serviceContainer.appendChild(inputContainer);

                for (const item of services[service][config]) {
                    const [local, remote] = item.split(':');
                    createInputPair(service, config, inputContainer, local, remote);
                }

                const addButton = createButton({ text: `Agregar ${config}`, onClickHandler: () => createInputPair(service, config, inputContainer) });
                serviceContainer.appendChild(addButton);
            } else if (config === 'environment') {
                serviceContainer.appendChild(label);
                serviceContainer.appendChild(inputContainer);

                for (const key in services[service][config]) {
                    const value = services[service][config][key];
                    createInputPair(service, config, inputContainer, key, value);
                }

                const addButton = createButton({ text: `Agregar ${config}`, onClickHandler: () => createInputPair(service, config, inputContainer) });
                serviceContainer.appendChild(addButton);
            } else {
                inputContainer.dataset.type = 'simple';
                let input;
                // if config is image, create select with options
                if (config === 'image') {
                    input = createSelect(`${service}-image`, services[service][config]);
                } else {
                    input = createInput(`${service}-${config}`, services[service][config]);
                }

                input.placeholder = `${service} ${config}`;
                inputContainer.appendChild(label);
                inputContainer.appendChild(input);
                serviceContainer.appendChild(inputContainer);
            }
        }
    }

    return serviceContainer;
};

const formToObject = () => {
    let switchs = Array.from(document.querySelectorAll('.checkboxes input[type="checkbox"]:checked'));
    let idsSwitchsSelected = switchs.map(checkbox => checkbox.id);

    const obj = {};
    idsSwitchsSelected.forEach(id => {
        const service = id;
        // objeto con la informacion de los inputs
        const results = [];

        const navcontent = document.getElementById(`nav-${service}-content`);
        const inputContainers = Array.from(navcontent.querySelectorAll('.input-container'));

        inputContainers.forEach(inputContainer => {

            if (inputContainer.dataset.type === 'simple') {
                const input = inputContainer.querySelector('select, input');
                const keys = input.name.split('-');
                // add to results new object with the input value and the input name
                const result = {};
                result.config = keys[1];
                result.value = input.value;
                results.push(result);
            } else {
                // Si no es simple, es un inputGroup con dos inputs
                const inputGroups = Array.from(inputContainer.querySelectorAll('.input-group'));

                // recorrer los inputGroups
                inputGroups.forEach(inputGroup => {
                    const inputs = Array.from(inputGroup.querySelectorAll('input'));
                    const keys = inputs[0].name.split('-');
                    // add to results new object with the input value and the input name
                    const result = {};
                    result.config = keys[1];

                    result.value = inputs[0].value;
                    result.pairValue = inputs[1].value;
                    results.push(result);
                });
            }
        });

        // crear el objeto con la informacion de los inputs
        results.forEach(result => {
            if (!obj[service]) {
                obj[service] = {};
            }

            if (result.config === 'ports' || result.config === 'volumes') {
                if (!obj[service][result.config]) {
                    obj[service][result.config] = [];
                }
                // si tiene varios puertos o volumenes, agregarlos al array con el formato local:remote y si solo tiene value o pairValue, agregarlo solo
                let concatValues = result.value && result.pairValue ? `${result.value}:${result.pairValue}` : result.value || result.pairValue || null;
                if (concatValues) obj[service][result.config].push(concatValues);
            } else if (result.config === 'environment') {
                if (!obj[service][result.config]) {
                    obj[service][result.config] = {};
                }
                obj[service][result.config][result.value] = result.pairValue;
            } else {
                obj[service][result.config] = result.value;
            }
        });
    });

    return obj;
};
