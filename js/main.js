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
            //.filter(path => path.includes('mysql') || path.includes('wordpress')).slice(0,3)
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

window.onload = async () => {
    const user = 'pHachepe';
    const repo = 'dockerBach';
    const path = 'jsons';
    const branch = 'master';
    const jsonPaths = await fetchJsonFromGithub(user, repo, path, branch);
    createTabs(jsonPaths, user, repo, branch);
};