% Board

%board_xy(+Board, +[X, Y], -Cell)
board_xy(Board, [X, Y], Cell) :-
        nth0(Y, Board, Line),
        nth0(X, Line, Cell).

%num_jokers_to_place(+Board, -N)
num_jokers_to_place(Board, N) :-
        num_jokers(J),
        count_xpieces(0, Board, N1),
        N is J - N1.

%create_board(-Board)
create_board(Board) :-
        board_size(Size),
        create_board(Size, Board1),
        create_board_place_jokers(Board1, Board).
create_board(Size, Board) :- create_board(Size, Size, Board).               
create_board(Width, Height, Board) :-
        Height > 0,
        H1 is Height - 1,
        create_board_line(Width, L1),
        create_board(Width, H1, B1),
        append([L1], B1, Board).
create_board(_, 0, []).
create_board_line(Width, Line) :-
        Width > 0,
        W1 is Width - 1,
        create_board_line(W1, L1),
        append([[[], -1]], L1, Line).
create_board_line(0, []).

create_board_place_jokers(Board, New_board) :-
        num_jokers(N),
        board_get_size(Board, Width, Height),
        Total is Width * Height,
        create_board_place_jokers_aux(Board, New_board, N, Width, Total).
create_board_place_jokers_aux(Board, Board, 0, _, _) :- !.
create_board_place_jokers_aux(Board, New_board, N, Width, Total) :-
        board_random_coords(Board, Coords),
        board_xy(Board, Coords, Cell),
        cell_xpiece(Cell, -1), !,
        cell_spieces(Cell, Spieces),
        cell_spieces(New_cell, Spieces),
        cell_xpiece(New_cell, 0),
        board_set_cell(Board, Coords, New_cell, Board1),
        N1 is N - 1,
        create_board_place_jokers_aux(Board1, New_board, N1, Width, Total).

create_board_place_jokers_aux(Board, New_board, N, Width, Total) :- create_board_place_jokers_aux(Board, New_board, N, Width, Total).

%board_random_coords(+Board, -[X, Y])
board_random_coords(Board, [X, Y]) :-
        board_get_size(Board, Width, Height),
        Total_size is Width * Height,
        random(0, Total_size, R),
        Div is R div Width,
        Mod is R mod Width,
        X = Div,
        Y = Mod.

%board_set_cell(+Board, +[X, Y], +Cell, -New_board)
board_set_cell(Board, [X, Y], Cell, New_board) :-
        nth0(Y, Board, Line),
        replace(X, Cell, Line, New_line),
        replace(Y, New_line, Board, New_board).

%board_get_size(+[H | T], -Width, -Height)
board_get_size([H | T], Width, Height) :-
        length([H | T], Height),
        length(H, Width).

board_get_scores([], 0, 0).
board_get_scores([Row1|Rows], Score1, Score2) :-
        board_get_scores_row(Row1, Score1_1, Score2_1),
        board_get_scores(Rows, Score1_2, Score2_2),
        Score1 is Score1_1 + Score1_2,
        Score2 is Score2_1 + Score2_2.

board_get_scores_row([], 0, 0).
board_get_scores_row([Cell|Row], Score1, Score2) :-
        cell_top_spiece(Cell, -1),
        board_get_scores_row(Row, Score1, Score2).
board_get_scores_row([Cell|Row], Score1, Score2) :-
        cell_top_spiece(Cell, 1),
        board_get_scores_row(Row, Score1_1, Score2),
        Score1 is Score1_1 + 1.
board_get_scores_row([Cell|Row], Score1, Score2) :-
        cell_top_spiece(Cell, 2),
        board_get_scores_row(Row, Score1, Score2_1),
        Score2 is Score2_1 + 1.






