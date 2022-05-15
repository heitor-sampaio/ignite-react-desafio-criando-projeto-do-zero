/* eslint-disable @typescript-eslint/explicit-function-return-type */
import * as prismic from '@prismicio/client';

export function getPrismicClient(req?: unknown) {
  const client = prismic.createClient(process.env.PRISMIC_API_ENDPOINT, {
    accessToken: process.env.PRISMIC_ACCESS_TOKEN,
  });

  client.enableAutoPreviewsFromReq(req);

  return client;
}
