import { useElementRemoval } from "./useElementRemoval";

export default function One() {
  const { ref, isRemoved } = useElementRemoval<HTMLDivElement>({
    onRemoved: (element) => {
      console.log("Removed:", element);
    },
    onRestored: (element) => {
      console.log("Restored:", element);
    },
  });

  const handleClick = () => {
    alert("vikas");
  };

  return (
    <div
      inert={isRemoved ? true : undefined}
      aria-hidden={isRemoved || undefined}
    >
      <div ref={ref}>Target element</div>

      <button type="button" onClick={handleClick}>
        Submit
      </button>
    </div>
  );
}
