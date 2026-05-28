import { successResponse } from "@/server/shared/error-response";

export function GET() {
  return successResponse(
    {
      service: "sellerroom-front",
      timestamp: new Date().toISOString()
    },
    {
      message: "서비스가 정상입니다."
    }
  );
}
