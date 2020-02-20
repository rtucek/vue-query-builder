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
  <div class="block w-full">
    <div class="w-full">
        {{ ruleName }}
    </div>
    <div class="w-full mt-4">
      <component
        :is="ruleCtrl.ruleComponent"
        :value="ruleCtrl.ruleData"
        @input="ruleCtrl.updateRuleData"
      />
    </div>
  </div>
</template>
