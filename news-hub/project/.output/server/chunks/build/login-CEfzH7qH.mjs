import { defineComponent, ref, watchEffect, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrInterpolate, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import { d as useAuth, u as useRouter, n as navigateTo } from './server.mjs';
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
  __name: "login",
  __ssrInlineRender: true,
  setup(__props) {
    const { isLoggedIn } = useAuth();
    useRouter();
    const credentials = ref({
      email: "",
      password: ""
    });
    const loading = ref(false);
    const error = ref("");
    watchEffect(() => {
      if (isLoggedIn.value) {
        navigateTo("/dashboard");
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen flex items-center justify-center bg-gray-50" }, _attrs))}><div class="max-w-md w-full space-y-8 p-8"><div class="text-center"><h2 class="text-4xl font-bold text-black mb-2">News Hub</h2><p class="text-gray-600">Sign in to access your news feed</p></div><form class="mt-8 space-y-6"><div class="space-y-4"><div><label for="email" class="block text-sm font-medium text-black mb-2"> Email Address </label><input id="email"${ssrRenderAttr("value", unref(credentials).email)} type="email" required class="input-field" placeholder="Enter your email"></div><div><label for="password" class="block text-sm font-medium text-black mb-2"> Password </label><input id="password"${ssrRenderAttr("value", unref(credentials).password)} type="password" required class="input-field" placeholder="Enter your password"></div></div>`);
      if (unref(error)) {
        _push(`<div class="text-red-600 text-sm text-center">${ssrInterpolate(unref(error))}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<button type="submit"${ssrIncludeBooleanAttr(unref(loading)) ? " disabled" : ""} class="btn-primary w-full">`);
      if (unref(loading)) {
        _push(`<span>Signing in...</span>`);
      } else {
        _push(`<span>Sign In</span>`);
      }
      _push(`</button></form><div class="text-center text-sm text-gray-600"><p>Demo credentials: any email and password will work</p></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/login.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=login-CEfzH7qH.mjs.map
