<template>
  <div class="container">
    <div class="container-config">
      <div class="container-config-item" >
        <label for="ctrlEnableDragNDrop">
          Allow Drag'n'drop
        </label>
        <input type="checkbox" v-model="ctrlEnableDragNDrop" id="ctrlEnableDragNDrop">
      </div>
      <div class="container-config-item config-max-depth">
        <div>
          <label for="ctrlEnableMaxDepth">
            Enable max depth
          </label>
          <input type="checkbox" v-model="ctrlEnableMaxDepth" id="ctrlEnableMaxDepth">
        </div>
        <div>
          <label for="ctrlMaxDepth">
            Max Depth:
          </label>
          <input
            v-model.number="ctrlMaxDepth"
            type="number"
            min="0"
            :disabled="! ctrlEnableMaxDepth"
            id="ctrlMaxDepth"
          >
        </div>
      </div>
    </div>
    <query-builder
      :config="getConfig"
      v-model="query"
      class ="query-builder"
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
ctrlEnableDragNDrop: boolean = true;

  ctrlEnableMaxDepth: boolean = false;

  ctrlMaxDepth: number = 3;

  query: RuleSet | null = {
    operatorIdentifier: 'OR',
    children: [
      {
        identifier: 'txt',
        value: 'A',
      },
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
    maxDepth: undefined,
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

  get getConfig(): QueryBuilderConfig {
    const config: QueryBuilderConfig = { ...this.config };

    if (!config.dragging) {
      config.dragging = {};
    }
    config.dragging.disabled = !this.ctrlEnableDragNDrop;

    config.maxDepth = Math.abs(this.ctrlMaxDepth || 0);
    if (!this.ctrlEnableMaxDepth) {
      config.maxDepth = undefined;
    }

    return config;
  }
}
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css?family=Roboto&display=swap');

body {
  margin: 0;
  padding: 0;
  font-family: 'Roboto', sans-serif;
  font-size: 16px;
}

.container {
  width: 90%;
  margin: 30px auto;
  display: flex;
  flex-direction: column;
}

.container-config {
  border: 1px solid hsl(0, 0%, 75%);
  margin-bottom: 30px;
  padding: 10px;
  display: grid;
  grid-template-columns: 1fr 1fr;
}

// .container-config-item {
//
// }

.config-max-depth #ctrlMaxDepth {
  width: 70px;
}

.query-builder {
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
