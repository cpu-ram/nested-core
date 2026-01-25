// src/node_modules/immer/dist/immer.mjs
var NOTHING = /* @__PURE__ */ Symbol.for("immer-nothing");
var DRAFTABLE = /* @__PURE__ */ Symbol.for("immer-draftable");
var DRAFT_STATE = /* @__PURE__ */ Symbol.for("immer-state");
var errors = process.env.NODE_ENV !== "production" ? [
  // All error codes, starting by 0:
  function(plugin) {
    return `The plugin for '${plugin}' has not been loaded into Immer. To enable the plugin, import and call \`enable${plugin}()\` when initializing your application.`;
  },
  function(thing) {
    return `produce can only be called on things that are draftable: plain objects, arrays, Map, Set or classes that are marked with '[immerable]: true'. Got '${thing}'`;
  },
  "This object has been frozen and should not be mutated",
  function(data) {
    return "Cannot use a proxy that has been revoked. Did you pass an object from inside an immer function to an async process? " + data;
  },
  "An immer producer returned a new value *and* modified its draft. Either return a new value *or* modify the draft.",
  "Immer forbids circular references",
  "The first or second argument to `produce` must be a function",
  "The third argument to `produce` must be a function or undefined",
  "First argument to `createDraft` must be a plain object, an array, or an immerable object",
  "First argument to `finishDraft` must be a draft returned by `createDraft`",
  function(thing) {
    return `'current' expects a draft, got: ${thing}`;
  },
  "Object.defineProperty() cannot be used on an Immer draft",
  "Object.setPrototypeOf() cannot be used on an Immer draft",
  "Immer only supports deleting array indices",
  "Immer only supports setting array indices and the 'length' property",
  function(thing) {
    return `'original' expects a draft, got: ${thing}`;
  }
  // Note: if more errors are added, the errorOffset in Patches.ts should be increased
  // See Patches.ts for additional errors
] : [];
function die(error, ...args) {
  if (process.env.NODE_ENV !== "production") {
    const e = errors[error];
    const msg = typeof e === "function" ? e.apply(null, args) : e;
    throw new Error(`[Immer] ${msg}`);
  }
  throw new Error(
    `[Immer] minified error nr: ${error}. Full error at: https://bit.ly/3cXEKWf`
  );
}
var getPrototypeOf = Object.getPrototypeOf;
function isDraft(value) {
  return !!value && !!value[DRAFT_STATE];
}
function isDraftable(value) {
  if (!value)
    return false;
  return isPlainObject(value) || Array.isArray(value) || !!value[DRAFTABLE] || !!value.constructor?.[DRAFTABLE] || isMap(value) || isSet(value);
}
var objectCtorString = Object.prototype.constructor.toString();
var cachedCtorStrings = /* @__PURE__ */ new WeakMap();
function isPlainObject(value) {
  if (!value || typeof value !== "object")
    return false;
  const proto = Object.getPrototypeOf(value);
  if (proto === null || proto === Object.prototype)
    return true;
  const Ctor = Object.hasOwnProperty.call(proto, "constructor") && proto.constructor;
  if (Ctor === Object)
    return true;
  if (typeof Ctor !== "function")
    return false;
  let ctorString = cachedCtorStrings.get(Ctor);
  if (ctorString === void 0) {
    ctorString = Function.toString.call(Ctor);
    cachedCtorStrings.set(Ctor, ctorString);
  }
  return ctorString === objectCtorString;
}
function each(obj, iter, strict = true) {
  if (getArchtype(obj) === 0) {
    const keys = strict ? Reflect.ownKeys(obj) : Object.keys(obj);
    keys.forEach((key) => {
      iter(key, obj[key], obj);
    });
  } else {
    obj.forEach((entry, index) => iter(index, entry, obj));
  }
}
function getArchtype(thing) {
  const state = thing[DRAFT_STATE];
  return state ? state.type_ : Array.isArray(thing) ? 1 : isMap(thing) ? 2 : isSet(thing) ? 3 : 0;
}
function has(thing, prop) {
  return getArchtype(thing) === 2 ? thing.has(prop) : Object.prototype.hasOwnProperty.call(thing, prop);
}
function set(thing, propOrOldValue, value) {
  const t2 = getArchtype(thing);
  if (t2 === 2)
    thing.set(propOrOldValue, value);
  else if (t2 === 3) {
    thing.add(value);
  } else
    thing[propOrOldValue] = value;
}
function is(x, y) {
  if (x === y) {
    return x !== 0 || 1 / x === 1 / y;
  } else {
    return x !== x && y !== y;
  }
}
function isMap(target) {
  return target instanceof Map;
}
function isSet(target) {
  return target instanceof Set;
}
function latest(state) {
  return state.copy_ || state.base_;
}
function shallowCopy(base, strict) {
  if (isMap(base)) {
    return new Map(base);
  }
  if (isSet(base)) {
    return new Set(base);
  }
  if (Array.isArray(base))
    return Array.prototype.slice.call(base);
  const isPlain = isPlainObject(base);
  if (strict === true || strict === "class_only" && !isPlain) {
    const descriptors = Object.getOwnPropertyDescriptors(base);
    delete descriptors[DRAFT_STATE];
    let keys = Reflect.ownKeys(descriptors);
    for (let i2 = 0; i2 < keys.length; i2++) {
      const key = keys[i2];
      const desc = descriptors[key];
      if (desc.writable === false) {
        desc.writable = true;
        desc.configurable = true;
      }
      if (desc.get || desc.set)
        descriptors[key] = {
          configurable: true,
          writable: true,
          // could live with !!desc.set as well here...
          enumerable: desc.enumerable,
          value: base[key]
        };
    }
    return Object.create(getPrototypeOf(base), descriptors);
  } else {
    const proto = getPrototypeOf(base);
    if (proto !== null && isPlain) {
      return { ...base };
    }
    const obj = Object.create(proto);
    return Object.assign(obj, base);
  }
}
function freeze(obj, deep = false) {
  if (isFrozen(obj) || isDraft(obj) || !isDraftable(obj))
    return obj;
  if (getArchtype(obj) > 1) {
    Object.defineProperties(obj, {
      set: dontMutateMethodOverride,
      add: dontMutateMethodOverride,
      clear: dontMutateMethodOverride,
      delete: dontMutateMethodOverride
    });
  }
  Object.freeze(obj);
  if (deep)
    Object.values(obj).forEach((value) => freeze(value, true));
  return obj;
}
function dontMutateFrozenCollections() {
  die(2);
}
var dontMutateMethodOverride = {
  value: dontMutateFrozenCollections
};
function isFrozen(obj) {
  if (obj === null || typeof obj !== "object")
    return true;
  return Object.isFrozen(obj);
}
var plugins = {};
function getPlugin(pluginKey) {
  const plugin = plugins[pluginKey];
  if (!plugin) {
    die(0, pluginKey);
  }
  return plugin;
}
var currentScope;
function getCurrentScope() {
  return currentScope;
}
function createScope(parent_, immer_) {
  return {
    drafts_: [],
    parent_,
    immer_,
    // Whenever the modified draft contains a draft from another scope, we
    // need to prevent auto-freezing so the unowned draft can be finalized.
    canAutoFreeze_: true,
    unfinalizedDrafts_: 0
  };
}
function usePatchesInScope(scope, patchListener) {
  if (patchListener) {
    getPlugin("Patches");
    scope.patches_ = [];
    scope.inversePatches_ = [];
    scope.patchListener_ = patchListener;
  }
}
function revokeScope(scope) {
  leaveScope(scope);
  scope.drafts_.forEach(revokeDraft);
  scope.drafts_ = null;
}
function leaveScope(scope) {
  if (scope === currentScope) {
    currentScope = scope.parent_;
  }
}
function enterScope(immer2) {
  return currentScope = createScope(currentScope, immer2);
}
function revokeDraft(draft) {
  const state = draft[DRAFT_STATE];
  if (state.type_ === 0 || state.type_ === 1)
    state.revoke_();
  else
    state.revoked_ = true;
}
function processResult(result, scope) {
  scope.unfinalizedDrafts_ = scope.drafts_.length;
  const baseDraft = scope.drafts_[0];
  const isReplaced = result !== void 0 && result !== baseDraft;
  if (isReplaced) {
    if (baseDraft[DRAFT_STATE].modified_) {
      revokeScope(scope);
      die(4);
    }
    if (isDraftable(result)) {
      result = finalize(scope, result);
      if (!scope.parent_)
        maybeFreeze(scope, result);
    }
    if (scope.patches_) {
      getPlugin("Patches").generateReplacementPatches_(
        baseDraft[DRAFT_STATE].base_,
        result,
        scope.patches_,
        scope.inversePatches_
      );
    }
  } else {
    result = finalize(scope, baseDraft, []);
  }
  revokeScope(scope);
  if (scope.patches_) {
    scope.patchListener_(scope.patches_, scope.inversePatches_);
  }
  return result !== NOTHING ? result : void 0;
}
function finalize(rootScope, value, path) {
  if (isFrozen(value))
    return value;
  const useStrictIteration = rootScope.immer_.shouldUseStrictIteration();
  const state = value[DRAFT_STATE];
  if (!state) {
    each(
      value,
      (key, childValue) => finalizeProperty(rootScope, state, value, key, childValue, path),
      useStrictIteration
    );
    return value;
  }
  if (state.scope_ !== rootScope)
    return value;
  if (!state.modified_) {
    maybeFreeze(rootScope, state.base_, true);
    return state.base_;
  }
  if (!state.finalized_) {
    state.finalized_ = true;
    state.scope_.unfinalizedDrafts_--;
    const result = state.copy_;
    let resultEach = result;
    let isSet2 = false;
    if (state.type_ === 3) {
      resultEach = new Set(result);
      result.clear();
      isSet2 = true;
    }
    each(
      resultEach,
      (key, childValue) => finalizeProperty(
        rootScope,
        state,
        result,
        key,
        childValue,
        path,
        isSet2
      ),
      useStrictIteration
    );
    maybeFreeze(rootScope, result, false);
    if (path && rootScope.patches_) {
      getPlugin("Patches").generatePatches_(
        state,
        path,
        rootScope.patches_,
        rootScope.inversePatches_
      );
    }
  }
  return state.copy_;
}
function finalizeProperty(rootScope, parentState, targetObject, prop, childValue, rootPath, targetIsSet) {
  if (childValue == null) {
    return;
  }
  if (typeof childValue !== "object" && !targetIsSet) {
    return;
  }
  const childIsFrozen = isFrozen(childValue);
  if (childIsFrozen && !targetIsSet) {
    return;
  }
  if (process.env.NODE_ENV !== "production" && childValue === targetObject)
    die(5);
  if (isDraft(childValue)) {
    const path = rootPath && parentState && parentState.type_ !== 3 && // Set objects are atomic since they have no keys.
    !has(parentState.assigned_, prop) ? rootPath.concat(prop) : void 0;
    const res = finalize(rootScope, childValue, path);
    set(targetObject, prop, res);
    if (isDraft(res)) {
      rootScope.canAutoFreeze_ = false;
    } else
      return;
  } else if (targetIsSet) {
    targetObject.add(childValue);
  }
  if (isDraftable(childValue) && !childIsFrozen) {
    if (!rootScope.immer_.autoFreeze_ && rootScope.unfinalizedDrafts_ < 1) {
      return;
    }
    if (parentState && parentState.base_ && parentState.base_[prop] === childValue && childIsFrozen) {
      return;
    }
    finalize(rootScope, childValue);
    if ((!parentState || !parentState.scope_.parent_) && typeof prop !== "symbol" && (isMap(targetObject) ? targetObject.has(prop) : Object.prototype.propertyIsEnumerable.call(targetObject, prop)))
      maybeFreeze(rootScope, childValue);
  }
}
function maybeFreeze(scope, value, deep = false) {
  if (!scope.parent_ && scope.immer_.autoFreeze_ && scope.canAutoFreeze_) {
    freeze(value, deep);
  }
}
function createProxyProxy(base, parent) {
  const isArray = Array.isArray(base);
  const state = {
    type_: isArray ? 1 : 0,
    // Track which produce call this is associated with.
    scope_: parent ? parent.scope_ : getCurrentScope(),
    // True for both shallow and deep changes.
    modified_: false,
    // Used during finalization.
    finalized_: false,
    // Track which properties have been assigned (true) or deleted (false).
    assigned_: {},
    // The parent draft state.
    parent_: parent,
    // The base state.
    base_: base,
    // The base proxy.
    draft_: null,
    // set below
    // The base copy with any updated values.
    copy_: null,
    // Called by the `produce` function.
    revoke_: null,
    isManual_: false
  };
  let target = state;
  let traps = objectTraps;
  if (isArray) {
    target = [state];
    traps = arrayTraps;
  }
  const { revoke, proxy } = Proxy.revocable(target, traps);
  state.draft_ = proxy;
  state.revoke_ = revoke;
  return proxy;
}
var objectTraps = {
  get(state, prop) {
    if (prop === DRAFT_STATE)
      return state;
    const source = latest(state);
    if (!has(source, prop)) {
      return readPropFromProto(state, source, prop);
    }
    const value = source[prop];
    if (state.finalized_ || !isDraftable(value)) {
      return value;
    }
    if (value === peek(state.base_, prop)) {
      prepareCopy(state);
      return state.copy_[prop] = createProxy(value, state);
    }
    return value;
  },
  has(state, prop) {
    return prop in latest(state);
  },
  ownKeys(state) {
    return Reflect.ownKeys(latest(state));
  },
  set(state, prop, value) {
    const desc = getDescriptorFromProto(latest(state), prop);
    if (desc?.set) {
      desc.set.call(state.draft_, value);
      return true;
    }
    if (!state.modified_) {
      const current2 = peek(latest(state), prop);
      const currentState = current2?.[DRAFT_STATE];
      if (currentState && currentState.base_ === value) {
        state.copy_[prop] = value;
        state.assigned_[prop] = false;
        return true;
      }
      if (is(value, current2) && (value !== void 0 || has(state.base_, prop)))
        return true;
      prepareCopy(state);
      markChanged(state);
    }
    if (state.copy_[prop] === value && // special case: handle new props with value 'undefined'
    (value !== void 0 || prop in state.copy_) || // special case: NaN
    Number.isNaN(value) && Number.isNaN(state.copy_[prop]))
      return true;
    state.copy_[prop] = value;
    state.assigned_[prop] = true;
    return true;
  },
  deleteProperty(state, prop) {
    if (peek(state.base_, prop) !== void 0 || prop in state.base_) {
      state.assigned_[prop] = false;
      prepareCopy(state);
      markChanged(state);
    } else {
      delete state.assigned_[prop];
    }
    if (state.copy_) {
      delete state.copy_[prop];
    }
    return true;
  },
  // Note: We never coerce `desc.value` into an Immer draft, because we can't make
  // the same guarantee in ES5 mode.
  getOwnPropertyDescriptor(state, prop) {
    const owner = latest(state);
    const desc = Reflect.getOwnPropertyDescriptor(owner, prop);
    if (!desc)
      return desc;
    return {
      writable: true,
      configurable: state.type_ !== 1 || prop !== "length",
      enumerable: desc.enumerable,
      value: owner[prop]
    };
  },
  defineProperty() {
    die(11);
  },
  getPrototypeOf(state) {
    return getPrototypeOf(state.base_);
  },
  setPrototypeOf() {
    die(12);
  }
};
var arrayTraps = {};
each(objectTraps, (key, fn) => {
  arrayTraps[key] = function() {
    arguments[0] = arguments[0][0];
    return fn.apply(this, arguments);
  };
});
arrayTraps.deleteProperty = function(state, prop) {
  if (process.env.NODE_ENV !== "production" && isNaN(parseInt(prop)))
    die(13);
  return arrayTraps.set.call(this, state, prop, void 0);
};
arrayTraps.set = function(state, prop, value) {
  if (process.env.NODE_ENV !== "production" && prop !== "length" && isNaN(parseInt(prop)))
    die(14);
  return objectTraps.set.call(this, state[0], prop, value, state[0]);
};
function peek(draft, prop) {
  const state = draft[DRAFT_STATE];
  const source = state ? latest(state) : draft;
  return source[prop];
}
function readPropFromProto(state, source, prop) {
  const desc = getDescriptorFromProto(source, prop);
  return desc ? `value` in desc ? desc.value : (
    // This is a very special case, if the prop is a getter defined by the
    // prototype, we should invoke it with the draft as context!
    desc.get?.call(state.draft_)
  ) : void 0;
}
function getDescriptorFromProto(source, prop) {
  if (!(prop in source))
    return void 0;
  let proto = getPrototypeOf(source);
  while (proto) {
    const desc = Object.getOwnPropertyDescriptor(proto, prop);
    if (desc)
      return desc;
    proto = getPrototypeOf(proto);
  }
  return void 0;
}
function markChanged(state) {
  if (!state.modified_) {
    state.modified_ = true;
    if (state.parent_) {
      markChanged(state.parent_);
    }
  }
}
function prepareCopy(state) {
  if (!state.copy_) {
    state.copy_ = shallowCopy(
      state.base_,
      state.scope_.immer_.useStrictShallowCopy_
    );
  }
}
var Immer2 = class {
  constructor(config) {
    this.autoFreeze_ = true;
    this.useStrictShallowCopy_ = false;
    this.useStrictIteration_ = true;
    this.produce = (base, recipe, patchListener) => {
      if (typeof base === "function" && typeof recipe !== "function") {
        const defaultBase = recipe;
        recipe = base;
        const self = this;
        return function curriedProduce(base2 = defaultBase, ...args) {
          return self.produce(base2, (draft) => recipe.call(this, draft, ...args));
        };
      }
      if (typeof recipe !== "function")
        die(6);
      if (patchListener !== void 0 && typeof patchListener !== "function")
        die(7);
      let result;
      if (isDraftable(base)) {
        const scope = enterScope(this);
        const proxy = createProxy(base, void 0);
        let hasError = true;
        try {
          result = recipe(proxy);
          hasError = false;
        } finally {
          if (hasError)
            revokeScope(scope);
          else
            leaveScope(scope);
        }
        usePatchesInScope(scope, patchListener);
        return processResult(result, scope);
      } else if (!base || typeof base !== "object") {
        result = recipe(base);
        if (result === void 0)
          result = base;
        if (result === NOTHING)
          result = void 0;
        if (this.autoFreeze_)
          freeze(result, true);
        if (patchListener) {
          const p = [];
          const ip = [];
          getPlugin("Patches").generateReplacementPatches_(base, result, p, ip);
          patchListener(p, ip);
        }
        return result;
      } else
        die(1, base);
    };
    this.produceWithPatches = (base, recipe) => {
      if (typeof base === "function") {
        return (state, ...args) => this.produceWithPatches(state, (draft) => base(draft, ...args));
      }
      let patches, inversePatches;
      const result = this.produce(base, recipe, (p, ip) => {
        patches = p;
        inversePatches = ip;
      });
      return [result, patches, inversePatches];
    };
    if (typeof config?.autoFreeze === "boolean")
      this.setAutoFreeze(config.autoFreeze);
    if (typeof config?.useStrictShallowCopy === "boolean")
      this.setUseStrictShallowCopy(config.useStrictShallowCopy);
    if (typeof config?.useStrictIteration === "boolean")
      this.setUseStrictIteration(config.useStrictIteration);
  }
  createDraft(base) {
    if (!isDraftable(base))
      die(8);
    if (isDraft(base))
      base = current(base);
    const scope = enterScope(this);
    const proxy = createProxy(base, void 0);
    proxy[DRAFT_STATE].isManual_ = true;
    leaveScope(scope);
    return proxy;
  }
  finishDraft(draft, patchListener) {
    const state = draft && draft[DRAFT_STATE];
    if (!state || !state.isManual_)
      die(9);
    const { scope_: scope } = state;
    usePatchesInScope(scope, patchListener);
    return processResult(void 0, scope);
  }
  /**
   * Pass true to automatically freeze all copies created by Immer.
   *
   * By default, auto-freezing is enabled.
   */
  setAutoFreeze(value) {
    this.autoFreeze_ = value;
  }
  /**
   * Pass true to enable strict shallow copy.
   *
   * By default, immer does not copy the object descriptors such as getter, setter and non-enumrable properties.
   */
  setUseStrictShallowCopy(value) {
    this.useStrictShallowCopy_ = value;
  }
  /**
   * Pass false to use faster iteration that skips non-enumerable properties
   * but still handles symbols for compatibility.
   *
   * By default, strict iteration is enabled (includes all own properties).
   */
  setUseStrictIteration(value) {
    this.useStrictIteration_ = value;
  }
  shouldUseStrictIteration() {
    return this.useStrictIteration_;
  }
  applyPatches(base, patches) {
    let i2;
    for (i2 = patches.length - 1; i2 >= 0; i2--) {
      const patch = patches[i2];
      if (patch.path.length === 0 && patch.op === "replace") {
        base = patch.value;
        break;
      }
    }
    if (i2 > -1) {
      patches = patches.slice(i2 + 1);
    }
    const applyPatchesImpl = getPlugin("Patches").applyPatches_;
    if (isDraft(base)) {
      return applyPatchesImpl(base, patches);
    }
    return this.produce(
      base,
      (draft) => applyPatchesImpl(draft, patches)
    );
  }
};
function createProxy(value, parent) {
  const draft = isMap(value) ? getPlugin("MapSet").proxyMap_(value, parent) : isSet(value) ? getPlugin("MapSet").proxySet_(value, parent) : createProxyProxy(value, parent);
  const scope = parent ? parent.scope_ : getCurrentScope();
  scope.drafts_.push(draft);
  return draft;
}
function current(value) {
  if (!isDraft(value))
    die(10, value);
  return currentImpl(value);
}
function currentImpl(value) {
  if (!isDraftable(value) || isFrozen(value))
    return value;
  const state = value[DRAFT_STATE];
  let copy;
  let strict = true;
  if (state) {
    if (!state.modified_)
      return state.base_;
    state.finalized_ = true;
    copy = shallowCopy(value, state.scope_.immer_.useStrictShallowCopy_);
    strict = state.scope_.immer_.shouldUseStrictIteration();
  } else {
    copy = shallowCopy(value, true);
  }
  each(
    copy,
    (key, childValue) => {
      set(copy, key, currentImpl(childValue));
    },
    strict
  );
  if (state) {
    state.finalized_ = false;
  }
  return copy;
}
var immer = new Immer2();
var produce = immer.produce;

