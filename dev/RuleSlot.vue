<script>
export default {
  props: [
    'rules',
    'ruleCtrl',
  ],
  computed: {
    ruleName() {
      return this.rules
        .find(r => r.component === this.ruleCtrl.ruleComponent)
        .name;
    },
  },
};
</script>

<template>
  <div class="container is-fluid">
    <div class="columns">
      <div class="column is-1 is-12-mobile">
        {{ ruleName }}
      </div>
      <div class="column is-12-mobile">
        <component
          :is="ruleCtrl.ruleComponent"
          :value="ruleCtrl.ruleData"
          @input="ruleCtrl.updateRuleData"
        />
      </div>
    </div>
  </div>
</template>
