import { FilterDto } from "@/admin/packages/types/constants";

function TableIdComponent({
    filter,
    index
}: {
    filter: FilterDto;
    index: number;
}) {
    const number = (filter.page - 1) * filter.limit + index + 1;
    return number.toString().padStart(4, '0');
}

export default TableIdComponent;
