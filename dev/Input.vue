<script lang="ts" setup>
import { computed, defineProps, defineEmits, WritableComputedRef } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: 0
  }
});

const emit = defineEmits(['update:modelValue']);

const model: WritableComputedRef<string> = computed<string>({
  get: () => {
    return props.modelValue;
  },

  set: (value: string) => {
    emit('update:modelValue', value);
  }
});
</script>

<template>
  <input
    type="text"
    v-model="model"
    placeholder="dummy input"
  >
</template>
