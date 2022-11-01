import { markRaw, Component as VueComponent } from 'vue';
import { shallowMount } from '@vue/test-utils';
import QueryBuilderChild from '@/QueryBuilderChild.vue';
import {
  QueryBuilderConfig, Rule, RuleDefinition, RuleSet,
} from '@/types';
import Component from '../components/Component.vue';

interface QueryBuilderChildInterface extends Vue {
  component: VueComponent,
  definition: RuleDefinition | null,
  ruleDefinition: RuleDefinition | null,
}

describe('Testing QueryBuilderChild', () => {
  const config: QueryBuilderConfig = {
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
        component: markRaw(Component),
        initialValue: '',
      },
      {
        identifier: 'num',
        name: 'Number Selection',
        component: markRaw(Component),
        initialValue: 10,
      },
    ],
    dragging: {
      animation: 300,
      disabled: false,
      ghostClass: 'ghost',
    },
  };

  it('tests if QueryBuilderChild handles rule query', () => {
    const query: Rule = {
      identifier: 'txt',
      value: 'A',
    };

    const child = shallowMount(QueryBuilderChild, {
      props: {
        config: { ...config },
        query: { ...query },
      },
    });

    expect((child.vm as QueryBuilderChildInterface).component.__name).toBe('QueryBuilderRule');
    expect((child.vm as QueryBuilderChildInterface).definition).not.toBeNull();
    expect((child.vm as QueryBuilderChildInterface).ruleDefinition).not.toBeNull();
  });

  it('tests if QueryBuilderChild handles group query', () => {
    const query: RuleSet = {
      operatorIdentifier: 'AND',
      children: [{
        identifier: 'txt',
        value: 'X',
      }],
    };

    const child = shallowMount(QueryBuilderChild, {
      props: {
        config: { ...config },
        query: { ...query },
      },
    });

    expect((child.vm as QueryBuilderChildInterface).component.__name).toBe('QueryBuilderGroup');
    expect((child.vm as QueryBuilderChildInterface).definition).toBeNull();
    expect((child.vm as QueryBuilderChildInterface).ruleDefinition).toBeNull();
  });
});
