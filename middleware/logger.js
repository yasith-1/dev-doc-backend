/**
 * Custom logger middleware for a terminal-like experience
 */
const logger = (req, res, next) => {
    const start = Date.now();
    const timestamp = new Date().toLocaleTimeString();

    // When the request finishes
    res.on('finish', () => {
        const duration = Date.now() - start;
        const status = res.statusCode;
        const contentType = res.get('Content-Type');

        let statusColor = '\x1b[32m'; // Green
        if (status >= 500) statusColor = '\x1b[31m'; // Bright Red
        else if (status >= 400) statusColor = '\x1b[33m'; // Yellow
        else if (status >= 300) statusColor = '\x1b[36m'; // Cyan

        const methodColor = '\x1b[35m'; // Magenta
        const reset = '\x1b[0m';
        const gray = '\x1b[90m';
        const white = '\x1b[37m';
        const blue = '\x1b[34m';

        console.log(`\n${gray}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${reset}`);
        console.log(
            `${gray}[${timestamp}]${reset} ` +
            `${methodColor}${req.method}${reset} ` +
            `${white}${req.originalUrl}${reset} ` +
            `${statusColor}${status}${reset} ` +
            `${gray}(${duration}ms)${reset}`
        );

        // Log Content-Type
        if (contentType) {
            console.log(`${gray}Type:${reset} ${blue}${contentType}${reset}`);
        }

        // Log Headers
        console.log(`${gray}Req Headers:${reset}`, {
            'content-type': req.headers['content-type'],
            'authorization': req.headers['authorization'] ? 'Bearer [HIDDEN]' : 'none'
        });

        console.log(`${gray}Res Headers:${reset}`, {
            'content-type': contentType,
            'cache-control': res.get('Cache-Control')
        });

        if (req.method !== 'GET' && req.body && Object.keys(req.body).length > 0) {
            console.log(`${gray}Request Payload:${reset}`, JSON.stringify(req.body, null, 2));
        }

        if (req.query && Object.keys(req.query).length > 0) {
            console.log(`${gray}Query Params:${reset}`, req.query);
        }
    });

    // Capture response data BEFORE the finish event
    const oldSend = res.send;
    res.send = function (data) {
        try {
            if (data && typeof data === 'string' && (data.startsWith('{') || data.startsWith('['))) {
                const parsed = JSON.parse(data);
                console.log(`\x1b[90mResponse Body:\x1b[0m`, JSON.stringify(parsed, null, 2).substring(0, 500) + (data.length > 500 ? '... [TRUNCATED]' : ''));
            } else if (typeof data === 'object') {
                console.log(`\x1b[90mResponse Body:\x1b[0m`, JSON.stringify(data, null, 2).substring(0, 500) + (JSON.stringify(data).length > 500 ? '... [TRUNCATED]' : ''));
            }
        } catch (e) {
            // Ignore parse errors for binary/other data
        }
        return oldSend.apply(res, arguments);
    };

    next();
};

module.exports = logger;
