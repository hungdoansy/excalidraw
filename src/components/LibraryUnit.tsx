import clsx from "clsx";
import oc from "open-color";
import { useEffect, useRef, useState } from "react";
import { MIME_TYPES } from "../constants";
import { useIsMobile } from "../components/App";
import { exportToSvg } from "../scene/export";
import { BinaryFiles, LibraryItem } from "../types";
import "./LibraryUnit.scss";

// fa-plus
const PLUS_ICON = (
  <svg viewBox="0 0 1792 1792">
    <path
      fill="currentColor"
      d="M1600 736v192q0 40-28 68t-68 28h-416v416q0 40-28 68t-68 28h-192q-40 0-68-28t-28-68v-416h-416q-40 0-68-28t-28-68v-192q0-40 28-68t68-28h416v-416q0-40 28-68t68-28h192q40 0 68 28t28 68v416h416q40 0 68 28t28 68z"
    />
  </svg>
);

export const LibraryUnit = ({
  elements,
  files,
  pendingElements,
  onRemoveFromLibrary,
  onClick,
  index,
  activeIndex,
  onSelect,
}: {
  elements?: LibraryItem;
  files: BinaryFiles;
  pendingElements?: LibraryItem;
  onRemoveFromLibrary: () => void;
  onClick: () => void;
  index: number;
  activeIndex: number;
  onSelect: (index: number) => void;
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }

    (async () => {
      const elementsToRender = elements || pendingElements;
      if (!elementsToRender) {
        return;
      }
      const svg = await exportToSvg(
        elementsToRender,
        {
          exportBackground: false,
          viewBackgroundColor: oc.white,
        },
        files,
      );
      node.innerHTML = svg.outerHTML;
    })();

    return () => {
      node.innerHTML = "";
    };
  }, [elements, pendingElements, files]);

  const [isHovered, setIsHovered] = useState(false);
  const isMobile = useIsMobile();

  const adder = (isHovered || isMobile) && pendingElements && (
    <div className="library-unit__adder">{PLUS_ICON}</div>
  );

  return (
    <div
      className={clsx("library-unit", {
        "library-unit__active": elements || pendingElements,
        "library-unit--hover": elements && (isHovered || isMobile),
      })}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={clsx("library-unit__dragger", {
          "library-unit__pulse": !!pendingElements,
        })}
        ref={ref}
        draggable={!!elements}
        onClick={!!elements || !!pendingElements ? onClick : undefined}
        onDragStart={(event) => {
          setIsHovered(false);
          event.dataTransfer.setData(
            MIME_TYPES.excalidrawlib,
            JSON.stringify(elements),
          );
        }}
      />
      {adder}
      {elements && (isHovered || isMobile) && (
        <input
          type="checkbox"
          className="library-unit__actions"
          checked={index === activeIndex}
          onChange={() => {
            if (index === activeIndex) {
              onSelect(-1);
            } else {
              onSelect(index);
            }
          }}
        />
      )}
    </div>
  );
};
