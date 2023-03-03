export default defineEventHandler(async (event) => {
  const { apiShopifySecret, apiShopifyUrl } = useRuntimeConfig();

  const res = await $fetch(`${apiShopifyUrl}/3528699904115/metafields.json`, {
    headers: { 'X-Shopify-Access-Token': apiShopifySecret },
    method: 'GET',
  });

  return res;
});
