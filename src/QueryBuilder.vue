<script lang="ts">
import {
  Component, Vue, Prop, Model,
} from 'vue-property-decorator';
import { isQueryBuilderConfig, isRuleSet } from '@/guards';
import { RuleSet, QueryBuilderConfig } from '@/types';
import QueryBuilderGroup from './QueryBuilderGroup.vue';

@Component({
  components: {
    QueryBuilderGroup,
  },
  model: {
    prop: 'query',
    event: 'update',
  },
})
export default class QueryBuilder extends Vue {
  @Model('update', {
    required: false,
    validator: query => query === null || isRuleSet(query),
  }) readonly query!: RuleSet | null

  @Prop({
    required: true,
    validator: param => isQueryBuilderConfig(param),
  }) readonly config!: QueryBuilderConfig | null
}
</script>

<template>
  <query-builder-group
    :config="config"
    :query="query"
    :depth="0"
    class="query-builder__root"
    @query-update="$emit('update', $event)"
  />
</template>

<style lang="scss" scoped>
.query-builder__root {
  display: flex;
  flex-flow: column;
}
</style>
