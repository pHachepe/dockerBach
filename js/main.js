const fetchJsonFromGithub = async (user, repo, path, branch) => {
    const url = `https://api.github.com/repos/${user}/${repo}/contents/${path}?ref=${branch}`;
    const response = await fetch(url);
    const jsons = await response.json();
    jsons.sort((a, b) => a.path.localeCompare(b.path)); // ordenar alfabeticamente
    return jsons.map((json) => json.path);
}

const fetchAndParseJson = async (user, repo, branch, path) => {
    let timestamp = Date.now();
    const response = await fetch(`https://raw.githubusercontent.com/${user}/${repo}/${branch}/${path}?${timestamp}`); //,{ headers: { 'Cache-Control': 'no-cache' } }
    return response.json();
}

const switchChangeListener = () => {
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

const createTabs = (jsonPaths, user, repo, branch) => {
    if (!jsonPaths.length) console.error('No hay jsons en la carpeta jsons')
    else {
        jsonPaths = jsonPaths
            .forEach(async (path) => {
                try {
                    const jsonForm = await fetchAndParseJson(user, repo, branch, path);

                    const tabId = path.split('/').pop().split('.')[0];

                    createSwitch(tabId);
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
                    switchChangeListener();
                }
            });
    }
}

const createYaml = () => {
    const dockerComposeObject = { version: '3.9', services: formToObject() };
    const dockerComposeYaml = jsyaml.dump(dockerComposeObject);
    return dockerComposeYaml;
}

const showYaml = () => {
    const dockerComposeYaml = createYaml();
    const bodyModal = document.querySelector('.modal-body');
    bodyModal.innerHTML = `<pre>${dockerComposeYaml}</pre>`;
}

const downloadYaml = () => {
    const dockerComposeYaml = createYaml();

    const blob = new Blob([dockerComposeYaml], { type: "text/yaml;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = 'docker-compose.yaml';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

const copyYaml = () => {
    const dockerComposeYaml = createYaml();
    navigator.clipboard.writeText(dockerComposeYaml);
    showAlert('Copiado al portapapeles!');
}

const showAlert = (message) => {
        // mensaje de copiado que se desvanece poco a poco en total tarda 2 segundos
        let notification = document.getElementById('notification');
        // Mostramos la notificación
        notification.style.display = 'block';
        notification.style.opacity = 1;
        notification.innerHTML = message;
    
        // Esperamos 2 segundos antes de comenzar a desvanecer
        setTimeout(() => {
            // Cambiamos la opacidad a 0 para que comience a desvanecerse
            notification.style.opacity = 0;
        }, 2000);
    
        // Esperamos 4 segundos en total antes de ocultar completamente la notificación
        setTimeout(() => {
            notification.style.display = 'none';
        }, 4000);
}

window.onload = async () => {
    const user = 'pHachepe';
    const repo = 'dockerBach';
    const path = 'jsons';
    const branch = 'master';
    const jsonPaths = await fetchJsonFromGithub(user, repo, path, branch);
    createTabs(jsonPaths, user, repo, branch);
};