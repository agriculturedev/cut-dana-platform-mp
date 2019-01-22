var sorting = {},
    size = 10000;

function prepareSearchBody (query) {
    var searchBody = {};

    if (!_.isEmpty(sorting)) {
        searchBody.sort = [sorting];
    }

    searchBody.from = 0;
    searchBody.size = size;
    searchBody.query = query;

    return JSON.stringify(searchBody);
}

export function setTimeOut (value) {
    timeout = value;
}

export function setSorting (key, value) {
    sorting = { key, value };
}

export function setSize (value) {
    size = value;
}

/**
* sends query against ElasticSearch-Index
* @param {string} serviceId - id of ElasticSearch Element in rest-services.json
* @param {object} query - json-notated Query to post to
* @return {object} result - Resultobject of ElasticQuery
*/
export function search (serviceId, query) {
    var result = {},
        searchUrl,
        searchBody,
        serviceUrl;

    serviceUrl = Radio.request("RestReader", "getServiceById", serviceId).get("url");
    searchUrl = Radio.request("Util", "getProxyURL", serviceUrl);
    searchBody = prepareSearchBody(query);


    if (_.isUndefined(serviceUrl)) {
        result.status = "error";
        result.message = "ElasticSearch Service with id " + serviceId + " not found.";
        console.error(JSON.stringify(result));
    }
    else if (_.isUndefined(query)) {
        result.status = "error";
        result.message = "ElasticSearch query not found.";
        console.error(JSON.stringify(result));
    }
    else {
        fetch(searchUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            },
            body: searchBody
        })
            .then(response => response.json())
            .then(response => {
                var datasources = [];

                result.status = "success";

                _.each(response.hits.hits, function (hit) {
                    datasources.push(hit._source);
                })
                result.hits = datasources;}
            )
            .catch(err => {
                result.status = "error";
                result.message = "ElasticSearch query went wrong with message: " + err;
                console.error("error", err);
            });
    }

    return result;
}
