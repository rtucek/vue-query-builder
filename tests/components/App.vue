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
import QueryBuilder from '@/QueryBuilder.vue';
import { RuleSet, QueryBuilderConfig } from '@/types';

// NB: this component must use options api to declare data because vue-test-utils will not 
// patch data composed with script setup.
export default {
  data() {
    return {
      query: /* RuleSet | null: */ null,
      config: /* QueryBuilderConfig: */ null,
    };
  },
  components: {
    QueryBuilder,
  },
};
</script>
