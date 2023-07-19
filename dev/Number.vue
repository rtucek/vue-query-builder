<script lang="ts" setup>
import { computed, defineProps, defineEmits, WritableComputedRef } from 'vue';

const props = defineProps({
  modelValue: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['update:modelValue']);

const model: WritableComputedRef<any> = computed<any>({
  get: () => {
    return props.modelValue;
  },

  set: (value: any) => {
    if (typeof value === 'number') {
      emit('update:modelValue', value);
    }
  }
});
</script>

<template>
  <input
    type="number"
    v-model.number="model"
    placeholder="dummy number"
  >
</template>
