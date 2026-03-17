/**
 * Simple validation middleware
 * @param {Object} schema - Object with required fields { body: ['name', 'email'], query: [], params: [] }
 */
const validate = (schema) => (req, res, next) => {
    const errors = [];

    if (schema.body) {
        schema.body.forEach(field => {
            if (!req.body[field]) {
                errors.push(`${field} is required in body`);
            }
        });
    }

    if (schema.params) {
        schema.params.forEach(field => {
            if (!req.params[field]) {
                errors.push(`${field} is required in params`);
            }
        });
    }

    if (schema.query) {
        schema.query.forEach(field => {
            if (!req.query[field]) {
                errors.push(`${field} is required in query`);
            }
        });
    }

    if (errors.length > 0) {
        return res.status(400).json({ message: 'Validation failed', errors });
    }

    next();
};

module.exports = validate;
