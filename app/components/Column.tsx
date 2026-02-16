"use client";
import { DndContext, useDroppable } from "@dnd-kit/core";
import {
	SortableContext,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function Column({
	children,
	columnId,
	activeId,
	columnTitle,
}: {
	children: React.ReactNode;
	columnId: number;
	columnTitle: string;
	activeId: string;
}) {
	let isDragging = false;
	if (!!activeId) {
		const matches = activeId.match(/column-(\d+)/);
		if (matches != null) {
			isDragging = parseInt(matches[1]) == columnId;
		}
	}

	const {
		setNodeRef: setSortableRef,
		attributes,
		listeners,
		transform,
	} = useSortable({
		id: `column-${columnId}`,
	});
	const { setNodeRef: setDroppableRef } = useDroppable({
		id: `column-${columnId}`,
	});
	const styles = {
		transform: CSS.Translate.toString(transform),
		backgroundColor: isDragging ? "lightgray" : "#f4f6f8",
		borderWidth: isDragging ? "3px" : "0",
		borderColor: isDragging ? "gray" : "transparent",
		borderStyle: isDragging ? "dashed" : "solid",
	};
	return (
		<div
			ref={(node) => {
				setSortableRef(node);
				setDroppableRef(node);
			}}
			style={styles}
			{...attributes}
			{...listeners}
			className="rounded-lg cursor-grab min-w-xs min-h-full flex flex-col gap-2"
		>
			{!isDragging && <div className="px-4 py-2 font-bold">{columnTitle}</div>}
			{!isDragging && children}
		</div>
	);
}