// src/utils/generateId.ts
function generateId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}
var generateId_default = generateId;

// src/node/BaseNode.ts
var _a;
_a = DRAFTABLE;
var BaseNode = class {
  constructor(args) {
    this[_a] = true;
    this.children = [];
    this.id = args.id ?? generateId_default();
    this.title = args.title;
    this.body = args.body ?? null;
    this.type = args.type ?? null;
  }
};

// src/node_modules/use-immer/dist/use-immer.module.mjs
import { useState as t, useCallback as o, useMemo as f, useReducer as u } from "react";
function i(f2) {
  var u2 = t(function() {
    return freeze("function" == typeof f2 ? f2() : f2, true);
  }), i2 = u2[1];
  return [u2[0], o(function(t2) {
    i2("function" == typeof t2 ? produce(t2) : freeze(t2));
  }, [])];
}

// src/tree/findNode.ts
function findNode({
  root,
  nodeId
}) {
  let result = null;
  if (root.id === nodeId) {
    result = root;
    return result;
  }
  for (const child of root.children ?? []) {
    const tempResult = findNode({ root: child, nodeId });
    if (tempResult) {
      result = tempResult;
      return result;
    }
  }
  return result;
}
function genericFindNode({
  root,
  searchCondition
}) {
  let result = null;
  if (searchCondition(root) === true) {
    result = root;
    return result;
  }
  for (const child of root.children ?? []) {
    const tempResult = genericFindNode({ root: child, searchCondition });
    if (tempResult) {
      result = tempResult;
      return result;
    }
  }
  return result;
}

