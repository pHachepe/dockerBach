function printForm() {
    // imprimir los valores de todos los campos del formulario
    const form = document.getElementById('DockerBach');

    let formData = new FormData(form);

    // iterate through entries...
    for (let pair of formData.entries()) {
        console.log(pair[0] + ": " + pair[1]);
    }

    // ...or output as an object
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
    // disabled
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

const json = {
    mysql: {
        image: { $select$: ['mysql:latest', 'mysql:8.0', 'mysql:7.0'] },
        $input$: { label: 'MYSQL_ROOT_PASSWORD', default: 'toor', placeholder: 'Password', type: 'text' },
        
        environment: {
            MYSQL_ROOT_PASSWORD: 'toor',
            MYSQL_DATABASE: 'mydb',
            MYSQL_USER: 'user',
            MYSQL_PASSWORD: 'password',
        },
        ports: ['3306:3306', '80:80'],
        volumes: './data:/var/lib/mysql',
        volumesArr: ['./data:/var/lib/mysql', './data2:/var/lib/mysql2'],
        depends_on: { $disabled$: ['dep1', 'dep2', 'dep3'] },
    },
    mariadb: {
        image: { $select$: ['maria:latest', 'maria:0.2', 'maria:0.4'] },
        depends_on: { $disabled$: ['dep1', 'dep2', 'dep3'] },
    },
};

const json2 = {
    nginx: {
        image: { $select$: ['nginx:latest', 'nginx:alpine'] },
        ports: ['80:80', '443:443'],
        volumes: ['./html:/usr/share/nginx/html'],
        depends_on: ['php', 'mysql']
    },
    mysql: {
        image: { $select$: ['mysql:latest', 'mysql:8.0', 'mysql:5.7'] },
        environment: {
            MYSQL_ROOT_PASSWORD: 'rootpassword',
            MYSQL_DATABASE: 'dbname',
            MYSQL_USER: 'username',
            MYSQL_PASSWORD: 'password'
        },
        ports: ['3306:3306'],
        volumes: ['./data:/var/lib/mysql']
    },
    postgres: {
        image: { $select$: ['postgres:latest', 'postgres:10', 'postgres:9'] },
        environment: {
            POSTGRES_PASSWORD: 'rootpassword',
            POSTGRES_USER: 'username',
            POSTGRES_DB: 'dbname'
        },
        ports: ['5432:5432'],
        volumes: ['./data:/var/lib/postgresql/data']
    },
    redis: {
        image: { $select$: ['redis:latest', 'redis:6.0', 'redis:5.0'] },
        ports: ['6379:6379']
    },
    mongo: {
        image: { $select$: ['mongo:latest', 'mongo:4.0', 'mongo:3.6'] },
        ports: ['27017:27017'],
        volumes: ['./data:/data/db']
    },
    elasticsearch: {
        image: { $select$: ['elasticsearch:latest', 'elasticsearch:7', 'elasticsearch:6'] },
        environment: {
            ES_JAVA_OPTS: '-Xms512m -Xmx512m'
        },
        ports: ['9200:9200', '9300:9300'],
        volumes: ['./data:/usr/share/elasticsearch/data']
    },
    rabbitmq: {
        image: { $select$: ['rabbitmq:latest', 'rabbitmq:3-management'] },
        ports: ['5672:5672', '15672:15672']
    },
    php: {
        image: { $select$: ['php:latest', 'php:7.4-fpm', 'php:7.3-fpm'] },
        volumes: ['./code:/var/www/html']
    },
    nodejs: {
        image: { $select$: ['node:latest', 'node:14', 'node:12'] },
        volumes: ['./code:/usr/src/app'],
        working_dir: '/usr/src/app',
        command: 'npm start'
    },
    python: {
        image: { $select$: ['python:latest', 'python:3.8', 'python:2.7'] },
        volumes: ['./code:/usr/src/app'],
        working_dir: '/usr/src/app',
        command: 'python app.py'
    },
    memcached: {
        image: { $select$: ['memcached:latest', 'memcached:1.6', 'memcached:1.5'] },
        ports: ['11211:11211']
    },
    apache: {
        image: { $select$: ['httpd:latest', 'httpd:2.4', 'httpd:2.2'] },
        ports: ['80:80'],
        volumes: ['./html:/usr/local/apache2/htdocs/']
    },
    wordpress: {
        image: {
            $select$: ['wordpress: latest', 'wordpress: 5', 'wordpress: 4']
        },
        ports: ['80:80'],
        environment: {
            WORDPRESS_DB_HOST: 'mysql',
            WORDPRESS_DB_USER: 'user',
            WORDPRESS_DB_PASSWORD: 'password',
            WORDPRESS_DB_NAME: 'wordpress'
        },
        depends_on: ['mysql']
    }
};

/*
       
*/

// onload
window.onload = () => {
    jsonToForm(json);
}