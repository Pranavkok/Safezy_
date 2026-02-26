export const EmptyState = ({
  searchQuery,
  contentType
}: {
  searchQuery: string;
  contentType: string;
}) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
    <div className="text-center">
      <h3 className="text-xl font-bold text-gray-700 mb-3">
        {searchQuery ? 'No Topics Found' : `No ${contentType} Available`}
      </h3>
      <p className="text-gray-600 max-w-md text-center">
        {searchQuery
          ? 'Sorry, we couldnot find any topics matching your search criteria. Try adjusting your search term.'
          : 'There are currently no checklist topics to display.'}
      </p>
    </div>
  </div>
);
