import { f as defineNuxtRouteMiddleware, d as useAuth, n as navigateTo } from './server.mjs';
import 'vue';
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
import 'vue/server-renderer';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'unhead/plugins';
import 'vue-router';

const auth = defineNuxtRouteMiddleware((to, from) => {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn.value) {
    return navigateTo("/login");
  }
});

export { auth as default };
//# sourceMappingURL=auth-C5cHcktB.mjs.map
