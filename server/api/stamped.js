export default defineEventHandler(async (event) => {
  const { apiShopifySecret, apiShopifyUrl } = useRuntimeConfig();

  const { customer_id } = getQuery(event);

  const { metafields } = await $fetch(
    `${apiShopifyUrl}/${customer_id}/metafields.json?namespace=rewards`,
    {
      headers: { 'X-Shopify-Access-Token': apiShopifySecret },
      method: 'GET',
    }
  );

  const result = {
    video: false,
    selfie: false,
    answers: [],
  };

  if (!metafields.length) return result;

  metafields.forEach((metafield) => {
    if (metafield.key == 'upload_selfie') {
      result.selfie = true;
    }

    if (metafield.key == 'upload_video') {
      result.video = true;
    }

    if (/question\d+/.test(metafield.key)) {
      result.answers.push(metafield.key);
    }
  });

  console.log(metafields);

  return { ...result, metafields };
});
