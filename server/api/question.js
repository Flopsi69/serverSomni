export default defineEventHandler(async (event) => {
  setResponseHeaders(event, {
    'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Expose-Headers': '*',
  });

  const { apiShopifySecret, apiShopifyUrl } = useRuntimeConfig();

  const { customer_id } = getQuery(event);
  let body = await readBody(event);

  console.log(body);

  const res = await $fetch(`${apiShopifyUrl}/${customer_id}/metafields.json`, {
    headers: { 'X-Shopify-Access-Token': apiShopifySecret },
    method: 'POST',
    body: {
      metafield: {
        namespace: 'rewards',
        key: body.question,
        value: JSON.stringify(body.answer),
        type: 'string',
      },
    },
  });

  return res;
});
