const {
  transform,
  parseIconURL,
  parseContent,
  parseLocale,
  parseOther,
  parseVersion,
  parseRegion,
  parseTargeting,
} = require("../transform");

const PANEL_CONTENT = {
  id: "WHATS_NEW_BETTER_PDF_82",
  order: 0,
  content: {
    fields: {
      publish_date: "2020-11-06",
      title: "A Better PDF Experience in Firefox",
      body: "Firefox allows you to browse, edit PDF files like a breeze.",
      icon_url: {
        fields: {
          title: "lockwise-mobile",
          file: {
            url:
              "//images.ctfassets.net/fh7ffc8n579v/KdmBNxlx0n2typVyJBlo4/72836c115ae3f0911841870ad2ecb4fc/lockwise-mobile.svg",
            details: {
              size: 6907,
              image: {
                width: 50,
                height: 58,
              },
            },
            fileName: "lockwise-mobile.svg",
            contentType: "image/svg+xml",
          },
        },
      },
      icon_alt: "An Firefox PDF icon",
      cta_type: "OPEN_URL",
      cta_url:
        "https://support.mozilla.org/en-US/kb/view-pdf-files-firefox-or-choose-another-viewer",
      cta_where: "tabshifted",
      link_text: "Learn more",
    },
  },
  targeting: {
    fields: {
      version: {
        fields: {
          chooseVersion: true,
          version: "82",
        },
      },
      region: {
        fields: {
          chooseRegion: true,
          region: "US",
        },
      },
      locale: {
        fields: {
          chooseLocale: true,
          localeType: "locale",
          value: "en-US",
        },
      },
    },
  },
};

const EXPECTED_CONTENT = {
  bucket_id: "WHATS_NEW_BETTER_PDF_82",
  publish_date: 1604620800000,
  title: "A Better PDF Experience in Firefox",
  body: "Firefox allows you to browse, edit PDF files like a breeze.",
  icon_url: "chrome://browser/content/logos/lockwise-mobile.svg",
  icon_alt: "An Firefox PDF icon",
  cta_type: "OPEN_URL",
  cta_url:
    "https://support.mozilla.org/en-US/kb/view-pdf-files-firefox-or-choose-another-viewer",
  cta_where: "tabshifted",
  link_text: "Learn more",
};

const EXPECTED_TARGETING =
  'firefoxVersion == 82 && locale == "en-US" && region == "US"';

const EXPECTED_TRANSFORMED_MESSAGES = {
  id: PANEL_CONTENT.id,
  order: PANEL_CONTENT.order,
  content: EXPECTED_CONTENT,
  targeting: EXPECTED_TARGETING,
  template: "whatsnew_panel_message",
  trigger: { id: "whatsNewPanelOpened" },
};

describe("parseIconURL", () => {
  test("should parse the icon URL with Firefox aware relative path", () => {
    const rawIconURL = {
      fields: {
        title: "lockwise-mobile",
        file: {
          url:
            "//images.ctfassets.net/fh7ffc8n579v/KdmBNxlx0n2typVyJBlo4/72836c115ae3f0911841870ad2ecb4fc/lockwise-mobile.svg",
          details: {
            size: 6907,
            image: {
              width: 50,
              height: 58,
            },
          },
          fileName: "lockwise-mobile.svg",
          contentType: "image/svg+xml",
        },
      },
    };
    expect(parseIconURL(rawIconURL)).toBe(
      "chrome://browser/content/logos/lockwise-mobile.svg"
    );
  });

  test("should return an empty string if icon_url is empty", () => {
    expect(parseIconURL(undefined)).toBe("");
  });
});

describe("parseContent", () => {
  test("should parse the content property from the raw content", () => {
    expect(parseContent(PANEL_CONTENT)).toEqual(EXPECTED_CONTENT);
  });
});

describe("parseVersion", () => {
  test("should parse the version targeting if present", () => {
    const rawVersion = {
      fields: {
        chooseVersion: true,
        version: "82",
      },
    };
    expect(parseVersion(rawVersion)).toBe("firefoxVersion == 82");
  });

  test("should return an empty string if version targeting is absent", () => {
    expect(parseVersion(undefined)).toBe("");
  });

  test("should return an empty string if chooseVersion is false", () => {
    const rawVersion = {
      fields: { chooseVersion: false },
    };
    expect(parseVersion(rawVersion)).toBe("");
  });
});

describe("parseRegion", () => {
  test("should parse the region targeting if present", () => {
    const rawRegion = {
      fields: {
        chooseRegion: true,
        region: "US",
      },
    };
    expect(parseRegion(rawRegion)).toBe('region == "US"');
  });

  test("should return an empty string if region targeting is absent", () => {
    expect(parseRegion(undefined)).toBe("");
  });

  test("should return an empty string if chooseRegion is false", () => {
    const rawRegion = {
      fields: { chooseRegion: false },
    };
    expect(parseRegion(rawRegion)).toBe("");
  });
});

describe("parseLocale", () => {
  test("should parse the locale targeting with locale if present", () => {
    const rawLocale = {
      fields: {
        chooseLocale: true,
        localeType: "locale",
        value: "en-US",
      },
    };
    expect(parseLocale(rawLocale)).toBe('locale == "en-US"');
  });

  test("should parse the locale targeting with languageCode if present", () => {
    const rawLocale = {
      fields: {
        chooseLocale: true,
        localeType: "language",
        value: "en",
      },
    };
    expect(parseLocale(rawLocale)).toBe('languageCode == "en"');
  });

  test("should return an empty string if locale targeting is absent", () => {
    expect(parseRegion(undefined)).toBe("");
  });

  test("should return an empty string if chooseLocale is false", () => {
    const rawLocale = {
      fields: { chooseLocale: false },
    };
    expect(parseRegion(rawLocale)).toBe("");
  });
});

describe("parseOther", () => {
  test("should parse other if present", () => {
    expect(parseOther(" usesFirefoxSync || hasAccessedFxAPanel ")).toBe(
      "(usesFirefoxSync || hasAccessedFxAPanel)"
    );
  });

  test("should return an empty string if other is absent", () => {
    expect(parseOther(undefined)).toBe("");
  });
});

describe("parseTargeting", () => {
  test("should parse the targeting content and transform it into JEXL", () => {
    expect(parseTargeting(PANEL_CONTENT)).toBe(EXPECTED_TARGETING);
  });

  test("should append the 'other' JEXL to the targeting if present", () => {
    const withOther = {
      ...PANEL_CONTENT,
      targeting: {
        fields: {
          version: {
            fields: {
              chooseVersion: true,
              version: "82",
            },
          },
          other:
            "usesFirefoxSync || hasAccessedFxAPanel || currentDate|date - 2419200000 >= profileAgeCreated",
        },
      },
    };
    expect(parseTargeting(withOther)).toBe(
      "firefoxVersion == 82 && (usesFirefoxSync || hasAccessedFxAPanel || currentDate|date - 2419200000 >= profileAgeCreated)"
    );
  });

  test("should return a dummy truthy JEXL if targeting is absent", () => {
    const withoutTargeting = {
      ...PANEL_CONTENT,
      targeting: null,
    };
    expect(parseTargeting(withoutTargeting)).toBe("true");
  });
});

describe("transform", () => {
  test("should parse and transform wnp content from Contentful", () => {
    expect(transform([PANEL_CONTENT])).toEqual([EXPECTED_TRANSFORMED_MESSAGES]);
  });
});
