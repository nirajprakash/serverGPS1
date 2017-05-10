'use strict';

module.exports = {

    missingHeader: function(header) {
        return {
            code: 101,
            message: util.format('Missing header: ', header)
        };
    },
    missingQueryParam: function(queryParam) {
        return {
            code: 102,
            message: util.format('Missing query param: %s', queryParam)
        };
    },
    missingParam: function(param) {
        return {
            code: 103,
            message: util.format('Missing param: %s', param)
        };
    },
    missingRequestBody: function() {
        return {
            code: 104,
            message: 'API call missing request body object'
        };
    },
    missingBodyParam: function(bodyParam) {
        return {
            code: 105,
            message: util.format('Missing body param: %s', bodyParam)
        };
    },
    missingRequestQuery: function() {
        return {
            code: 106,
            message: 'API call missing query object'
        };
    },
    invalidQuery: function(query, value) {
        return {
            code: 107,
            message: 'invalid query: ' + query + '=' + value
        };
    },
    dbOperationFailed: function() {
        return {
            code: 50,
            message: util.format('Database operation failed')
        };
    },

    notFound: function(type, value){
        return {
            code: 404,
            message: 'not found: ' + type + '=' + value
        };

    },


    invalidGrantType: function(grant_type) {
        return {
            code: 90,
            message: util.format('Invalid grant type: %s', grant_type)
        };
    },

    internalRequestError: function(url) {
        return {
            code: 500,
            message: util.format('Request failed for URL: ', url)
        };
    },
    invalidSourceProvider: function(sourceProvider) {
        return {
            code: 10,
            message: util.format('Invalid source provider: %s', sourceProvider)
        };
    },
    unAuthorizedClient: function(client) {
        return {
            code: 3001,
            message: util.format('Unauthorized client: %s', client)
        };
    },
    unAuthorizedAdmin: function(admin) {
        return {
            code: 3001,
            message: util.format('Unauthorized admin: %s', admin)
        };
    },
    noClientFound: function() {
        return {
            code: 3000,
            message: util.format('No client found')
        };
    }
};