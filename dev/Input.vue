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
    type: String,
    default: '',
  }) readonly value!: string;

  get model() {
    return this.value;
  }

  set model(value: string) {
    this.$emit('input', value);
  }
}
</script>

<template>
  <input
    type="text"
    v-model="model"
    placeholder="dummy input"
  >
</template>
