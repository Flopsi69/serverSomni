export default defineEventHandler(async (event) => {
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
        key: 'upload_video',
        value: JSON.stringify(body),
        type: 'string',
      },
    },
  });

  return res;
});
