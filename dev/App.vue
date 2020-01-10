<template>
  <div id="app">
    <query-builder
      :config="config"
      v-model="query"
    >
      <template #groupOperator="props">
        <div class="query-builder-group-slot__group-selection">
          <span class="query-builder-group-slot__group-operator">SLOT #groupOperator</span>
          <select
            :value="props.currentOperator"
            @input="props.updateCurrentOperator($event.target.value)"
          >
            <option disabled value="">Select an operator</option>
            <option
              v-for="operator in props.operators"
              :key="operator.identifier"
              :value="operator.identifier"
              v-text="operator.name"
            />
          </select>
        </div>
      </template>

      <template #groupControl="props">
        <group-ctrl-slot :group-ctrl="props"/>
      </template>

      <template #rule="props">
        <rule-slot :ruleCtrl="props"/>
      </template>
    </query-builder>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import QueryBuilder from '@/QueryBuilder.vue';
import { RuleSet, QueryBuilderConfig } from '@/types';

import InputSelection from './Input.vue';
import NumberSelection from './Number.vue';
import GroupCtrlSlot from './GroupCtrlSlot.vue';
import RuleSlot from './RuleSlot.vue';

@Component({
  components: {
    QueryBuilder,
    GroupCtrlSlot,
    RuleSlot,
  },
})
export default class App extends Vue {
  query: RuleSet | null = {
    operatorIdentifier: 'OR',
    children: [
      {
        operatorIdentifier: 'AND',
        children: [
          {
            identifier: 'txt',
            value: 'A',
          },
          {
            identifier: 'txt',
            value: 'B',
          },
          {
            identifier: 'txt',
            value: 'C',
          },
          {
            operatorIdentifier: 'AND',
            children: [
              {
                identifier: 'txt',
                value: 'c',
              },
              {
                identifier: 'txt',
                value: 'd',
              },
              {
                operatorIdentifier: 'AND',
                children: [
                  {
                    identifier: 'txt',
                    value: 'a',
                  },
                  {
                    identifier: 'txt',
                    value: 'b',
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        operatorIdentifier: 'AND',
        children: [
          {
            identifier: 'txt',
            value: 'X',
          },
          {
            identifier: 'txt',
            value: 'Y',
          },
          {
            identifier: 'txt',
            value: 'Z',
          },
        ],
      },
    ],
  };

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
    rules: [
      {
        identifier: 'txt',
        name: 'Text Selection',
        component: InputSelection,
        initialValue: '',
      },
      {
        identifier: 'num',
        name: 'Number Selection',
        component: NumberSelection,
        initialValue: 10,
      },
    ],
    colors: [
      'hsl(88, 50%, 55%)',
      'hsl(187, 100%, 45%)',
      'hsl(15, 100%, 55%)',
    ],
    dragging: {
      animation: 300,
      disabled: false,
      ghostClass: 'ghost',
    },
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

.query-builder-group-slot__group-selection {
  padding: 16px;
  background-color: hsl(0, 0, 95%);
}
.query-builder-group-slot__group-operator {
  margin-right: 8px;
}
</style>
