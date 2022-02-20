export default {
    $schema: 'http://json-schema.org/draft-04/schema#',
    definitions: {
        permissionRule:  {
            properties: {
                allow: {$ref: '#/definitions/permissionValue'},
                deny: {$ref: '#/definitions/permissionValue'}
            },
            required: ['allow', 'deny']
        },
        permissionValue: {
            oneOf: [
                {
                    enum: ['all', 'config', 'none'],
                    type: 'string'
                },
                {
                    items: {type: 'string'},
                    type: 'array'
                }
            ]
        }
    },
    properties: {
        call: {
            $ref: '#/definitions/permissionRule'
        },
        realize: {
            $ref: '#/definitions/permissionRule'
        }
    },
    required: ['call', 'realize'],
    type: 'object'
};
