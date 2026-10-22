import {
  ElementRemovalProvider,
  useElementRemoval,
} from "./context/ElementRemovalContext";

function BlockingContainer() {
  const { isRemoved } = useElementRemoval();

  return (
    <div
      inert={isRemoved ? true : undefined}
      aria-hidden={isRemoved || undefined}
    >
      <DeepChild />

      <button className="cursor-pointer" onClick={() => alert("vikas")}>
        Submit
      </button>
    </div>
  );
}

export default function Three() {
  return (
    <ElementRemovalProvider>
      <BlockingContainer />
    </ElementRemovalProvider>
  );
}

function DeepChild() {
  const { ref } = useElementRemoval();

  return (
    <div className="rounded-xl bg-gray-100 p-6">
      <div className="rounded-lg border border-gray-300 bg-white p-4">
        <div
          ref={ref}
          id="target-element"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 shadow-sm"
        >
          Target element remove it!
        </div>
      </div>
    </div>
  );
}
