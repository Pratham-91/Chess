

const socket = io();
const chess = new Chess();
const boardElement = document.querySelector(".chessboard");

let draggedPiece =  null ; // role server deta he intial me sab null honge 
let sourceSquare = null ;
let playerRole = null ;

const renderBoard = () =>{
    const board = chess.board();
    boardElement.innerHTML = "";
    board.forEach((row,rowindex)=>{  // board ---> array he  idhar  ---> jisme bhoot saari rows he 
        // console.log(row,rowindex); // har row me ek element  
        row.forEach((square,squareindex)=>{ // for each ke through row li firr for each firr lagage ke sqaure liye 
            // console.log(square,squareindex)  //
            const squareElement = document.createElement("div");
            // for pattern-->
            squareElement.classList.add(
                "square",
                (rowindex + squareindex)%2 ===0 ? "light":"dark"    // colour diya he  // rownumber+ squarenumber ==> example 1row + 1sqaure = white 
            );
            squareElement.dataset.row = rowindex ;
            squareElement.dataset.col = squareindex;

            if(square){
                const pieceElement = document.createElement("div");
                pieceElement.classList.add(
                    "piece",
                square.color === "w" ? "white":"black"
                );
                pieceElement.innerText = getPieceUnicode(square);
                pieceElement.draggable = playerRole === square.color;

                pieceElement.addEventListener("dragstart",(e) => {
                    if(pieceElement.draggable){
                        draggedPiece = pieceElement;
                        sourceSquare = {row: rowindex , col : squareindex};
                        e.dataTransfer.setData("text/plain", "")
                    }
                });

                pieceElement.addEventListener("dragend",(e)=>{
                    draggedPiece= null ;
                    sourceSquare = null ;
                });

                squareElement.appendChild(pieceElement); // suare pr element(character attch kardiya he )
            }

            squareElement.addEventListener("dragover" , function (e) {
                e.preventDefault();
            });

            squareElement.addEventListener("drop", function(e){
                e.preventDefault();
                if(draggedPiece){
                    const targetSource = {
                        row: parseInt(squareElement.dataset.row),  // har sqaure ki particular valaue hogi vo nikal rhe he idhar 
                        col: parseInt(squareElement.dataset.col) , 
                    };
                    
                    handleMove(sourceSquare,targetSource);
                };
            })
            boardElement.appendChild(squareElement);
        });
        
    });

    if (playerRole === 'b'){
        boardElement.classList.add("flipped");
    }
    else {
        boardElement.classList.remove("flipped")
    }

    
};

const handleMove = (source , target)=>{
    const move = {
        from : `${String.fromCharCode(97+source.col)}${8-source.row}`,
        to :  `${String.fromCharCode(97+target.col)}${8-target.row}` ,
        promotion: 'q'
    }

    socket.emit("move", move)
};

const getPieceUnicode = (piece)=>{
    const unicodePieces = {
        p: "♙",
        r: "♖",
        n: "♘",
        b: "♗",
        q: "♕",
        k: "♔",
        P: "♟",
        R: "♜",
        N :"♞",
        B: "♝",
        Q: "♛",
        K: "♚",
    };

    return unicodePieces[piece.type] || ""

};


socket.on("playerRole" , function(role){
    playerRole = role ,
    renderBoard();
});

socket.on("spectatorRole",function(){
    playerRole = null ;
    renderBoard();
});

socket.on("boardState",function(fen){
    chess.load(fen);
    renderBoard();
});

socket.on("move",function(move){
    chess.move(move);
    renderBoard();
})

renderBoard();