// src/tree/reducers/treeDraftReducer.ts
function treeDraftReducer(draft, action) {
  switch (action.type) {
    case "ADD_CHILD_NODE":
      {
        if (!action.payload.parentId || !action.payload.childNode) {
          throw new Error("Invalid payload for ADD_CHILD_NODE action");
        }
        const payload = action.payload;
        const parentNode = findNode({
          root: draft,
          nodeId: payload.parentId
        });
        if (!parentNode) throw new Error("Search error: node not found.");
        if (!parentNode.children) {
          throw new Error(
            "Data integrity error: unexpected null children for the parent node"
          );
        }
        parentNode.children.push(payload.childNode);
        return true;
      }
      break;
    case "DELETE_NODE":
      {
        if (!action.payload.nodeId) {
          throw new Error("Invalid payload for DELETE_NODE action");
        }
        const { nodeId } = action.payload;
        const parentNode = genericFindNode({
          root: draft,
          searchCondition: (node) => node.children.some((child) => child.id === nodeId)
        });
        if (!parentNode) throw new Error("Search error: Element not found.");
        if (!parentNode.children) {
          throw new Error(
            "Data integrity error: unexpected null children for the parent node"
          );
        }
        parentNode.children = parentNode.children.filter(
          (x) => x.id !== nodeId
        );
        return true;
      }
      break;
    default:
      return false;
  }
}
var treeDraftReducer_default = treeDraftReducer;

