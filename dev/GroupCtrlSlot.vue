<script>
export default {
  props: [
    'groupCtrl',
  ],
  data() {
    return {
      selectedRule: '',
      expanded: false,
    };
  },
  computed: {
    ruleName() {
      if (this.selectedRule === '') {
        return 'Select a Rule';
      }

      return this.groupCtrl.rules.find(r => r.identifier === this.selectedRule).name;
    },
  },
  methods: {
    setRule(rule) {
      this.expanded = false;
      this.selectedRule = rule;
    },
    addRule(rule) {
      if (!this.selectedRule) {
        return;
      }

      this.groupCtrl.addRule(this.selectedRule);
      this.selectedRule = '';
    },
  },
};
</script>

<template>
  <div class="container-fluid group-ctrl-slot">
    <div class="row">
      <div class="col-auto">
        <div
          class="btn-group"
          role="group"
          aria-label="Button group with nested dropdown"
        >
          <div
            class="btn-group"
            :class="{ show: expanded }"
            role="group"
          >
            <button
              id="btnGroupDrop1"
              type="button"
              class="btn btn-primary dropdown-toggle"
              data-toggle="dropdown"
              aria-haspopup="true"
              :aria-expanded="String(expanded)"
              @click="expanded = !expanded"
            >
              {{ ruleName }}
            </button>
            <div
              class="dropdown-menu"
              :class="{ show: expanded }"
              aria-labelledby="btnGroupDrop1"
            >
              <a
                @click="setRule('')"
                class="dropdown-item"
                href="#"
              >
                Select a Rule
              </a>
              <a
                v-for="rule in groupCtrl.rules"
                :key="rule.identifier"
                @click="setRule(rule.identifier)"
                class="dropdown-item"
                href="#"
              >
                {{ rule.name }}
              </a>
            </div>
          </div>
          <button
            type="button"
            class="btn btn-primary"
            :disabled="selectedRule === ''"
            @click="addRule"
          >
            Add Rule
          </button>
        </div>
      </div>
      <div class="col-auto">
        <button
          class="btn btn-primary"
          @click="groupCtrl.newGroup"
          v-text="'Add Group'"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.group-ctrl-slot {
  margin-top: 16px;
  margin-bottom: 16px;
}
</style>
