import { ComponentPublicInstance } from 'vue';
import mitt, { Emitter } from 'mitt';
import {
  QueryBuilderGroupSym,
  RuleSet, QueryBuilderGroup, ComponentRegistration, MergeTrap as MergeTrapInterface, Rule,
} from './types';

function getNextGroup(group: QueryBuilderGroup): QueryBuilderGroup {
  if (group.depth < 1) {
    return group;
  }

  let vm: ComponentPublicInstance | null | undefined = group;

  do {
    vm = vm.$parent;
  } while ((vm as QueryBuilderGroup).type !== QueryBuilderGroupSym);

  return vm as QueryBuilderGroup;
}

function getCommonAncestor(
  nodeA: QueryBuilderGroup,
  nodeB: QueryBuilderGroup,
): QueryBuilderGroup {
  let a = nodeA;
  let b = nodeB;

  if (a.depth !== b.depth) {
    let lower: QueryBuilderGroup = a.depth > b.depth ? a : b;
    const higher: QueryBuilderGroup = a.depth < b.depth ? a : b;

    while (lower.depth !== higher.depth) {
      lower = getNextGroup(lower);
    }

    // Now both operate on the same level.
    a = lower;
    b = higher;
  }

  while (a !== b) {
    a = getNextGroup(a);
    b = getNextGroup(b);
  }

  return a;
}

function triggerUpdate(adder: ComponentRegistration, remover: ComponentRegistration): void {
  const commonAncestor = getCommonAncestor(adder.component, remover.component);

  if (![adder.component, remover.component].includes(commonAncestor)) {
    mergeViaParent(commonAncestor, adder, remover);

    return;
  }

  mergeViaNode(commonAncestor, adder, remover);
}

function mergeViaParent(
  commonAncestor: QueryBuilderGroup,
  adder: ComponentRegistration,
  remover: ComponentRegistration,
): void {
  let children: Array<RuleSet | Rule> | null = null;

  commonAncestor.trap = (position: number, newChild: RuleSet | Rule): void => {
    if (children === null) {
      children = [...commonAncestor.children];
      children.splice(position, 1, newChild);

      return;
    }

    commonAncestor.trap = null;

    children.splice(position, 1, newChild);

    commonAncestor.$emit(
      'query-update',
      {
        operatorIdentifier: commonAncestor.selectedOperator,
        children,
      } as RuleSet,
    );
  };

  adder.component.$emit('query-update', adder.ev);
  remover.component.$emit('query-update', remover.ev);
}

function mergeViaNode(
  parentEmitter: QueryBuilderGroup,
  adder: ComponentRegistration,
  remover: ComponentRegistration,
): void {
  const childEmitter = parentEmitter === adder.component ? remover : adder;
  const children = [...parentEmitter.children];

  parentEmitter.trap = (position: number, newChild: RuleSet | Rule): void => {
    parentEmitter.trap = null; // Release trap
    children.splice(position, 1, newChild); // First... accept the update from the child

    // Now we'd need to know if the update on the parent is an add or remove action.
    if (parentEmitter === adder.component) {
      // Parent emitter is adding and child is removing an item.
      //
      // First, use the event from the child to patch the current state (see above),
      // then use the state from the adder for inserting at the right idx.
      children.splice(adder.affectedIdx, 0, adder.ev.children[adder.affectedIdx]);
    } else {
      // Parent emitter is removing and child is adding an item.
      //
      // Use the event from the child to patch the current state (see above),
      // then use the state from the remover to remove the correct item.
      children.splice(remover.affectedIdx, 1);
    }

    parentEmitter.$emit(
      'query-update',
      {
        operatorIdentifier: parentEmitter.selectedOperator,
        children,
      } as RuleSet,
    );
  };

  childEmitter.component.$emit('query-update', childEmitter.ev);
}

export default class MergeTrap implements MergeTrapInterface {
  private eventBus: Emitter;

  constructor() {
    this.eventBus = mitt();

    Promise.all<ComponentRegistration>([
      new Promise(res => this.eventBus.on('adder-registered', res)),
      new Promise(res => this.eventBus.on('remover-registered', res)),
    ])
      .then((args: ComponentRegistration[]) => triggerUpdate(args[0], args[1]))
      .then(() => this.eventBus.all.clear());
  }

  public registerSortUpdate(update: ComponentRegistration): void {
    if (update.adding) {
      return this.registerAdder(update);
    }

    return this.registerRemover(update);
  }

  protected registerAdder(ev: ComponentRegistration): void {
    this.eventBus.emit('adder-registered', ev);
  }

  protected registerRemover(ev: ComponentRegistration): void {
    this.eventBus.emit('remover-registered', ev);
  }
}
