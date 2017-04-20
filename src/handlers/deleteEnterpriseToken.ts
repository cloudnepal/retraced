import getApiToken from "../models/api_token/get";
import uniqueId from "../models/uniqueId";
import modelsDeleteEnterpriseToken from "../models/eitapi_token/delete";
import { apiTokenFromAuthHeader } from "../security/helpers";
import getPgPool from "../persistence/pg";

const pgPool = getPgPool();

export async function deleteEnterpriseToken(
    authorization: string,
    projectId: string,
    groupId: string,
    eitapiTokenId: string,
) {
    const apiTokenId = apiTokenFromAuthHeader(authorization);
    const apiToken: any = await getApiToken(apiTokenId, pgPool.query.bind(pgPool));
    const validAccess = apiToken && apiToken.project_id === projectId;

    if (!validAccess) {
        throw { status: 401, err: new Error("Unauthorized") };
    }

    const wasDeleted = await modelsDeleteEnterpriseToken({
        projectId,
        groupId,
        eitapiTokenId,
        environmentId: apiToken.environment_id,
    });

    if (!wasDeleted) {
        throw {
            status: 404,
            err: new Error(`Not Found`),
        };
    }

    return { status: 204 };
}
