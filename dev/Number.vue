<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component({
  model: {
    event: 'input',
    prop: 'value',
  },
})
export default class Input extends Vue {
  @Prop({
    type: Number,
    default: 0,
  }) readonly value!: number;

  get model() {
    return this.value;
  }

  set model(value: any) {
    if (typeof value === 'number') {
      this.$emit('input', value);
    }
  }
}
</script>

<template>
  <input
    type="number"
    v-model.number="model"
    placeholder="dummy number"
  >
</template>
