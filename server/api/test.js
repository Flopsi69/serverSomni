export default defineEventHandler(async (event) => {
  setResponseHeaders(event, {
    'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Expose-Headers': '*',
  });

  const { apiShopifySecret, apiShopifyUrl } = useRuntimeConfig();

  const res = await $fetch(`${apiShopifyUrl}/3528699904115/metafields.json`, {
    headers: { 'X-Shopify-Access-Token': apiShopifySecret },
    method: 'GET',
  });

  return res;
});
