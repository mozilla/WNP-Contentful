const https = require("https");

const ENDPOINT = `https://cdn.contentful.com/spaces/${process.env.SPACE_ID}/environments/master/entries?access_token=${process.env.ACCESS_TOKEN}&content_type=whatsNewBadge`;

function fetchContent() {
  return new Promise((resolve, reject) => {
    const req = https.get(ENDPOINT, (res) => {
      let body = "";

      res.setEncoding("utf8");

      res.on("data", (chunk) => {
        body += chunk;
      });

      res.on("end", () => {
        try {
          let output = JSON.parse(body);
          resolve({
            status: res.statusCode,
            data: output
          });
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on("error", reject);
    req.end();
  });
}

/**
 * HTTP Cloud Function to fetch Whats-New-Panel messages from Contentful content API.
 *
 * @param {Object} req Cloud Function request context.
 *                     More info: https://expressjs.com/en/api.html#req
 * @param {Object} res Cloud Function response context.
 *                     More info: https://expressjs.com/en/api.html#res
 */
exports.wnpGET = async (req, res) => {
  try {
    const { data } = await fetchContent();
    const messages = data.items.map(item => item.fields);
    res.json({ messages });
  } catch (err) {
    res.error(500).json({ error: `${err}` });
  }
}