// src/tree/dispatchDataTreeChange.ts
function dispatchDataTreeChange(updateFn, action, supplementalReducers) {
  updateFn((draft) => {
    let handled = false;
    for (const reducer of [treeDraftReducer_default, ...supplementalReducers || []]) {
      handled = reducer(draft, action);
      if (handled) {
        break;
      }
    }
    if (!handled) {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  });
}
function createTreeDispatcher(updateDataTree, supplementalReducers) {
  return (action) => dispatchDataTreeChange(updateDataTree, action, supplementalReducers);
}

// src/tree/useTreeState.ts
function useTreeState(options) {
  const [dataTree, updateDataTree] = i(options.initialData);
  const dispatch = createTreeDispatcher(
    updateDataTree,
    options.supplementalReducers
  );
  return {
    dataTree,
    dispatch,
    addChildNode: ({ parentId, childNode }) => {
      dispatch({
        type: "ADD_CHILD_NODE",
        payload: { parentId, childNode }
      });
    },
    deleteNode: ({ nodeId }) => {
      dispatch({
        type: "DELETE_NODE",
        payload: { nodeId }
      });
    }
  };
}

// src/ui/TreeUI.tsx
import { useState, useEffect, Fragment as Fragment2 } from "react";

// src/node_modules/clsx/dist/clsx.mjs
function r(e) {
  var t2, f2, n = "";
  if ("string" == typeof e || "number" == typeof e) n += e;
  else if ("object" == typeof e) if (Array.isArray(e)) {
    var o2 = e.length;
    for (t2 = 0; t2 < o2; t2++) e[t2] && (f2 = r(e[t2])) && (n && (n += " "), n += f2);
  } else for (f2 in e) e[f2] && (n && (n += " "), n += f2);
  return n;
}
function clsx() {
  for (var e, t2, f2 = 0, n = "", o2 = arguments.length; f2 < o2; f2++) (e = arguments[f2]) && (t2 = r(e)) && (n && (n += " "), n += t2);
  return n;
}
var clsx_default = clsx;

// src/ui/utilities/focusFirstDescendant.ts
function focusFirstDescendant({
  element,
  typeList
}) {
  const firstElement = element.querySelector(
    typeList.join(", ")
  );
  firstElement?.focus();
}
var focusFirstDescendant_default = focusFirstDescendant;

// src/ui/utilities/setTabFocus.ts
var focusableTypes = ["input", "button", "textarea", "a", "details"];
function setTabFocus({
  element,
  focus
}) {
  const focusableElementsArray = element.querySelectorAll(
    focusableTypes.join(", ")
  );
  focusableElementsArray.forEach((focusable) => {
    const prevTabIndex = focusable.getAttribute("data-prev-tabindex");
    const currentTabIndex = focusable.getAttribute("tabindex");
    if (focus) {
      if (prevTabIndex !== null) {
        focusable.setAttribute("tabindex", prevTabIndex);
        focusable.removeAttribute("data-prev-tabindex");
      } else {
        focusable.removeAttribute("tabindex");
      }
      focusFirstDescendant_default({ element, typeList: focusableTypes });
    } else if (!focus) {
      if (currentTabIndex !== null && !focusable.hasAttribute("data-prev-tabindex")) {
        focusable.setAttribute("data-prev-tabindex", currentTabIndex);
      }
      focusable.setAttribute("tabindex", "-1");
    }
  });
}
var setTabFocus_default = setTabFocus;

// src/ui/components/FilterCriterion.tsx
import { jsx, jsxs } from "react/jsx-runtime";
var FilterCriterion = (props) => /* @__PURE__ */ jsxs("label", { children: [
  /* @__PURE__ */ jsx(
    "input",
    {
      type: "checkbox",
      checked: props.value,
      name: props.name,
      onChange: props.handleToggle
    }
  ),
  props.label
] }, `filter-criterion-${props.name}`);
var FilterCriterion_default = FilterCriterion;

// src/ui/components/FilterMenu.tsx
import { Fragment, jsx as jsx2 } from "react/jsx-runtime";
function FilterMenu({
  filterCriteria,
  createToggleHandler
}) {
  return /* @__PURE__ */ jsx2(Fragment, { children: Object.entries(filterCriteria).map(([name, criterion]) => /* @__PURE__ */ jsx2(
    FilterCriterion_default,
    {
      name,
      label: criterion.label,
      value: criterion.value,
      handleToggle: createToggleHandler(name)
    },
    name
  )) });
}

// src/ui/TreeUI.tsx
import { Fragment as Fragment3, jsx as jsx3, jsxs as jsxs2 } from "react/jsx-runtime";
function TreeUI(props) {
  const {
    dataTree,
    renderCustomDataFields,
    renderTitle,
    isFilteredOut,
    actions,
    getNodeActionsList,
    headerActions,
    initialFilterCriteria,
    nodeSort
  } = props;
  const [filterCriteria, updateFilterCriteria] = i(
    initialFilterCriteria.reduce(
      (acc, curr) => ({
        ...acc,
        [curr.name]: { label: curr.label, value: curr.initialValue }
      }),
      {}
    )
  );
  const [popupContent, setPopupContent] = useState(null);
  const [lastActiveElement, setLastActiveElement] = useState(null);
  useEffect(() => {
    if (popupContent !== null) {
      const primary = document.getElementById("primary");
      const secondary = document.getElementById("secondary");
      if (primary && secondary) {
        setTabFocus_default({ element: primary, focus: false });
        setTabFocus_default({ element: secondary, focus: true });
      }
    }
    if (popupContent === null) {
      const primary = document.getElementById("primary");
      const secondary = document.getElementById("secondary");
      primary && setTabFocus_default({ element: primary, focus: true });
      secondary && setTabFocus_default({ element: secondary, focus: false });
      if (lastActiveElement) {
        lastActiveElement.focus();
        lastActiveElement.classList.remove("last-active-element");
      }
      setLastActiveElement(null);
    }
  }, [popupContent]);
  const mainClassNames = clsx_default(popupContent && "split-screen");
  function showPopup({ content }) {
    if (popupContent !== null) {
      throw new Error(
        "Error: Can not display new popup, popup content is already shown."
      );
    }
    let currentActiveElement = null;
    if (document.activeElement) {
      currentActiveElement = document.activeElement;
      currentActiveElement.classList.add("last-active-element");
    }
    if (currentActiveElement) setLastActiveElement(currentActiveElement);
    setPopupContent(content);
  }
  function hidePopup() {
    setPopupContent(null);
  }
  const createToggleHandler = (criterionName) => () => {
    updateFilterCriteria((x) => {
      const targetCriterion = x[criterionName];
      if (!targetCriterion) throw new Error(`Invalid filter criterion name: ${criterionName}`);
      targetCriterion.value = !targetCriterion.value;
    });
  };
  function renderNodeActions(node) {
    return getNodeActionsList(node).map((actionName) => {
      const targetAction = actions[actionName];
      if (!targetAction) throw new Error(`Invalid filter criterion name: ${actionName}`);
      const action = targetAction;
      return renderActionButton(action, node);
    });
  }
  function HeaderActions() {
    return headerActions.map((actionName) => {
      const targetAction = actions[actionName];
      if (!targetAction) throw new Error(`Invalid filter criterion name: ${actionName}`);
      const action = targetAction;
      return /* @__PURE__ */ jsx3(Fragment2, { children: renderActionButton(action) }, actionName);
    });
  }
  function renderActionButton(action, callerNode) {
    if (!action.ownRenderer) {
      return /* @__PURE__ */ jsx3(
        "button",
        {
          type: "button",
          onClick: () => runAction(action, {
            callerId: callerNode?.id
          }),
          children: action.label
        },
        action.label
      );
    }
    return action.ownRenderer();
  }
  function runAction(action, context) {
    if (action.type === "node") {
      if (!context.callerId) {
        throw new Error("Error: node action requires callerId in context.");
      }
      action.execute?.({ callerId: context.callerId });
      action.renderer && showPopup({
        content: action.renderer({ hidePopup, callerId: context.callerId })
      });
    } else if (action.type === "global") {
      action.execute?.();
      action.renderer && showPopup({
        content: action.renderer({ hidePopup })
      });
    } else {
      throw new Error("Error: unsupported action type.");
    }
  }
  function renderNode(node, filterCriteria2, nodeSort2) {
    if (isFilteredOut(node, filterCriteria2)) {
      return null;
    }
    return /* @__PURE__ */ jsxs2("details", { className: "content", children: [
      /* @__PURE__ */ jsx3("summary", { children: renderTitle(node) }),
      /* @__PURE__ */ jsxs2("div", { className: "details-body", children: [
        renderCustomDataFields(node),
        node.body && /* @__PURE__ */ jsx3("p", { children: node.body }),
        node.children?.length > 0 && [...node.children].sort(nodeSort2).map((child) => renderNode(child, filterCriteria2, nodeSort2)),
        /* @__PURE__ */ jsx3("span", { className: "node-actions", children: renderNodeActions(node) })
      ] })
    ] }, node.id);
  }
  return /* @__PURE__ */ jsxs2(Fragment3, { children: [
    /* @__PURE__ */ jsx3("header", { children: /* @__PURE__ */ jsx3("nav", { children: /* @__PURE__ */ jsx3(HeaderActions, {}) }) }),
    /* @__PURE__ */ jsxs2("main", { className: mainClassNames, children: [
      /* @__PURE__ */ jsxs2("section", { id: "primary", children: [
        /* @__PURE__ */ jsx3(
          FilterMenu,
          {
            filterCriteria,
            createToggleHandler
          }
        ),
        renderNode(dataTree, filterCriteria, nodeSort)
      ] }),
      /* @__PURE__ */ jsx3(
        "section",
        {
          role: "region",
          id: "secondary",
          onKeyDown: (e) => {
            if (e.key === "Escape" && popupContent !== null) {
              hidePopup();
            }
          },
          children: popupContent
        }
      )
    ] })
  ] });
}
var TreeUI_default = TreeUI;
export {
  BaseNode,
  TreeUI_default as TreeUI,
  findNode,
  genericFindNode,
  useTreeState
};
//# sourceMappingURL=index.js.map