/**
 * Parses the raw content entries fetched from Contentful, transforms them into
 * the message format that Firefox WNP understands.
 *
 * @param {Array[Object]} entries An array of objects fetched from Contentful
 * @return {Array[Object]} An array of objects that can be consumed by Firefox WNP
 */
function transform(entries) {
  return entries.map((entry) => ({
    id: entry.id,
    template: "whatsnew_panel_message",
    order: entry.order,
    content: parseContent(entry),
    targeting: parseTargeting(entry),
    trigger: {
      id: "whatsNewPanelOpened",
    },
  }));
}

/**
 * Maps the icon fields to the format that Firefox understands.
 * Note that it assumes all the icons reside in a fixed directory,
 * also, the data uri is not yet supported for now.
 */
function parseIconURL(icon) {
  return icon
    ? `chrome://browser/content/logos/${icon.fields.file.fileName}`
    : "";
}

function parseContent(entry) {
  const raw = entry.content.fields;

  return {
    bucket_id: entry.id,
    publish_date: Date.parse(raw.publish_date),
    title: raw.title,
    body: raw.body,
    icon_url: parseIconURL(raw.icon_url),
    icon_alt: raw.icon_alt,
    cta_type: raw.cta_type,
    cta_url: raw.cta_url || "",
    cta_where: raw.cta_where,
    link_text: raw.link_text,
  };
}

function parseVersion(version) {
  if (version && version.fields && version.fields.chooseVersion) {
    return `firefoxVersion == ${version.fields.version}`;
  }
  return "";
}

function parseLocale(locale) {
  if (locale && locale.fields && locale.fields.chooseLocale) {
    const type =
      locale.fields.localeType === "language" ? "languageCode" : "locale";
    return `${type} == "${locale.fields.value}"`;
  }
  return "";
}

function parseRegion(region) {
  if (region && region.fields && region.fields.chooseRegion) {
    return `region == "${region.fields.region}"`;
  }
  return "";
}

function parseOther(other) {
  if (other && other.trim() !== "") {
    return `(${other.trim()})`;
  }
  return "";
}

function parseTargeting(entry) {
  if (!entry.targeting) {
    return "true";
  }

  const raw = entry.targeting.fields;
  const targeting = [];

  targeting.push(parseVersion(raw.version));
  targeting.push(parseLocale(raw.locale));
  targeting.push(parseRegion(raw.region));
  targeting.push(parseOther(raw.other));

  const jexl = targeting.filter((item) => item !== "").join(" && ");
  return jexl === "" ? "true" : jexl;
}

exports.transform = transform;
exports.parseIconURL = parseIconURL;
exports.parseContent = parseContent;
exports.parseVersion = parseVersion;
exports.parseLocale = parseLocale;
exports.parseRegion = parseRegion;
exports.parseOther = parseOther;
exports.parseTargeting = parseTargeting;
