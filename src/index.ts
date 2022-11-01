import PrivateQueryBuilder from '@/QueryBuilder.vue';

export const QueryBuilder = PrivateQueryBuilder;

export function install(app) {
  app.component('QueryBuilder', QueryBuilder);
}
