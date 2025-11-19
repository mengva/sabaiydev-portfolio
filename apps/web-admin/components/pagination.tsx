import { FilterDto, PaginationFilterDto } from "@/admin/packages/types/constants";
import GlobalHelper from "@/admin/packages/utils/GlobalHelper";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@workspace/ui/components/pagination"

interface PaginationDto {
    data: unknown[];
    filter: FilterDto;
    pagination: PaginationFilterDto;
    handleFetchData: () => void;
    setFilter: React.Dispatch<React.SetStateAction<FilterDto>>;
}

export function PaginationComponent({ data, filter, setFilter, pagination, handleFetchData }: PaginationDto) {
    return (
        <>
            {
                data.length > 0 &&
                <div className="grid lg:grid-cols-2 gap-4 mt-4 w-full">
                    <div className="text-sm text-nowrap my-auto max-lg:text-center">
                        Page {filter.page} Of {pagination.totalPage} Page Total {pagination.total} Item
                    </div>
                    <Pagination className="flex lg:justify-end justify-center">
                        <PaginationContent>
                            {/* Previous */}
                            <PaginationItem
                                aria-disabled={filter.page === 1}
                                onClick={() => {
                                    setFilter((prev) => {
                                        const page = prev.page > 1 ? prev.page - 1 : 1;
                                        if (filter.page > 1)
                                            handleFetchData();
                                        return { ...prev, page };
                                    })
                                }}
                                className={`${filter.page === 1 ? 'cursor-default' : 'cursor-pointer'}`}
                            >
                                <PaginationPrevious />
                            </PaginationItem>

                            {/* Pages with ellipsis */}
                            {
                                GlobalHelper.getPaginationRange(filter.page, pagination.totalPage).map((p, idx) => {
                                    return <div key={idx}>
                                        {
                                            p === "..." ? (
                                                <PaginationItem className="cursor-pointer">
                                                    <PaginationEllipsis />
                                                </PaginationItem>
                                            ) : (
                                                <PaginationItem className="cursor-pointer">
                                                    <PaginationLink
                                                        isActive={filter.page === p}
                                                        onClick={() => {
                                                            setFilter((prev) => ({ ...prev, page: p as number }));
                                                            handleFetchData();
                                                        }}
                                                    >
                                                        {p}
                                                    </PaginationLink>
                                                </PaginationItem>
                                            )
                                        }
                                    </div>
                                })}

                            {/* Next */}
                            <PaginationItem
                                aria-disabled={filter.page === pagination.totalPage}
                                onClick={() => {
                                    setFilter((prev) => {
                                        const page = prev.page < pagination.totalPage
                                            ? prev.page + 1
                                            : pagination.totalPage;
                                        if (filter.page < pagination.totalPage)
                                            handleFetchData();
                                        return { ...prev, page };
                                    })
                                }}
                                className={`${filter.page === pagination.totalPage ? 'cursor-default' : 'cursor-pointer'}`}
                            >
                                <PaginationNext />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            }
        </>
    )
}

