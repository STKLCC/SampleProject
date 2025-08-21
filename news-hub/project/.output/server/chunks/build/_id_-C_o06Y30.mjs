import { defineComponent, useSSRContext, ref, mergeProps, unref } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderList, ssrRenderAttr } from 'vue/server-renderer';
import { e as useRoute, d as useAuth } from './server.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
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
  __name: "[id]",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const { user } = useAuth();
    route.params.id;
    const platformName = route.query.name;
    const news = ref([]);
    const loading = ref(true);
    const error = ref("");
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    };
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-white" }, _attrs))} data-v-2f7428e5><header class="border-b-2 border-black bg-white" data-v-2f7428e5><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-v-2f7428e5><div class="flex justify-between items-center h-16" data-v-2f7428e5><div class="flex items-center space-x-4" data-v-2f7428e5><button class="text-black hover:text-gray-600" data-v-2f7428e5><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-2f7428e5><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" data-v-2f7428e5></path></svg></button><h1 class="text-2xl font-bold text-black" data-v-2f7428e5>${ssrInterpolate(unref(platformName) || "News")}</h1></div><div class="flex items-center space-x-4" data-v-2f7428e5><span class="text-sm text-gray-600" data-v-2f7428e5>Welcome, ${ssrInterpolate((_a = unref(user)) == null ? void 0 : _a.name)}</span><button class="btn-secondary text-sm" data-v-2f7428e5> Sign Out </button></div></div></div></header><main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-v-2f7428e5><div class="mb-8" data-v-2f7428e5><h2 class="text-3xl font-bold text-black mb-2" data-v-2f7428e5>Latest News</h2><p class="text-gray-600" data-v-2f7428e5>Stay updated with the latest stories from ${ssrInterpolate(unref(platformName))}</p></div>`);
      if (unref(loading)) {
        _push(`<div class="flex justify-center items-center py-12" data-v-2f7428e5><div class="text-lg text-gray-600" data-v-2f7428e5>Loading news...</div></div>`);
      } else if (unref(error)) {
        _push(`<div class="text-center py-12" data-v-2f7428e5><div class="text-red-600 mb-4" data-v-2f7428e5>${ssrInterpolate(unref(error))}</div><button class="btn-primary" data-v-2f7428e5> Try Again </button></div>`);
      } else {
        _push(`<div class="space-y-6" data-v-2f7428e5><!--[-->`);
        ssrRenderList(unref(news), (article) => {
          _push(`<article class="card flex flex-col md:flex-row gap-6" data-v-2f7428e5><div class="md:w-1/3" data-v-2f7428e5><img${ssrRenderAttr("src", article.image)}${ssrRenderAttr("alt", article.headline)} class="w-full h-48 md:h-full object-cover rounded-lg border-2 border-gray-200" data-v-2f7428e5></div><div class="md:w-2/3 flex flex-col justify-between" data-v-2f7428e5><div data-v-2f7428e5><h3 class="text-xl font-bold text-black mb-3 line-clamp-2" data-v-2f7428e5>${ssrInterpolate(article.headline)}</h3><p class="text-gray-600 mb-4 line-clamp-3" data-v-2f7428e5>${ssrInterpolate(article.summary)}</p><div class="flex items-center text-sm text-gray-500 mb-4" data-v-2f7428e5><span data-v-2f7428e5>By ${ssrInterpolate(article.author)}</span><span class="mx-2" data-v-2f7428e5>\u2022</span><span data-v-2f7428e5>${ssrInterpolate(formatDate(article.publishedAt))}</span></div></div><div class="flex justify-end" data-v-2f7428e5><a${ssrRenderAttr("href", article.originalUrl)} target="_blank" rel="noopener noreferrer" class="btn-primary inline-flex items-center space-x-2" data-v-2f7428e5><span data-v-2f7428e5>Read Full Article</span><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-2f7428e5><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" data-v-2f7428e5></path></svg></a></div></div></article>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/news/[id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _id_ = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-2f7428e5"]]);

export { _id_ as default };
//# sourceMappingURL=_id_-C_o06Y30.mjs.map
