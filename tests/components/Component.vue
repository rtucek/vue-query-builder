<script lang="ts" setup>
import { defineProps } from 'vue';

defineProps({
  modelValue: {
    type: [Object, Number, String]
  },
  identifier: String
});

</script>

<template>
  <span class="dummy-component" />
</template>
