'use strict';

const OpenAPI = require('../dist');
const fetch = require('node-fetch');

async function generate(input, output) {
    await OpenAPI.generate({
        input,
        output,
        httpClient: OpenAPI.HttpClient.FETCH,
        useOptions: false,
        useUnionTypes: false,
        exportCore: true,
        exportSchemas: true,
        exportModels: true,
        exportServices: true,
        // request: './test/custom/request.ts',
    });
}

async function generateRealWorldSpecs() {
    const response = await fetch('https://api.apis.guru/v2/list.json');

    const list = await response.json();
    delete list['api.video'];
    delete list['apideck.com:vault'];
    delete list['amazonaws.com:mediaconvert'];
    delete list['bungie.net'];
    delete list['docusign.net'];
    delete list['googleapis.com:adsense'];
    delete list['googleapis.com:servicebroker'];
    delete list['kubernetes.io'];
    delete list['microsoft.com:graph'];
    delete list['presalytics.io:ooxml'];
    delete list['stripe.com'];

    const specs = Object.entries(list).map(([name, api]) => {
        const latestVersion = api.versions[api.preferred];
        return {
            name: name
                .replace(/^[^a-zA-Z]+/g, '')
                .replace(/[^\w\-]+/g, '-')
                .trim()
                .toLowerCase(),
            url: latestVersion.swaggerYamlUrl || latestVersion.swaggerUrl,
        };
    });

    for (let i = 0; i < specs.length; i++) {
        const spec = specs[i];
        await generate(spec.url, `./test/generated/${spec.name}/`);
    }
}

async function main() {
    // await generate('./test/spec/v2.json', './test/generated/v2/');
    // await generate('./test/spec/v3.json', './test/generated/v3/');
    // await generateRealWorldSpecs();
    await generate('https://api.apis.guru/v2/specs/asana.com/1.0/openapi.yaml', './test/generated/asana/');
    await generate('https://api.apis.guru/v2/specs/amazonaws.com/ec2/2016-11-15/openapi.yaml', './test/generated/ec2/');
    await generate('https://api.apis.guru/v2/specs/aucklandmuseum.com/2.0.0/swagger.yaml', './test/generated/aucklandmuseum/');
}

main();
