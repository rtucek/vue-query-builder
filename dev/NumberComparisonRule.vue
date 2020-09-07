<script>
export default {
  props: [
    'value',
  ],
  computed: {
    operators() {
      return [
        '=',
        '!=',
        '<',
        '<=',
        '<',
        '>=',
      ];
    },
    lft: {
      get() {
        return this.value.lft;
      },
      set(lft) {
        this.$emit('input', {
          ...this.value,
          lft,
        });
      },
    },
    rgt: {
      get() {
        return this.value.rgt;
      },
      set(rgt) {
        this.$emit('input', {
          ...this.value,
          rgt,
        });
      },
    },
    operator: {
      get() {
        return this.value.operator;
      },
      set(operator) {
        this.$emit('input', {
          ...this.value,
          operator,
        });
      },
    },
  },
};
</script>

<template>
  <div>
    <input type="number" v-model="lft">
    <select type="select" v-model="operator" class="ml8">
      <option
        v-for="(operator, idx) in operators"
        :value="operator"
        :key="idx"
      >
        {{ operator }}
      </option>
    </select>
    <input type="number" v-model="rgt" class="ml8">
  </div>
</template>

<style lang="scss" scoped>
.ml8 {
  margin-left: 8px;
}
</style>
