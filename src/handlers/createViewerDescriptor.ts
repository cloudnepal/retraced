import getApiToken from "../models/api_token/get";
import { apiTokenFromAuthHeader } from "../security/helpers";
import createViewerDescriptor from "../models/viewer_descriptor/create";

export default async function handler(req) {
  const apiTokenId = apiTokenFromAuthHeader(req.get("Authorization"));
  const apiToken: any = await getApiToken(apiTokenId);
  const validAccess = apiToken && apiToken.project_id === req.params.projectId;
  if (!validAccess) {
    throw { status: 401, err: new Error("Unauthorized") };
  }

  const newDesc = await createViewerDescriptor({
    projectId: req.params.projectId,
    environmentId: apiToken.environment_id,
    groupId: req.query.group_id || req.query.team_id,
    isAdmin: req.query.is_admin === "true",
    targetId: req.query.target_id || null,
  });

  return {
    status: 201,
    body: JSON.stringify({ token: newDesc.id }),
  };
}