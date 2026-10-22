import ReusableComponent from "./components/ReusableComponent";
import { useBlockOnChildRemoval } from "./useBlockOnChildRemovalOptions";

export default function Two() {
  const { ref, isBlocking } = useBlockOnChildRemoval<HTMLDivElement>({
    onChildRemoved: (child) => {
      console.log("Child removed:", child);
    },
  });

  const handleSubmit = () => {
    alert("vikas 2");
  };

  return (
    <>
      <div className="space-y-6 p-6">
        <div
          ref={ref}
          inert={isBlocking ? true : undefined}
          aria-hidden={isBlocking || undefined}
          className={`space-y-3 rounded-xl border p-5 shadow-sm transition-opacity ${
            isBlocking
              ? "pointer-events-none opacity-50"
              : "border-gray-200 bg-white"
          }`}
        >
          <div id="child-1" className="rounded-lg bg-gray-50 p-3 text-gray-800">
            Child 1
          </div>

          <div id="child-2" className="rounded-lg bg-gray-50 p-3 text-gray-800">
            Child 2
          </div>

          <div id="child-3" className="rounded-lg bg-gray-50 p-3 text-gray-800">
            Child 3
          </div>

          <button
            type="button"
            className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Submit
          </button>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                document.querySelector("#child-2")?.remove();
              }}
              className="rounded-lg border border-red-300 bg-white px-4 py-2 font-medium text-red-600 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Remove Child 2
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Submit
            </button>
          </div>
        </div>
      </div>

      {/* <ReusableComponent
        title="My Reusable Component"
        isBlocking={isBlocking}
        handleClick={handleSubmit}
        ref={ref}
      >
        <CompA />
      </ReusableComponent> */}
    </>
  );
}

const CompA = () => {
  return (
    <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 5 }, (_, index) => (
        <div
          key={index}
          className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-gray-900">
            Child {index + 1}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            This is card number {index + 1}.
          </p>
        </div>
      ))}
    </div>
  );
};
