<script>
export default {
  props: [
    'value',
  ],
  computed: {
    fields() {
      return [
        'email',
        'username',
        'first_name',
        'last_name',
      ];
    },
    operators() {
      return [
        'equals',
        'starts_with',
        'ends_with',
        'contains',
      ];
    },
    userField: {
      get() {
        return this.value.field;
      },
      set(field) {
        this.$emit('input', {
          ...this.value,
          field,
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
    userAttribute: {
      get() {
        return this.value.value;
      },
      set(userAttribute) {
        this.$emit('input', {
          ...this.value,
          value: userAttribute,
        });
      },
    },
  },
};
</script>

<template>
  <div>
    <select type="select" v-model="userField">
      <option
        v-for="(field, idx) in fields"
        :value="field"
        :key="idx"
      >
        {{ field }}
      </option>
    </select>
    <select type="select" v-model="operator" class="ml8">
      <option
        v-for="(operator, idx) in operators"
        :value="operator"
        :key="idx"
      >
        {{ operator }}
      </option>
    </select>
    <input type="text" v-model="userAttribute" class="ml8">
  </div>
</template>

<style lang="scss" scoped>
.ml8 {
  margin-left: 8px;
}
</style>
