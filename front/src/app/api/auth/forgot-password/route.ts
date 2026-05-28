import { forgotPasswordSchema } from "@/features/auth/schemas/auth-form-schema";
import { isRecoveryRequestLimited } from "@/server/auth/recovery-rate-limit";
import { parseJsonBody } from "@/server/shared/api-route";
import { errorResponse, successResponse, withApiErrorBoundary } from "@/server/shared/error-response";

const FORGOT_PASSWORD_MESSAGE = "비밀번호 재설정 요청을 접수했습니다. 가입된 계정이 있으면 안내를 받을 수 있습니다.";

export const POST = withApiErrorBoundary(async (request: Request) => {
  const parsed = await parseJsonBody(request, forgotPasswordSchema, "입력한 정보를 다시 확인해 주세요.");

  if (!parsed.ok) {
    return parsed.response;
  }

  if (isRecoveryRequestLimited(request, parsed.data.email)) {
    return errorResponse(429, "요청이 많습니다. 잠시 후 다시 시도해 주세요.");
  }

  return successResponse(
    {
      requested: true
    },
    {
      message: FORGOT_PASSWORD_MESSAGE
    }
  );
});

export const dynamic = "force-dynamic";
