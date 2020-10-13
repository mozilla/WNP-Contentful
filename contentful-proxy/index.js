const contentful = require("contentful");
const { transform } = require("./transform");

const client = contentful.createClient({
  space: process.env.SPACE_ID,
  accessToken: process.env.ACCESS_TOKEN,
});

async function fetchContent() {
  const entries = await client.getEntries({
    content_type: "whatsNewPanel",
    include: 3,
  });
  return entries.items.map((entry) => entry.fields);
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
    const entries = await fetchContent();
    const messages = transform(entries);
    res.json({ messages });
  } catch (err) {
    res.error(500).json({ error: `${err}` });
  }
};
