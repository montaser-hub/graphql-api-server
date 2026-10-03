import DataLoader from "dataloader";
import mongoose from "mongoose";
import { Company, User } from "../database/models.js";

/**
 * DataLoaders batch the per-user and per-company lookups made while resolving
 * one query into a single MongoDB query each (no N+1). They cache results, so
 * they are created per request: a shared instance would keep serving data that
 * a later mutation has changed.
 */
export function createLoaders() {
  // Keys are { id, fields }: `fields` is the projection the query asked for.
  // The batch loads the union of all requested fields; the cache is keyed by id.
  const companyLoader = new DataLoader(
    async (keys) => {
      const ids = keys.map((key) => String(key.id));
      const validIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));
      const projection = Object.assign({}, ...keys.map((key) => key.fields));
      const companies = await Company.find({ _id: { $in: validIds } }).select(projection);
      const byId = new Map(companies.map((company) => [String(company._id), company]));
      return ids.map((id) => byId.get(id) ?? null);
    },
    { cacheKeyFn: (key) => String(key.id) }
  );

  const usersByCompanyLoader = new DataLoader(async (companyIds) => {
    const ids = companyIds.map(String);
    const users = await User.find({ companyId: { $in: ids } });
    return ids.map((id) => users.filter((user) => user.companyId === id));
  });

  return { companyLoader, usersByCompanyLoader };
}
