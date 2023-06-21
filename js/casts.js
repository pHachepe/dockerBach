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
    let switchs = Array.from(document.querySelectorAll('.checkboxes input[type="checkbox"]:checked'));
    let idsSwitchsSelected = switchs.map(checkbox => checkbox.id);
    
    idsSwitchsSelected.forEach(id => {
        const service = id;
        const navcontent = document.getElementById(`nav-${service}-content`);
        const inputs = Array.from(navcontent.querySelectorAll('input, select'));
        inputs.forEach(input => {
            const keys = input.name.split('-');
            const service = keys[0];
            const config = keys[1];
            const index = keys[3];
            const value = input.value;
        });
    });
    

    const obj = {};
    const formData = new FormData(form);

    // filtrar solo los formularios seleccionados en idsSwitchsSelected
   // for (const [key, value] of formData.entries()) {
  //      const keys = key.split('-');


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

const objectToYaml = () => {
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

const showYaml = () => {
    const form = document.getElementById('docker-compose-form');
    let dockerComposeObject = formToObject(form);
    dockerComposeObject = { version: '3.9', services: dockerComposeObject };
    const dockerComposeYaml = jsyaml.dump(dockerComposeObject);
    const modal = document.getElementById('yamlModal');
    modal.querySelector('.modal-body').innerHTML = `<pre>${dockerComposeYaml}</pre>`;
}