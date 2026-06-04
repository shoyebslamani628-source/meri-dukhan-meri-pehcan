const PageState = ({ loading, error, empty, emptyText = "No records found." }) => {
  if (loading) {
    return (
      <div className="surface p-6 text-center text-sm font-semibold text-slate-500">
        Loading
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
        {error}
      </div>
    );
  }

  if (empty) {
    return (
      <div className="surface p-6 text-center text-sm font-semibold text-slate-500">
        {emptyText}
      </div>
    );
  }

  return null;
};

export default PageState;

