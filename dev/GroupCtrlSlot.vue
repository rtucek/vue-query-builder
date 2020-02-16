<script>
export default {
  props: [
    'groupCtrl',
  ],
  data() {
    return {
      randomId: new Date().getTime() * Math.random(),
      expanded: false,
    };
  },
  methods: {
    addRule(rule) {
      this.groupCtrl.addRule(rule);
      this.expanded = false;
    },
  },
};
</script>

<template>
  <div class="group-ctrl-slot container is-fluid">
    <div class="columns">
      <div class="column is-narrow">
        <div
          class="dropdown"
          :class="{ 'is-active': expanded }"
        >
          <div class="dropdown-trigger">
            <button
              class="button"
              aria-haspopup="true"
              :aria-controls="randomId"
              @click="expanded = !expanded"
            >
              <span>Add Rule</span>
              <span class="icon is-small">
                <i
                  class="fas fa-angle-down"
                  aria-hidden="true"
                />
              </span>
            </button>
          </div>
          <div
            class="dropdown-menu"
            :id="randomId"
            role="menu"
          >
            <div class="dropdown-content">
              <a
                v-for="rule in groupCtrl.rules"
                :key="rule.identifier"
                v-text="rule.name"
                @click="addRule(rule.identifier)"
                href="#"
                class="dropdown-item"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="column is-narrow">
        <button
          class="button"
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
