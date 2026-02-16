"use client";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function Card({
	cardId,
	columnId,
	title,
	activeId,
}: {
	cardId: number;
	columnId: number;
	title: string;
	activeId: string;
}) {
	const { setNodeRef, attributes, listeners, transform } = useSortable({
		id: `card-${cardId}`,
		data: {
			type: "card",
			columnId: columnId,
		},
	});
	let isDragging = false;
	if (!!activeId) {
		const matches = activeId.match(/card-(\d+)/);
		if (matches != null) {
			isDragging = parseInt(matches[1]) == cardId;
		}
	}
	const styles = {
		transform: CSS.Translate.toString(transform),
		backgroundColor: isDragging ? "lightgray" : "white",
		borderWidth: isDragging ? "3px" : "0",
		borderColor: isDragging ? "gray" : "transparent",
		borderStyle: isDragging ? "dashed" : "solid",
	};
	return (
		<div
			ref={setNodeRef}
			style={styles}
			{...attributes}
			{...listeners}
			className={`bg-white flex flex-col min-h-[60] rounded-lg m-2 cursor-grab hover:shadow-lg hover:shadow-gray-200 transition-shadow duration-400`}
		>
			{!isDragging ? (
				<div className="p-2">Card: {title}</div>
			) : (
				<div className="p-2 opacity-0">...</div>
			)}
			{!isDragging ? (
				<div className="p-3 bg-yellow-50/10 italic font-sm text-gray-400">
					card content
				</div>
			) : (
				<div className="p-2 opacity-0">...</div>
			)}
		</div>
	);
}
