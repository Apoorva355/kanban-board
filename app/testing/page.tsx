"use client";
import { useState } from "react";
import Card from "../components/Card";
import Column from "../components/Column";
import {
	closestCenter,
	DndContext,
	DragEndEvent,
	DragOverlay,
	DragStartEvent,
	pointerWithin,
	useDroppable,
} from "@dnd-kit/core";
import {
	arrayMove,
	horizontalListSortingStrategy,
	SortableContext,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
export default function testingPage() {
	const [activeThing, setActiveThing] = useState({
		type: "card",
		title: "titleContent",
		id: -1,
		cards: [{ id: -1, title: "card A title", columnId: -1 }],
	});

	const [activeId, setActiveId] = useState("");
	// const [cards, setCards]  = useState([
	//     {id:1, title:'card A title', columnId:1},
	//     {id:2, title:'card B title', columnId:3},
	//     {id:3, title:'card C title', columnId:1},
	//     {id:4, title:'card C title', columnId:3},
	//     {id:5, title:'card C title', columnId:3},
	//     {id:6, title:'card C title', columnId:2},
	// ]);
	// const [columns, setColumns] = useState([
	//     {id: 1, title: "column 1 title"},
	//     {id: 2, title: "column 2 title"},
	//     {id: 3, title: "column 3 title"},
	// ]);
	const [columns, setColumns] = useState([
		{
			id: 1,
			title: "column 1 title",
			cards: [
				{ id: 1, title: "card A title", columnId: 1 },
				{ id: 3, title: "card C title", columnId: 1 },
			],
		},
		{
			id: 2,
			title: "column 2 title",
			cards: [{ id: 6, title: "card C title", columnId: 2 }],
		},
		{
			id: 3,
			title: "column 3 title",
			cards: [
				{ id: 2, title: "card B title", columnId: 3 },
				{ id: 4, title: "card C title", columnId: 3 },
				{ id: 5, title: "card C title", columnId: 3 },
			],
		},
		{
			id: 4,
			title: "column 4 title",
			cards: [],
		},
	]);

	const handleDragEnd = (event: DragEndEvent) => {
		setActiveId("");

		const { active, over } = event;
		if (!over || active.id === over.id) return;

		setColumns((columns) => {
			const newColumns = [...columns];
			//if active is a card
			if (active.id.toString().startsWith("card-")) {
				const activeMatches = active.id.toString().match(/card-(\d+)/);
				if (activeMatches === null) return columns;
				const activeCardId = activeMatches[1];

				//over matches
				const overMatches = over.id.toString().match(/card-(\d+)/);
				if (overMatches === null) return columns;
				const overCardId = overMatches[1];

				//if inside the same column
				const sameColumn = columns.find((column) =>
					column.cards.some((card) => card.id.toString() === activeCardId),
				);
				const oldIndex = sameColumn?.cards.findIndex(
					(card) => card.id.toString() === activeCardId,
				);
				const newIndex = sameColumn?.cards.findIndex(
					(card) => card.id.toString() === overCardId,
				);
				if (oldIndex !== undefined && newIndex !== undefined && sameColumn) {
					const sameColumnIndex = newColumns.findIndex(
						(c) => c.id === sameColumn.id,
					);
					const newCards = [...sameColumn.cards];
					const [movedCard] = newCards.splice(oldIndex, 1);
					newCards.splice(newIndex, 0, movedCard);
					const newColumn = {
						...sameColumn,
						cards: newCards,
					};
					newColumns[sameColumnIndex] = newColumn;
					return newColumns;
					console.log(sameColumn);
				}
			}
			if (active.id.toString().startsWith("column-")) {
				const activeMatches = active.id.toString().match(/column-(\d+)/);
				const overMatches = over.id.toString().match(/column-(\d+)/);

				if (activeMatches != undefined && overMatches != undefined) {
					const activeColumnId = activeMatches[1];
					const overColumnId = overMatches[1];
					const oldIndex = columns.findIndex(
						(c) => c.id.toString() === activeColumnId,
					);
					const newIndex = columns.findIndex(
						(c) => c.id.toString() === overColumnId,
					);
					const [movedColumn] = newColumns.splice(oldIndex, 1);
					newColumns.splice(newIndex, 0, movedColumn);
					console.log(newColumns);
					return newColumns;
				}
			}
			return columns;

			// //if active is a column
			// else if(active.id.toString().match(/column-\d+/)){

			// }
		});
	};

	const handleDragStart = (event: DragStartEvent) => {
		setActiveId(event.active.id.toString());
		if (event.active.id.toString().startsWith("column-")) {
			const activeColumnMatches = event.active.id
				.toString()
				.match(/column-(\d+)/);
			if (!activeColumnMatches) return;
			const activeColumnId = activeColumnMatches[1];
			const activeColumn = columns.find(
				(c) => c.id.toString() === activeColumnId,
			);
			if (!activeColumn) return;
			const activeColumnCards = activeColumn?.cards;
			setActiveThing({
				type: "column",
				title: activeColumn.title,
				id: parseInt(activeColumnId),
				cards: activeColumnCards,
			});
		} else {
			const activeCardMatches = event.active.id.toString().match(/card-(\d+)/);
			if (!activeCardMatches) return;
			const activeCardId = activeCardMatches[1];
			const activeCardParentColumn = columns.find((column) =>
				column.cards.find((c) => c.id.toString() === activeCardId),
			);
			if (!activeCardParentColumn) return;
			const activeCard = activeCardParentColumn.cards.find(
				(card) => card.id.toString() === activeCardId,
			);
			if (!activeCard) return;
			setActiveThing({
				type: "card",
				title: activeCard.title,
				id: activeCard.id,
				cards: [{ id: 1, title: "card A title", columnId: 1 }],
			});
		}
	};

	return (
		<div className="flex bg-white px-8 py-4 rounded-lg flex-row gap-10 align-center">
			<DndContext
				onDragStart={handleDragStart}
				onDragEnd={handleDragEnd}
				onDragCancel={() => setActiveId("")}
				collisionDetection={pointerWithin}
			>
				<SortableContext
					items={columns.map((column) => `column-${column.id}`)}
					strategy={horizontalListSortingStrategy}
				>
					{columns.map((column) => (
						<Column
							key={column.id}
							activeId={activeId}
							columnId={column.id}
							columnTitle={column.title}
						>
							<SortableContext
								items={column.cards.map((card) => `card-${card.id}`)}
								strategy={verticalListSortingStrategy}
							>
								{column.cards.length ? (
									column.cards.map((card) => (
										<Card
											activeId={activeId}
											key={card.id}
											cardId={card.id}
											columnId={column.id}
											title={card.title}
										/>
									))
								) : (
									<p className="px-4 text-sm text-zinc-300 italic">
										No cards in this column
									</p>
								)}
							</SortableContext>
						</Column>
					))}
				</SortableContext>

				<DragOverlay>
					{activeThing.type === "column" ? (
						<Column
							columnId={activeThing.id}
							activeId={""}
							columnTitle={activeThing.title}
						>
							{activeThing.cards.map((card) => (
								<Card
									activeId=""
									cardId={card.id}
									columnId={card.columnId}
									title={card.title}
								/>
							))}
						</Column>
					) : (
						<Card
							activeId=""
							cardId={activeThing.id}
							columnId={0}
							title={activeThing.title}
						/>
					)}
				</DragOverlay>
			</DndContext>
		</div>
	);
}
