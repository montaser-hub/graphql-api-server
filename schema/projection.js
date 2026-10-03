import { fieldsList } from "graphql-fields-list";

/**
 * Turns the fields a query selects into a MongoDB projection, so only those
 * fields are read. `company` is resolved from the stored `companyId`.
 */
export function projectionFor(info) {
  const projection = {};
  for (const field of fieldsList(info)) {
    if (field === "id") continue; // _id is always returned
    projection[field === "company" ? "companyId" : field] = 1;
  }
  return projection;
}
