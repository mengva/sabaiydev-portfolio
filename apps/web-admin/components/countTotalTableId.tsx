function CountTotalTableIdComponent({
    filter,
    index
}: {
    filter: {
        page: number,
        limit: number
    };
    index: number
}) {
    return (filter.page > 1 ? ((filter.limit * (filter.page === 2 ? 1 : filter.page - 1)) + index + 1) : index + 1).toString().padStart(4, '0')
}

export default CountTotalTableIdComponent;
