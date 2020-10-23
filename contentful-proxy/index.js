const contentful = require("contentful");
const kinto = require("kinto-http");
const { transform } = require("./transform");

// Contentful client
const client = contentful.createClient({
  space: process.env.SPACE_ID,
  accessToken: process.env.ACCESS_TOKEN,
});

// Contentful preview client
const previewClient = contentful.createClient({
  space: process.env.SPACE_ID,
  accessToken: process.env.PREVIEW_TOKEN,
  host: "preview.contentful.com",
})

const auth = Buffer.from(
  `${process.env.KINTO_USER}:${process.env.KINTO_PASSWORD}`
).toString("base64");
// Kinto client
const rsClient = new kinto.default("https://kinto.dev.mozaws.net/v1", {
  headers: {
    Authorization: `Basic ${auth}`,
  },
});
const kintoStore = rsClient.bucket("main").collection("whats-new-panel");

async function fetchAll() {
  const entries = await client.getEntries({
    content_type: "whatsNewPanel",
    include: 3,
  });
  return entries.items.map((entry) => entry.fields);
}

async function fetchOne(id) {
  const entry = await client.getEntry(id, {
    content_type: "whatsNewPanel",
    include: 3,
  });
  return entry.fields;
}

async function fetchOnePreview(id) {
  const entry = await previewClient.getEntry(id, {
    content_type: "whatsNewPanel",
    include: 3,
  });
  return entry.fields;
}

/**
 * HTTP Cloud Function to:
 *
 *  * [GET] fetch Whats-New-Panel messages from Contentful content API
 *  * [POST] notify a new content is published on Contentful
 *
 * @param {Object} req Cloud Function request context.
 *                     More info: https://expressjs.com/en/api.html#req
 * @param {Object} res Cloud Function response context.
 *                     More info: https://expressjs.com/en/api.html#res
 */
exports.wnpGET = async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  switch (req.method) {
    case "OPTIONS":
      res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Content-Length, X-Contentful-Webhooks-Token, x-contentful-topic"
      );
      res.set("Access-Control-Max-Age", "3600");
      res.status(204).send("");
      break;
    case "GET":
      try {
        const entries = await fetchAll();
        const messages = transform(entries);
        res.json({ messages });
      } catch (err) {
        res.status(500).json({ error: `${err}` });
      }
      break;
    case "POST":
      if (
        !req.get("X-Contentful-Webhooks-Token") ||
        req.get("X-Contentful-Webhooks-Token") !== process.env.WEB_HOOKS_TOKEN
      ) {
        res.status(401).json({ error: "Unauthorized request" });
      }
      try {
        const [_type, _entry, publishState] = req
          .get("x-contentful-topic")
          .split(".");
        if (publishState === "publish") {
          const entry = await fetchOne(req.body.sys.id);
          const [parsed] = transform([entry]);
          kintoStore.createRecord(parsed);
          res.status(201).json({ message: "ok" });
        } else if (publishState === "unpublish") {
          const entry = await fetchOnePreview(req.body.sys.id);
          const [parsed] = transform([entry]);
          kintoStore.deleteRecord(parsed.id);
          res.status(200).json({ message: "ok" });
        } else {
          res.status(404).json({ error: "Invalid action" });
        }
      } catch (err) {
        res.status(500).json({ error: `${err}` });
      }
      break;
    default:
      res.status(405).send({ error: "Unsupported HTTP method" });
      break;
  }
};
