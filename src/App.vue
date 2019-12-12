<template>
  <div id="app">
    <query-builder
      :config="config"
      v-model="query"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { RuleSet, QueryBuilderConfig } from '@/types';
import QueryBuilder from '@/QueryBuilder.vue';

@Component({
  components: {
    QueryBuilder,
  },
})
export default class App extends Vue {
  query: RuleSet | null = null;

  config: QueryBuilderConfig = {
    operators: [
      {
        name: 'AND',
        identifier: 'AND',
      },
      {
        name: 'OR',
        identifier: 'OR',
      },
    ],
    rules: [],
  }
}
</script>

<style lang="scss">
body {
  margin: 0;
  padding: 0;
}

#app {
  margin: 30px auto;
  width: 90%;
  border: 1px solid hsl(0, 0%, 75%);
}
</style>
