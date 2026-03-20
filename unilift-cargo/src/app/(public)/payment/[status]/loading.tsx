export default function PaymentStatusLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full animate-pulse">
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div className="flex justify-center">
            <div className="h-16 w-16 bg-gray-200 rounded-full" />
          </div>

          <div className="mt-4 h-8 bg-gray-200 rounded w-3/4 mx-auto" />
          <div className="mt-2 h-4 bg-gray-200 rounded w-1/2 mx-auto" />

          <div className="mt-6 space-y-4">
            <div className="h-12 bg-gray-200 rounded" />
            <div className="h-12 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
