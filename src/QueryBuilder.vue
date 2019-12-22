<script lang="ts">
import {
  Component, Vue, Prop, Provide, Watch,
} from 'vue-property-decorator';
import { isQueryBuilderConfig, isRuleSet } from '@/guards';
import { RuleSet, QueryBuilderConfig } from '@/types';
import QueryBuilderGroup from './QueryBuilderGroup.vue';

@Component({
  components: {
    QueryBuilderGroup,
  },
})
export default class QueryBuilder extends Vue {
  trapped: boolean = false

  trappedRuleSet: RuleSet | null = null

  @Prop({
    required: true,
    validator: query => query === null || isRuleSet(query),
  }) readonly value!: RuleSet | null

  @Prop({
    required: true,
    validator: param => isQueryBuilderConfig(param),
  }) readonly config!: QueryBuilderConfig

  // See getUpdateHook()
  @Provide() getNextUpdateTick = this.getUpdateHook

  @Watch('value')
  removeTrap() {
    // If for any reason the parent who actually owns the state updates the query, we'll remove
    // cleanup any existing traps.
    this.trapped = false;
    this.trappedRuleSet = null;
  }

  get ruleSet(): RuleSet {
    if (this.trappedRuleSet) {
      return this.trappedRuleSet;
    }

    if (this.value) {
      return this.value;
    }

    return {
      operatorIdentifier: this.config.operators[0].identifier,
      children: [],
    };
  }

  updateQuery(newQuery: RuleSet): void {
    if (this.trapped) {
      this.trappedRuleSet = newQuery;

      return;
    }

    this.trappedRuleSet = null;
    this.$emit('input', { ...newQuery });
  }

  // IF elements are move between groups, we must provide promise locks to avoid race conditions.
  //
  // The problem: when moving items between 2 groups, both affected groups fire update events
  // independently. Both updates don't have a consistent view of what's happening somewhere else in
  // query builder's tree, causing the later propagated event to override the state mutation from
  // first one. In particular, this bug can be observed when moving items within the same hierarchy,
  // instead of between siblings of groups.
  //
  // The solution is to provide promises for both child components who want to update in that
  // particular case. The promise will act as locks for coordinating the child components IF they
  // want to dispatch the `update-query` event.
  getUpdateHook(): Promise<void> {
    // First caller (usually, the one group who's about to remove an item), will receive an
    // immediate green light for firring his update event...
    if (!this.trapped) {
      this.trapped = true;

      return Promise.resolve();
    }

    // ...whereas the second caller (usually, the one who's about to receive the new item) will have
    // wait until the update event from the first caller has propagated to this component... than
    // we'll use the received state temporarily and let it flow down to all child components.
    // After all child components have been re-rendered, we'll resolve the second promise so the
    // entire tree below has a consistent view of the first update... and THEN the second caller
    // gets the permission for reporting is update.
    return new Promise((res, rej) => {
      const unwatch = this.$watch('trappedRuleSet', function releaseLock() {
        unwatch(); // Remove the watcher again!

        // Now we've received the update from the first caller...
        // Remove the trap, Wait for the next tick so the tree can update
        // properly... then release the lock.
        this.trapped = false;
        this.$nextTick().then(res);
      });
    });
  }
}
</script>

<template>
  <query-builder-group
    :config="config"
    :query="ruleSet"
    :depth="0"
    class="query-builder__root"
    @query-update="updateQuery"
  >
    <template
      v-for="(_, slotName) in $scopedSlots"
      v-slot:[slotName]="props"
    >
      <slot
        :name="slotName"
        v-bind="props"
      />
    </template>
  </query-builder-group>
</template>

<style lang="scss" scoped>
.query-builder__root {
  display: flex;
  flex-flow: column;
}
</style>
