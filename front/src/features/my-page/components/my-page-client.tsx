"use client";

import { MyPageForm } from "@/features/my-page/components/my-page-form";
import { useMyPageQuery } from "@/features/my-page/hooks/use-my-page-query";
import { QueryErrorState, QueryLoadingState } from "@/shared/components/query-state";

export function MyPageClient() {
  const myPageQuery = useMyPageQuery();

  if (myPageQuery.isLoading) {
    return <QueryLoadingState title="마이페이지 정보를 불러오고 있습니다." variant="form" />;
  }

  if (myPageQuery.isError || !myPageQuery.data) {
    return <QueryErrorState title="마이페이지 정보를 불러오지 못했습니다." />;
  }

  const { displayName, email } = myPageQuery.data;

  return (
    <>
      <MyPageForm displayName={displayName} email={email} />
    </>
  );
}
