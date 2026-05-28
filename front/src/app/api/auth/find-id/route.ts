import { findIdSchema } from "@/features/auth/schemas/auth-form-schema";
import { isRecoveryRequestLimited } from "@/server/auth/recovery-rate-limit";
import { parseJsonBody } from "@/server/shared/api-route";
import { errorResponse, successResponse, withApiErrorBoundary } from "@/server/shared/error-response";

const FIND_ID_MESSAGE = "확인 요청을 접수했습니다. 보안을 위해 화면에서 가입 여부를 바로 표시하지 않습니다.";

export const POST = withApiErrorBoundary(async (request: Request) => {
  const parsed = await parseJsonBody(request, findIdSchema, "입력한 정보를 다시 확인해 주세요.");

  if (!parsed.ok) {
    return parsed.response;
  }

  const identity = `${parsed.data.name}:${parsed.data.storeName}`;

  if (isRecoveryRequestLimited(request, identity)) {
    return errorResponse(429, "요청이 많습니다. 잠시 후 다시 시도해 주세요.");
  }

  return successResponse(
    {
      requested: true
    },
    {
      message: FIND_ID_MESSAGE
    }
  );
});

export const dynamic = "force-dynamic";
