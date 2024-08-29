import { auth } from "@clerk/nextjs";

import { db } from "@/lib/db";
import { MAX_FREE_BOARDS } from "@/constants/boards";

const getOrgId = () => {
  const { orgId } = auth();
  if (!orgId) throw new Error("Unauthorized");
  return orgId;
};

const getOrCreateOrgLimit = async (orgId: string) => {
  let orgLimit = await db.orgLimit.findUnique({ where: { orgId } });
  if (!orgLimit) {
    orgLimit = await db.orgLimit.create({ data: { orgId, count: 0 } });
  }
  return orgLimit;
};

export const incrementAvailableCount = async () => {
  const orgId = getOrgId();
  const orgLimit = await getOrCreateOrgLimit(orgId);

  return db.orgLimit.update({
    where: { orgId },
    data: { count: orgLimit.count + 1 },
  });
};

export const decreaseAvailableCount = async () => {
  const orgId = getOrgId();
  const orgLimit = await getOrCreateOrgLimit(orgId);

  return db.orgLimit.update({
    where: { orgId },
    data: { count: Math.max(0, orgLimit.count - 1) },
  });
};

export const hasAvailableCount = async () => {
  const orgId = getOrgId();
  const orgLimit = await getOrCreateOrgLimit(orgId);

  return orgLimit.count < MAX_FREE_BOARDS;
};

export const getAvailableCount = async () => {
  try {
    const orgId = getOrgId();
    const orgLimit = await getOrCreateOrgLimit(orgId);
    return orgLimit.count;
  } catch (error) {
    console.error("Error getting available count:", error);
    return 0;
  }
};
