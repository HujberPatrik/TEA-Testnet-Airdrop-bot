import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import AdminPage from "../views/AdminPage.vue";
import Login from "../views/Login.vue";
import Event from "../views/event.vue";
import Test from "../views/test.vue";
import Archived from "../views/Archived.vue";
import PriceListPage from '../views/Prices.vue';
import NeptunRoleAssign from '../views/NeptunRoleAssign.vue';
 
const router = createRouter({
   history: createWebHistory(import.meta.env.BASE_URL),
   routes: [
     {
       path: "/",
       name: "home",
       component: HomeView,
     },
     {
       path: "/admin",
       name: "admin",
       component: AdminPage,
     },
     {
       path: "/login",
       name: "login",
       component: Login,
     },
     {
       path: "/event",
       name: "event",
       component: Event,
     },
     {
       path: "/test",
       name: "test",
       component: Test,
     },
     {
       path: "/admin/archived",
       name: "ArchivedEvents",
       component: Archived,
       meta: {
         requiresAuth: true,
       },
     },
     {
       path: '/price-list',
       name: 'PriceList',
       component: PriceListPage,
       meta: { requiresAuth: true }  // Ha csak bejelentkezett felhasználóknak szeretnéd mutatni
     },
     {
      path: '/admin/users',
      name: 'NeptunRoleAssign',
      component: NeptunRoleAssign
    },
    {
      path: '/profile',
      name: 'ProfileEdit',
      component: () => import('@/views/ProfileEdit.vue')
    },
   ],
 });
 
 router.beforeEach((to, from, next) => {
  const user = router.app?.$store?.state?.auth?.user
    || JSON.parse(localStorage.getItem('user') || 'null')
    || {};
  const role = String(user?.role || user?.szerepkor || user?.szerep || '').toUpperCase();
  const isUf = ['UNI-FAMULUS','UNI_FAMULUS','UNIFAMULUS','UF'].includes(role);

  // Ezeket a route NEVEKET igazítsd a projektedhez
  const adminOnly = ['ArchivedEvents', 'PriceList', 'NeptunRoleAssign'];

  if (isUf && adminOnly.includes(to.name)) return next({ name: 'Kezdolap' });
  next();
});

 export default router;
