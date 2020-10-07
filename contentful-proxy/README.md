# Contentful-proxy

This is a proxy app between the Contentful content API and the WNP content consumers.

In this prototype, we will be experimenting consuming content for WNP without going though the current content pipeline. Though the content type on Contentful may not be the same as the current one, therefore, we use this proxy to transform the raw content generated by Contentful to the format that WNP currently expects.