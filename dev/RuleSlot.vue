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
  <div class="container-fluid">
    <div class="row">
      <div class="col-xs-12 col-sm-3 col-md-1">
        {{ ruleName }}
      </div>
      <div class="col-xs-12 col-sm-9 col-md-11">
        <component
          :is="ruleCtrl.ruleComponent"
          :value="ruleCtrl.ruleData"
          @input="ruleCtrl.updateRuleData"
        />
      </div>
    </div>
  </div>
</template>
