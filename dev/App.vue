<template>
  <div id="app">
    <query-builder :config="config" v-model="query">
      <template #groupOperator="props">
        <group-operator-slot :group-operator="props"/>
      </template>

      <template #groupControl="props">
        <group-ctrl-slot :group-ctrl="props"/>
      </template>

      <template #rule="props">
        <rule-slot :rules="config.rules" :ruleCtrl="props"/>
      </template>
    </query-builder>
  </div>
</template>

<script>
import QueryBuilder from 'query-builder-vue';

import FlatPickr from 'vue-flatpickr-component';
import GroupOperatorSlot from './GroupOperatorSlot.vue';
import GroupCtrlSlot from './GroupCtrlSlot.vue';
import RuleSlot from './RuleSlot.vue';

import CountrySelection from './CountrySelection.vue';
import RangeSlider from './RangeSlider.vue';

import 'flatpickr/dist/flatpickr.css';

import 'bulma/css/bulma.css';
import '@fortawesome/fontawesome-free/css/all.css';

export default {
  components: {
    QueryBuilder,
    GroupOperatorSlot,
    GroupCtrlSlot,
    RuleSlot,
  },
  data() {
    return {
      query: {
        operatorIdentifier: 'AND',
        children: [
          { identifier: 'age_range', value: [18, 45] },
          { identifier: 'country', value: 'US' },
          { identifier: 'date', value: new Date().toLocaleDateString('fr-CA') },
        ],
      },
    };
  },

  computed: {
    config() {
      return {
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
            identifier: 'age_range',
            name: 'Age Range',
            component: RangeSlider,
            initialValue: () => [18, 45],
          },
          {
            identifier: 'country',
            name: 'Country',
            component: CountrySelection,
            initialValue: 'US',
          },
          {
            identifier: 'date',
            name: 'Date',
            component: FlatPickr,
            initialValue: () => new Date().toLocaleDateString('en-CA'),
          },
        ],
        colors: ['hsl(88, 50%, 55%)', 'hsl(187, 100%, 45%)'],
        dragging: {
          disabled: false,
        },
      };
    },
  },
};
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

.query-builder-group__group-children {
  margin-left: 32px !important;
}
</style>
