<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { QueryBuilderConfig, Rule } from '@/types';
import { isQueryBuilderConfig } from '@/guards';

@Component
export default class QueryBuilderRule extends Vue {
  @Prop({
    required: true,
    validator: param => isQueryBuilderConfig(param),
  }) readonly config!: QueryBuilderConfig

  @Prop() readonly query!: Rule | null
}
</script>

<template>
  <div class="query-builder-rule">Hello Rule {{ query.identifier }}</div>
</template>
