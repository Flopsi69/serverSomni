<template>
  <pre>{{ test }}</pre>
</template>

<script setup>
const test = await $fetch('/api/stamped?customer_id=3528699904115');
// const test = await $fetch('/api/selfie?customer_id=3528699904115');

console.log(test);
</script>

<style lang="scss" scoped></style>
