<template>
  <div id="app">
    <pre v-text="JSON.stringify(this.query, null, 2)"></pre>
    <query-builder
      :config="config"
      v-model="query"
    >
    </query-builder>
  </div>
</template>

<script>
import QueryBuilder from '@/QueryBuilder.vue';
import UserRule from './UserRule.vue';
import NumberComparisonRule from './NumberComparisonRule.vue';

export default {
  components: {
    QueryBuilder,
  },
  data() {
    return {
      query: {
        operatorIdentifier: 'OR',
        children: [
          {
            identifier: 'txt',
            value: {
              field: 'username',
              operator: 'equals',
              value: 'foo@bar.com',
            },
          },
          {
            identifier: 'num',
            value: {
              lft: '20',
              rgt: '30',
              operator: '<=',
            },
          },
        ],
      },
      config: {
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
        rules: [
          {
            identifier: 'txt',
            name: 'Text Selection',
            component: UserRule,
            initialValue: () => ({
              field: 'email',
              operator: 'equals',
              value: '',
            }),
          },
          {
            identifier: 'num',
            name: 'Number Comparison',
            component: NumberComparisonRule,
            initialValue: () => ({
              lft: 0,
              rgt: 0,
              operator: '=',
            }),
          },
        ],
        colors: [
          'hsl(88, 50%, 55%)',
          'hsl(187, 100%, 45%)',
          'hsl(15, 100%, 55%)',
        ],
      },
    };
  },
};
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css?family=Roboto&display=swap');

body {
  margin: 0;
  padding: 0;
  font-family: 'Roboto', sans-serif;
  font-size: 16px;
}

#app {
  margin: 30px auto;
  width: 90%;
  border: 1px solid hsl(0, 0%, 75%);
}

.query-builder-group-slot__group-selection {
  padding: 16px;
  background-color: hsl(0, 0, 95%);
}
.query-builder-group-slot__group-operator {
  margin-right: 8px;
}
</style>
