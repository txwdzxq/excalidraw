import clsx from "clsx";
import { memo, useEffect, useRef, useState } from "react";
import { useDevice } from "./App";
import type { LibraryItem } from "../types";
import "./LibraryUnit.scss";
import { CheckboxItem } from "./CheckboxItem";
import { PlusIcon } from "./icons";
import { PngCache, useLibraryItemPng } from "../hooks/useLibraryItemPng";

export const LibraryUnit = memo(
  ({
    id,
    elements,
    isPending,
    onClick,
    selected,
    onToggle,
    onDrag,
    cache,
  }: {
    id: LibraryItem["id"] | /** for pending item */ null;
    elements?: LibraryItem["elements"];
    isPending?: boolean;
    onClick: (id: LibraryItem["id"] | null) => void;
    selected: boolean;
    onToggle: (id: string, event: React.MouseEvent) => void;
    onDrag: (id: string, event: React.DragEvent) => void;
    cache: PngCache;
  }) => {
    const ref = useRef<HTMLDivElement | null>(null);
    const cachedItem = useLibraryItemPng(id, elements, cache);

    useEffect(() => {
      const node = ref.current;

      if (!node) {
        return;
      }

      if (cachedItem) {
        node.style.backgroundImage = `url(${cachedItem.url})`;
      }

      return () => {
        node.innerHTML = "";
      };
    }, [cachedItem]);

    const [isHovered, setIsHovered] = useState(false);
    const isMobile = useDevice().editor.isMobile;
    const adder = isPending && (
      <div className="library-unit__adder">{PlusIcon}</div>
    );

    return (
      <div
        className={clsx("library-unit", {
          "library-unit__active": elements,
          "library-unit--hover": elements && isHovered,
          "library-unit--selected": selected,
          "library-unit--skeleton": !cachedItem,
        })}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className={clsx("library-unit__dragger", {
            "library-unit__pulse": !!isPending,
          })}
          ref={ref}
          draggable={!!elements}
          onClick={
            !!elements || !!isPending
              ? (event) => {
                  if (id && event.shiftKey) {
                    onToggle(id, event);
                  } else {
                    onClick(id);
                  }
                }
              : undefined
          }
          onDragStart={(event) => {
            if (!id) {
              event.preventDefault();
              return;
            }
            setIsHovered(false);
            onDrag(id, event);
          }}
        />
        {adder}
        {id && elements && (isHovered || isMobile || selected) && (
          <CheckboxItem
            checked={selected}
            onChange={(checked, event) => onToggle(id, event)}
            className="library-unit__checkbox"
          />
        )}
      </div>
    );
  },
);

export const EmptyLibraryUnit = () => (
  <div className="library-unit library-unit--skeleton" />
);
