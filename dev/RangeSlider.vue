<script>
import VueRangeSlider from 'vue-range-component';
import 'vue-range-component/dist/vue-range-slider.css';

export default {
  components: {
    VueRangeSlider,
  },
  props: ['value'],
};
</script>

<template>
  <div>
    <vue-range-slider
      :value="value"
      @input="$emit('input', $event)"
      :min="3"
      :max="80"
      :tooltip-merge="false"
    />
  </div>
</template>
