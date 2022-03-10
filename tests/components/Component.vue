<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component
export default class Input extends Vue {
  @Prop({
    default: null,
  }) readonly value!: any;

  @Prop({
    default: null,
  }) readonly identifier!: string;
}
</script>

<template>
  <span class="dummy-component"/>
</template>
