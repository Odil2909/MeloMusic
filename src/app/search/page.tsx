import { Suspense } from "react";
import { SearchContent } from "@/features/search/SearchContent";
import { SearchLoading } from "@/features/search/SearchLoading";

interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  return (
    <div className="page-content">
      <Suspense fallback={<SearchLoading />}>
        <SearchRouteContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function SearchRouteContent({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const queryValue = params.q;
  const query = Array.isArray(queryValue) ? queryValue[0] ?? "" : queryValue ?? "";

  return <SearchContent query={query} />;
}
