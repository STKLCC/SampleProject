import { defineComponent, ref, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderList, ssrRenderAttr } from 'vue/server-renderer';
import { d as useAuth } from './server.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'unhead/plugins';
import 'vue-router';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "dashboard",
  __ssrInlineRender: true,
  setup(__props) {
    const { user } = useAuth();
    const platforms = ref([]);
    const loading = ref(true);
    const error = ref("");
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-white" }, _attrs))}><header class="border-b-2 border-black bg-white"><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div class="flex justify-between items-center h-16"><div class="flex items-center"><h1 class="text-2xl font-bold text-black">News Hub</h1></div><div class="flex items-center space-x-4"><span class="text-sm text-gray-600">Welcome, ${ssrInterpolate((_a = unref(user)) == null ? void 0 : _a.name)}</span><button class="btn-secondary text-sm"> Sign Out </button></div></div></div></header><main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><div class="mb-8"><h2 class="text-3xl font-bold text-black mb-2">Media Platforms</h2><p class="text-gray-600">Choose a news source to explore the latest stories</p></div>`);
      if (unref(loading)) {
        _push(`<div class="flex justify-center items-center py-12"><div class="text-lg text-gray-600">Loading platforms...</div></div>`);
      } else if (unref(error)) {
        _push(`<div class="text-center py-12"><div class="text-red-600 mb-4">${ssrInterpolate(unref(error))}</div><button class="btn-primary"> Try Again </button></div>`);
      } else {
        _push(`<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"><!--[-->`);
        ssrRenderList(unref(platforms), (platform) => {
          _push(`<div class="card cursor-pointer transform hover:scale-105 transition-transform duration-200"><div class="flex items-center space-x-4 mb-4"><img${ssrRenderAttr("src", platform.logo)}${ssrRenderAttr("alt", platform.name)} class="w-16 h-16 rounded-lg object-cover border-2 border-gray-200"><div><h3 class="text-xl font-bold text-black">${ssrInterpolate(platform.name)}</h3><span class="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">${ssrInterpolate(platform.category)}</span></div></div><p class="text-gray-600 mb-4">${ssrInterpolate(platform.description)}</p><div class="flex justify-end"><span class="text-sm font-medium text-black"> View News \u2192 </span></div></div>`);
        });
        _push(`<!--]--></div>`);
      }
      _push(`</main></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/dashboard.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=dashboard-CsKPBULk.mjs.map
