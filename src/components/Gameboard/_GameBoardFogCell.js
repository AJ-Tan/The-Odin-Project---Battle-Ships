const generateBoardFogCell = (board) => {
  const fragment = document.createDocumentFragment();
  board.boardNodeArray().forEach((boardRow) => {
    boardRow.forEach((node) => {
      const cell = document.createElement("div");
      cell.classList.add("fog-cell");
      cell.boardNode = node;
      node.fogElement = cell;
      fragment.appendChild(cell);
    });
  });

  return fragment;
};
