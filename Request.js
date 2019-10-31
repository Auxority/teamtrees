const http = require("http");
const https = require("https");

class Request {
    static parseJSON(str) {
        try {
            return JSON.parse(str);
        } catch (e) {
            throw new Error(e);
        }
    }

    static create(method, url, headers, data, encoding) {
        return new Promise((resolve, reject) => {
            let protocol = https;
            let path = "/";
            let urlMatch = url.match(/(https:\/\/)|(http:\/\/)/);
            if (urlMatch) {
                if (urlMatch[1]) {
                    url = url.replace(urlMatch[1], "");
                } else if (urlMatch[2]) {
                    url = url.replace(urlMatch[2], "");
                    protocol = http;
                }
                let pathMatch = url.match(/.*?\..*?(\/.*)/);
                if (pathMatch) {
                    path = pathMatch[1];
                    url = url.replace(path, "");
                }
            } else {
                return reject("Invalid url provided. Supported protocols: (http:// or https://)");
            }
            if (typeof(method) === "string") {
                method = method.toUpperCase();
            }
            if (headers === undefined) {
                headers = {};
            }
            if (typeof(headers) !== "object" || Array.isArray(headers) === true) {
                return reject("Invalid headers provided.")
            }
            if (method !== "GET" && method !== "POST" && method !== "PUT" && method !== "PATCH" && method !== "DELETE") {
                return reject("Invalid method provided. Supported methods: (GET, POST, PUT, PATCH, DELETE)");
            }
            const r = protocol.request({
                method: method,
                hostname: url,
                path: path,
                headers: {}
            }, (res) => {
                let bodyChunks = [];
                res.on("data", (chunk) => {
                    bodyChunks.push(chunk);
                });

                res.on("end", () => {
                    let body = Buffer.concat(bodyChunks);
                    if (encoding === undefined || encoding === "utf-8") {
                        body = body.toString();
                    } else if (encoding === "json") {
                        body = body.toString();
                        body = Request.parseJSON(body);
                    }
                    return resolve(body);
                });
            });
            
            r.on("error", (error) => {
                return reject(error);
            });
            
            if (method !== "GET" && data !== undefined) {
                r.write(data);
            }

            r.end();
        });
    }

    static get(url, headers, encoding) {
        return Request.create("GET", url, headers, undefined, encoding);
    }

    static post(url, headers, data, encoding) {
        return Request.create("POST", url, headers, data, encoding);
    }

    static put(url, headers, data, encoding) {
        return Request.create("PUT", url, headers, data, encoding);
    }

    static patch(url, headers, data, encoding) {
        return Request.create("PATCH", url, headers, data, encoding);
    }

    static delete(url, headers, data, encoding) {
        return Request.create("DELETE", url, headers, data, encoding);
    }
}

module.exports = Request;