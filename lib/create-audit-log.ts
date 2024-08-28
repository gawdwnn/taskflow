import { auth, currentUser } from "@clerk/nextjs";
import { ACTION, ENTITY_TYPE } from "@prisma/client";

import { db } from "@/lib/db";

interface Props {
  entityId: string;
  entityType: ENTITY_TYPE,
  entityTitle: string;
  action: ACTION;
};

export const createAuditLog = async (props: Props): Promise<void> => {
  const { orgId } = auth();
  const user = await currentUser();

  if (!user || !orgId) {
    throw new Error("User or organization not found");
  }

  const { entityId, entityType, entityTitle, action } = props;

  try {
    await db.auditLog.create({
      data: {
        orgId,
        entityId,
        entityType,
        entityTitle,
        action,
        userId: user.id,
        userImage: user.imageUrl ?? null,
        userName:
          `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
          "Unknown User",
      },
    });
  } catch (error) {
    console.error("[AUDIT_LOG_ERROR]", error);
    throw new Error("Failed to create audit log");
  }
};
