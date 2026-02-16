"use client";
import { useState } from "react";
import Card from "../components/Card";
import Column from "../components/Column";
import {
	closestCenter,
	DndContext,
	DragEndEvent,
	DragOverEvent,
	DragOverlay,
	DragStartEvent,
	pointerWithin,
	useDroppable,
} from "@dnd-kit/core";
import {
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
	const [overColumnId, setOverColumnId] = useState("");
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
		setOverColumnId("");

		const { active, over } = event;
		if (!over || active.id === over.id) return;

		setColumns((columns) => {
			const newColumns = [...columns];

			//if active is a card
			if (active.id.toString().startsWith("card-")) {
				const activeMatches = active.id.toString().match(/card-(\d+)/);
				if (activeMatches === null) return columns;
				const activeCardId = activeMatches[1];

				// over could be a card (reorder) or a column (move to end)
				const overCardMatches = over.id.toString().match(/card-(\d+)/);
				const overColumnMatches = over.id.toString().match(/column-(\d+)/);

				// if over is another card — possibly reorder within same column
				if (overCardMatches !== null) {
					const overCardId = parseInt(overCardMatches[1], 10);
					const activeCardIdNum = parseInt(activeCardId, 10);

					const sourceIndex = newColumns.findIndex((c) =>
						c.cards.some((card) => card.id === activeCardIdNum),
					);
					const targetIndex = newColumns.findIndex((c) =>
						c.cards.some((card) => card.id === overCardId),
					);

					if (sourceIndex === -1 || targetIndex === -1) return columns;

					// if same column -> reorder to position of over card
					if (sourceIndex === targetIndex) {
						const sameColumn = columns[sourceIndex];
						const oldIndex = sameColumn.cards.findIndex(
							(card) => card.id === activeCardIdNum,
						);
						const newIndex = sameColumn.cards.findIndex(
							(card) => card.id === overCardId,
						);
						if (oldIndex !== -1 && newIndex !== -1) {
							const newCards = [...sameColumn.cards];
							const [movedCard] = newCards.splice(oldIndex, 1);
							newCards.splice(newIndex, 0, movedCard);
							newColumns[sourceIndex] = { ...sameColumn, cards: newCards };
							return newColumns;
						}
					}

					// different columns -> remove from source and append to target
					if (sourceIndex !== targetIndex) {
						const sourceCards = [...newColumns[sourceIndex].cards];
						const movedCardIndex = sourceCards.findIndex(
							(card) => card.id === activeCardIdNum,
						);
						if (movedCardIndex === -1) return columns;
						const [movedCard] = sourceCards.splice(movedCardIndex, 1);
						newColumns[sourceIndex] = {
							...newColumns[sourceIndex],
							cards: sourceCards,
						};
						const targetCards = [
							...newColumns[targetIndex].cards,
							{ ...movedCard, columnId: newColumns[targetIndex].id },
						];
						newColumns[targetIndex] = {
							...newColumns[targetIndex],
							cards: targetCards,
						};
						return newColumns;
					}
				}

				// if over is a column — remove from source and append to target
				if (overColumnMatches !== null) {
					const overColumnId = parseInt(overColumnMatches[1], 10);
					const activeCardIdNum = parseInt(activeCardId, 10);

					const sourceIndex = newColumns.findIndex((c) =>
						c.cards.some((card) => card.id === activeCardIdNum),
					);
					if (sourceIndex === -1) return columns;
					const sourceCards = [...newColumns[sourceIndex].cards];
					const movedCardIndex = sourceCards.findIndex(
						(card) => card.id === activeCardIdNum,
					);
					if (movedCardIndex === -1) return columns;
					const [movedCard] = sourceCards.splice(movedCardIndex, 1);
					newColumns[sourceIndex] = {
						...newColumns[sourceIndex],
						cards: sourceCards,
					};

					const targetIndex = newColumns.findIndex(
						(c) => c.id === overColumnId,
					);
					if (targetIndex === -1) return columns;
					const targetCards = [
						...newColumns[targetIndex].cards,
						{ ...movedCard, columnId: overColumnId },
					];
					newColumns[targetIndex] = {
						...newColumns[targetIndex],
						cards: targetCards,
					};
					return newColumns;
				}
			}
			// if active is a column
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

	const handleDragOver = (event: DragOverEvent) => {
		const { active, over } = event;
		if (active?.data.current?.type !== "card") return;

		// determine target column id (either over a column element or over a card)
		let targetColumnId: number | null = null;
		if (over?.data.current?.type === "column") {
			const overMatches = over.id.toString().match(/column-(\d+)/);
			if (overMatches == null) return;
			targetColumnId = parseInt(overMatches[1], 10);
		} else if (over?.data.current?.type === "card") {
			const oc = over.data.current.columnId;
			if (oc == null) return;
			targetColumnId = oc;
		}

		if (targetColumnId == null) return;

		// find where the active card currently lives according to state
		const activeCardMatches = active.id.toString().match(/card-(\d+)/);
		if (!activeCardMatches) return;
		const activeCardIdNum = parseInt(activeCardMatches[1], 10);
		const sourceIndex = columns.findIndex((c) =>
			c.cards.some((card) => card.id === activeCardIdNum),
		);
		const targetIndex = columns.findIndex((c) => c.id === targetColumnId);
		if (sourceIndex === -1 || targetIndex === -1) return;

		// if card already in target column, just set over id and exit
		if (sourceIndex === targetIndex) {
			setOverColumnId(String(targetColumnId));
			return;
		}

		// move card from source to target immediately so SortableContext shows displacement
		setColumns((cols) => {
			const newColumns = [...cols];
			const sourceCards = [...newColumns[sourceIndex].cards];
			const movedCardIndex = sourceCards.findIndex(
				(card) => card.id === activeCardIdNum,
			);
			if (movedCardIndex === -1) return cols;
			const [movedCard] = sourceCards.splice(movedCardIndex, 1);
			newColumns[sourceIndex] = {
				...newColumns[sourceIndex],
				cards: sourceCards,
			};
			const targetCards = [
				...newColumns[targetIndex].cards,
				{ ...movedCard, columnId: newColumns[targetIndex].id },
			];
			newColumns[targetIndex] = {
				...newColumns[targetIndex],
				cards: targetCards,
			};
			return newColumns;
		});

		setOverColumnId(String(targetColumnId));
	};

	return (
		<div className="flex bg-white px-8 py-4 rounded-lg flex-row gap-10 align-center">
			<DndContext
				onDragStart={handleDragStart}
				onDragEnd={handleDragEnd}
				onDragOver={handleDragOver}
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
							overId={overColumnId}
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
                            overId={""}
							columnId={activeThing.id}
							activeId={""}
							columnTitle={activeThing.title}
						>
							{activeThing.cards.map((card) => (
								<Card
									key={`overlay-card-${card.id}`}
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
