var axios   = require('axios'),
    fs      = require('fs'),
    yaml    = require('js-yaml');

class OpenAPIConverter {

    constructor(oaiString) {
        this.oaiString = oaiString;
        this.oai = yaml.safeLoad(this.oaiString);
    }

    dereference(array) {
        var newArray = [];
        array.forEach(item => {
            var newItem = {}
            if (item.hasOwnProperty('$ref')) {
                var ref = item["$ref"];
                var refGraph = ref.replace("#/", "").split("/");
                var objWalker = this.oai;
                
                refGraph.forEach(objKey => {
                    objWalker = objWalker[objKey];
                })

                newItem = objWalker;

            } else {
                newItem = item;
            }
            
            newArray.push(newItem);
        })
        return newArray;
    }

    convertResponses(responses) {

        const convertContent = (contents) => {
            var newContents = [];

            Object.keys(contents).forEach(contentType => {
                var oldContent = contents[contentType];
                var newContent = {};
                Object.assign(newContent, oldContent);
                newContent.contentType = contentType;

                if (newContent.schema.hasOwnProperty('$ref')) {
                    var ref = newContent.schema["$ref"].split("/");
                    var complexType = ref[ref.length - 1];
                    newContent.schema.complexType = complexType;
                }

                if (newContent.schema.type === "array") {
                    if (newContent.schema.items.hasOwnProperty("$ref")) {
                        var ref = newContent.schema.items["$ref"].split("/");
                        var complexType = ref[ref.length - 1];
                        newContent.schema.items.complexType = complexType;
                    }
                }
                newContents.push(newContent);
            })
            return newContents;
        }

        var converted = [];
        Object.keys(responses).forEach(code => {
            var oldResponse = responses[code];
            var newResponse = {};
            Object.assign(newResponse, oldResponse);
            newResponse.httpCode = code;
            newResponse.content = oldResponse.content ? 
                                  convertContent(oldResponse.content) :
                                  undefined;
            converted.push(newResponse);
        })
        return converted;
    }

    convertOaiPath(pathKey, path) {
        var operations = [];
        Object.keys(path).forEach((httpMethod, i) => {
            var pathMethod = path[httpMethod];
            var operation = {};
            Object.assign(operation, pathMethod);
            operation.path = pathKey;
            operation.httpMethod = httpMethod;
            operation.hasParams = operation.hasOwnProperty("parameters");
            if (operation.hasParams) {
                operation.parameters = this.dereference(operation.parameters);
            }
            operation.hasTags = operation.hasOwnProperty("tags");
            operation.responses = this.convertResponses(pathMethod.responses);
            operations.push(operation);
        });
        return operations;
    }

    convertForDocs() {
        const convertSchemas = () => {

            const convertProperties = (oldProperties) => {
                var newProperties = [];
                Object.keys(oldProperties).forEach(propertyKey => {
                    var oldProperty = oldProperties[propertyKey];
                    var newProperty = {};
                    Object.assign(newProperty, oldProperty);
                    newProperty.name = propertyKey;
                    newProperties.push(newProperty);
                })
                return newProperties;
            }

            var newSchemas = [];
            Object.keys(this.oai.components.schemas).forEach(schemaKey => {
                var oldSchema = this.oai.components.schemas[schemaKey];
                var newSchema = {};
                Object.assign(newSchema, oldSchema);
                newSchema.name = schemaKey;
                newSchema.properties = convertProperties(oldSchema.properties);
                newSchemas.push(newSchema);
            })
            return newSchemas;
        }
        
        var converted = {
            info: this.oai.info,
            apiInfo: {
                apis: []
            },
            components: {
                schemas: convertSchemas(),
                hasSchemas: this.oai.components.hasOwnProperty("schemas")
            }
        };

        var apiKeyToCounter = {};
        var counter = 0;

        Object.keys(this.oai.paths).forEach((pathKey, i) => {
            var api = pathKey.split("/")[1];
            var includedApiKeys = converted.apiInfo.apis.map(a => a.baseName);
            if (!includedApiKeys.includes(api)) {
                var newApi = {
                    baseName: api,
                    operations: {
                        operation: []
                    }
                }
                converted.apiInfo.apis.push(newApi);
                apiKeyToCounter[api] = counter;
                counter++;
            }

            var path = this.oai.paths[pathKey];
            this.convertOaiPath(pathKey, path).forEach(op => {
                var apiIdx = apiKeyToCounter[api];
                converted.apiInfo.apis[apiIdx].operations.operation.push(op);
            });
        })

        this.oai.tags.forEach((tagObj, i) => {
            var apiOrder = null;
            converted.apiInfo.apis.forEach((api, a) => {
                if (api.baseName === tagObj.name) {
                    apiOrder = a;
                }
            })
            if (apiOrder !== null) {
                converted.apiInfo.apis[apiOrder].description = tagObj.description;
                converted.apiInfo.apis[apiOrder].externalDocs = tagObj.externalDocs;
            }
        })
        return converted;
    }

}

module.exports = OpenAPIConverter;
