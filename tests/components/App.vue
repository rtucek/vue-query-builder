<template>
  <div id="app">
    <query-builder
      :config="config"
      v-model="query"
    >
    </query-builder>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';

import QueryBuilder from '@/QueryBuilder.vue';
import { RuleSet, QueryBuilderConfig } from '@/types';

@Component({
  components: {
    QueryBuilder,
  },
})
export default class App extends Vue {
  query: RuleSet | null = null;

  config: QueryBuilderConfig = {
    operators: [],
    rules: [],
  }
}
</script>
